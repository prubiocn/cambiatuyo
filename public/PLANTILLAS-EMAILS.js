// ============================================
// PLANTILLAS DE EMAILS CON ENLACES
// ============================================

// Estas funciones generan el HTML de los emails que se envían
// Incluyen enlaces a cambiatuyo.es y info@cambiatuyo.es

// ============================================
// EMAIL DE VERIFICACIÓN
// ============================================

function getVerificationEmailHTML(verificationLink) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu email - CambiaTuYo</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="font-size: 60px; margin-bottom: 10px;">🔮</div>
      <h1 style="margin: 0; color: white; font-size: 32px;">CambiaTuYo</h1>
      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">Tu portal místico personal</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px;">
      
      <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">¡Bienvenido! ✨</h2>
      
      <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Estamos encantados de tenerte en CambiaTuYo. Solo necesitas verificar tu email para comenzar tu viaje místico.
      </p>
      
      <!-- Botón de verificación -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
          Verificar Email
        </a>
      </div>
      
      <p style="color: #888; font-size: 14px; margin-top: 25px; text-align: center;">
        O copia este enlace en tu navegador:<br>
        <span style="color: #667eea; word-break: break-all;">${verificationLink}</span>
      </p>
      
      <!-- Separador -->
      <div style="border-top: 1px solid #eee; margin: 30px 0;"></div>
      
      <!-- Información -->
      <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #667eea; font-size: 18px;">¿Qué sigue?</h3>
        <ul style="color: #555; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Accede a 3 agentes místicos gratis</li>
          <li style="margin-bottom: 8px;">Explora nuestros planes premium</li>
          <li style="margin-bottom: 8px;">Comienza tus consultas místicas</li>
        </ul>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="background: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #eee;">
      
      <p style="color: #888; font-size: 14px; margin: 0 0 15px 0;">
        ¿Necesitas ayuda?
      </p>
      
      <div style="margin-bottom: 20px;">
        <a href="mailto:info@cambiatuyo.es" 
           style="color: #667eea; text-decoration: none; font-weight: bold; margin: 0 10px;">
          📧 info@cambiatuyo.es
        </a>
        <span style="color: #ccc;">|</span>
        <a href="https://cambiatuyo.es" 
           style="color: #667eea; text-decoration: none; font-weight: bold; margin: 0 10px;">
          🌐 cambiatuyo.es
        </a>
      </div>
      
      <p style="color: #aaa; font-size: 12px; margin: 20px 0 0 0;">
        © 2025 CambiaTuYo. Todos los derechos reservados.<br>
        <a href="https://cambiatuyo.es/privacidad" style="color: #aaa; text-decoration: none;">Privacidad</a> · 
        <a href="https://cambiatuyo.es/terminos" style="color: #aaa; text-decoration: none;">Términos</a>
      </p>
      
    </div>
    
  </div>
  
</body>
</html>
  `;
}

// ============================================
// EMAIL DE BIENVENIDA (después de verificar)
// ============================================

function getWelcomeEmailHTML(userName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido a CambiaTuYo!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
      <h1 style="margin: 0; color: white; font-size: 32px;">¡Email verificado!</h1>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px;">
      
      <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hola ${userName} 👋</h2>
      
      <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Tu cuenta está lista. Ahora puedes acceder a todos tus agentes místicos y comenzar tu viaje de transformación personal.
      </p>
      
      <!-- Agentes disponibles -->
      <div style="background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%); padding: 25px; border-radius: 15px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;">🔮 Tus agentes gratuitos:</h3>
        <div style="color: #555;">
          <div style="margin-bottom: 10px;">🔮 <strong>Madame Arcana</strong> - Maestra del tarot</div>
          <div style="margin-bottom: 10px;">🔢 <strong>Numerius Sage</strong> - Numerología y destino</div>
          <div style="margin-bottom: 10px;">💎 <strong>Crystal Harmony</strong> - Cristales y energía</div>
        </div>
      </div>
      
      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://cambiatuyo.web.app" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
          Comenzar ahora
        </a>
      </div>
      
      <!-- Separador -->
      <div style="border-top: 1px solid #eee; margin: 30px 0;"></div>
      
      <!-- Tip -->
      <div style="background: #fff8e1; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107;">
        <h3 style="margin: 0 0 10px 0; color: #f57c00; font-size: 16px;">💡 Consejo:</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">
          Para una experiencia completa, considera actualizar a un plan premium y accede a los 11 agentes místicos, 
          incluyendo astrología avanzada, I-Ching, runas y más.
        </p>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="background: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #eee;">
      
      <p style="color: #888; font-size: 14px; margin: 0 0 15px 0;">
        ¿Tienes preguntas?
      </p>
      
      <div style="margin-bottom: 20px;">
        <a href="mailto:info@cambiatuyo.es" 
           style="color: #667eea; text-decoration: none; font-weight: bold; margin: 0 10px;">
          📧 info@cambiatuyo.es
        </a>
        <span style="color: #ccc;">|</span>
        <a href="https://cambiatuyo.es" 
           style="color: #667eea; text-decoration: none; font-weight: bold; margin: 0 10px;">
          🌐 cambiatuyo.es
        </a>
      </div>
      
      <p style="color: #aaa; font-size: 12px; margin: 20px 0 0 0;">
        © 2025 CambiaTuYo. Todos los derechos reservados.<br>
        Hecho con ✨ y magia en España 🇪🇸
      </p>
      
    </div>
    
  </div>
  
</body>
</html>
  `;
}

// ============================================
// EMAIL DE SUSCRIPCIÓN EXITOSA
// ============================================

function getSubscriptionEmailHTML(userName, planName, planPrice) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Suscripción confirmada - CambiaTuYo</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="font-size: 60px; margin-bottom: 10px;">👑</div>
      <h1 style="margin: 0; color: white; font-size: 32px;">¡Suscripción activada!</h1>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px;">
      
      <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">¡Gracias ${userName}! 🎉</h2>
      
      <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Tu suscripción al plan <strong>${planName}</strong> está activa. Ya tienes acceso completo a todos tus agentes místicos.
      </p>
      
      <!-- Detalle de suscripción -->
      <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px 0; color: #667eea;">📋 Resumen de tu plan:</h3>
        <div style="color: #555;">
          <div style="margin-bottom: 8px;"><strong>Plan:</strong> ${planName}</div>
          <div style="margin-bottom: 8px;"><strong>Precio:</strong> ${planPrice}</div>
          <div style="margin-bottom: 8px;"><strong>Renovación:</strong> Automática</div>
        </div>
      </div>
      
      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://cambiatuyo.web.app" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
          Acceder a mis agentes
        </a>
      </div>
      
      <!-- Info gestión -->
      <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin-top: 25px;">
        <p style="color: #555; margin: 0; font-size: 14px; text-align: center;">
          💡 Puedes gestionar tu suscripción en cualquier momento desde tu panel de usuario. 
          Cambiar de plan o cancelar es fácil y sin penalizaciones.
        </p>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="background: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #eee;">
      
      <p style="color: #888; font-size: 14px; margin: 0 0 15px 0;">
        ¿Necesitas ayuda con tu suscripción?
      </p>
      
      <div style="margin-bottom: 20px;">
        <a href="mailto:info@cambiatuyo.es" 
           style="color: #667eea; text-decoration: none; font-weight: bold; margin: 0 10px;">
          📧 info@cambiatuyo.es
        </a>
        <span style="color: #ccc;">|</span>
        <a href="https://cambiatuyo.es/soporte" 
           style="color: #667eea; text-decoration: none; font-weight: bold; margin: 0 10px;">
          💬 Centro de ayuda
        </a>
      </div>
      
      <p style="color: #aaa; font-size: 12px; margin: 20px 0 0 0;">
        © 2025 CambiaTuYo. Todos los derechos reservados.<br>
        <a href="https://cambiatuyo.es/privacidad" style="color: #aaa; text-decoration: none;">Privacidad</a> · 
        <a href="https://cambiatuyo.es/terminos" style="color: #aaa; text-decoration: none;">Términos</a>
      </p>
      
    </div>
    
  </div>
  
</body>
</html>
  `;
}

// ============================================
// NOTA: Estas plantillas son para referencia
// Firebase Authentication maneja los emails de verificación automáticamente
// Pero puedes personalizar el template en Firebase Console:
// https://console.firebase.google.com/project/cambiatuyo/authentication/emails
// ============================================
