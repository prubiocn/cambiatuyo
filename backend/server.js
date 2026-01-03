// ========================================
// BACKEND NODE.JS + EXPRESS + ANTHROPIC API
// server.js
// ========================================

const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://cambiatuyo.web.app',
  credentials: true
}));
app.use(express.json());

// Inicializar Firebase Admin SDK
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Inicializar Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ========================================
// MIDDLEWARE DE AUTENTICACIÓN
// ========================================
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado - Token requerido' 
      });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    
    // Obtener datos adicionales del usuario de Firestore
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado en base de datos'
      });
    }
    
    req.userData = userDoc.data();
    req.isAdmin = req.userData.isAdmin === true;
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido o expirado' 
    });
  }
}

// ========================================
// ENDPOINT: CHAT CON CLAUDE
// ========================================
app.post('/api/chat', authenticateUser, async (req, res) => {
  try {
    const { systemPrompt, messages, agentId, agentName } = req.body;
    
    if (!systemPrompt || !messages || !agentId) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos'
      });
    }
    
    // Verificar si el usuario es admin (sin límites)
    const isAdmin = req.isAdmin;
    
    // Si NO es admin, verificar límites de consultas
    if (!isAdmin) {
      const userPlan = req.userData.plan || 'free';
      const consultationsThisMonth = req.userData.consultationsThisMonth || {};
      const monthKey = new Date().toISOString().slice(0, 7);
      const totalThisMonth = Object.values(consultationsThisMonth[monthKey] || {})
        .reduce((a, b) => a + b, 0);
      
      // Verificar límite según plan
      const planLimits = {
        free: 9,
        basic: 20,
        mystic: 50,
        master: Infinity
      };
      
      const limit = planLimits[userPlan] || 9;
      
      if (totalThisMonth >= limit) {
        return res.status(429).json({
          success: false,
          message: `Has alcanzado tu límite de ${limit} consultas este mes`,
          limitReached: true
        });
      }
    }
    
    // Llamar a Claude API
    console.log(`📞 Llamando a Claude API para ${req.user.email} (${agentName})`);
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages
    });
    
    const assistantMessage = response.content[0].text;
    
    // Incrementar contador solo si NO es admin
    if (!isAdmin) {
      const monthKey = new Date().toISOString().slice(0, 7);
      const userRef = db.collection('users').doc(req.user.uid);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      
      const consultationsThisMonth = userData.consultationsThisMonth || {};
      const monthData = consultationsThisMonth[monthKey] || {};
      monthData[agentId] = (monthData[agentId] || 0) + 1;
      consultationsThisMonth[monthKey] = monthData;
      
      await userRef.update({
        consultationsUsed: admin.firestore.FieldValue.increment(1),
        consultationsThisMonth,
        lastConsultation: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    res.json({
      success: true,
      response: assistantMessage,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens
    });
    
  } catch (error) {
    console.error('❌ Error en /api/chat:', error);
    
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Límite de API alcanzado. Por favor, intenta de nuevo en unos minutos.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al procesar la consulta',
      error: error.message
    });
  }
});

// ========================================
// ENDPOINT: ELIMINAR USUARIO COMPLETAMENTE
// (Firestore + Firebase Auth)
// ========================================
app.delete('/api/admin/users/:userId', authenticateUser, async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos de administrador'
      });
    }
    
    const { userId } = req.params;
    
    // 1. Eliminar de Firestore
    await db.collection('users').doc(userId).delete();
    
    // 2. Eliminar consultas del usuario
    const consultationsSnapshot = await db.collection('consultations')
      .where('userId', '==', userId)
      .get();
    
    const batch = db.batch();
    consultationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    // 3. Eliminar de Firebase Auth
    try {
      await admin.auth().deleteUser(userId);
      console.log(`✅ Usuario ${userId} eliminado completamente (Firestore + Auth)`);
    } catch (authError) {
      console.warn('⚠️ No se pudo eliminar de Auth (puede que ya no exista):', authError.message);
    }
    
    res.json({
      success: true,
      message: 'Usuario eliminado completamente. Puede registrarse nuevamente.'
    });
    
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
});

// ========================================
// ENDPOINT: HEALTH CHECK
// ========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'CambiaTuYo Backend',
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY
  });
});

// ========================================
// ENDPOINT: VERIFICAR CONFIGURACIÓN (SOLO ADMIN)
// ========================================
app.get('/api/config', authenticateUser, async (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ message: 'Solo admin' });
  }
  
  res.json({
    anthropicKey: process.env.ANTHROPIC_API_KEY ? 'Configurado ✓' : 'No configurado ✗',
    frontendUrl: process.env.FRONTEND_URL || 'No configurado',
    nodeEnv: process.env.NODE_ENV || 'development',
    firebaseConfigured: !!serviceAccount
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🔮 ================================');
  console.log('🔮 CambiaTuYo Backend Iniciado');
  console.log('🔮 ================================');
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Anthropic API: ${process.env.ANTHROPIC_API_KEY ? 'Configurado ✓' : 'NO CONFIGURADO ✗'}`);
  console.log(`🔥 Firebase: ${serviceAccount ? 'Configurado ✓' : 'NO CONFIGURADO ✗'}`);
  console.log('🔮 ================================');
});

module.exports = app;
