import { auth } from './firebase.js';
import { watchAuth, login, logout, resetPassword } from './auth.js';
import {
  subscribeToEntity,
  createRecord,
  updateRecord,
  softDeleteRecord,
  writeAudit,
  onConnectionChange
} from './database.js';
import {
  NAV_SECTIONS,
  ENTITY_CONFIG,
  APP_CONFIG,
  CLOUDINARY_CONFIG
} from './config.js';
import { formatMoney, formatDate, formatDateTime, escapeHtml, todayISO } from './utils.js';

const state = {
  currentUser: null,
  userProfile: null,
  data: {},
  listeners: [],
  currentSection: 'dashboard',
  currentChild: 'expenses',
  online: true,
  toastTimer: null
};

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initAuth();
  initConnectionStatus();
});

function initUI() {
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('reset-password').addEventListener('click', handleResetPassword);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('fab').addEventListener('click', showQuickMenu);
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
  });
  document.getElementById('quick-menu').addEventListener('click', (e) => {
    if (e.target.id === 'quick-menu') closeQuickMenu();
  });

  // Delegación de eventos para navegación y acciones
  document.addEventListener('click', handleGlobalClick);
}

function initAuth() {
  watchAuth((user, profile) => {
    if (user && profile) {
      state.currentUser = user;
      state.userProfile = profile;
      state.data = {};
      showApp();
      subscribeToAllEntities();
      renderAll();
    } else {
      showLogin();
    }
  });
}

function initConnectionStatus() {
  onConnectionChange((online) => {
    state.online = online;
    updateConnectionStatus();
  });
}

function updateConnectionStatus() {
  const el = document.getElementById('connection-status');
  if (el) {
    el.textContent = state.online ? '🟢' : '🟠';
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
  try {
    await login(email, password);
  } catch (err) {
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
    await resetPassword(email);
    showToast('Correo de recuperación enviado.');
  } catch (err) {
    showToast('Error al enviar el correo de recuperación.');
  }
}

async function handleLogout() {
  try {
    await logout();
  } catch (err) {
    showToast('Error al cerrar sesión.');
  }
}

function subscribeToAllEntities() {
  const entities = [
    'users', 'projects', 'lands', 'expenses', 'contributions', 'workers',
    'workLogs', 'seeds', 'agriculturalProducts', 'cropActivities',
    'incidents', 'harvests', 'sales', 'journal', 'attachments', 'auditLogs'
  ];
  entities.forEach((entity) => {
    const unsub = subscribeToEntity(entity, (data) => {
      state.data[entity] = data;
      renderCurrentView();
    });
    state.listeners.push(unsub);
  });
}

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
  NAV_SECTIONS.forEach((section) => {
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
  const section = NAV_SECTIONS.find(s => s.id === state.currentSection) || NAV_SECTIONS[0];
  if (section.type === 'dashboard') {
    main.innerHTML = renderDashboard();
  } else if (section.type === 'list') {
    main.innerHTML = renderList(section.entity);
  } else if (section.type === 'group') {
    main.innerHTML = renderGroup(section);
  }
  bindListSearch();
}

function renderDashboard() {
  const data = state.data;
  const expenses = sumEntity('expenses', 'amount');
  const contributions = sumEntity('contributions', 'amount');
  const sales = sumEntity('sales', 'total');
  const harvestKg = sumEntity('harvests', 'quantity');
  const salesKg = sumEntity('sales', 'quantity');
  const resultado = contributions + sales - expenses;

  const alerts = computeAlerts();
  const recent = getRecentActivity(5);

  return `
    <div class="dashboard">
      <h2>Inicio</h2>
      <div class="cards-grid">
        <div class="stat-card"><div class="stat-label">Capital aportado</div><div class="stat-value">${formatMoney(contributions)}</div></div>
        <div class="stat-card"><div class="stat-label">Gastos</div><div class="stat-value">${formatMoney(expenses)}</div></div>
        <div class="stat-card"><div class="stat-label">Ingresos</div><div class="stat-value">${formatMoney(sales)}</div></div>
        <div class="stat-card"><div class="stat-label">Resultado</div><div class="stat-value">${formatMoney(resultado)}</div></div>
        <div class="stat-card"><div class="stat-label">Producción</div><div class="stat-value">${harvestKg} kg</div></div>
        <div class="stat-card"><div class="stat-label">Kg vendidos</div><div class="stat-value">${salesKg} kg</div></div>
      </div>

      <div class="alerts">
        <h3>Alertas</h3>
        ${alerts.length ? alerts.map(a => `<div class="alert-item ${a.type}">${a.icon} ${a.message}</div>`).join('') : '<p class="empty">Sin alertas</p>'}
      </div>

      <div class="recent-activity">
        <h3>Actividad reciente</h3>
        ${recent.length ? recent.map(log => `
          <div class="list-item">
            <div class="list-main">
              <span class="item-date">${formatDateTime(log.timestamp)}</span>
              <span class="item-text">${escapeHtml(log.description)}</span>
            </div>
          </div>`).join('') : '<p class="empty">Sin actividad</p>'}
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
    if (land.rentalEnd && land.rentalEnd < in30Days) {
      alerts.push({ type: 'alert-warning', icon: '⚠️', message: `Alquiler próximo a vencer: ${land.name}` });
    }
  });

  Object.values(state.data.incidents || {}).filter(i => !i.deleted && i.status !== 'RESOLVED').forEach(inc => {
    alerts.push({ type: 'alert-danger', icon: '🚨', message: `Incidencia abierta: ${inc.description?.substring(0, 40)}` });
  });

  Object.values(state.data.sales || {}).filter(s => !s.deleted && s.paymentStatus !== 'COBRADO').forEach(sale => {
    alerts.push({ type: 'alert-warning', icon: '💳', message: `Venta pendiente de cobro: ${sale.customer} - ${formatMoney(sale.total)}` });
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

function renderList(entity) {
  const config = ENTITY_CONFIG[entity];
  if (!config) return '<p class="empty">Entidad no configurada</p>';
  if (entity === 'users') return renderUsers();
  if (entity === 'attachments') return renderAttachments();
  if (entity === 'auditLogs') return renderAuditLogs();

  const records = Object.values(state.data[entity] || {})
    .filter(r => !r.deleted)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  let html = `
    <div class="section-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <h2>${config.icon} ${config.label}</h2>
      <button class="btn-sm" data-action="new" data-entity="${entity}">+ Nuevo</button>
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
        const field = config.fields.find(f => f.name === fieldName);
        if (!field) return;
        const value = record[fieldName];
        if (field.type === 'date' && value) {
          html += `<span class="item-date">${formatDate(value)}</span>`;
        } else if (['number'].includes(field.type) || fieldName.match(/amount|cost|price|total|rate|capital|rentalCost/)) {
          html += `<span class="item-number">${formatMoney(value)}</span>`;
        } else if (field.type === 'checkbox') {
          html += `<span class="item-text">${value ? '✅' : '❌'}</span>`;
        } else {
          html += `<span class="item-text">${escapeHtml(value ?? '')}</span>`;
        }
      });
      html += `</div>`;
      if (canEdit) {
        html += `<div class="list-actions">
          <button class="btn-icon" data-action="edit" data-entity="${entity}" data-id="${record.id}">✏️</button>
          <button class="btn-icon" data-action="delete" data-entity="${entity}" data-id="${record.id}">🗑️</button>
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
    const cfg = ENTITY_CONFIG[child];
    if (!cfg) return;
    if (child === 'users' && state.userProfile?.role !== 'ADMIN') return;
    html += `<button class="chip ${child === state.currentChild ? 'active' : ''}" data-child="${child}">${cfg.icon} ${cfg.label}</button>`;
  });
  html += `</div><div id="list-container">${renderList(state.currentChild)}</div>`;
  return html;
}

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
            <span class="item-text">${escapeHtml(user.name || 'Sin nombre')}</span>
            <span class="item-text">${escapeHtml(user.email || '')}</span>
            <span class="item-text">${escapeHtml(user.role || 'SOCIO')}</span>
            <span class="item-text">${user.active ? '✅' : '❌'}</span>
          </div>
          <div class="list-actions">
            <button class="btn-icon" data-action="toggle-role" data-id="${user.uid}" data-role="${user.role === 'ADMIN' ? 'SOCIO' : 'ADMIN'}" title="Cambiar rol">🔁</button>
            <button class="btn-icon" data-action="toggle-active" data-id="${user.uid}" data-active="${!user.active}" title="Activar/Desactivar">${user.active ? '🚫' : '✅'}</button>
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
            <span class="item-text">${escapeHtml(a.fileName || 'Archivo')}</span>
            <span class="item-date">${formatDate(a.uploadedAt)}</span>
            <span class="item-text"><a href="${escapeHtml(a.url)}" target="_blank">Ver</a></span>
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
            <span class="item-date">${formatDateTime(log.timestamp)}</span>
            <span class="item-text">${escapeHtml(log.userName || '')}</span>
            <span class="item-text">${escapeHtml(log.action || '')}</span>
            <span class="item-text">${escapeHtml(log.description || '')}</span>
          </div>
        </div>`).join('') : '<p class="empty">Sin registros.</p>'}
    </div>
  `;
}

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

function showForm(entity, record = null) {
  const config = ENTITY_CONFIG[entity];
  if (!config || config.fields.length === 0) return;
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
          <button type="submit" class="btn-primary">Guardar</button>
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
  const config = ENTITY_CONFIG[entity];
  const recordData = record || {}; // <-- Corrección clave
  let html = '';
  config.fields.forEach(field => {
    const value = recordData[field.name] ?? (field.type === 'date' ? todayISO() : '');
    html += `<div class="form-group"><label for="f_${field.name}">${field.label}</label>`;
    switch (field.type) {
      case 'textarea':
        html += `<textarea id="f_${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>${escapeHtml(value)}</textarea>`;
        break;
      case 'select':
        html += `<select id="f_${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>`;
        if (!field.required) html += `<option value="">—</option>`;
        const options = getOptions(field);
        options.forEach(opt => {
          const selected = String(value) === String(opt.value) ? 'selected' : '';
          html += `<option value="${escapeHtml(opt.value)}" ${selected}>${escapeHtml(opt.label)}</option>`;
        });
        html += `</select>`;
        break;
      case 'checkbox':
        html += `<input type="checkbox" id="f_${field.name}" name="${field.name}" ${value ? 'checked' : ''}>`;
        break;
      default:
        html += `<input type="${field.type}" id="f_${field.name}" name="${field.name}" value="${escapeHtml(value)}" ${field.required ? 'required' : ''} ${field.step ? `step="${field.step}"` : ''}>`;
    }
    html += `</div>`;
  });
  return html;
}

function getOptions(field) {
  if (field.optionsFrom === 'lands') {
    return Object.values(state.data.lands || {}).filter(l => !l.deleted).map(l => ({ value: l.id, label: l.name || l.id }));
  }
  if (field.optionsFrom === 'workers') {
    return Object.values(state.data.workers || {}).filter(w => !w.deleted).map(w => ({ value: w.id, label: w.name || w.id }));
  }
  if (field.optionsFrom === 'users') {
    return Object.values(state.data.users || {}).filter(u => u.active !== false).map(u => ({ value: u.uid, label: u.name || u.email || u.uid }));
  }
  if (field.options) {
    return field.options.map(opt => typeof opt === 'object' ? opt : { value: opt, label: opt });
  }
  return [];
}

async function handleFormSubmit(entity, record) {
  const config = ENTITY_CONFIG[entity];
  const form = document.getElementById('entity-form');
  const formData = new FormData(form);
  const data = {};
  config.fields.forEach(field => {
    let value = formData.get(field.name);
    if (field.type === 'number') value = Number(value || 0);
    if (field.type === 'checkbox') value = formData.get(field.name) === 'on';
    data[field.name] = value;
  });
  data.projectId = data.projectId || APP_CONFIG.defaultProjectId;
  data.updatedBy = state.currentUser.uid;

  try {
    if (record) {
      await updateRecord(entity, record.id, data);
      await writeAudit('update', entity, record.id, `Modificó ${config.singular.toLowerCase()}`, state.currentUser.uid, state.userProfile.name || state.userProfile.email);
    } else {
      data.createdBy = state.currentUser.uid;
      const id = await createRecord(entity, data);
      await writeAudit('create', entity, id, `Creó ${config.singular.toLowerCase()}`, state.currentUser.uid, state.userProfile.name || state.userProfile.email);
    }
    closeModal();
    showToast('Registro guardado correctamente');
  } catch (err) {
    showToast('Error al guardar. Verifica permisos o conexión.');
  }
}

function confirmDelete(entity, id) {
  if (!confirm('¿Seguro que deseas eliminar este registro? Se marcará como eliminado.')) return;
  softDeleteRecord(entity, id, state.currentUser.uid)
    .then(async () => {
      const config = ENTITY_CONFIG[entity];
      await writeAudit('delete', entity, id, `Eliminó ${config.singular.toLowerCase()}`, state.currentUser.uid, state.userProfile.name || state.userProfile.email);
      showToast('Registro eliminado');
    })
    .catch(() => showToast('No se pudo eliminar. Verifica permisos.'));
}

async function toggleUserRole(uid, newRole) {
  try {
    await updateRecord('users', uid, { role: newRole, updatedBy: state.currentUser.uid });
    showToast('Rol actualizado');
  } catch (err) {
    showToast('No se pudo cambiar el rol.');
  }
}

async function toggleUserActive(uid, active) {
  try {
    await updateRecord('users', uid, { active, updatedBy: state.currentUser.uid });
    showToast(active ? 'Usuario activado' : 'Usuario desactivado');
  } catch (err) {
    showToast('No se pudo cambiar el estado.');
  }
}

function showQuickMenu() {
  const entities = Object.keys(ENTITY_CONFIG).filter(e => e !== 'users' && e !== 'auditLogs' && e !== 'attachments' && ENTITY_CONFIG[e].fields.length > 0);
  const modal = document.getElementById('quick-menu');
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header"><h3>Registro rápido</h3><button class="modal-close" data-dismiss="quick">×</button></div>
      <div class="quick-grid">
        ${entities.map(e => `
          <button class="chip quick-item" data-quick="${e}">${ENTITY_CONFIG[e].icon} ${ENTITY_CONFIG[e].label}</button>
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
  state.toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Cloudinary upload
async function uploadAttachment(file) {
  const { cloudName, uploadPreset, folder } = CLOUDINARY_CONFIG;
  if (!cloudName || cloudName === 'TU_CLOUD_NAME') {
    showToast('Configura Cloudinary en js/config.js');
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
      document.getElementById('upload-progress').textContent = `Subiendo: ${percent}%`;
    }
  });
  xhr.onload = async () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      const response = JSON.parse(xhr.responseText);
      const attachmentRef = await import('./database.js');
      await attachmentRef.createRecord('attachments', {
        url: response.secure_url,
        publicId: response.public_id,
        resourceType: response.resource_type,
        fileName: file.name,
        uploadedBy: state.currentUser.uid,
        uploadedAt: new Date().toISOString()
      });
      showToast('Archivo subido correctamente');
      document.getElementById('upload-progress').textContent = '';
    } else {
      showToast('Error al subir archivo.');
    }
  };
  xhr.onerror = () => showToast('Error de red al subir archivo.');
  xhr.send(formData);
}

// Event listeners para subida
document.addEventListener('click', (e) => {
  if (e.target.id === 'upload-attachment-btn') {
    const fileInput = document.getElementById('attachment-file');
    const file = fileInput.files[0];
    if (!file) {
      showToast('Selecciona un archivo primero.');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Tipo de archivo no permitido. Usa JPG, PNG, WEBP o PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Archivo demasiado grande (máx. 5 MB).');
      return;
    }
    uploadAttachment(file);
  }
});