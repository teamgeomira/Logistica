// ================================================================
// INICIALIZACIÓN DE FIREBASE
// ================================================================

// Inicializar Firebase con la configuración global
const app = firebase.initializeApp(window.FIREBASE_CONFIG);

// Exportar servicios a window para uso global
window.auth = firebase.auth(app);
window.db = firebase.database(app);

console.log('🔥 Firebase inicializado correctamente');