// ================================================================
// SISTEMA DE REGISTRO DE USUARIOS - MALANGA
// ================================================================

(function() {
  'use strict';

  // ================================================================
  // 1. ELEMENTOS DEL DOM
  // ================================================================

  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');
  var tabLogin = document.getElementById('tab-login');
  var tabRegister = document.getElementById('tab-register');
  var loginError = document.getElementById('login-error');
  var registerError = document.getElementById('register-error');
  var registerSuccess = document.getElementById('register-success');
  var loginBtn = document.getElementById('login-btn');
  var loginBtnContent = document.getElementById('login-btn-content');
  var registerBtn = document.getElementById('register-btn');
  var registerBtnContent = document.getElementById('register-btn-content');

  // ================================================================
  // 2. CAMBIAR ENTRE TABS (Login / Registro)
  // ================================================================

  if (tabLogin) {
    tabLogin.addEventListener('click', function() {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      loginError.classList.remove('visible');
      registerError.classList.remove('visible');
      registerSuccess.classList.remove('visible');
    });
  }

  if (tabRegister) {
    tabRegister.addEventListener('click', function() {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      loginError.classList.remove('visible');
      registerError.classList.remove('visible');
      registerSuccess.classList.remove('visible');
    });
  }

  // ================================================================
  // 3. FUNCIÓN DE REGISTRO
  // ================================================================

  function handleRegister(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Limpiar mensajes anteriores
    if (registerError) {
      registerError.textContent = '';
      registerError.classList.remove('visible');
    }
    if (registerSuccess) {
      registerSuccess.textContent = '';
      registerSuccess.classList.remove('visible');
    }

    // Obtener valores
    var name = document.getElementById('register-name').value.trim();
    var email = document.getElementById('register-email').value.trim();
    var password = document.getElementById('register-password').value;
    var passwordConfirm = document.getElementById('register-password-confirm').value;
    var role = document.getElementById('register-role').value;

    // Validaciones
    if (!name) {
      if (registerError) {
        registerError.textContent = '⚠️ Por favor, ingresa tu nombre completo.';
        registerError.classList.add('visible');
      }
      return;
    }

    if (!email) {
      if (registerError) {
        registerError.textContent = '⚠️ Por favor, ingresa tu correo electrónico.';
        registerError.classList.add('visible');
      }
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      if (registerError) {
        registerError.textContent = '⚠️ Ingresa un correo electrónico válido.';
        registerError.classList.add('visible');
      }
      return;
    }

    if (!password || password.length < 6) {
      if (registerError) {
        registerError.textContent = '⚠️ La contraseña debe tener al menos 6 caracteres.';
        registerError.classList.add('visible');
      }
      return;
    }

    if (password !== passwordConfirm) {
      if (registerError) {
        registerError.textContent = '⚠️ Las contraseñas no coinciden.';
        registerError.classList.add('visible');
      }
      return;
    }

    // Deshabilitar botón mientras se procesa
    if (registerBtn) registerBtn.disabled = true;
    if (registerBtnContent) registerBtnContent.innerHTML = '<span class="spinner"></span> Registrando...';

    // ================================================================
    // REGISTRAR USUARIO EN FIREBASE AUTH
    // ================================================================

    window.auth.createUserWithEmailAndPassword(email, password)
      .then(function(userCredential) {
        var user = userCredential.user;

        // ================================================================
        // GUARDAR PERFIL DEL USUARIO EN REALTIME DATABASE
        // ================================================================

        var userData = {
          uid: user.uid,
          name: name,
          email: email,
          role: role || 'SOCIO',
          active: true,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP
        };

        return window.db.ref('users/' + user.uid).set(userData)
          .then(function() {
            return userData;
          });
      })
      .then(function(userData) {
        // Registrar en auditoría
        return window.writeAudit('register', 'users', userData.uid, 'Usuario registrado: ' + userData.name, userData.uid, userData.name)
          .then(function() {
            return userData;
          });
      })
      .then(function(userData) {
        // Mostrar mensaje de éxito
        if (registerSuccess) {
          registerSuccess.textContent = '✅ ¡Usuario registrado correctamente! Ahora puedes iniciar sesión.';
          registerSuccess.classList.add('visible');
        }

        // Limpiar formulario
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-password-confirm').value = '';

        // Cambiar a login automáticamente después de 2 segundos
        setTimeout(function() {
          if (tabLogin) tabLogin.click();
          if (registerError) registerError.classList.remove('visible');

          // Prellenar email en login
          document.getElementById('login-email').value = email;

          // Mostrar mensaje en login
          if (loginError) {
            loginError.textContent = '✅ Usuario registrado. Ahora inicia sesión con tu contraseña.';
            loginError.classList.add('visible');
          }
        }, 2000);

        if (registerBtn) registerBtn.disabled = false;
        if (registerBtnContent) registerBtnContent.innerHTML = '📝 Registrarse';

        console.log('✅ Usuario registrado:', userData.name, userData.email);
      })
      .catch(function(error) {
        console.error('❌ Error al registrar usuario:', error);

        var errorMsg = '❌ Error al registrar usuario.';

        if (error.code === 'auth/email-already-in-use') {
          errorMsg = '⚠️ Este correo electrónico ya está registrado.';
        } else if (error.code === 'auth/invalid-email') {
          errorMsg = '⚠️ Correo electrónico inválido.';
        } else if (error.code === 'auth/weak-password') {
          errorMsg = '⚠️ La contraseña es demasiado débil. Usa al menos 6 caracteres.';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMsg = '⚠️ El registro de usuarios está deshabilitado en Firebase.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMsg = '⚠️ Error de red. Verifica tu conexión a internet.';
        }

        if (registerError) {
          registerError.textContent = errorMsg;
          registerError.classList.add('visible');
        }

        if (registerBtn) registerBtn.disabled = false;
        if (registerBtnContent) registerBtnContent.innerHTML = '📝 Registrarse';
      });
  }

  // ================================================================
  // 4. CONFIGURAR FUNCIÓN DE REGISTRO COMO GLOBAL
  // ================================================================

  window.handleRegister = handleRegister;

  // ================================================================
  // 5. EVENTO DE REGISTRO
  // ================================================================

  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      handleRegister(e);
    });

    // Permitir Enter en los inputs del formulario de registro
    var registerInputs = registerForm.querySelectorAll('input');
    registerInputs.forEach(function(input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          handleRegister(e);
        }
      });
    });
  }

  // ================================================================
  // 6. FUNCIÓN PARA CREAR PRIMER ADMIN (SI ES NECESARIO)
  // ================================================================

  window.createFirstAdmin = function(email, password, name) {
    if (!confirm('¿Crear usuario ADMIN con email: ' + email + '?')) return;

    window.auth.createUserWithEmailAndPassword(email, password)
      .then(function(userCredential) {
        var user = userCredential.user;
        return window.db.ref('users/' + user.uid).set({
          uid: user.uid,
          name: name || 'Administrador',
          email: email,
          role: 'ADMIN',
          active: true,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP
        });
      })
      .then(function() {
        alert('✅ Usuario ADMIN creado correctamente');
        console.log('✅ Usuario ADMIN creado:', email);
      })
      .catch(function(error) {
        console.error('❌ Error:', error);
        alert('❌ Error: ' + error.message);
      });
  };

  console.log('✅ Sistema de registro cargado correctamente');

})();