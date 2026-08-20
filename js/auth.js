// Funciones globales de autenticación - SIN IMPORTS/EXPORTS
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
        // Verificar que el usuario existe y está activo
        if (!profile) {
          await window.auth.signOut();
          callback(null, { error: 'Usuario no registrado en el sistema.' });
          return;
        }
        if (profile.active === false) {
          await window.auth.signOut();
          callback(null, { error: 'Usuario inactivo. Contacta al administrador.' });
          return;
        }
        // Asegurar que el usuario tenga un rol por defecto si no lo tiene
        if (!profile.role) {
          profile.role = 'SOCIO';
          await userRef.update({ role: 'SOCIO' });
        }
        callback(user, profile);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        await window.auth.signOut();
        callback(null, { error: 'Error al cargar perfil de usuario.' });
      }
    } else {
      callback(null, null);
    }
  });
};