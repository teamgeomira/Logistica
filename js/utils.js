// Utilidades globales - SIN IMPORTS/EXPORTS
window.formatMoney = function(amount, currency = window.APP_CONFIG.currency) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(Number(amount) || 0);
};

window.formatDate = function(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleDateString('es-ES');
};

window.formatDateTime = function(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleString('es-ES');
};

window.escapeHtml = function(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

window.todayISO = function() {
  return new Date().toISOString().split('T')[0];
};

window.debounce = function(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

window.getUserName = function(userId) {
  if (!state || !state.data || !state.data.users) return userId;
  const user = state.data.users[userId];
  return user ? (user.name || user.email || userId) : userId;
};