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