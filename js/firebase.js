// Inicialización global de Firebase (compat)
const app = firebase.initializeApp(window.FIREBASE_CONFIG);
window.auth = firebase.auth(app);
window.db = firebase.database(app);