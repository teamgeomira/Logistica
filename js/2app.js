// ================================================================
// APLICACIÓN PRINCIPAL - MALANGA v2.0.0
// ================================================================

// ================================================================
// ESTADO GLOBAL
// ================================================================
const state = {
  currentUser: null,
  userProfile: null,
  data: {},
  listeners: [],
  currentSection: 'dashboard',
  currentChild: null,
  online: true,
  toastTimer: null,
  settings: {}
};

// ================================================================
// INICIALIZACIÓN
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
  initUI();
  initAuth();
  initConnectionStatus();
  initSettings();
});

// ================================================================
// CONFIGURACIÓN
// ================================================================
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

// ================================================================
// UI
// ================================================================
function initUI() {
  // Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      handleLogin(e);
    });
    
    // Prevenir Enter en inputs
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(function(input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          handleLogin(e);
        }
      });
    });
  }
  
  document.getElementById('reset-password').addEventListener('click', handleResetPassword);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('fab').addEventListener('click', showQuickMenu);
  document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);
  
  // Modales
  document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target.id === 'modal') closeModal();
  });
  document.getElementById('quick-menu').addEventListener('click', function(e) {
    if (e.target.id === 'quick-menu') closeQuickMenu();
  });
  
  // Clicks globales
  document.addEventListener('click', handleGlobalClick);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (!sidebar) return;
  
  const isOpen = sidebar.classList.contains('open');
  
  if (isOpen) {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
  } else {
    sidebar.classList.add('open');
    // Crear overlay si no existe
    if (!overlay) {
      const newOverlay = document.createElement('div');
      newOverlay.id = 'sidebar-overlay';
      newOverlay.className = 'sidebar-overlay';
      newOverlay.addEventListener('click', toggleSidebar);
      document.body.appendChild(newOverlay);
    }
    document.getElementById('sidebar-overlay').classList.add('visible');
  }
}

// ================================================================
// AUTENTICACIÓN
// ================================================================
function initAuth() {
  window.watchAuth(function(user, profile) {
    if (user && profile) {
      state.currentUser = user;
      state.userProfile = profile;
      state.data = {};
      showApp();
      subscribeToAllEntities();
      renderAll();
      showToast('Bienvenido, ' + (profile.name || profile.email || 'Usuario'));
    } else {
      showLogin();
    }
  });
}

function initConnectionStatus() {
  window.onConnectionChange(function(online) {
    state.online = online;
    updateConnectionStatus();
  });
}

function updateConnectionStatus() {
  const el = document.getElementById('connection-status');
  if (el) {
    el.className = 'connection-status ' + (state.online ? 'online' : 'offline');
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
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  const btnContent = document.getElementById('login-btn-content');
  
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
  
  if (!email || !password) {
    errorEl.textContent = '⚠️ Por favor, completa todos los campos.';
    errorEl.classList.add('visible');
    return;
  }
  
  if (!email.includes('@') || !email.includes('.')) {
    errorEl.textContent = '⚠️ Ingresa un correo electrónico válido.';
    errorEl.classList.add('visible');
    return;
  }
  
  btn.disabled = true;
  btnContent.innerHTML = '<span class="spinner"></span> Cargando...';
  
  try {
    await window.login(email, password);
  } catch (err) {
    console.error('Login error:', err);
    let errorMsg = '❌ Error al iniciar sesión.';
    if (err.code === 'auth/user-not-found') {
      errorMsg = '❌ Usuario no encontrado. Verifica tu email.';
    } else if (err.code === 'auth/wrong-password') {
      errorMsg = '❌ Contraseña incorrecta. Intenta nuevamente.';
    } else if (err.code === 'auth/too-many-requests') {
      errorMsg = '⏳ Demasiados intentos. Espera unos minutos.';
    } else if (err.code === 'auth/invalid-email') {
      errorMsg = '❌ Email inválido. Verifica el formato.';
    } else if (err.code === 'auth/user-disabled') {
      errorMsg = '🚫 Usuario desactivado. Contacta al administrador.';
    }
    errorEl.textContent = errorMsg;
    errorEl.classList.add('visible');
    btn.disabled = false;
    btnContent.innerHTML = '<span class="btn-icon">🚀</span> Entrar';
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

// ================================================================
// DATOS Y SUSCRIPCIONES
// ================================================================
function subscribeToAllEntities() {
  const entities = [
    'users', 'projects', 'lands', 'expenses', 'contributions', 'workers',
    'workLogs', 'seeds', 'agriculturalProducts', 'cropActivities',
    'incidents', 'harvests', 'sales', 'journal', 'attachments', 'auditLogs',
    'partners', 'appSettings'
  ];
  entities.forEach(function(entity) {
    var unsub = window.subscribeToEntity(entity, function(data) {
      state.data[entity] = data;
      renderCurrentView();
    });
    state.listeners.push(unsub);
  });
}

// ================================================================
// RENDER PRINCIPAL
// ================================================================
function renderAll() {
  renderNavigation();
  renderCurrentView();
  updateUserBadge();
}

function updateUserBadge() {
  const nameEl = document.getElementById('user-name');
  const avatarEl = document.getElementById('user-avatar');
  if (nameEl && state.userProfile) {
    nameEl.textContent = state.userProfile.name || state.userProfile.email || 'Usuario';
  }
  if (avatarEl && state.userProfile) {
    avatarEl.textContent = (state.userProfile.name || state.userProfile.email || 'U').charAt(0).toUpperCase();
  }
}

function renderNavigation() {
  const sidebar = document.getElementById('sidebar');
  const bottomNav = document.getElementById('bottom-nav');
  if (!sidebar || !bottomNav) return;

  let sidebarHtml = '';
  let bottomHtml = '';

  window.NAV_SECTIONS.forEach(function(section) {
    // Sidebar
    if (section.type === 'group') {
      sidebarHtml += '<div class="nav-section">';
      sidebarHtml += '<div class="nav-section-title">' + section.icon + ' ' + section.label + '</div>';
      if (section.children && section.children.length > 0) {
        section.children.forEach(function(child) {
          var active = (state.currentSection === child.id || state.currentChild === child.id) ? 'active' : '';
          sidebarHtml += '<a href="#" class="nav-item ' + active + '" data-section="' + child.id + '">';
          sidebarHtml += '<span class="nav-icon">' + (child.icon || '📄') + '</span>';
          sidebarHtml += '<span class="nav-label">' + child.label + '</span>';
          sidebarHtml += '</a>';
        });
      }
      sidebarHtml += '</div>';
      sidebarHtml += '<div class="nav-divider"></div>';
    } else {
      var active = (state.currentSection === section.id || state.currentChild === section.id) ? 'active' : '';
      sidebarHtml += '<a href="#" class="nav-item ' + active + '" data-section="' + section.id + '">';
      sidebarHtml += '<span class="nav-icon">' + section.icon + '</span>';
      sidebarHtml += '<span class="nav-label">' + section.label + '</span>';
      sidebarHtml += '</a>';
    }

    // Bottom Nav (solo items principales)
    bottomHtml += '<button class="nav-btn ' + active + '" data-section="' + section.id + '">';
    bottomHtml += '<span class="nav-icon">' + section.icon + '</span>';
    bottomHtml += '<span class="nav-label">' + section.label + '</span>';
    bottomHtml += '</button>';
  });

  sidebar.innerHTML = sidebarHtml;
  bottomNav.innerHTML = bottomHtml;
}

function renderCurrentView() {
  const main = document.getElementById('main-content');
  if (!main) return;

  var section = null;
  var isChild = false;

  // Buscar en la navegación
  for (var i = 0; i < window.NAV_SECTIONS.length; i++) {
    var navSection = window.NAV_SECTIONS[i];
    if (navSection.id === state.currentSection) {
      section = navSection;
      break;
    }
    if (navSection.type === 'group' && navSection.children) {
      for (var j = 0; j < navSection.children.length; j++) {
        if (navSection.children[j].id === state.currentSection) {
          section = navSection.children[j];
          isChild = true;
          break;
        }
      }
    }
    if (section) break;
  }

  if (!section) {
    section = window.NAV_SECTIONS[0];
  }

  var content = '';
  
  if (section.type === 'dashboard' || section.id === 'dashboard') {
    content = renderDashboard();
  } else if (section.type === 'list' || section.entity) {
    content = renderList(section.entity || section.id);
  } else if (section.type === 'group') {
    if (section.children && section.children.length > 0) {
      content = renderGroup(section);
    } else {
      content = '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Sin elementos</div></div>';
    }
  } else if (section.type === 'config' || section.id === 'configuracion') {
    content = renderConfig();
  } else {
    content = '<div class="empty-state"><div class="empty-icon">🚧</div><div class="empty-title">En construcción</div></div>';
  }

  main.innerHTML = content;
  bindListSearch();
  bindFormEvents();
}

// ================================================================
// DASHBOARD
// ================================================================
function renderDashboard() {
  var expenses = sumEntity('expenses', 'amount');
  var contributions = sumEntity('contributions', 'amount');
  var sales = sumEntity('sales', 'total');
  var harvestKg = sumEntity('harvests', 'quantity');
  var salesKg = sumEntity('sales', 'quantity');
  var resultado = contributions + sales - expenses;
  var totalPartners = Object.values(state.data.partners || {}).filter(function(p) { return !p.deleted && p.status === 'ACTIVO'; }).length;

  var alerts = computeAlerts();
  var recent = getRecentActivity(5);

  return `
    <div class="dashboard animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">📊 Panel de Control</h1>
        <p class="page-subtitle">Resumen general del proyecto agrícola</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label"><span class="label-icon">👥</span> Socios activos</div>
          <div class="stat-value">${totalPartners}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label"><span class="label-icon">🏦</span> Capital aportado</div>
          <div class="stat-value">${window.formatMoney(contributions)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label"><span class="label-icon">💸</span> Gastos</div>
          <div class="stat-value">${window.formatMoney(expenses)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label"><span class="label-icon">💰</span> Ingresos</div>
          <div class="stat-value">${window.formatMoney(sales)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label"><span class="label-icon">📊</span> Resultado</div>
          <div class="stat-value">${window.formatMoney(resultado)}</div>
          <div class="stat-change ${resultado >= 0 ? 'up' : 'down'}">${resultado >= 0 ? '📈' : '📉'} ${resultado >= 0 ? 'Positivo' : 'Negativo'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label"><span class="label-icon">🌾</span> Producción</div>
          <div class="stat-value">${harvestKg} kg</div>
        </div>
        <div class="stat-card">
          <div class="stat-label"><span class="label-icon">📦</span> Kg vendidos</div>
          <div class="stat-value">${salesKg} kg</div>
        </div>
      </div>

      <div class="alerts-section">
        <div class="section-header">
          <div class="section-title"><span class="title-icon">⚠️</span> Alertas</div>
          <span class="alert-count">${alerts.length}</span>
        </div>
        ${alerts.length ? alerts.map(function(a) { return `
          <div class="alert-item ${a.type}">
            <span class="alert-icon">${a.icon}</span>
            <div class="alert-content">
              <div class="alert-message">${a.message}</div>
            </div>
          </div>
        `; }).join('') : '<div class="empty-state" style="padding:1rem;"><div class="empty-icon">✅</div><div class="empty-title" style="font-size:0.9rem;">Sin alertas activas</div></div>'}
      </div>

      <div class="recent-section">
        <div class="section-title"><span class="title-icon">📋</span> Actividad reciente</div>
        ${recent.length ? recent.map(function(log) { return `
          <div class="recent-item">
            <span class="recent-icon">📝</span>
            <div class="recent-content">
              <div class="recent-text">${window.escapeHtml(log.description)}</div>
              <div class="recent-time">${window.formatDateTime(log.timestamp)}</div>
            </div>
          </div>
        `; }).join('') : '<div class="empty-state" style="padding:1rem;"><div class="empty-icon">📭</div><div class="empty-title" style="font-size:0.9rem;">Sin actividad reciente</div></div>'}
      </div>
    </div>
  `;
}

function sumEntity(entity, field) {
  var records = Object.values(state.data[entity] || {}).filter(function(r) { return !r.deleted; });
  return records.reduce(function(sum, r) { return sum + (Number(r[field]) || 0); }, 0);
}

function computeAlerts() {
  var alerts = [];
  var now = Date.now();
  var in30Days = now + 30 * 24 * 60 * 60 * 1000;

  Object.values(state.data.lands || {}).filter(function(l) { return !l.deleted && l.status === 'ACTIVO'; }).forEach(function(land) {
    if (land.rentalEnd && new Date(land.rentalEnd).getTime() < in30Days) {
      alerts.push({ type: 'alert-warning', icon: '⚠️', message: 'Alquiler próximo a vencer: ' + land.name });
    }
  });

  Object.values(state.data.incidents || {}).filter(function(i) { return !i.deleted && i.status !== 'RESOLVED'; }).forEach(function(inc) {
    alerts.push({ type: 'alert-danger', icon: '🚨', message: 'Incidencia abierta: ' + (inc.description || '').substring(0, 40) });
  });

  Object.values(state.data.sales || {}).filter(function(s) { return !s.deleted && s.paymentStatus !== 'COBRADO'; }).forEach(function(sale) {
    alerts.push({ type: 'alert-warning', icon: '💳', message: 'Venta pendiente de cobro: ' + (sale.customer || 'Cliente') + ' - ' + window.formatMoney(sale.total || 0) });
  });

  return alerts;
}

function getRecentActivity(limit) {
  limit = limit || 5;
  var logs = Object.values(state.data.auditLogs || {})
    .filter(function(l) { return l.timestamp; })
    .sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); })
    .slice(0, limit);
  return logs;
}

// ================================================================
// LISTAS
// ================================================================
function renderList(entity) {
  var config = window.ENTITY_CONFIG[entity];
  if (!config) return '<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Entidad no configurada</div></div>';
  
  if (entity === 'users') return renderUsers();
  if (entity === 'attachments') return renderAttachments();
  if (entity === 'auditLogs') return renderAuditLogs();
  if (entity === 'appSettings') return renderConfig();

  var records = Object.values(state.data[entity] || {})
    .filter(function(r) { return !r.deleted; })
    .sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });

  var html = `
    <div class="section-header">
      <div class="section-title"><span class="title-icon">${config.icon}</span> ${config.label}</div>
      <div class="section-actions">
        ${config.fields && config.fields.length > 0 ? '<button class="btn btn-primary btn-sm" data-action="new" data-entity="' + entity + '">+ Nuevo</button>' : ''}
      </div>
    </div>
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input type="search" placeholder="Buscar en ${config.label.toLowerCase()}..." data-search-list>
    </div>
    <div class="list-container">
      <div class="list-header">
        ${config.listFields.map(function(field) { return '<div class="header-cell">' + field + '</div>'; }).join('')}
        <div class="header-cell">Acciones</div>
      </div>
  `;

  if (records.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">No hay ${config.label.toLowerCase()}</div>
        <div class="empty-desc">Comienza creando tu primer ${config.singular.toLowerCase()}</div>
        ${config.fields && config.fields.length > 0 ? '<div class="empty-action"><button class="btn btn-primary btn-sm" data-action="new" data-entity="' + entity + '">➕ Crear ' + config.singular + '</button></div>' : ''}
      </div>
    `;
  } else {
    records.forEach(function(record) {
      var canEdit = state.userProfile && (state.userProfile.role === 'ADMIN' || record.createdBy === state.currentUser.uid);
      html += '<div class="list-item" data-record-id="' + record.id + '">';
      html += '<div class="list-main">';
      config.listFields.forEach(function(fieldName) {
        var field = config.fields ? config.fields.find(function(f) { return f.name === fieldName; }) : null;
        var value = record[fieldName];
        if (value === undefined || value === null) return;

        // Relaciones
        if (field && field.optionsFrom === 'lands') {
          var land = state.data.lands ? state.data.lands[value] : null;
          html += '<span class="item-text">' + window.escapeHtml(land ? land.name || value : value) + '</span>';
          return;
        }
        if (field && (field.optionsFrom === 'users' || field.optionsFrom === 'partners')) {
          var user = state.data[field.optionsFrom] ? state.data[field.optionsFrom][value] : null;
          html += '<span class="item-text">' + window.escapeHtml(user ? user.name || user.email || value : value) + '</span>';
          return;
        }
        if (field && field.optionsFrom === 'workers') {
          var worker = state.data.workers ? state.data.workers[value] : null;
          html += '<span class="item-text">' + window.escapeHtml(worker ? worker.name || value : value) + '</span>';
          return;
        }

        // Tipos
        if (field && field.type === 'date' && value) {
          html += '<span class="item-date">' + window.formatDate(value) + '</span>';
        } else if (field && (field.type === 'number' || fieldName.match(/amount|cost|price|total|rate|capital|rentalCost|contributionAmount/))) {
          html += '<span class="item-number">' + window.formatMoney(value) + '</span>';
        } else if (field && field.type === 'checkbox') {
          html += '<span class="item-text">' + (value ? '✅' : '❌') + '</span>';
        } else if (field && field.type === 'select') {
          html += '<span class="item-tag ' + (value === 'ACTIVO' || value === 'COBRADO' || value === 'RESOLVED' ? 'success' : value === 'INACTIVO' || value === 'PENDIENTE' ? 'warning' : '') + '">' + window.escapeHtml(String(value)) + '</span>';
        } else if (value !== undefined && value !== null) {
          html += '<span class="item-text">' + window.escapeHtml(String(value)) + '</span>';
        }
      });
      html += '</div>';
      if (canEdit && config.fields && config.fields.length > 0) {
        html += '<div class="list-actions">';
        html += '<button class="btn-icon primary" data-action="edit" data-entity="' + entity + '" data-id="' + record.id + '" title="Editar">✏️</button>';
        html += '<button class="btn-icon danger" data-action="delete" data-entity="' + entity + '" data-id="' + record.id + '" title="Eliminar">🗑️</button>';
        html += '</div>';
      }
      html += '</div>';
    });
  }

  html += '</div>';
  return html;
}

function renderGroup(section) {
  var children = section.children || [];
  if (!children.length) return '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No hay elementos</div></div>';

  if (!children.find(function(c) { return c.id === state.currentChild; })) {
    state.currentChild = children[0].id;
  }

  var html = '<div class="subnav">';
  children.forEach(function(child) {
    var active = child.id === state.currentChild ? 'active' : '';
    html += '<button class="chip ' + active + '" data-child="' + child.id + '">';
    html += (child.icon || '📄') + ' ' + child.label;
    html += '</button>';
  });
  html += '</div>';
  html += '<div id="list-container">' + renderList(state.currentChild) + '</div>';

  return html;
}

// ================================================================
// USUARIOS, ARCHIVOS, AUDITORÍA
// ================================================================
function renderUsers() {
  if (state.userProfile && state.userProfile.role !== 'ADMIN') {
    return '<div class="empty-state"><div class="empty-icon">🚫</div><div class="empty-title">Sin permisos</div><div class="empty-desc">No tienes permiso para ver usuarios.</div></div>';
  }

  var users = Object.values(state.data.users || {}).filter(function(u) { return u.uid; });
  
  var html = `
    <div class="section-header">
      <div class="section-title"><span class="title-icon">👥</span> Usuarios</div>
    </div>
    <div class="list-container">
      <div class="list-header">
        <div class="header-cell">Nombre</div>
        <div class="header-cell">Email</div>
        <div class="header-cell">Rol</div>
        <div class="header-cell">Estado</div>
        <div class="header-cell">Acciones</div>
      </div>
  `;

  if (users.length === 0) {
    html += '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No hay usuarios</div></div>';
  } else {
    users.forEach(function(user) {
      html += '<div class="list-item">';
      html += '<div class="list-main">';
      html += '<span class="item-text"><strong>' + window.escapeHtml(user.name || 'Sin nombre') + '</strong></span>';
      html += '<span class="item-text">' + window.escapeHtml(user.email || '') + '</span>';
      html += '<span class="item-tag ' + (user.role === 'ADMIN' ? 'primary' : '') + '">' + window.escapeHtml(user.role || 'SOCIO') + '</span>';
      html += '<span class="item-tag ' + (user.active !== false ? 'success' : 'danger') + '">' + (user.active !== false ? '✅ Activo' : '❌ Inactivo') + '</span>';
      html += '</div>';
      html += '<div class="list-actions">';
      html += '<button class="btn-icon primary" data-action="toggle-role" data-id="' + user.uid + '" data-role="' + (user.role === 'ADMIN' ? 'SOCIO' : 'ADMIN') + '" title="Cambiar rol">🔁</button>';
      html += '<button class="btn-icon ' + (user.active !== false ? 'danger' : 'success') + '" data-action="toggle-active" data-id="' + user.uid + '" data-active="' + (user.active !== false ? 'false' : 'true') + '" title="Activar/Desactivar">' + (user.active !== false ? '🚫' : '✅') + '</button>';
      html += '</div>';
      html += '</div>';
    });
  }

  html += '</div>';
  return html;
}

function renderAttachments() {
  var html = `
    <div class="section-header">
      <div class="section-title"><span class="title-icon">📎</span> Archivos</div>
    </div>
    <div class="upload-box">
      <div class="file-input-wrapper">
        <input type="file" id="attachment-file" accept=".jpg,.jpeg,.png,.webp,.pdf">
      </div>
      <button class="btn btn-primary" id="upload-attachment-btn">Subir archivo</button>
      <div id="upload-progress" class="upload-progress"></div>
    </div>
    <div class="list-container">
      <div class="list-header">
        <div class="header-cell">Archivo</div>
        <div class="header-cell">Subido</div>
        <div class="header-cell">Acciones</div>
      </div>
  `;

  var attachments = Object.values(state.data.attachments || {})
    .filter(function(a) { return !a.deleted; })
    .sort(function(a, b) { return (b.uploadedAt || 0) - (a.uploadedAt || 0); });

  if (attachments.length === 0) {
    html += '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No hay archivos</div></div>';
  } else {
    attachments.forEach(function(a) {
      html += '<div class="list-item">';
      html += '<div class="list-main">';
      html += '<span class="item-text">' + window.escapeHtml(a.fileName || 'Archivo') + '</span>';
      html += '<span class="item-date">' + window.formatDate(a.uploadedAt) + '</span>';
      html += '</div>';
      html += '<div class="list-actions">';
      html += '<a href="' + window.escapeHtml(a.url) + '" target="_blank" class="btn-icon primary" title="Ver">🔗</a>';
      html += '</div>';
      html += '</div>';
    });
  }

  html += '</div>';
  return html;
}

function renderAuditLogs() {
  var logs = Object.values(state.data.auditLogs || {})
    .sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });

  var html = `
    <div class="section-header">
      <div class="section-title"><span class="title-icon">🧾</span> Auditoría</div>
    </div>
    <div class="list-container">
      <div class="list-header">
        <div class="header-cell">Fecha</div>
        <div class="header-cell">Usuario</div>
        <div class="header-cell">Acción</div>
        <div class="header-cell">Descripción</div>
      </div>
  `;

  if (logs.length === 0) {
    html += '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Sin registros</div></div>';
  } else {
    logs.slice(0, 100).forEach(function(log) {
      html += '<div class="list-item">';
      html += '<div class="list-main">';
      html += '<span class="item-date">' + window.formatDateTime(log.timestamp) + '</span>';
      html += '<span class="item-text"><strong>' + window.escapeHtml(log.userName || '') + '</strong></span>';
      html += '<span class="item-tag">' + window.escapeHtml(log.action || '') + '</span>';
      html += '<span class="item-text">' + window.escapeHtml(log.description || '') + '</span>';
      html += '</div>';
      html += '</div>';
    });
    if (logs.length > 100) {
      html += '<div class="list-item"><div class="list-main"><span class="item-text text-muted">Mostrando los últimos 100 registros</span></div></div>';
    }
  }

  html += '</div>';
  return html;
}

// ================================================================
// CONFIGURACIÓN
// ================================================================
function renderConfig() {
  if (state.userProfile && state.userProfile.role !== 'ADMIN') {
    return '<div class="empty-state"><div class="empty-icon">🚫</div><div class="empty-title">Sin permisos</div><div class="empty-desc">No tienes permiso para acceder a la configuración.</div></div>';
  }

  var settings = state.data.appSettings || {};

  var html = `
    <div class="config-section animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">⚙️ Configuración</h1>
        <p class="page-subtitle">Configura los parámetros generales del sistema</p>
      </div>

      <div class="config-grid">
        <div class="config-card">
          <div class="config-card-title"><span class="cc-icon">💰</span> Moneda</div>
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
          <div class="config-card-title"><span class="cc-icon">🏢</span> Empresa</div>
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
          <div class="config-card-title"><span class="cc-icon">📊</span> Impuestos</div>
          <div class="form-group">
            <label for="config-tax">Tasa de impuesto (%)</label>
            <input type="number" id="config-tax" value="${settings.taxRate || 0}" step="0.01" min="0" max="100">
          </div>
        </div>

        <div class="config-card">
          <div class="config-card-title"><span class="cc-icon">📁</span> Proyecto</div>
          <div class="form-group">
            <label for="config-project">Proyecto por defecto</label>
            <input type="text" id="config-project" value="${settings.defaultProject || 'malanga-2026'}">
          </div>
        </div>
      </div>

      <div class="config-actions">
        <button class="btn btn-primary" id="save-config-btn">💾 Guardar configuración</button>
        <button class="btn btn-secondary" id="reset-config-btn">↺ Restablecer por defecto</button>
      </div>
    </div>
  `;

  return html;
}

async function saveConfig() {
  var settings = {
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
    var settingsRef = window.db.ref('appSettings');
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

  var settings = window.DEFAULT_SETTINGS || {
    currencySymbol: '$',
    currency: 'USD',
    companyName: 'Malanga Agrícola',
    companyEmail: 'info@malanga.com',
    companyPhone: '+1 123 456 7890',
    taxRate: 0,
    defaultProject: 'malanga-2026'
  };

  try {
    var settingsRef = window.db.ref('appSettings');
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

// ================================================================
// FORMULARIOS
// ================================================================
function showForm(entity, record) {
  record = record || null;
  var config = window.ENTITY_CONFIG[entity];
  if (!config || !config.fields || config.fields.length === 0) {
    showToast('Esta entidad no tiene formulario configurado.');
    return;
  }

  var isEdit = !!record;
  var title = isEdit ? 'Editar ' + config.singular : 'Nuevo ' + config.singular;
  var fieldsHtml = buildFormFields(entity, record);
  
  var modal = document.getElementById('modal');
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">${config.icon} ${title}</div>
        <button class="modal-close" data-dismiss="modal">×</button>
      </div>
      <form id="entity-form">
        ${fieldsHtml}
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">💾 Guardar</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.querySelector('#entity-form').addEventListener('submit', function(e) {
    e.preventDefault();
    handleFormSubmit(entity, record);
  });
  modal.querySelector('[data-dismiss]').addEventListener('click', closeModal);
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
}

function buildFormFields(entity, record) {
  record = record || {};
  var config = window.ENTITY_CONFIG[entity];
  var html = '';
  var groups = config.fieldGroups || [{ title: '📋 Datos', fields: config.fields.map(function(f) { return f.name; }) }];

  groups.forEach(function(group) {
    var groupFields = config.fields.filter(function(f) { return group.fields.indexOf(f.name) !== -1; });
    if (groupFields.length === 0) return;

    html += '<div class="field-group">';
    html += '<div class="field-group-title"><span class="fg-icon">📌</span> ' + group.title + '</div>';

    groupFields.forEach(function(field) {
      var value = record[field.name] !== undefined ? record[field.name] : (field.defaultValue || '');
      if (field.type === 'date' && !value) value = window.todayISO();

      html += '<div class="form-group">';
      html += '<label for="f_' + field.name + '">' + field.label + (field.required ? ' <span class="required">*</span>' : '') + '</label>';

      switch (field.type) {
        case 'textarea':
          html += '<textarea id="f_' + field.name + '" name="' + field.name + '" ' + (field.required ? 'required' : '') + ' rows="' + (field.rows || 3) + '" placeholder="' + (field.placeholder || '') + '">' + window.escapeHtml(value) + '</textarea>';
          break;
        case 'select':
          html += '<select id="f_' + field.name + '" name="' + field.name + '" ' + (field.required ? 'required' : '') + '>';
          if (!field.required) html += '<option value="">— Seleccionar —</option>';
          var options = getOptions(field);
          options.forEach(function(opt) {
            var selected = String(value) === String(opt.value) ? 'selected' : '';
            html += '<option value="' + window.escapeHtml(opt.value) + '" ' + selected + '>' + window.escapeHtml(opt.label) + '</option>';
          });
          html += '</select>';
          break;
        case 'checkbox':
          var checked = value ? 'checked' : '';
          html += '<input type="checkbox" id="f_' + field.name + '" name="' + field.name + '" ' + checked + '>';
          break;
        case 'number':
          html += '<input type="number" id="f_' + field.name + '" name="' + field.name + '" value="' + value + '" ' + (field.required ? 'required' : '') + ' ' + (field.step ? 'step="' + field.step + '"' : '') + ' ' + (field.min !== undefined ? 'min="' + field.min + '"' : '') + ' ' + (field.max !== undefined ? 'max="' + field.max + '"' : '') + ' placeholder="' + (field.placeholder || '') + '">';
          break;
        default:
          html += '<input type="' + field.type + '" id="f_' + field.name + '" name="' + field.name + '" value="' + window.escapeHtml(value) + '" ' + (field.required ? 'required' : '') + ' ' + (field.min !== undefined ? 'min="' + field.min + '"' : '') + ' ' + (field.max !== undefined ? 'max="' + field.max + '"' : '') + ' placeholder="' + (field.placeholder || '') + '">';
      }

      html += '</div>';
    });

    html += '</div>';
  });

  return html;
}

function getOptions(field) {
  var source = field.optionsFrom;
  if (source === 'lands') {
    return Object.values(state.data.lands || {}).filter(function(l) { return !l.deleted; }).map(function(l) { return { value: l.id, label: l.name || l.id }; });
  }
  if (source === 'workers') {
    return Object.values(state.data.workers || {}).filter(function(w) { return !w.deleted; }).map(function(w) { return { value: w.id, label: w.name || w.id }; });
  }
  if (source === 'users' || source === 'partners') {
    var data = state.data[source] || {};
    return Object.values(data).filter(function(u) { return u.active !== false && !u.deleted; }).map(function(u) {
      return { value: u.uid || u.id, label: u.name || u.email || u.id || 'Sin nombre' };
    });
  }
  if (field.options) {
    return field.options.map(function(opt) { return typeof opt === 'object' ? opt : { value: opt, label: opt }; });
  }
  return [];
}

async function handleFormSubmit(entity, record) {
  var config = window.ENTITY_CONFIG[entity];
  var form = document.getElementById('entity-form');
  var formData = new FormData(form);
  var data = {};

  config.fields.forEach(function(field) {
    var value = formData.get(field.name);
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

  data.projectId = data.projectId || window.APP_CONFIG.defaultProjectId;

  var now = firebase.database.ServerValue.TIMESTAMP;

  if (!record) {
    data.createdBy = state.currentUser.uid;
    data.createdAt = now;
    data.updatedAt = now;
  } else {
    data.updatedBy = state.currentUser.uid;
    data.updatedAt = now;
    data.createdBy = record.createdBy || state.currentUser.uid;
  }

  if (entity === 'contributions' && data.partnerId) {
    var partner = state.data.partners ? state.data.partners[data.partnerId] : null;
    if (partner) {
      data.partnerName = partner.name || partner.email || 'Socio';
    }
  }

  try {
    var id;
    if (record) {
      await window.updateRecord(entity, record.id, data);
      id = record.id;
      await window.writeAudit('update', entity, id, 'Modificó ' + config.singular.toLowerCase(), state.currentUser.uid, state.userProfile.name || state.userProfile.email);
      showToast('✅ Registro actualizado correctamente');
    } else {
      data.createdBy = state.currentUser.uid;
      id = await window.createRecord(entity, data);
      await window.writeAudit('create', entity, id, 'Creó ' + config.singular.toLowerCase(), state.currentUser.uid, state.userProfile.name || state.userProfile.email);
      showToast('✅ Registro creado correctamente');
    }
    closeModal();
    renderCurrentView();
  } catch (err) {
    console.error('Error al guardar:', err);
    showToast('❌ Error al guardar: ' + (err.message || 'Verifica permisos o conexión.'));
  }
}

function confirmDelete(entity, id) {
  var config = window.ENTITY_CONFIG[entity];
  if (!confirm('¿Seguro que deseas eliminar este ' + config.singular.toLowerCase() + '?')) return;

  window.softDeleteRecord(entity, id, state.currentUser.uid)
    .then(async function() {
      await window.writeAudit('delete', entity, id, 'Eliminó ' + config.singular.toLowerCase(), state.currentUser.uid, state.userProfile.name || state.userProfile.email);
      showToast('✅ Registro eliminado');
      renderCurrentView();
    })
    .catch(function(err) {
      console.error('Error al eliminar:', err);
      showToast('❌ No se pudo eliminar. Verifica permisos.');
    });
}

// ================================================================
// ACCIONES DE USUARIOS
// ================================================================
async function toggleUserRole(uid, newRole) {
  try {
    await window.updateRecord('users', uid, { role: newRole, updatedBy: state.currentUser.uid });
    showToast('✅ Rol actualizado a ' + newRole);
    renderCurrentView();
  } catch (err) {
    console.error('Error al cambiar rol:', err);
    showToast('❌ No se pudo cambiar el rol.');
  }
}

async function toggleUserActive(uid, active) {
  try {
    await window.updateRecord('users', uid, { active: active === 'true' || active === true, updatedBy: state.currentUser.uid });
    showToast(active ? '✅ Usuario activado' : '✅ Usuario desactivado');
    renderCurrentView();
  } catch (err) {
    console.error('Error al cambiar estado:', err);
    showToast('❌ No se pudo cambiar el estado.');
  }
}

// ================================================================
// UTILIDADES UI
// ================================================================
function bindListSearch() {
  var searchInput = document.querySelector('[data-search-list]');
  if (!searchInput) return;
  searchInput.addEventListener('input', function(e) {
    var term = e.target.value.toLowerCase();
    var items = document.querySelectorAll('.list-item');
    items.forEach(function(item) {
      var text = item.textContent.toLowerCase();
      item.style.display = text.indexOf(term) !== -1 ? '' : 'none';
    });
  });
}

function bindFormEvents() {
  document.getElementById('save-config-btn') && document.getElementById('save-config-btn').addEventListener('click', saveConfig);
  document.getElementById('reset-config-btn') && document.getElementById('reset-config-btn').addEventListener('click', resetConfig);
}

function handleGlobalClick(e) {
  var target = e.target.closest('[data-action], [data-section], [data-child]');
  if (!target) return;

  if (target.dataset.section) {
    e.preventDefault();
    var sectionId = target.dataset.section;

    var isChild = false;
    for (var i = 0; i < window.NAV_SECTIONS.length; i++) {
      var navSection = window.NAV_SECTIONS[i];
      if (navSection.type === 'group' && navSection.children) {
        for (var j = 0; j < navSection.children.length; j++) {
          if (navSection.children[j].id === sectionId) {
            isChild = true;
            state.currentChild = sectionId;
            state.currentSection = navSection.id;
            break;
          }
        }
      }
      if (isChild) break;
    }

    if (!isChild) {
      state.currentSection = sectionId;
    }

    renderNavigation();
    renderCurrentView();
    // Cerrar sidebar en móvil
    var sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      toggleSidebar();
    }
    return;
  }

  if (target.dataset.child) {
    state.currentChild = target.dataset.child;
    renderCurrentView();
    return;
  }

  var action = target.dataset.action;
  if (action === 'new') {
    showForm(target.dataset.entity);
  } else if (action === 'edit') {
    var entity = target.dataset.entity;
    var record = state.data[entity] ? state.data[entity][target.dataset.id] : null;
    if (record) showForm(entity, record);
  } else if (action === 'delete') {
    confirmDelete(target.dataset.entity, target.dataset.id);
  } else if (action === 'toggle-role') {
    toggleUserRole(target.dataset.id, target.dataset.role);
  } else if (action === 'toggle-active') {
    toggleUserActive(target.dataset.id, target.dataset.active);
  }
}

function showQuickMenu() {
  var entities = Object.keys(window.ENTITY_CONFIG).filter(function(e) {
    return e !== 'users' && e !== 'auditLogs' && e !== 'attachments' && e !== 'appSettings' &&
           window.ENTITY_CONFIG[e].fields && window.ENTITY_CONFIG[e].fields.length > 0;
  });

  var modal = document.getElementById('quick-menu');
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">⚡ Registro rápido</div>
        <button class="modal-close" data-dismiss="quick">×</button>
      </div>
      <div class="quick-grid">
        ${entities.map(function(e) {
          return '<button class="quick-item" data-quick="' + e + '">' +
            '<span class="qi-icon">' + window.ENTITY_CONFIG[e].icon + '</span>' +
            '<span class="qi-label">' + window.ENTITY_CONFIG[e].label + '</span>' +
            '</button>';
        }).join('')}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.querySelector('[data-dismiss]').addEventListener('click', closeQuickMenu);
  modal.querySelector('.modal-close').addEventListener('click', closeQuickMenu);
  modal.querySelectorAll('[data-quick]').forEach(function(btn) {
    btn.addEventListener('click', function() {
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
  var toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast';
  toast.classList.remove('hidden');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(function() {
    toast.classList.add('hidden');
  }, 4000);
}

// ================================================================
// CLOUDINARY UPLOAD
// ================================================================
async function uploadAttachment(file) {
  var config = window.CLOUDINARY_CONFIG;
  if (!config.cloudName || config.cloudName === 'TU_CLOUD_NAME') {
    showToast('⚠️ Configura Cloudinary en js/config.js');
    return;
  }

  var url = 'https://api.cloudinary.com/v1_1/' + config.cloudName + '/upload';
  var formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('folder', config.folder);

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.upload.addEventListener('progress', function(e) {
    if (e.lengthComputable) {
      var percent = Math.round((e.loaded / e.total) * 100);
      var progressEl = document.getElementById('upload-progress');
      if (progressEl) {
        progressEl.innerHTML = '📤 Subiendo: ' + percent + '%';
      }
    }
  });

  xhr.onload = async function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var response = JSON.parse(xhr.responseText);
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
        var progressEl = document.getElementById('upload-progress');
        if (progressEl) progressEl.textContent = '';
        renderCurrentView();
      } catch (err) {
        console.error('Error al guardar archivo:', err);
        showToast('❌ Error al guardar el archivo en la base de datos.');
      }
    } else {
      showToast('❌ Error al subir archivo.');
    }
  };

  xhr.onerror = function() {
    showToast('❌ Error de red al subir archivo.');
  };

  xhr.send(formData);
}

// ================================================================
// EVENTOS DE UPLOAD
// ================================================================
document.addEventListener('click', function(e) {
  if (e.target.id === 'upload-attachment-btn') {
    var fileInput = document.getElementById('attachment-file');
    var file = fileInput.files[0];
    if (!file) {
      showToast('⚠️ Selecciona un archivo primero.');
      return;
    }
    var allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.indexOf(file.type) === -1) {
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

// ================================================================
// FORMATO DE MONEDA
// ================================================================
window.formatMoney = function(amount) {
  var symbol = state.settings.currencySymbol || window.APP_CONFIG.currencySymbol || '$';
  return symbol + Number(amount || 0).toFixed(2);
};