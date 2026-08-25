// ================================================================
// FUNCIONES DE UTILIDAD
// ================================================================

// Formatear fecha
window.formatDate = function(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Formatear fecha y hora
window.formatDateTime = function(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Formatear número como moneda
window.formatMoney = function(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  const symbol = window.APP_CONFIG?.currencySymbol || '$';
  return symbol + Number(amount).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Escapar HTML para seguridad
window.escapeHtml = function(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Obtener fecha de hoy en formato ISO
window.todayISO = function() {
  return new Date().toISOString().split('T')[0];
};

// Debounce para evitar múltiples llamadas
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

// ================================================================
// CÁLCULOS AUTOMÁTICOS EN FORMULARIOS
// ================================================================

// Función para actualizar campos calculados
window.updateCalculatedFields = function(entity, form) {
  var config = window.ENTITY_CONFIG[entity];
  if (!config || !config.fields) return;

  // Buscar campos que tienen calculatedFrom
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
      var isMoney = field.name === 'amount' || field.name === 'total' || field.name === 'cost';
      if (isMoney) {
        targetInput.value = result.toFixed(2);
      } else {
        targetInput.value = result;
      }
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

    var update = function() {
      window.updateCalculatedFields(entity, form);
    };

    input.addEventListener('input', update);
    input.addEventListener('change', update);
    input.addEventListener('keyup', update);
  });

  // Ejecutar cálculo inicial
  window.updateCalculatedFields(entity, form);
};

// ================================================================
// EXTENSIÓN DE showForm PARA INCLUIR CÁLCULOS AUTOMÁTICOS
// ================================================================

// Guardar referencia a showForm original
var _originalShowForm = window.showForm;

// Sobrescribir showForm para incluir cálculos automáticos
window.showForm = function(entity, record) {
  // Llamar a la función original
  if (_originalShowForm) {
    _originalShowForm(entity, record);
  }

  // Esperar a que el DOM se actualice y vincular cálculos automáticos
  setTimeout(function() {
    var form = document.getElementById('entity-form');
    if (form) {
      window.bindAutoCalculations(entity, form);
    }
  }, 50);
};

// ================================================================
// EXTENSIÓN DE handleFormSubmit PARA INCLUIR CÁLCULOS
// ================================================================

// Guardar referencia a handleFormSubmit original
var _originalHandleFormSubmit = window.handleFormSubmit;

// Sobrescribir handleFormSubmit
window.handleFormSubmit = function(entity, record) {
  // Actualizar cálculos antes de enviar
  var form = document.getElementById('entity-form');
  if (form) {
    window.updateCalculatedFields(entity, form);
  }

  // Llamar a la función original
  if (_originalHandleFormSubmit) {
    _originalHandleFormSubmit(entity, record);
  }
};