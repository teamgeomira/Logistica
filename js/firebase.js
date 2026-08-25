// ================================================================
// INICIALIZACIÓN DE FIREBASE - MALANGA v2.1.0
// ================================================================

// Verificar que la configuración existe ANTES de inicializar
if (typeof window.FIREBASE_CONFIG === 'undefined') {
  console.error('❌ ERROR CRÍTICO: window.FIREBASE_CONFIG no está definido.');
  console.error('Asegúrate de que config.js se carga ANTES que firebase.js');
  console.error('Orden correcto: config.js → firebase.js → auth.js → database.js → utils.js → app.js');
  
  // Mostrar mensaje de error en la pantalla
  document.addEventListener('DOMContentLoaded', function() {
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #c0392b;
        color: #ffffff;
        padding: 1rem;
        text-align: center;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 0.95rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
      errorDiv.innerHTML = `
        <strong>⚠️ Error de configuración</strong><br>
        No se pudo cargar la configuración de Firebase.<br>
        <small style="opacity:0.8;">Verifica que config.js se carga antes que firebase.js</small>
      `;
      document.body.prepend(errorDiv);
    }
  });
} else {
  try {
    // Inicializar Firebase con la configuración global
    const app = firebase.initializeApp(window.FIREBASE_CONFIG);
    
    // Exportar servicios a window para uso global
    window.auth = firebase.auth(app);
    window.db = firebase.database(app);
    
    console.log('🔥 Firebase inicializado correctamente');
    console.log('✅ Auth disponible:', typeof window.auth !== 'undefined');
    console.log('✅ Database disponible:', typeof window.db !== 'undefined');
    
    // Verificar conexión a la base de datos
    const connectedRef = window.db.ref('.info/connected');
    connectedRef.on('value', function(snap) {
      if (snap.val() === true) {
        console.log('✅ Conexión a Firebase establecida');
      } else {
        console.warn('⚠️ Sin conexión a Firebase');
      }
    });
    
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    console.error('Configuración recibida:', window.FIREBASE_CONFIG);
    
    // Mostrar error en la pantalla
    document.addEventListener('DOMContentLoaded', function() {
      const loginScreen = document.getElementById('login-screen');
      if (loginScreen) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #c0392b;
          color: #ffffff;
          padding: 1rem;
          text-align: center;
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.95rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        errorDiv.innerHTML = `
          <strong>❌ Error al inicializar Firebase</strong><br>
          ${error.message || 'Error desconocido'}<br>
          <small style="opacity:0.8;">Revisa la consola para más detalles</small>
        `;
        document.body.prepend(errorDiv);
      }
    });
  }
}

// ================================================================
// FUNCIÓN DE AYUDA PARA VERIFICAR ESTADO
// ================================================================
window.checkFirebaseStatus = function() {
  const status = {
    configLoaded: typeof window.FIREBASE_CONFIG !== 'undefined',
    authLoaded: typeof window.auth !== 'undefined',
    dbLoaded: typeof window.db !== 'undefined',
    config: window.FIREBASE_CONFIG || null
  };
  
  console.log('📊 Estado de Firebase:');
  console.log('  - Configuración cargada:', status.configLoaded);
  console.log('  - Auth disponible:', status.authLoaded);
  console.log('  - Database disponible:', status.dbLoaded);
  
  if (!status.configLoaded) {
    console.warn('⚠️ window.FIREBASE_CONFIG no está definido');
  }
  
  return status;
};

// Ejecutar verificación automática
setTimeout(function() {
  window.checkFirebaseStatus();
}, 500);