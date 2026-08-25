// ================================================================
// FUNCIONES DE AUTENTICACIÓN
// ================================================================

// Iniciar sesión con email y contraseña
window.login = function(email, password) {
  return window.auth.signInWithEmailAndPassword(email, password);
};

// Cerrar sesión
window.logout = function() {
  return window.auth.signOut();
};

// Enviar correo de restablecimiento de contraseña
window.resetPassword = function(email) {
  return window.auth.sendPasswordResetEmail(email);
};

// Observar cambios en el estado de autenticación
window.watchAuth = function(callback) {
  window.auth.onAuthStateChanged(async function(user) {
    if (user) {
      try {
        const userRef = window.db.ref('users/' + user.uid);
        const snap = await userRef.get();
        const profile = snap.val();

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