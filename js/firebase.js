// Inicialización global de Firebase (compat) - SIN IMPORTS/EXPORTS
const app = firebase.initializeApp(window.FIREBASE_CONFIG);
window.auth = firebase.auth(app);
window.db = firebase.database(app);