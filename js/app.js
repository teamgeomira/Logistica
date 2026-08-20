// Aplicación principal (global) - SIN IMPORTS/EXPORTS
const state = {
  currentUser: null,
  userProfile: null,
  data: {},
  listeners: [],
  currentSection: 'dashboard',
  currentChild: 'expenses',
  online: true,
  toastTimer: null,
  settings: {}
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initAuth();
  initConnectionStatus();
  initSettings();
});

function initUI() {
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('reset-password').addEventListener('click', handleResetPassword);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('fab').addEventListener('click', showQuickMenu);
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
  });
  document.getElementById('quick-menu').addEventListener('click', (e) => {
    if (e.target.id === 'quick-menu') closeQuickMenu();
  });
  document.addEventListener('click', handleGlobalClick);
  document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block';
}

async function initSettings() {
  try {
    const settingsRef = window.db.ref('appSettings');
    const snap = await settingsRef.get();
    const settings = snap.val() || {};
    state.settings = settings;
    if (settings.currencySymbol) {
      window.APP_CONFIG.currencySymbol = settings.currencySymbol;
    }
  } catch (error) {
    console.warn('Error al cargar configuración:', error);
    state.settings = window.DEFAULT_SETTINGS || {};
  }
}

// ============================================
// AUTENTICACIÓN
// ============================================
function initAuth() {
  window.watchAuth((user, profile) => {
    if (user && profile) {
      state.currentUser = user;
      state.userProfile = profile;
      state.data = {};
      showApp();
      subscribeToAllEntities();
      renderAll();
      showToast(`Bienvenido, ${profile.name || profile.email || 'Usuario'}`);
    } else {
      showLogin();
    }
  });
}

function initConnectionStatus() {
  window.onConnectionChange((online) => {
    state.online = online;
    updateConnectionStatus();
  });
}

function updateConnectionStatus() {
  const el = document.getElementById('connection-status');
  if (el) {
    el.textContent = state.online ? '🟢' : '🟠';
    el.title = state.online ? 'Conectado' : 'Desconectado';
  }
}

function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app-screen').classList.add('hidden');
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';
  
  if (!email || !password) {
    errorEl.textContent = 'Por favor, completa todos los campos.';
    return;
  }
  
  try {
    await window.login(email, password);
  } catch (err) {
    console.error('Login error:', err);
    errorEl.textContent = 'Error al iniciar sesión. Verifica tus credenciales.';
  }
}

async function handleResetPassword() {
  const email = document.getElementById('login-email').value.trim();
  if (!email) {
    showToast('Introduce tu email primero.');
    return;
  }
  try {
    await window.resetPassword(email);
    showToast('Correo de recuperación enviado.');
  } catch (err) {
    console.error('Reset password error:', err);
    showToast('Error al enviar el correo de recuperación.');
  }
}

async function handleLogout() {
  try {
    await window.logout();
    showToast('Sesión cerrada correctamente.');
  } catch (err) {
    console.error('Logout error:', err);
    showToast('Error al cerrar sesión.');
  }
}

// ============================================
// DATOS Y SUSCRIPCIONES
// ============================================
function subscribeToAllEntities() {
  const entities = [
    'users', 'projects', 'lands', 'expenses', 'contributions', 'workers',
    'workLogs', 'seeds', 'agriculturalProducts', 'cropActivities',
    'incidents', 'harvests', 'sales', 'journal', 'attachments', 'auditLogs',
    'partners', 'appSettings'
  ];
  entities.forEach((entity) => {
    const unsub = window.subscribeToEntity(entity, (data) => {
      state.data[entity] = data;
      renderCurrentView();
    });
    state.listeners.push(unsub);
  });
}

// ============================================
// RENDER PRINCIPAL
// ============================================
function renderAll() {
  renderNavigation();
  renderCurrentView();
}

function renderNavigation() {
  const sidebar = document.getElementById('sidebar');
  const bottomNav = document.getElementById('bottom-nav');
  if (!sidebar || !bottomNav) return;

  let sidebarHtml = '';
  let bottomHtml = '';
  window.NAV_SECTIONS.forEach((section) => {
    const active = state.currentSection === section.id ? 'active' : '';
    sidebarHtml += `<a href="#" class="${active}" data-section="${section.id}">
      <span>${section.icon}</span><span>${section.label}</span>
    </a>`;
    bottomHtml += `<button class="${active}" data-section="${section.id}">
      <span class="nav-icon">${section.icon}</span>
      <span>${section.label}</span>
    </button>`;
  });
  sidebar.innerHTML = sidebarHtml;
  bottomNav.innerHTML = bottomHtml;
}

function renderCurrentView() {
  const main = document.getElementById('main-content');
  if (!main) return;
  const section = window.NAV_SECTIONS.find(s => s.id === state.currentSection) || window.NAV_SECTIONS[0];
  
  let content = '';
  if (section.type === 'dashboard') {
    content = renderDashboard();
  } else if (section.type === 'list') {
    content = renderList(section.entity);
  } else if (section.type === 'group') {
    content = renderGroup(section);
  } else if (section.type === 'config') {
    content = renderConfig();
  } else {
    content = '<p>Sección en construcción</p>';
  }
  
  main.innerHTML = content;
  bindListSearch();
  bindFormEvents();
}

// ============================================
// DASHBOARD
// ============================================
function renderDashboard() {
  const expenses = sumEntity('expenses', 'amount');
  const contributions = sumEntity('contributions', 'amount');
  const sales = sumEntity('sales', 'total');
  const harvestKg = sumEntity('harvests', 'quantity');
  const salesKg = sumEntity('sales', 'quantity');
  const resultado = contributions + sales - expenses;
  const totalPartners = Object.values(state.data.partners || {}).filter(p => !p.deleted && p.status === 'ACTIVO').length;

  const alerts = computeAlerts();
  const recent = getRecentActivity(5);

  return `
    <div class="dashboard">
      <h2>📊 Panel de Control</h2>
      <div class="cards-grid">
        <div class="stat-card"><div class="stat-label">Socios activos</div><div class="stat-value">${totalPartners}</div></div>
        <div class="stat-card"><div class="stat-label">Capital aportado</div><div class="stat-value">${window.formatMoney(contributions)}</div></div>
        <div class="stat-card"><div class="stat-label">Gastos</div><div class="stat-value">${window.formatMoney(expenses)}</div></div>
        <div class="stat-card"><div class="stat-label">Ingresos</div><div class="stat-value">${window.formatMoney(sales)}</div></div>
        <div class="stat-card"><div class="stat-label">Resultado</div><div class="stat-value">${window.formatMoney(resultado)}</div></div>
        <div class="stat-card"><div class="stat-label">Producción</div><div class="stat-value">${harvestKg} kg</div></div>
        <div class="stat-card"><div class="stat-label">Kg vendidos</div><div class="stat-value">${salesKg} kg</div></div>
      </div>

      <div class="alerts">
        <h3>⚠️ Alertas</h3>
        ${alerts.length ? alerts.map(a => `<div class="alert-item ${a.type}">${a.icon} ${a.message}</div>`).join('') : '<p class="empty">✅ Sin alertas activas</p>'}
      </div>

      <div class="recent-activity">
        <h3>📋 Actividad reciente</h3>
        ${recent.length ? recent.map(log => `
          <div class="list-item">
            <div class="list-main">
              <span class="item-date">${window.formatDateTime(log.timestamp)}</span>
              <span class="item-text">${window.escapeHtml(log.description)}</span>
            </div>
          </div>`).join('') : '<p class="empty">Sin actividad reciente</p>'}
      </div>
    </div>
  `;
}

function sumEntity(entity, field) {
  const records = Object.values(state.data[entity] || {}).filter(r => !r.deleted);
  return records.reduce((sum, r) => sum + (Number(r[field]) || 0), 0);
}

function computeAlerts() {
  const alerts = [];
  const now = Date.now();
  const in30Days = now + 30 * 24 * 60 * 60 * 1000;

  Object.values(state.data.lands || {}).filter(l => !l.deleted && l.status === 'ACTIVO').forEach(land => {
    if (land.rentalEnd && new Date(land.rentalEnd).getTime() < in30Days) {
      alerts.push({ type: 'alert-warning', icon: '⚠️', message: `Alquiler próximo a vencer: ${land.name}` });
    }
  });

  Object.values(state.data.incidents || {}).filter(i => !i.deleted && i.status !== 'RESOLVED').forEach(inc => {
    alerts.push({ type: 'alert-danger', icon: '🚨', message: `Incidencia abierta: ${(inc.description || '').substring(0, 40)}` });
  });

  Object.values(state.data.sales || {}).filter(s => !s.deleted && s.paymentStatus !== 'COBRADO').forEach(sale => {
    alerts.push({ type: 'alert-warning', icon: '💳', message: `Venta pendiente de cobro: ${sale.customer || 'Cliente'} - ${window.formatMoney(sale.total || 0)}` });
  });

  return alerts;
}

function getRecentActivity(limit = 5) {
  const logs = Object.values(state.data.auditLogs || {})
    .filter(l => l.timestamp)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, limit);
  return logs;
}

// ============================================
// LISTAS
// ============================================
function renderList(entity) {
  const config = window.ENTITY_CONFIG[entity];
  if (!config) return '<p class="empty">Entidad no configurada</p>';
  if (entity === 'users') return renderUsers();
  if (entity === 'attachments') return renderAttachments();
  if (entity === 'auditLogs') return renderAuditLogs();
  if (entity === 'appSettings') return renderConfig();

  const records = Object.values(state.data[entity] || {})
    .filter(r => !r.deleted)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  let html = `
    <div class="section-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <h2>${config.icon} ${config.label}</h2>
      ${config.fields && config.fields.length > 0 ? `<button class="btn-sm" data-action="new" data-entity="${entity}">+ Nuevo</button>` : ''}
    </div>
    <div class="search-box"><input type="search" placeholder="Buscar en ${config.label.toLowerCase()}..." data-search-list></div>
    <div class="list">
  `;
  if (records.length === 0) {
    html += '<p class="empty">No hay registros.</p>';
  } else {
    records.forEach(record => {
      const canEdit = state.userProfile?.role === 'ADMIN' || record.createdBy === state.currentUser?.uid;
      html += `<div class="list-item" data-record-id="${record.id}">`;
      html += `<div class="list-main">`;
      config.listFields.forEach(fieldName => {
        const field = config.fields?.find(f => f.name === fieldName);
        const value = record[fieldName];
        if (value === undefined || value === null) return;
        
        // Relaciones
        if (field?.optionsFrom === 'lands') {
          const land = state.data.lands?.[value];
          html += `<span class="item-text">${window.escapeHtml(land ? land.name || value : value)}</span>`;
          return;
        }
        if (field?.optionsFrom === 'users' || field?.optionsFrom === 'partners') {
          const user = state.data[field.optionsFrom]?.[value];
          html += `<span class="item-text">${window.escapeHtml(user ? user.name || user.email || value : value)}</span>`;
          return;
        }
        if (field?.optionsFrom === 'workers') {
          const worker = state.data.workers?.[value];
          html += `<span class="item-text">${window.escapeHtml(worker ? worker.name || value : value)}</span>`;
          return;
        }
        
        // Tipos
        if (field?.type === 'date' && value) {
          html += `<span class="item-date">${window.formatDate(value)}</span>`;
        } else if (field?.type === 'number' || fieldName.match(/amount|cost|price|total|rate|capital|rentalCost|contributionAmount/)) {
          html += `<span class="item-number">${window.formatMoney(value)}</span>`;
        } else if (field?.type === 'checkbox') {
          html += `<span class="item-text">${value ? '✅' : '❌'}</span>`;
        } else {
          html += `<span class="item-text">${window.escapeHtml(String(value))}</span>`;
        }
      });
      html += `</div>`;
      if (canEdit && config.fields && config.fields.length > 0) {
        html += `<div class="list-actions">
          <button class="btn-icon" data-action="edit" data-entity="${entity}" data-id="${record.id}" title="Editar">✏️</button>
          <button class="btn-icon" data-action="delete" data-entity="${entity}" data-id="${record.id}" title="Eliminar">🗑️</button>
        </div>`;
      }
      html += `</div>`;
    });
  }
  html += `</div>`;
  return html;
}

function renderGroup(section) {
  const children = section.children || [];
  if (!children.length) return '';
  if (!children.includes(state.currentChild)) {
    state.currentChild = children[0];
  }
  let html = `<div class="subnav">`;
  children.forEach(child => {
    const cfg = window.ENTITY_CONFIG[child];
    if (!cfg) return;
    if (child === 'users' && state.userProfile?.role !== 'ADMIN') return;
    html += `<button class="chip ${child === state.currentChild ? 'active' : ''}" data-child="${child}">${cfg.icon} ${cfg.label}</button>`;
  });
  html += `</div><div id="list-container">${renderList(state.currentChild)}</div>`;
  return html;
}

// ============================================
// USUARIOS, ARCHIVOS, AUDITORÍA
// ============================================
function renderUsers() {
  if (state.userProfile?.role !== 'ADMIN') {
    return '<p class="empty">No tienes permiso para ver usuarios.</p>';
  }
  const users = Object.values(state.data.users || {}).filter(u => u.uid);
  return `
    <h2>👥 Usuarios</h2>
    <div class="list">
      ${users.length ? users.map(user => `
        <div class="list-item">
          <div class="list-main">
            <span class="item-text"><strong>${window.escapeHtml(user.name || 'Sin nombre')}</strong></span>
            <span class="item-text">${window.escapeHtml(user.email || '')}</span>
            <span class="item-text">Rol: ${window.escapeHtml(user.role || 'SOCIO')}</span>
            <span class="item-text">${user.active !== false ? '✅ Activo' : '❌ Inactivo'}</span>
          </div>
          <div class="list-actions">
            <button class="btn-icon" data-action="toggle-role" data-id="${user.uid}" data-role="${user.role === 'ADMIN' ? 'SOCIO' : 'ADMIN'}" title="Cambiar rol">🔁</button>
            <button class="btn-icon" data-action="toggle-active" data-id="${user.uid}" data-active="${user.active !== false ? 'false' : 'true'}" title="Activar/Desactivar">${user.active !== false ? '🚫' : '✅'}</button>
          </div>
        </div>`).join('') : '<p class="empty">No hay usuarios.</p>'}
    </div>
  `;
}

function renderAttachments() {
  return `
    <h2>📎 Archivos</h2>
    <div class="upload-box">
      <input type="file" id="attachment-file" accept=".jpg,.jpeg,.png,.webp,.pdf">
      <button class="btn-primary" id="upload-attachment-btn">Subir archivo</button>
      <div id="upload-progress" class="upload-progress"></div>
    </div>
    <div class="list">
      ${Object.values(state.data.attachments || {}).filter(a => !a.deleted).sort((a,b)=>(b.uploadedAt||0)-(a.uploadedAt||0)).map(a => `
        <div class="list-item">
          <div class="list-main">
            <span class="item-text">${window.escapeHtml(a.fileName || 'Archivo')}</span>
            <span class="item-date">${window.formatDate(a.uploadedAt)}</span>
            <span class="item-text"><a href="${window.escapeHtml(a.url)}" target="_blank">🔗 Ver</a></span>
          </div>
        </div>`).join('') || '<p class="empty">No hay archivos.</p>'}
    </div>
  `;
}

function renderAuditLogs() {
  const logs = Object.values(state.data.auditLogs || {})
    .sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));
  return `
    <h2>🧾 Auditoría</h2>
    <div class="list">
      ${logs.length ? logs.map(log => `
        <div class="list-item">
          <div class="list-main">
            <span class="item-date">${window.formatDateTime(log.timestamp)}</span>
            <span class="item-text"><strong>${window.escapeHtml(log.userName || '')}</strong></span>
            <span class="item-text">${window.escapeHtml(log.action || '')}</span>
            <span class="item-text">${window.escapeHtml(log.description || '')}</span>
          </div>
        </div>`).join('') : '<p class="empty">Sin registros de auditoría.</p>'}
    </div>
  `;
}

// ============================================
// CONFIGURACIÓN
// ============================================
function renderConfig() {
  if (state.userProfile?.role !== 'ADMIN') {
    return '<p class="empty">⛔ No tienes permiso para acceder a la configuración.</p>';
  }

  const settings = state.data.appSettings || {};
  
  let html = `
    <div class="config-section">
      <h2>⚙️ Configuración de la aplicación</h2>
      <p class="config-subtitle">Configura los parámetros generales del sistema</p>
      
      <div class="config-grid">
        <div class="config-card">
          <h3>💰 Moneda</h3>
          <div class="form-group">
            <label for="config-currency">Símbolo de moneda</label>
            <input type="text" id="config-currency" value="${settings.currencySymbol || '$'}" placeholder="$">
          </div>
          <div class="form-group">
            <label for="config-currency-code">Código de moneda</label>
            <input type="text" id="config-currency-code" value="${settings.currency || 'USD'}" placeholder="USD">
          </div>
        </div>
        
        <div class="config-card">
          <h3>🏢 Empresa</h3>
          <div class="form-group">
            <label for="config-company">Nombre de la empresa</label>
            <input type="text" id="config-company" value="${settings.companyName || 'Malanga Agrícola'}">
          </div>
          <div class="form-group">
            <label for="config-email">Email de contacto</label>
            <input type="email" id="config-email" value="${settings.companyEmail || 'info@malanga.com'}">
          </div>
          <div class="form-group">
            <label for="config-phone">Teléfono</label>
            <input type="text" id="config-phone" value="${settings.companyPhone || '+1 123 456 7890'}">
          </div>
        </div>
        
        <div class="config-card">
          <h3>📊 Impuestos</h3>
          <div class="form-group">
            <label for="config-tax">Tasa de impuesto (%)</label>
            <input type="number" id="config-tax" value="${settings.taxRate || 0}" step="0.01" min="0" max="100">
          </div>
        </div>
        
        <div class="config-card">
          <h3>📁 Proyecto</h3>
          <div class="form-group">
            <label for="config-project">Proyecto por defecto</label>
            <input type="text" id="config-project" value="${settings.defaultProject || 'malanga-2026'}">
          </div>
        </div>
      </div>
      
      <div class="config-actions">
        <button class="btn-primary" id="save-config-btn">💾 Guardar configuración</button>
        <button class="btn-secondary" id="reset-config-btn">↺ Restablecer por defecto</button>
      </div>
    </div>
  `;
  
  return html;
}

async function saveConfig() {
  const settings = {
    currencySymbol: document.getElementById('config-currency').value.trim() || '$',
    currency: document.getElementById('config-currency-code').value.trim() || 'USD',
    companyName: document.getElementById('config-company').value.trim() || 'Malanga Agrícola',
    companyEmail: document.getElementById('config-email').value.trim() || 'info@malanga.com',
    companyPhone: document.getElementById('config-phone').value.trim() || '+1 123 456 7890',
    taxRate: parseFloat(document.getElementById('config-tax').value) || 0,
    defaultProject: document.getElementById('config-project').value.trim() || 'malanga-2026',
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
    updatedBy: state.currentUser.uid
  };
  
  try {
    const settingsRef = window.db.ref('appSettings');
    await settingsRef.update(settings);
    state.settings = settings;
    window.APP_CONFIG.currencySymbol = settings.currencySymbol;
    showToast('✅ Configuración guardada correctamente');
    renderCurrentView();
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    showToast('❌ Error al guardar la configuración');
  }
}

async function resetConfig() {
  if (!confirm('¿Restablecer la configuración a los valores por defecto?')) return;
  
  const settings = window.DEFAULT_SETTINGS || {
    currencySymbol: '$',
    currency: 'USD',
    companyName: 'Malanga Agrícola',
    companyEmail: 'info@malanga.com',
    companyPhone: '+1 123 456 7890',
    taxRate: 0,
    defaultProject: 'malanga-2026'
  };
  
  try {
    const settingsRef = window.db.ref('appSettings');
    await settingsRef.update({
      ...settings,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      updatedBy: state.currentUser.uid
    });
    state.settings = settings;
    window.APP_CONFIG.currencySymbol = settings.currencySymbol;
    showToast('✅ Configuración restablecida');
    renderCurrentView();
  } catch (error) {
    console.error('Error al restablecer configuración:', error);
    showToast('❌ Error al restablecer la configuración');
  }
}

// ============================================
// FORMULARIOS AVANZADOS
// ============================================
function showForm(entity, record = null) {
  const config = window.ENTITY_CONFIG[entity];
  if (!config || !config.fields || config.fields.length === 0) {
    showToast('Esta entidad no tiene formulario configurado.');
    return;
  }
  const isEdit = !!record;
  const title = isEdit ? `Editar ${config.singular}` : `Nuevo ${config.singular}`;
  const fieldsHtml = buildFormFields(entity, record);
  const modal = document.getElementById('modal');
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" data-dismiss="modal">×</button>
      </div>
      <form id="entity-form">
        ${fieldsHtml}
        <div class="form-actions">
          <button type="submit" class="btn-primary">💾 Guardar</button>
          <button type="button" class="btn-secondary" data-dismiss="modal">Cancelar</button>
        </div>
      </form>
    </div>`;
  modal.classList.remove('hidden');
  modal.querySelector('#entity-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(entity, record);
  });
  modal.querySelector('[data-dismiss]').addEventListener('click', closeModal);
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
}

function buildFormFields(entity, record = null) {
  const config = window.ENTITY_CONFIG[entity];
  const recordData = record || {};
  let html = '';
  
  // Si tiene grupos, usarlos
  const groups = config.fieldGroups || [{ title: 'Datos', fields: config.fields.map(f => f.name) }];
  
  groups.forEach(group => {
    const groupFields = config.fields.filter(f => group.fields.includes(f.name));
    if (groupFields.length === 0) return;
    
    html += `<div class="field-group">`;
    html += `<div class="field-group-title">${group.title}</div>`;
    
    groupFields.forEach(field => {
      let value = recordData[field.name] ?? field.defaultValue ?? '';
      if (field.type === 'date' && !value) value = window.todayISO();
      
      html += `<div class="form-group"><label for="f_${field.name}">${field.label}${field.required ? ' *' : ''}</label>`;
      switch (field.type) {
        case 'textarea':
          html += `<textarea id="f_${field.name}" name="${field.name}" ${field.required ? 'required' : ''} rows="${field.rows || 3}" placeholder="${field.placeholder || ''}">${window.escapeHtml(value)}</textarea>`;
          break;
        case 'select':
          html += `<select id="f_${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>`;
          if (!field.required) html += `<option value="">— Seleccionar —</option>`;
          const options = getOptions(field);
          options.forEach(opt => {
            const selected = String(value) === String(opt.value) ? 'selected' : '';
            html += `<option value="${window.escapeHtml(opt.value)}" ${selected}>${window.escapeHtml(opt.label)}</option>`;
          });
          html += `</select>`;
          break;
        case 'checkbox':
          const checked = value ? 'checked' : '';
          html += `<input type="checkbox" id="f_${field.name}" name="${field.name}" ${checked}>`;
          break;
        case 'number':
          html += `<input type="number" id="f_${field.name}" name="${field.name}" value="${value}" ${field.required ? 'required' : ''} ${field.step ? `step="${field.step}"` : ''} ${field.min !== undefined ? `min="${field.min}"` : ''} ${field.max !== undefined ? `max="${field.max}"` : ''} placeholder="${field.placeholder || ''}">`;
          break;
        default:
          html += `<input type="${field.type}" id="f_${field.name}" name="${field.name}" value="${window.escapeHtml(value)}" ${field.required ? 'required' : ''} ${field.min !== undefined ? `min="${field.min}"` : ''} ${field.max !== undefined ? `max="${field.max}"` : ''} placeholder="${field.placeholder || ''}">`;
      }
      html += `</div>`;
    });
    
    html += `</div>`;
  });
  
  return html;
}

function getOptions(field) {
  const source = field.optionsFrom;
  if (source === 'lands') {
    return Object.values(state.data.lands || {}).filter(l => !l.deleted).map(l => ({ value: l.id, label: l.name || l.id }));
  }
  if (source === 'workers') {
    return Object.values(state.data.workers || {}).filter(w => !w.deleted).map(w => ({ value: w.id, label: w.name || w.id }));
  }
  if (source === 'users' || source === 'partners') {
    const data = state.data[source] || {};
    return Object.values(data).filter(u => u.active !== false && !u.deleted).map(u => ({ 
      value: u.uid || u.id, 
      label: u.name || u.email || u.id || 'Sin nombre' 
    }));
  }
  if (field.options) {
    return field.options.map(opt => typeof opt === 'object' ? opt : { value: opt, label: opt });
  }
  return [];
}

async function handleFormSubmit(entity, record) {
  const config = window.ENTITY_CONFIG[entity];
  const form = document.getElementById('entity-form');
  const formData = new FormData(form);
  const data = {};
  
  config.fields.forEach(field => {
    let value = formData.get(field.name);
    if (field.type === 'number') {
      value = value !== '' ? Number(value) : 0;
    }
    if (field.type === 'checkbox') {
      value = formData.get(field.name) === 'on';
    }
    if (field.type === 'email' && value) {
      value = value.trim();
    }
    data[field.name] = value;
  });
  
  // Asegurar campos obligatorios
  data.projectId = data.projectId || window.APP_CONFIG.defaultProjectId;
  
  if (!record) {
    data.createdBy = state.currentUser.uid;
    data.createdAt = firebase.database.ServerValue.TIMESTAMP;
  } else {
    data.updatedBy = state.currentUser.uid;
    data.updatedAt = firebase.database.ServerValue.TIMESTAMP;
    if (record.createdBy) {
      data.createdBy = record.createdBy;
    }
  }

  // Para contribuciones, añadir partnerName automáticamente
  if (entity === 'contributions' && data.partnerId) {
    const partner = state.data.partners?.[data.partnerId];
    if (partner) {
      data.partnerName = partner.name || partner.email || 'Socio';
    }
  }

  try {
    let id;
    if (record) {
      await window.updateRecord(entity, record.id, data);
      id = record.id;
      await window.writeAudit('update', entity, id, `Modificó ${config.singular.toLowerCase()}`, state.currentUser.uid, state.userProfile.name || state.userProfile.email);
      showToast('✅ Registro actualizado correctamente');
    } else {
      id = await window.createRecord(entity, data);
      await window.writeAudit('create', entity, id, `Creó ${config.singular.toLowerCase()}`, state.currentUser.uid, state.userProfile.name || state.userProfile.email);
      showToast('✅ Registro creado correctamente');
    }
    closeModal();
    renderCurrentView();
  } catch (err) {
    console.error('Error al guardar:', err);
    showToast('❌ Error al guardar. Verifica permisos o conexión.');
  }
}

function confirmDelete(entity, id) {
  const config = window.ENTITY_CONFIG[entity];
  if (!confirm(`¿Seguro que deseas eliminar este ${config.singular.toLowerCase()}?`)) return;
  
  window.softDeleteRecord(entity, id, state.currentUser.uid)
    .then(async () => {
      await window.writeAudit('delete', entity, id, `Eliminó ${config.singular.toLowerCase()}`, state.currentUser.uid, state.userProfile.name || state.userProfile.email);
      showToast('✅ Registro eliminado');
      renderCurrentView();
    })
    .catch((err) => {
      console.error('Error al eliminar:', err);
      showToast('❌ No se pudo eliminar. Verifica permisos.');
    });
}

// ============================================
// ACCIONES DE USUARIOS
// ============================================
async function toggleUserRole(uid, newRole) {
  try {
    await window.updateRecord('users', uid, { role: newRole, updatedBy: state.currentUser.uid });
    showToast(`✅ Rol actualizado a ${newRole}`);
    renderCurrentView();
  } catch (err) {
    console.error('Error al cambiar rol:', err);
    showToast('❌ No se pudo cambiar el rol.');
  }
}

async function toggleUserActive(uid, active) {
  try {
    await window.updateRecord('users', uid, { active, updatedBy: state.currentUser.uid });
    showToast(active ? '✅ Usuario activado' : '✅ Usuario desactivado');
    renderCurrentView();
  } catch (err) {
    console.error('Error al cambiar estado:', err);
    showToast('❌ No se pudo cambiar el estado.');
  }
}

// ============================================
// UTILIDADES UI
// ============================================
function bindListSearch() {
  const searchInput = document.querySelector('[data-search-list]');
  if (!searchInput) return;
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.list-item');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(term) ? '' : 'none';
    });
  });
}

function bindFormEvents() {
  // Guardar configuración
  document.getElementById('save-config-btn')?.addEventListener('click', saveConfig);
  document.getElementById('reset-config-btn')?.addEventListener('click', resetConfig);
}

function handleGlobalClick(e) {
  const target = e.target.closest('[data-action], [data-section], [data-child]');
  if (!target) return;

  if (target.dataset.section) {
    e.preventDefault();
    state.currentSection = target.dataset.section;
    renderNavigation();
    renderCurrentView();
    return;
  }

  if (target.dataset.child) {
    state.currentChild = target.dataset.child;
    renderCurrentView();
    return;
  }

  const action = target.dataset.action;
  if (action === 'new') {
    showForm(target.dataset.entity);
  } else if (action === 'edit') {
    const entity = target.dataset.entity;
    const record = state.data[entity]?.[target.dataset.id];
    if (record) showForm(entity, record);
  } else if (action === 'delete') {
    const entity = target.dataset.entity;
    const id = target.dataset.id;
    confirmDelete(entity, id);
  } else if (action === 'toggle-role') {
    toggleUserRole(target.dataset.id, target.dataset.role);
  } else if (action === 'toggle-active') {
    toggleUserActive(target.dataset.id, target.dataset.active === 'true');
  }
}

function showQuickMenu() {
  const entities = Object.keys(window.ENTITY_CONFIG).filter(e => 
    e !== 'users' && e !== 'auditLogs' && e !== 'attachments' && e !== 'appSettings' &&
    window.ENTITY_CONFIG[e].fields && window.ENTITY_CONFIG[e].fields.length > 0
  );
  const modal = document.getElementById('quick-menu');
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>⚡ Registro rápido</h3>
        <button class="modal-close" data-dismiss="quick">×</button>
      </div>
      <div class="quick-grid">
        ${entities.map(e => `
          <button class="chip quick-item" data-quick="${e}">${window.ENTITY_CONFIG[e].icon} ${window.ENTITY_CONFIG[e].label}</button>
        `).join('')}
      </div>
    </div>`;
  modal.classList.remove('hidden');
  modal.querySelector('[data-dismiss]').addEventListener('click', closeQuickMenu);
  modal.querySelector('.modal-close').addEventListener('click', closeQuickMenu);
  modal.querySelectorAll('[data-quick]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeQuickMenu();
      showForm(btn.dataset.quick);
    });
  });
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function closeQuickMenu() {
  document.getElementById('quick-menu').classList.add('hidden');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ============================================
// CLOUDINARY UPLOAD
// ============================================
async function uploadAttachment(file) {
  const { cloudName, uploadPreset, folder } = window.CLOUDINARY_CONFIG;
  if (!cloudName || cloudName === 'TU_CLOUD_NAME') {
    showToast('⚠️ Configura Cloudinary en js/config.js');
    return;
  }
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      document.getElementById('upload-progress').textContent = `📤 Subiendo: ${percent}%`;
    }
  });
  xhr.onload = async () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const response = JSON.parse(xhr.responseText);
        await window.createRecord('attachments', {
          url: response.secure_url,
          publicId: response.public_id,
          resourceType: response.resource_type,
          fileName: file.name,
          fileSize: file.size,
          uploadedBy: state.currentUser.uid,
          uploadedAt: firebase.database.ServerValue.TIMESTAMP,
          projectId: window.APP_CONFIG.defaultProjectId
        });
        showToast('✅ Archivo subido correctamente');
        document.getElementById('upload-progress').textContent = '';
        renderCurrentView();
      } catch (err) {
        console.error('Error al guardar archivo:', err);
        showToast('❌ Error al guardar el archivo en la base de datos.');
      }
    } else {
      showToast('❌ Error al subir archivo.');
    }
  };
  xhr.onerror = () => showToast('❌ Error de red al subir archivo.');
  xhr.send(formData);
}

// Event listeners para subida de archivos
document.addEventListener('click', (e) => {
  if (e.target.id === 'upload-attachment-btn') {
    const fileInput = document.getElementById('attachment-file');
    const file = fileInput.files[0];
    if (!file) {
      showToast('⚠️ Selecciona un archivo primero.');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('⚠️ Tipo de archivo no permitido. Usa JPG, PNG, WEBP o PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ Archivo demasiado grande (máx. 5 MB).');
      return;
    }
    uploadAttachment(file);
  }
});

// Sobrescribir formatMoney para usar el símbolo configurado
const originalFormatMoney = window.formatMoney;
window.formatMoney = function(amount) {
  const symbol = state.settings.currencySymbol || window.APP_CONFIG.currencySymbol || '$';
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
};