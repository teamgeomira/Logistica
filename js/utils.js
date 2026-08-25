// ================================================================
// FUNCIONES DE UTILIDAD - MALANGA v2.1.0
// ================================================================

// ================================================================
// 1. FORMATEO DE FECHAS
// ================================================================

// Formatear fecha
window.formatDate = function(ts) {
  if (!ts) return '';
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return '';
  }
};

// Formatear fecha y hora
window.formatDateTime = function(ts) {
  if (!ts) return '';
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return '';
  }
};

// Obtener fecha de hoy en formato ISO (YYYY-MM-DD)
window.todayISO = function() {
  try {
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

// Obtener fecha y hora actual en formato ISO completo
window.nowISO = function() {
  try {
    return new Date().toISOString();
  } catch (e) {
    return '';
  }
};

// ================================================================
// 2. FORMATEO DE MONEDA
// ================================================================

// Formatear número como moneda
window.formatMoney = function(amount) {
  if (amount === undefined || amount === null) return '';
  const num = Number(amount);
  if (isNaN(num)) return '';
  
  const symbol = window.APP_CONFIG?.currencySymbol || '$';
  const formatted = num.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return symbol + formatted;
};

// Formatear número como moneda con signo
window.formatMoneySigned = function(amount) {
  if (amount === undefined || amount === null) return '';
  const num = Number(amount);
  if (isNaN(num)) return '';
  
  const symbol = window.APP_CONFIG?.currencySymbol || '$';
  const sign = num >= 0 ? '+' : '-';
  const formatted = Math.abs(num).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return sign + ' ' + symbol + formatted;
};

// Formatear número sin moneda (para porcentajes, cantidades, etc.)
window.formatNumber = function(number, decimals) {
  if (number === undefined || number === null) return '';
  const num = Number(number);
  if (isNaN(num)) return '';
  
  decimals = decimals || 0;
  return num.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// ================================================================
// 3. SEGURIDAD - ESCAPAR HTML
// ================================================================

// Escapar HTML para prevenir XSS
window.escapeHtml = function(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#x60;')
    .replace(/\//g, '&#x2F;');
};

// Desescapar HTML (para mostrar texto con formato)
window.unescapeHtml = function(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x60;/g, '`')
    .replace(/&#x2F;/g, '/');
};

// ================================================================
// 4. UTILIDADES DE STRING
// ================================================================

// Truncar texto con puntos suspensivos
window.truncateText = function(text, maxLength) {
  if (!text) return '';
  maxLength = maxLength || 50;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Capitalizar primera letra
window.capitalize = function(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Capitalizar cada palabra
window.capitalizeWords = function(str) {
  if (!str) return '';
  return str.split(' ').map(function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
};

// ================================================================
// 5. VALIDACIONES
// ================================================================

// Validar email
window.isValidEmail = function(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validar teléfono (formato internacional básico)
window.isValidPhone = function(phone) {
  if (!phone) return false;
  const regex = /^[\+\d\s\-\(\)]{7,20}$/;
  return regex.test(phone);
};

// Validar URL
window.isValidUrl = function(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// ================================================================
// 6. UTILIDADES DE ARRAYS Y OBJETOS
// ================================================================

// Agrupar array por clave
window.groupBy = function(array, key) {
  if (!array || !key) return {};
  return array.reduce(function(result, item) {
    const groupKey = item[key] || 'undefined';
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {});
};

// Ordenar array por campo
window.sortBy = function(array, field, ascending) {
  if (!array || !field) return array;
  ascending = ascending !== false;
  return array.slice().sort(function(a, b) {
    const valA = a[field] || '';
    const valB = b[field] || '';
    if (typeof valA === 'string') {
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return ascending ? valA - valB : valB - valA;
  });
};

// Filtrar array por término de búsqueda
window.filterByTerm = function(array, term, fields) {
  if (!array || !term) return array;
  term = term.toLowerCase();
  fields = fields || [];
  
  return array.filter(function(item) {
    for (var i = 0; i < fields.length; i++) {
      var value = item[fields[i]];
      if (value && String(value).toLowerCase().indexOf(term) !== -1) {
        return true;
      }
    }
    return false;
  });
};

// ================================================================
// 7. DEBOUNCE Y THROTTLE
// ================================================================

// Debounce - retrasar ejecución de función
window.debounce = function(fn, delay) {
  delay = delay || 300;
  let timer;
  return function() {
    var args = arguments;
    var context = this;
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
};

// Throttle - limitar ejecución de función
window.throttle = function(fn, limit) {
  limit = limit || 300;
  let inThrottle = false;
  return function() {
    var args = arguments;
    var context = this;
    if (!inThrottle) {
      fn.apply(context, args);
      inThrottle = true;
      setTimeout(function() {
        inThrottle = false;
      }, limit);
    }
  };
};

// ================================================================
// 8. UTILIDADES DE COLORES
// ================================================================

// Generar color basado en string (para avatares)
window.stringToColor = function(str) {
  if (!str) return '#2d6a4f';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#2d6a4f', '#40916c', '#1b4332', '#52b788', '#74c69d',
    '#c0392b', '#e67e22', '#f1c40f', '#27ae60', '#2980b9',
    '#8e44ad', '#e74c3c', '#2ecc71', '#3498db', '#9b59b6',
    '#1abc9c', '#f39c12', '#d35400', '#16a085', '#2c3e50'
  ];
  return colors[Math.abs(hash) % colors.length];
};

// Obtener iniciales
window.getInitials = function(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(' ');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// ================================================================
// 9. UTILIDADES DE NAVEGADOR
// ================================================================

// Detectar si está en modo PWA
window.isPWA = function() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

// Detectar si es dispositivo móvil
window.isMobile = function() {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detectar si es modo oscuro
window.isDarkMode = function() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// ================================================================
// 10. CÁLCULOS AUTOMÁTICOS EN FORMULARIOS
// ================================================================

// Función para actualizar campos calculados en tiempo real
window.updateCalculatedFields = function(entity, form) {
  var config = window.ENTITY_CONFIG[entity];
  if (!config || !config.fields) return;

  config.fields.forEach(function(field) {
    if (field.calculatedFrom && field.calculatedFrom.length > 0) {
      var targetInput = form.querySelector('[name="' + field.name + '"]');
      if (!targetInput) return;

      // Obtener valores de los campos origen
      var values = field.calculatedFrom.map(function(srcName) {
        var input = form.querySelector('[name="' + srcName + '"]');
        if (!input) return 0;
        var val = parseFloat(input.value) || 0;
        return val;
      });

      // Calcular el resultado (multiplicación)
      var result = values.reduce(function(acc, val) { return acc * val; }, 1);

      // Si es moneda, formatear con 2 decimales
      var isMoney = field.name === 'amount' || field.name === 'total' || field.name === 'cost' || field.name === 'price';
      if (isMoney) {
        targetInput.value = result.toFixed(2);
      } else {
        targetInput.value = result;
      }

      // Disparar evento change para que otros listeners se enteren
      var event = new Event('change', { bubbles: true });
      targetInput.dispatchEvent(event);
    }
  });
};

// Función para vincular eventos de cálculo automático
window.bindAutoCalculations = function(entity, form) {
  var config = window.ENTITY_CONFIG[entity];
  if (!config || !config.fields) return;

  // Encontrar todos los campos que tienen calculatedFrom
  var calculatedFields = config.fields.filter(function(f) { return f.calculatedFrom && f.calculatedFrom.length > 0; });
  if (calculatedFields.length === 0) return;

  // Obtener todos los nombres de campos origen
  var sourceFields = [];
  calculatedFields.forEach(function(f) {
    f.calculatedFrom.forEach(function(src) {
      if (sourceFields.indexOf(src) === -1) sourceFields.push(src);
    });
  });

  // Agregar event listeners a los campos origen
  sourceFields.forEach(function(fieldName) {
    var input = form.querySelector('[name="' + fieldName + '"]');
    if (!input) return;

    // Función de actualización con debounce para mejor rendimiento
    var update = window.debounce(function() {
      window.updateCalculatedFields(entity, form);
    }, 150);

    // Múltiples eventos para capturar todos los cambios
    input.addEventListener('input', update);
    input.addEventListener('change', update);
    input.addEventListener('keyup', update);
    input.addEventListener('blur', update);
  });

  // Ejecutar cálculo inicial
  setTimeout(function() {
    window.updateCalculatedFields(entity, form);
  }, 50);

  console.log('✅ Cálculos automáticos vinculados para:', entity);
};

// Función para vincular cálculos en formularios existentes
window.bindAllAutoCalculations = function() {
  var forms = document.querySelectorAll('#entity-form');
  forms.forEach(function(form) {
    // Intentar determinar la entidad desde el formulario
    var entity = form.dataset.entity;
    if (!entity) {
      // Buscar en el modal
      var modal = form.closest('.modal');
      if (modal) {
        var title = modal.querySelector('.modal-title');
        if (title) {
          var text = title.textContent || '';
          var entities = Object.keys(window.ENTITY_CONFIG || {});
          for (var i = 0; i < entities.length; i++) {
            if (text.toLowerCase().indexOf(entities[i].toLowerCase()) !== -1) {
              entity = entities[i];
              break;
            }
          }
        }
      }
    }
    if (entity) {
      window.bindAutoCalculations(entity, form);
    }
  });
};

// ================================================================
// 11. GENERACIÓN DE IDENTIFICADORES
// ================================================================

// Generar ID único corto
window.generateId = function(prefix) {
  prefix = prefix || '';
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + result;
};

// Generar número de referencia
window.generateReference = function(prefix) {
  prefix = prefix || 'REF';
  var date = new Date();
  var year = date.getFullYear().toString().slice(-2);
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  var random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return prefix + '-' + year + month + day + '-' + random;
};

// ================================================================
// 12. MANEJO DE ERRORES
// ================================================================

// Mostrar error amigable
window.showError = function(message, details) {
  console.error('❌ Error:', message, details || '');
  
  // Mostrar en toast si está disponible
  if (typeof showToast === 'function') {
    showToast('⚠️ ' + message);
  }
  
  // Mostrar en consola con detalles
  if (details) {
    console.error('Detalles:', details);
  }
};

// Manejar errores de Firebase
window.handleFirebaseError = function(error) {
  var messages = {
    'auth/user-not-found': 'Usuario no encontrado. Verifica tu email.',
    'auth/wrong-password': 'Contraseña incorrecta. Intenta nuevamente.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
    'auth/invalid-email': 'Email inválido. Verifica el formato.',
    'auth/user-disabled': 'Usuario desactivado. Contacta al administrador.',
    'auth/email-already-in-use': 'Este email ya está registrado.',
    'auth/weak-password': 'La contraseña es demasiado débil.',
    'auth/requires-recent-login': 'Requiere autenticación reciente.',
    'permission-denied': 'No tienes permiso para realizar esta acción.'
  };
  
  var code = error.code || '';
  var message = messages[code] || error.message || 'Error desconocido';
  
  return {
    code: code,
    message: message,
    original: error
  };
};

console.log('✅ Utilidades y cálculos automáticos cargados correctamente');
console.log('📦 Versión: Malanga v2.1.0');