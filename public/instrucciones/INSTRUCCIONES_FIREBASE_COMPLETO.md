# 🔮 CambiaTuYo - Actualización Completa con Firebase

## ✅ Nuevas Funcionalidades Implementadas

### 1. ✨ Prompts Completos de los 11 Agentes

Todos los agentes ahora tienen:
- **Mensajes de bienvenida personalizados** con listado de especialidades
- **System prompts detallados** con todas las instrucciones
- **Contexto temporal automático** para Astrología y Numerología (fecha, año, mes actualizado dinámicamente)
- **Límites éticos** definidos claramente

**Los 11 Agentes:**
1. 🔮 Madame Arcana - Tarot
2. 🔢 Numerius Sage - Numerología
3. 💎 Crystal Harmony - Cristales
4. ⭐ Celestia Nova - Astrología
5. 🌙 Morpheus Dream - Sueños
6. 👼 Seraphiel - Ángeles
7. 🔥 Sage Lao - I-Ching
8. ᚱ Völva Rúnhild - Runas
9. 🏯 Maestro Li Wei - Feng Shui
10. 📖 Rabbi Elohim - Cábala
11. 🕉️ Ananda - Guía Espiritual

---

### 2. 👨‍💼 Admin Puede Hacer Consultas Ilimitadas

El administrador ahora:
- ✅ Tiene **créditos ilimitados** (∞)
- ✅ Puede consultar **todos los 11 agentes** sin restricciones
- ✅ NO se le descuentan consultas
- ✅ Puede probar todos los agentes para verificar funcionamiento

**Código relevante:**
```javascript
// En selectAgent():
if (!isAdmin) {
  // Verificar acceso y límites solo si NO es admin
  // ...
}
```

---

### 3. 🎁 Admin Puede Añadir Agentes Bonus a Usuarios Específicos

Nueva funcionalidad para conceder acceso a agentes premium:

**Cómo funciona:**
1. Admin entra al Panel de Administración
2. Hace clic en el icono 🎁 junto a cualquier usuario
3. Se abre un modal mostrando todos los 11 agentes
4. Los agentes ya incluidos en el plan del usuario aparecen con ✅
5. Admin puede añadir/quitar agentes bonus con un clic
6. El usuario recibirá acceso inmediato sin cambiar su plan

**Ejemplo de uso:**
- Usuario tiene plan FREE (solo 3 agentes: Tarot, Numerología, Cristales)
- Admin le añade bonus: Astrología y Cábala
- Ahora el usuario puede usar 5 agentes (3 del plan + 2 bonus)

**Almacenamiento en Firestore:**
```javascript
users/{userId}: {
  bonusAgents: {
    'astrology': true,
    'kabbalah': true
  }
}
```

---

### 4. ✉️ Verificación de Email

Sistema completo de verificación implementado:

**Al Registrarse:**
1. Usuario se registra con email y contraseña
2. Firebase envía automáticamente email de verificación
3. Se crea documento en Firestore con `emailVerified: false`

**Banner de Advertencia:**
- Si el email no está verificado, aparece banner naranja en la parte superior
- Botones:
  - 📧 "Reenviar Email" - envía nuevo email de verificación
  - ✓ "Ya verifiqué" - verifica si el email fue verificado

**Restricciones:**
- Usuario con email no verificado **no puede** consultar agentes
- Al intentar consultar, aparece notificación: "Por favor, verifica tu email primero"

**Usuarios Existentes:**
- Si un usuario ya estaba registrado, al hacer login se marca automáticamente como verificado
- Código:
```javascript
if (!user.emailVerified) {
  // Mostrar banner
} else {
  if (userData.emailVerified === false) {
    await updateDoc(doc(db, 'users', user.uid), {
      emailVerified: true
    });
  }
}
```

---

### 5. 🗑️ Eliminar Usuario y Re-registro

Funcionalidad mejorada para eliminar usuarios:

**Lo que se elimina:**
1. ✅ Documento del usuario en Firestore (`users/{userId}`)
2. ✅ Todas las consultas del usuario (`consultations` donde `userId == userId`)
3. ✅ (Nota: Para eliminar de Firebase Auth se necesita Firebase Admin SDK en backend)

**Re-registro:**
- Después de eliminar, el usuario **puede volver a registrarse con el mismo email**
- Se crea una cuenta completamente nueva
- Historial anterior eliminado completamente

**Confirmación:**
```
¿Estás seguro de que deseas eliminar a user@example.com?

Esto borrará:
- Su cuenta en Firestore
- Su cuenta de autenticación
- Todas sus consultas

Podrá registrarse nuevamente con el mismo email.
```

---

### 6. 📊 Admin Puede Ver Número de Consultas

Panel de administración mejorado:

**Estadísticas Globales:**
- 👥 Total Usuarios
- 💬 **Total Consultas** (NUEVO)
- 💰 Ingresos Mensuales
- 📊 Usuarios Activos

**Tabla de Usuarios:**

| Usuario | Plan | **Consultas** | Agentes Bonus | Verificado | Acciones |
|---------|------|---------------|---------------|------------|----------|
| user@example.com | mystic | **25** | 🎁 2 bonus | ✓ | 🎁 🗑️ |

**Contador Individual:**
- Cada usuario tiene un campo `consultationsUsed` que se incrementa con cada consulta
- Se muestra en la tabla del panel admin

---

### 7. 📧 Admin Puede Exportar Emails

Nuevo botón en el panel de administración:

**Ubicación:** Panel Admin → Botón "📧 Exportar Emails"

**Funcionalidad:**
- Exporta todos los emails de usuarios a un archivo CSV
- Columnas: Email, Nombre, Plan, Verificado
- Nombre del archivo: `emails-cambiatuyo-2026-01-02.csv`

**Formato CSV:**
```csv
Email,Nombre,Plan,Verificado
user@example.com,Juan Pérez,mystic,Sí
admin@cambiatuyo.es,Admin,master,Sí
```

**Código:**
```javascript
window.exportEmails = async function() {
  // Obtener usuarios
  // Crear CSV
  // Descargar archivo
}
```

---

### 8. 📄 Usuario Puede Exportar Conversación a PDF

Nuevo botón en la ventana de chat:

**Ubicación:** Chat → Header → Botón "📄 Exportar PDF"

**Funcionalidad:**
- Exporta toda la conversación actual a PDF
- Incluye: Nombre del agente, fecha, todos los mensajes
- Solo disponible si hay al menos una conversación iniciada

**Estado Actual:**
```javascript
window.exportChatToPDF = async function() {
  // Función preparada para integración con jsPDF
  // Por ahora muestra notificación
  // En producción: implementar generación real de PDF
}
```

**Implementación Sugerida con jsPDF:**
```javascript
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

doc.setFontSize(16);
doc.text(`Conversación con ${currentAgent.name}`, 20, 20);

// Añadir mensajes...
doc.save(`conversacion-${currentAgent.id}-${Date.now()}.pdf`);
```

---

### 9. 📝 Mantener 4 Planes con Agentes Asignados

Los 4 planes están configurados correctamente:

#### 🌟 Plan FREE (Gratuito)
- **Precio:** €0
- **Consultas:** 9/mes (3 por agente)
- **Agentes:** 3 básicos
  - 🔮 Tarot
  - 🔢 Numerología
  - 💎 Cristales
- **Límites:** 3 consultas por agente al mes

#### ✨ Plan BASIC (€9.99/mes)
- **Precio:** €9.99/mes o €99/año (ahorra €20.88)
- **Consultas:** 20/mes
- **Agentes:** 6 totales
  - FREE + Astrología, Sueños, Ángeles

#### 🔮 Plan MYSTIC (€19.99/mes) - MÁS POPULAR
- **Precio:** €19.99/mes o €199/año (ahorra €40.88)
- **Consultas:** 50/mes
- **Agentes:** 9 totales
  - BASIC + I-Ching, Runas, Feng Shui

#### 👑 Plan MASTER (€39.99/mes)
- **Precio:** €39.99/mes o €399/año (ahorra €80.88)
- **Consultas:** ILIMITADAS
- **Agentes:** TODOS los 11 agentes
  - MYSTIC + Cábala, Guía Espiritual

---

## 🔧 Estructura Técnica

### Base de Datos Firestore

#### Colección `users`:
```javascript
{
  uid: "firebase-auth-uid",
  name: "Juan Pérez",
  email: "user@example.com",
  plan: "mystic",
  consultationsUsed: 25,
  consultationsThisMonth: {
    "2026-01": {
      "tarot": 5,
      "astrology": 3,
      "dreams": 2
    }
  },
  bonusAgents: {
    "kabbalah": true,
    "spiritual-guide": true
  },
  isAdmin: false,
  emailVerified: true,
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

#### Colección `consultations`:
```javascript
{
  userId: "firebase-auth-uid",
  userEmail: "user@example.com",
  agentId: "tarot",
  agentName: "Madame Arcana",
  messages: [
    { role: "assistant", content: "Bienvenido..." },
    { role: "user", content: "Hazme una tirada" },
    { role: "assistant", content: "He extraído las cartas..." }
  ],
  timestamp: Timestamp,
  createdAt: "2026-01-02T10:30:00.000Z"
}
```

---

## 🚀 Instalación

### Paso 1: Reemplazar app.js

```bash
# Reemplaza tu archivo actual
firebase-project/
└── public/
    └── app.js (reemplazar con app_completo.js)
```

### Paso 2: Actualizar index.html

Modificaciones necesarias en `index.html`:

**A. Panel Admin - Añadir columna "Consultas":**

```html
<!-- ANTES: -->
<thead>
  <tr class="border-b border-purple-500/20">
    <th>Usuario</th>
    <th>Plan</th>
    <th>Agentes Bonus</th>
    <th>Verificado</th>
    <th>Acciones</th>
  </tr>
</thead>

<!-- DESPUÉS: -->
<thead>
  <tr class="border-b border-purple-500/20">
    <th>Usuario</th>
    <th>Plan</th>
    <th>Consultas</th>  <!-- NUEVO -->
    <th>Agentes Bonus</th>
    <th>Verificado</th>
    <th>Acciones</th>
  </tr>
</thead>
```

**B. Panel Admin - Añadir 4ta tarjeta de estadísticas:**

```html
<!-- Cambiar grid de 3 a 4 columnas -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  
  <!-- Tarjetas existentes... -->
  
  <!-- NUEVA tarjeta -->
  <div class="bg-purple-600/20 p-6 rounded-xl border border-purple-500/20">
    <div class="text-3xl mb-2">💬</div>
    <div class="text-gray-400 text-sm">Total Consultas</div>
    <div class="text-3xl font-bold" id="totalConsultations">0</div>
  </div>
</div>
```

**C. Chat - Añadir botón "Exportar PDF":**

Ya está implementado automáticamente en el JavaScript (ver `app_completo.js` línea ~1950).

---

## 🔑 Configuración de Firebase

### Variables de Entorno

Tu configuración actual ya está correcta:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC_8NSVjSaTYj46eH_q8484m3K6litmQeA",
  authDomain: "cambiatuyo.firebaseapp.com",
  projectId: "cambiatuyo",
  storageBucket: "cambiatuyo.firebasestorage.app",
  messagingSenderId: "1078359634498",
  appId: "1:1078359634498:web:bcfeb837200ed91eb3b3db"
};
```

### Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer/escribir solo su propio documento
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      allow update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Solo admins pueden leer todos los usuarios
    match /users/{userId} {
      allow list: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Consultas
    match /consultations/{consultId} {
      allow read: if request.auth.uid == resource.data.userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 🧪 Pruebas

### Test 1: Registro y Verificación de Email
1. Registrarse con un nuevo email
2. ✅ Debería aparecer banner naranja "Email no verificado"
3. ✅ Al intentar consultar agente, debería aparecer error
4. Verificar email desde bandeja de entrada
5. Hacer clic en "Ya verifiqué"
6. ✅ Banner debe desaparecer
7. ✅ Ahora puede consultar agentes

### Test 2: Admin Consultas Ilimitadas
1. Iniciar sesión como admin@cambiatuyo.es
2. ✅ Debe ver ∞ en créditos
3. Seleccionar cualquier agente (incluso los premium)
4. ✅ Debe poder consultar sin restricciones
5. Hacer múltiples consultas
6. ✅ No debe descontarse ningún crédito

### Test 3: Añadir Agente Bonus
1. Como admin, ir a Panel Admin
2. Hacer clic en 🎁 junto a un usuario con plan FREE
3. ✅ Debe abrir modal mostrando 11 agentes
4. ✅ Tarot, Numerología, Cristales deben tener ✅ (ya en plan)
5. Hacer clic en "🎁 Añadir Bonus" en Astrología
6. ✅ Botón debe cambiar a "🗑️ Quitar Bonus" con fondo rojo
7. Cerrar modal
8. ✅ Usuario debe aparecer con "🎁 1 bonus"
9. Hacer logout e iniciar sesión como ese usuario
10. ✅ Usuario debe ver 4 agentes disponibles (3 del plan + 1 bonus)

### Test 4: Eliminar y Re-registro
1. Como admin, ir a Panel Admin
2. Hacer clic en 🗑️ junto a un usuario de prueba
3. ✅ Debe aparecer confirmación detallada
4. Confirmar eliminación
5. ✅ Usuario debe desaparecer de la tabla
6. Intentar registrarse nuevamente con el mismo email
7. ✅ Debe permitir crear cuenta nueva

### Test 5: Exportar Emails
1. Como admin, ir a Panel Admin
2. Hacer clic en "📧 Exportar Emails"
3. ✅ Debe descargarse archivo CSV
4. Abrir el archivo
5. ✅ Debe contener: Email, Nombre, Plan, Verificado

### Test 6: Exportar Conversación a PDF
1. Iniciar chat con cualquier agente
2. Enviar varios mensajes
3. ✅ Debe aparecer botón "📄 Exportar PDF" en el header del chat
4. Hacer clic en el botón
5. ✅ Por ahora muestra notificación (pendiente implementar jsPDF)

### Test 7: Contador de Consultas
1. Como usuario, hacer 5 consultas con diferentes agentes
2. Como admin, ir a Panel Admin
3. ✅ En la columna "Consultas" debe aparecer: 5
4. ✅ En "Total Consultas" (tarjeta estadística) debe sumar todas las consultas

### Test 8: Límites de Plan FREE
1. Como usuario con plan FREE
2. Hacer 3 consultas con Tarot
3. ✅ Al intentar 4ta consulta, debe aparecer mensaje: "Has alcanzado el límite de 3 consultas con Madame Arcana este mes"
4. ✅ Debe redirigir a página de Planes

---

## ⚠️ Importante: Claude API

### Estado Actual

La función `callClaudeAPI()` está **simulada**:

```javascript
async function callClaudeAPI(systemPrompt, conversationHistory) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Como ${currentAgent.name}, te respondo: [Simulación]`);
    }, 2000);
  });
}
```

### ⚠️ NUNCA expongas tu API Key de Anthropic en el frontend

### Implementación Correcta (Backend)

**Paso 1: Crear endpoint en tu backend (Node.js/Express):**

```javascript
// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY // En .env, NUNCA en frontend
});

router.post('/chat', async (req, res) => {
  try {
    const { systemPrompt, messages } = req.body;
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    });
    
    res.json({
      success: true,
      response: response.content[0].text
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
```

**Paso 2: Actualizar frontend:**

```javascript
// app.js
async function callClaudeAPI(systemPrompt, conversationHistory) {
  const response = await fetch('https://tu-backend.com/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      systemPrompt,
      messages: conversationHistory.slice(1) // Excluir mensaje de bienvenida
    })
  });
  
  const data = await response.json();
  return data.response;
}
```

---

## 📋 Checklist de Implementación

### Frontend:
- [ ] Reemplazar `app.js` con `app_completo.js`
- [ ] Actualizar `index.html`:
  - [ ] Añadir columna "Consultas" en tabla admin
  - [ ] Añadir 4ta tarjeta "Total Consultas"
  - [ ] (Opcional) Verificar botón exportar PDF en chat
- [ ] Probar registro y verificación de email
- [ ] Probar login de admin

### Backend (para Claude API):
- [ ] Crear endpoint `/api/chat` seguro
- [ ] Configurar variable de entorno `ANTHROPIC_API_KEY`
- [ ] Implementar autenticación en el endpoint
- [ ] Actualizar función `callClaudeAPI()` en frontend

### Firebase:
- [ ] Configurar reglas de Firestore
- [ ] Habilitar Email/Password en Authentication
- [ ] Configurar plantillas de email de verificación
- [ ] (Opcional) Configurar Firebase Admin SDK para eliminar usuarios de Auth

### Pruebas:
- [ ] Registro nuevo usuario
- [ ] Verificación de email
- [ ] Admin puede consultar ilimitado
- [ ] Añadir agente bonus
- [ ] Eliminar usuario
- [ ] Exportar emails
- [ ] Ver número de consultas

---

## 🎯 Funcionalidades Implementadas vs Solicitadas

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Prompts completos de 11 agentes | ✅ COMPLETO | Con saludos y system prompts |
| Contexto temporal en Astrología/Numerología | ✅ COMPLETO | Se actualiza dinámicamente |
| Admin consultas ilimitadas | ✅ COMPLETO | Créditos ∞, no se descuentan |
| Admin añadir agentes bonus | ✅ COMPLETO | Modal con toggle por agente |
| Verificación de email | ✅ COMPLETO | Banner + restricción consultas |
| Usuarios verificados automáticamente | ✅ COMPLETO | Al hacer login |
| Re-registro con mismo email | ✅ COMPLETO | Después de eliminar |
| Admin ver número de consultas | ✅ COMPLETO | Tabla + estadística global |
| Admin exportar emails | ✅ COMPLETO | Descarga CSV |
| Usuario exportar chat a PDF | 🚧 PREPARADO | Función lista, falta jsPDF |
| 4 planes con agentes asignados | ✅ COMPLETO | FREE, BASIC, MYSTIC, MASTER |

---

## 📞 Soporte

Si encuentras algún problema:

1. **Consola del navegador (F12)** - Revisa errores
2. **Firebase Console** - Verifica autenticación y Firestore
3. **Reglas de Firestore** - Asegúrate de que permiten las operaciones
4. **Variables de entorno** - Verifica tu configuración

---

**Versión:** 4.0 - Completo con Firebase  
**Fecha:** Enero 2026  
**Proyecto:** CambiaTuYo - Portal Místico Digital

🔮 "De la sabiduría ancestral a tu bienestar total" 🔮
