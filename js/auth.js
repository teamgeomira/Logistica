// Funciones globales de autenticación
window.login = function(email, password) {
  return window.auth.signInWithEmailAndPassword(email, password);
};

window.logout = function() {
  return window.auth.signOut();
};

window.resetPassword = function(email) {
  return window.auth.sendPasswordResetEmail(email);
};

window.watchAuth = function(callback) {
  window.auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const userRef = window.db.ref(`users/${user.uid}`);
        const snap = await userRef.get();
        const profile = snap.val();
        if (!profile || profile.active === false) {
          await window.auth.signOut();
          callback(null, { error: 'Usuario inactivo o no autorizado.' });
        } else {
          callback(user, profile);
        }
      } catch (error) {
        await window.auth.signOut();
        callback(null, { error: 'Error al cargar perfil.' });
      }
    } else {
      callback(null, null);
    }
  });
};