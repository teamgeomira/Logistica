import { APP_CONFIG } from './config.js';

export function formatMoney(amount, currency = APP_CONFIG.currency) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(Number(amount) || 0);
}

export function formatDate(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleDateString('es-ES');
}

export function formatDateTime(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleString('es-ES');
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}