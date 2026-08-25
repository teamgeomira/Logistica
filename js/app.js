// ================================================================
// MALANGA v2.1.0 - APLICACIÓN COMPLETA UNIFICADA
// ================================================================

// ================================================================
// 1. CONFIGURACIÓN
// ================================================================

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBI4O0d_Mec38FDiuhirujCnX99PFKiXW4",
  authDomain: "projekt-pc.firebaseapp.com",
  databaseURL: "https://projekt-pc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "projekt-pc",
  storageBucket: "projekt-pc.appspot.com",
  messagingSenderId: "90098431634",
  appId: "1:90098431634:web:7cb61800d03533c2a6984b"
};

window.CLOUDINARY_CONFIG = {
  cloudName: "TU_CLOUD_NAME",
  uploadPreset: "logistica",
  folder: "malanga"
};

window.APP_CONFIG = {
  currency: "USD",
  currencySymbol: "$",
  defaultProjectId: "malanga-2026",
  appName: "Malanga - Gestión Agrícola",
  version: "2.1.0"
};

window.DEFAULT_SETTINGS = {
  currency: 'USD',
  currencySymbol: '$',
  companyName: 'Malanga Agrícola',
  companyEmail: 'info@malanga.com',
  companyPhone: '+1 123 456 7890',
  taxRate: 0,
  defaultProject: 'malanga-2026'
};

// ================================================================
// 2. UTILIDADES
// ================================================================

window.formatDate = function(ts) {
  if (!ts) return '';
  try {
    var date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) { return ''; }
};

window.formatDateTime = function(ts) {
  if (!ts) return '';
  try {
    var date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) { return ''; }
};

window.formatMoney = function(amount) {
  if (amount === undefined || amount === null) return '';
  var num = Number(amount);
  if (isNaN(num)) return '';
  var symbol = window.APP_CONFIG?.currencySymbol || '$';
  return symbol + num.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
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
  try { return new Date().toISOString().split('T')[0]; } catch (e) { return ''; }
};

window.debounce = function(fn, delay) {
  delay = delay || 300;
  var timer;
  return function() {
    var args = arguments;
    var context = this;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(context, args); }, delay);
  };
};

// Cálculos automáticos
window.updateCalculatedFields = function(entity, form) {
  var config = window.ENTITY_CONFIG[entity];
  if (!config || !config.fields) return;
  config.fields.forEach(function(field) {
    if (field.calculatedFrom && field.calculatedFrom.length > 0) {
      var targetInput = form.querySelector('[name="' + field.name + '"]');
      if (!targetInput) return;
      var values = field.calculatedFrom.map(function(srcName) {
        var input = form.querySelector('[name="' + srcName + '"]');
        if (!input) return 0;
        return parseFloat(input.value) || 0;
      });
      var result = values.reduce(function(acc, val) { return acc * val; }, 1);
      var isMoney = field.name === 'amount' || field.name === 'total' || field.name === 'cost' || field.name === 'price';
      targetInput.value = isMoney ? result.toFixed(2) : result;
      var event = new Event('change', { bubbles: true });
      targetInput.dispatchEvent(event);
    }
  });
};

window.bindAutoCalculations = function(entity, form) {
  var config = window.ENTITY_CONFIG[entity];
  if (!config || !config.fields) return;
  var calculatedFields = config.fields.filter(function(f) { return f.calculatedFrom && f.calculatedFrom.length > 0; });
  if (calculatedFields.length === 0) return;
  var sourceFields = [];
  calculatedFields.forEach(function(f) {
    f.calculatedFrom.forEach(function(src) {
      if (sourceFields.indexOf(src) === -1) sourceFields.push(src);
    });
  });
  sourceFields.forEach(function(fieldName) {
    var input = form.querySelector('[name="' + fieldName + '"]');
    if (!input) return;
    var update = window.debounce(function() { window.updateCalculatedFields(entity, form); }, 150);
    input.addEventListener('input', update);
    input.addEventListener('change', update);
    input.addEventListener('keyup', update);
    input.addEventListener('blur', update);
  });
  setTimeout(function() { window.updateCalculatedFields(entity, form); }, 50);
};

// ================================================================
// 3. INICIALIZACIÓN DE FIREBASE
// ================================================================

console.log('🔥 Inicializando Firebase...');

try {
  var app = firebase.initializeApp(window.FIREBASE_CONFIG);
  window.auth = firebase.auth(app);
  window.db = firebase.database(app);
  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error);
}

// ================================================================
// 4. NAVEGACIÓN Y CONFIGURACIÓN DE ENTIDADES
// ================================================================

window.NAV_SECTIONS = [
  { id: 'dashboard', label: 'Inicio', icon: '🏠', type: 'dashboard' },
  { id: 'partners', label: 'Socios', icon: '👥', type: 'list', entity: 'partners' },
  {
    id: 'finanzas', label: 'Finanzas', icon: '💰', type: 'group',
    children: [
      { id: 'expenses', label: 'Gastos', icon: '💸', entity: 'expenses' },
      { id: 'contributions', label: 'Aportaciones', icon: '🏦', entity: 'contributions' },
      { id: 'sales', label: 'Ventas', icon: '💰', entity: 'sales' }
    ]
  },
  {
    id: 'cultivo', label: 'Cultivo', icon: '🌱', type: 'group',
    children: [
      { id: 'lands', label: 'Terrenos', icon: '🗺️', entity: 'lands' },
      { id: 'workers', label: 'Trabajadores', icon: '👤', entity: 'workers' },
      { id: 'workLogs', label: 'Jornales', icon: '⏱️', entity: 'workLogs' },
      { id: 'seeds', label: 'Semillas', icon: '🌰', entity: 'seeds' },
      { id: 'agriculturalProducts', label: 'Abonos/Productos', icon: '🧪', entity: 'agriculturalProducts' },
      { id: 'cropActivities', label: 'Labores', icon: '🚜', entity: 'cropActivities' },
      { id: 'incidents', label: 'Incidencias', icon: '⚠️', entity: 'incidents' },
      { id: 'harvests', label: 'Cosechas', icon: '🌾', entity: 'harvests' }
    ]
  },
  { id: 'journal', label: 'Bitácora', icon: '📋', type: 'list', entity: 'journal' },
  { id: 'configuracion', label: 'Configuración', icon: '⚙️', type: 'config' },
  {
    id: 'mas', label: 'Más', icon: '⋯', type: 'group',
    children: [
      { id: 'attachments', label: 'Archivos', icon: '📎', entity: 'attachments' },
      { id: 'auditLogs', label: 'Auditoría', icon: '🧾', entity: 'auditLogs' },
      { id: 'users', label: 'Usuarios', icon: '👥', entity: 'users' }
    ]
  }
];

// ENTITY_CONFIG
window.ENTITY_CONFIG = {};

// ================================================================
// SOCIOS (PARTNERS)
// ================================================================
window.ENTITY_CONFIG.partners = {
  label: 'Socios', singular: 'Socio', icon: '👥',
  listFields: ['name', 'email', 'phone', 'status', 'balance'],
  fields: [
    { name: 'name', label: 'Nombre completo', type: 'text', required: true },
    { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
    { name: 'phone', label: 'Teléfono', type: 'tel' },
    { name: 'documentType', label: 'Tipo de documento', type: 'select', options: ['CEDULA', 'PASAPORTE', 'RUC', 'NIT', 'OTRO'], defaultValue: 'CEDULA' },
    { name: 'documentNumber', label: 'Número de documento', type: 'text' },
    { name: 'address', label: 'Dirección', type: 'textarea' },
    { name: 'status', label: 'Estado', type: 'select', options: ['ACTIVO', 'INACTIVO', 'PENDIENTE'], defaultValue: 'ACTIVO' },
    { name: 'initialBalance', label: 'Saldo inicial', type: 'number', step: '0.01', min: 0, defaultValue: 0 },
    { name: 'joinDate', label: 'Fecha de ingreso', type: 'date', required: true },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📋 Información personal', fields: ['name', 'email', 'phone', 'documentType', 'documentNumber'] },
    { title: '📍 Dirección y estado', fields: ['address', 'status', 'joinDate'] },
    { title: '💰 Saldo', fields: ['initialBalance'] },
    { title: '📝 Notas', fields: ['notes'] }
  ]
};

// ================================================================
// TERRENOS (LANDS)
// ================================================================
window.ENTITY_CONFIG.lands = {
  label: 'Terrenos', singular: 'Terreno', icon: '🗺️',
  listFields: ['name', 'location', 'area', 'status', 'rentalCost'],
  fields: [
    { name: 'name', label: 'Nombre del terreno', type: 'text', required: true },
    { name: 'location', label: 'Ubicación', type: 'text', required: true },
    { name: 'area', label: 'Área', type: 'number', step: '0.01', required: true, min: 0 },
    { name: 'areaUnit', label: 'Unidad de área', type: 'select', options: ['ha', 'm²', 'acres'], defaultValue: 'ha' },
    { name: 'owner', label: 'Propietario', type: 'text' },
    { name: 'rentalStart', label: 'Inicio de alquiler', type: 'date' },
    { name: 'rentalEnd', label: 'Fin de alquiler', type: 'date' },
    { name: 'rentalCost', label: 'Coste de alquiler', type: 'number', step: '0.01', min: 0 },
    { name: 'status', label: 'Estado', type: 'select', options: ['PLANIFICADO', 'ACTIVO', 'FINALIZADO'], defaultValue: 'PLANIFICADO' },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📍 Datos básicos', fields: ['name', 'location', 'area', 'areaUnit'] },
    { title: '🏠 Propiedad', fields: ['owner', 'rentalStart', 'rentalEnd', 'rentalCost'] },
    { title: '📊 Estado', fields: ['status'] },
    { title: '📝 Notas', fields: ['notes'] }
  ]
};

// ================================================================
// GASTOS (EXPENSES)
// ================================================================
window.ENTITY_CONFIG.expenses = {
  label: 'Gastos', singular: 'Gasto', icon: '💸',
  listFields: ['date', 'category', 'concept', 'amount', 'paymentMethod'],
  fields: [
    { name: 'date', label: 'Fecha del gasto', type: 'date', required: true },
    { name: 'category', label: 'Categoría', type: 'select', required: true, options: ['TERRENO', 'SEMILLA', 'ABONO', 'PRODUCTOS', 'TRABAJADORES', 'HERRAMIENTAS', 'MAQUINARIA', 'TRANSPORTE', 'COMBUSTIBLE', 'RIEGO', 'ALIMENTACION', 'REPARACION', 'OTROS'] },
    { name: 'concept', label: 'Concepto', type: 'text', required: true },
    { name: 'provider', label: 'Proveedor', type: 'text' },
    { name: 'amount', label: 'Importe', type: 'number', step: '0.01', required: true, min: 0 },
    { name: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
    { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
    { name: 'partnerId', label: 'Socio responsable', type: 'select', optionsFrom: 'partners' },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📋 Datos del gasto', fields: ['date', 'category', 'concept', 'amount'] },
    { title: 'ℹ️ Información adicional', fields: ['provider', 'paymentMethod', 'landId', 'partnerId'] },
    { title: '📝 Notas', fields: ['notes'] }
  ],
  transactionType: 'expense'
};

// ================================================================
// APORTACIONES (CONTRIBUTIONS)
// ================================================================
window.ENTITY_CONFIG.contributions = {
  label: 'Aportaciones', singular: 'Aportación', icon: '🏦',
  listFields: ['date', 'partnerName', 'amount', 'paymentMethod'],
  fields: [
    { name: 'date', label: 'Fecha de aportación', type: 'date', required: true },
    { name: 'partnerId', label: 'Socio', type: 'select', optionsFrom: 'partners', required: true },
    { name: 'amount', label: 'Importe', type: 'number', step: '0.01', required: true, min: 0 },
    { name: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
    { name: 'concept', label: 'Concepto', type: 'text' },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📋 Datos de la aportación', fields: ['date', 'partnerId', 'amount'] },
    { title: 'ℹ️ Información adicional', fields: ['paymentMethod', 'concept'] },
    { title: '📝 Notas', fields: ['notes'] }
  ],
  transactionType: 'income'
};

// ================================================================
// TRABAJADORES (WORKERS)
// ================================================================
window.ENTITY_CONFIG.workers = {
  label: 'Trabajadores', singular: 'Trabajador', icon: '👤',
  listFields: ['name', 'phone', 'type', 'rate', 'rateUnit'],
  fields: [
    { name: 'name', label: 'Nombre completo', type: 'text', required: true },
    { name: 'phone', label: 'Teléfono', type: 'tel' },
    { name: 'type', label: 'Tipo de trabajador', type: 'select', options: ['FIJO', 'TEMPORAL', 'CONTRATISTA'], defaultValue: 'TEMPORAL' },
    { name: 'rate', label: 'Tarifa por día', type: 'number', step: '0.01', min: 0 },
    { name: 'rateUnit', label: 'Unidad de tarifa', type: 'select', options: ['día', 'hora', 'mes', 'tarea'], defaultValue: 'día' },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '👤 Datos personales', fields: ['name', 'phone'] },
    { title: '💼 Información laboral', fields: ['type', 'rate', 'rateUnit'] },
    { title: '📝 Notas', fields: ['notes'] }
  ]
};

// ================================================================
// JORNALES (WORKLOGS) - Cálculo: días × tarifa
// ================================================================
window.ENTITY_CONFIG.workLogs = {
  label: 'Jornales', singular: 'Jornal', icon: '⏱️',
  listFields: ['date', 'workerName', 'activity', 'days', 'amount'],
  fields: [
    { name: 'date', label: 'Fecha', type: 'date', required: true },
    { name: 'workerId', label: 'Trabajador', type: 'select', optionsFrom: 'workers', required: true },
    { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
    { name: 'activity', label: 'Actividad realizada', type: 'text', required: true },
    { name: 'days', label: 'Días trabajados', type: 'number', step: '0.5', min: 0, required: true },
    { name: 'rate', label: 'Tarifa por día', type: 'number', step: '0.01', min: 0, required: true },
    { name: 'amount', label: 'Importe total', type: 'number', step: '0.01', required: true, min: 0, calculatedFrom: ['days', 'rate'], readOnly: true },
    { name: 'paid', label: 'Pagado', type: 'checkbox' }
  ],
  fieldGroups: [
    { title: '📋 Datos del jornal', fields: ['date', 'workerId', 'landId', 'activity'] },
    { title: '🧮 Cálculo', fields: ['days', 'rate', 'amount'] },
    { title: '💰 Estado de pago', fields: ['paid'] }
  ],
  transactionType: 'expense'
};

// ================================================================
// SEMILLAS (SEEDS) - Unidades: kg, libras, sacos, quintales, toneladas
// ================================================================
window.ENTITY_CONFIG.seeds = {
  label: 'Semillas', singular: 'Semilla', icon: '🌰',
  listFields: ['date', 'variety', 'quantity', 'unit', 'total'],
  fields: [
    { name: 'date', label: 'Fecha', type: 'date', required: true },
    { name: 'provider', label: 'Proveedor', type: 'text' },
    { name: 'variety', label: 'Variedad', type: 'text', required: true },
    { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true, min: 0 },
    { name: 'unit', label: 'Unidad de medida', type: 'select', options: ['kg', 'libras', 'sacos', 'quintales', 'toneladas'], defaultValue: 'kg' },
    { name: 'price', label: 'Precio unitario', type: 'number', step: '0.01', min: 0 },
    { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true, min: 0, calculatedFrom: ['quantity', 'price'], readOnly: true },
    { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
    { name: 'partnerId', label: 'Socio responsable', type: 'select', optionsFrom: 'partners' },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📋 Datos de la semilla', fields: ['date', 'provider', 'variety'] },
    { title: '📊 Cantidad y precio', fields: ['quantity', 'unit', 'price', 'total'] },
    { title: '📍 Ubicación y responsable', fields: ['landId', 'partnerId'] },
    { title: '📝 Notas', fields: ['notes'] }
  ],
  transactionType: 'expense'
};

// ================================================================
// ABONOS / PRODUCTOS AGRÍCOLAS - Unidades completas
// ================================================================
window.ENTITY_CONFIG.agriculturalProducts = {
  label: 'Abonos/Productos', singular: 'Producto', icon: '🧪',
  listFields: ['date', 'product', 'type', 'quantity', 'unit', 'total'],
  fields: [
    { name: 'date', label: 'Fecha', type: 'date', required: true },
    { name: 'product', label: 'Nombre del producto', type: 'text', required: true },
    { name: 'type', label: 'Tipo de producto', type: 'select', options: ['ABONO', 'FERTILIZANTE', 'HERBICIDA', 'INSECTICIDA', 'FUNGICIDA', 'REMEDIO', 'OTRO'], required: true },
    { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true, min: 0 },
    { name: 'unit', label: 'Unidad de medida', type: 'select', options: ['kg', 'libras', 'quintal', 'litros', 'caneca', 'frasco', 'galón', 'bolsa', 'sobre', 'caja', 'unidad'], defaultValue: 'kg' },
    { name: 'price', label: 'Precio unitario', type: 'number', step: '0.01', min: 0 },
    { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true, min: 0, calculatedFrom: ['quantity', 'price'], readOnly: true },
    { name: 'provider', label: 'Proveedor', type: 'text' },
    { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
    { name: 'partnerId', label: 'Socio responsable', type: 'select', optionsFrom: 'partners' },
    { name: 'applicationReason', label: 'Motivo de aplicación', type: 'text' },
    { name: 'dose', label: 'Dosis aplicada', type: 'text' },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📋 Datos del producto', fields: ['date', 'product', 'type'] },
    { title: '📊 Cantidad y precio', fields: ['quantity', 'unit', 'price', 'total'] },
    { title: '🧪 Aplicación', fields: ['provider', 'landId', 'partnerId', 'applicationReason', 'dose'] },
    { title: '📝 Notas', fields: ['notes'] }
  ],
  transactionType: 'expense'
};

// ================================================================
// LABORES (CROP ACTIVITIES) - Con lista de tareas para malanga
// ================================================================
window.ENTITY_CONFIG.cropActivities = {
  label: 'Labores', singular: 'Labor', icon: '🚜',
  listFields: ['date', 'activity', 'landName', 'responsible', 'cost'],
  fields: [
    { name: 'date', label: 'Fecha', type: 'date', required: true },
    { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands', required: true },
    { name: 'activity', label: 'Tipo de labor', type: 'select', required: true, options: [
      'PREPARACIÓN DEL TERRENO',
      'ROZA Y LIMPIEZA',
      'ARADO',
      'RASTRILLO',
      'SURCADO',
      'AHOYADO',
      'SIEMBRA DE MALANGA',
      'RIEGO',
      'FERTILIZACIÓN',
      'APLICACIÓN DE ABONO',
      'APLICACIÓN DE HERBICIDA',
      'APLICACIÓN DE INSECTICIDA',
      'APLICACIÓN DE FUNGICIDA',
      'CONTROL DE PLAGAS',
      'CONTROL DE MALEZAS',
      'DESHIERBE MANUAL',
      'DESHIERBE QUÍMICO',
      'ACOLCHADO',
      'TUTORADO',
      'PODA',
      'COSECHA DE MALANGA',
      'CLASIFICACIÓN DE COSECHA',
      'EMPAQUE',
      'TRANSPORTE',
      'OTRA LABOR'
    ] },
    { name: 'activityDetail', label: 'Descripción detallada', type: 'textarea' },
    { name: 'responsible', label: 'Responsable', type: 'text' },
    { name: 'workers', label: 'Trabajadores (nombres)', type: 'text' },
    { name: 'workersCount', label: 'Número de trabajadores', type: 'number', step: '1', min: 0 },
    { name: 'duration', label: 'Duración (horas)', type: 'number', step: '0.5', min: 0 },
    { name: 'materials', label: 'Materiales utilizados', type: 'textarea' },
    { name: 'cost', label: 'Coste total', type: 'number', step: '0.01', min: 0 },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📋 Datos de la labor', fields: ['date', 'landId', 'activity', 'activityDetail'] },
    { title: '👥 Recursos humanos', fields: ['responsible', 'workers', 'workersCount', 'duration'] },
    { title: '🧰 Materiales y coste', fields: ['materials', 'cost'] },
    { title: '📝 Notas', fields: ['notes'] }
  ],
  transactionType: 'expense'
};

// ================================================================
// INCIDENCIAS (INCIDENTS)
// ================================================================
window.ENTITY_CONFIG.incidents = {
  label: 'Incidencias', singular: 'Incidencia', icon: '⚠️',
  listFields: ['date', 'type', 'severity', 'status', 'description'],
  fields: [
    { name: 'date', label: 'Fecha', type: 'date', required: true },
    { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
    { name: 'type', label: 'Tipo de incidencia', type: 'select', options: ['PLAGA', 'ENFERMEDAD', 'CLIMA', 'RIEGO', 'MAQUINARIA', 'OTRO'] },
    { name: 'severity', label: 'Severidad', type: 'select', options: ['BAJA', 'MEDIA', 'ALTA'] },
    { name: 'description', label: 'Descripción', type: 'textarea', required: true },
    { name: 'action', label: 'Acción tomada', type: 'textarea' },
    { name: 'cost', label: 'Coste', type: 'number', step: '0.01', min: 0 },
    { name: 'responsible', label: 'Responsable', type: 'text' },
    { name: 'status', label: 'Estado', type: 'select', options: ['OPEN', 'IN_PROGRESS', 'RESOLVED'], defaultValue: 'OPEN' },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📋 Datos de la incidencia', fields: ['date', 'landId', 'type', 'severity'] },
    { title: '📝 Descripción y acción', fields: ['description', 'action'] },
    { title: '👤 Gestión', fields: ['cost', 'responsible', 'status'] },
    { title: '📝 Notas', fields: ['notes'] }
  ],
  transactionType: 'expense'
};

// ================================================================
// COSECHAS (HARVESTS) - Unidades: kg, libras, quintales, sacos, toneladas, arrobas, unidades
// ================================================================
window.ENTITY_CONFIG.harvests = {
  label: 'Cosechas', singular: 'Cosecha', icon: '🌾',
  listFields: ['date', 'landName', 'quantity', 'unit', 'quality'],
  fields: [
    { name: 'date', label: 'Fecha de cosecha', type: 'date', required: true },
    { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands', required: true },
    { name: 'quantity', label: 'Cantidad cosechada', type: 'number', step: '0.01', required: true, min: 0 },
    { name: 'unit', label: 'Unidad de medida', type: 'select', options: ['kg', 'libras', 'quintales', 'sacos', 'toneladas', 'arrobas', 'unidades'], defaultValue: 'kg' },
    { name: 'quality', label: 'Calidad', type: 'select', options: ['ALTA', 'MEDIA', 'BAJA'], required: true },
    { name: 'destination', label: 'Destino', type: 'text' },
    { name: 'estimatedValue', label: 'Valor estimado', type: 'number', step: '0.01', min: 0 },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📋 Datos de la cosecha', fields: ['date', 'landId', 'quantity', 'unit'] },
    { title: '⭐ Calidad y destino', fields: ['quality', 'destination', 'estimatedValue'] },
    { title: '📝 Notas', fields: ['notes'] }
  ],
  transactionType: 'income'
};

// ================================================================
// VENTAS (SALES) - Unidades: kg, libras, quintales, sacos, toneladas, arrobas
// ================================================================
window.ENTITY_CONFIG.sales = {
  label: 'Ventas', singular: 'Venta', icon: '💰',
  listFields: ['date', 'customer', 'quantity', 'unit', 'total', 'paymentStatus'],
  fields: [
    { name: 'date', label: 'Fecha de venta', type: 'date', required: true },
    { name: 'customer', label: 'Cliente', type: 'text', required: true },
    { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true, min: 0 },
    { name: 'unit', label: 'Unidad de medida', type: 'select', options: ['kg', 'libras', 'quintales', 'sacos', 'toneladas', 'arrobas'], defaultValue: 'kg' },
    { name: 'price', label: 'Precio por unidad', type: 'number', step: '0.01', min: 0 },
    { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true, min: 0, calculatedFrom: ['quantity', 'price'], readOnly: true },
    { name: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
    { name: 'paymentStatus', label: 'Estado de pago', type: 'select', options: ['COBRADO', 'PENDIENTE', 'PARCIAL'], defaultValue: 'PENDIENTE' },
    { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
    { name: 'partnerId', label: 'Socio responsable', type: 'select', optionsFrom: 'partners' },
    { name: 'notes', label: 'Notas', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📋 Datos de la venta', fields: ['date', 'customer', 'quantity', 'unit', 'price', 'total'] },
    { title: '💳 Pago', fields: ['paymentMethod', 'paymentStatus'] },
    { title: '📍 Ubicación y responsable', fields: ['landId', 'partnerId'] },
    { title: '📝 Notas', fields: ['notes'] }
  ],
  transactionType: 'income'
};

// ================================================================
// BITÁCORA (JOURNAL)
// ================================================================
window.ENTITY_CONFIG.journal = {
  label: 'Bitácora', singular: 'Nota', icon: '📋',
  listFields: ['date', 'title', 'content'],
  fields: [
    { name: 'date', label: 'Fecha', type: 'date', required: true },
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'content', label: 'Contenido', type: 'textarea', required: true, rows: 5 },
    { name: 'notes', label: 'Notas adicionales', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '📋 Información', fields: ['date', 'title'] },
    { title: '📝 Contenido', fields: ['content'] },
    { title: '📝 Notas', fields: ['notes'] }
  ]
};

// ================================================================
// USUARIOS (USERS)
// ================================================================
window.ENTITY_CONFIG.users = {
  label: 'Usuarios', singular: 'Usuario', icon: '👥',
  listFields: ['name', 'email', 'role', 'active'],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Rol', type: 'select', options: ['SOCIO', 'ADMIN'], defaultValue: 'SOCIO' },
    { name: 'active', label: 'Activo', type: 'checkbox' }
  ],
  fieldGroups: [
    { title: '👤 Datos del usuario', fields: ['name', 'email'] },
    { title: '🔐 Permisos', fields: ['role', 'active'] }
  ]
};

// ================================================================
// ARCHIVOS (ATTACHMENTS)
// ================================================================
window.ENTITY_CONFIG.attachments = {
  label: 'Archivos', singular: 'Archivo', icon: '📎',
  listFields: ['fileName', 'uploadedAt', 'uploadedBy'],
  fields: []
};

// ================================================================
// AUDITORÍA (AUDIT LOGS)
// ================================================================
window.ENTITY_CONFIG.auditLogs = {
  label: 'Auditoría', singular: 'Registro', icon: '🧾',
  listFields: ['timestamp', 'userName', 'action', 'entity', 'description'],
  fields: []
};

// ================================================================
// CONFIGURACIÓN (APP SETTINGS)
// ================================================================
window.ENTITY_CONFIG.appSettings = {
  label: 'Configuración', singular: 'Configuración', icon: '⚙️',
  listFields: ['key', 'value', 'description'],
  fields: [
    { name: 'key', label: 'Clave', type: 'text', required: true },
    { name: 'value', label: 'Valor', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' }
  ],
  fieldGroups: [
    { title: '⚙️ Configuración', fields: ['key', 'value'] },
    { title: '📝 Descripción', fields: ['description'] }
  ]
};

// ================================================================
// 5. FUNCIONES DE AUTENTICACIÓN
// ================================================================

window.login = function(email, password) {
  return window.auth.signInWithEmailAndPassword(email, password);
};

window.logout = function() {
  return window.auth.signOut();
};

window.resetPassword = function(email) {
  return window.auth.sendPasswordResetEmail(email);
};

// ================================================================
// 6. FUNCIONES DE BASE DE DATOS
// ================================================================

window.subscribeToEntity = function(entity, callback) {
  var ref = window.db.ref(entity);
  return ref.on('value', function(snapshot) {
    try {
      callback(snapshot.val() || {});
    } catch (error) {
      console.error('Error en callback de ' + entity + ':', error);
    }
  });
};

window.createRecord = async function(entity, data) {
  var ref = window.db.ref(entity);
  var newRef = ref.push();
  var record = {
    ...data,
    id: newRef.key,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };
  await newRef.set(record);
  return newRef.key;
};

window.updateRecord = async function(entity, id, data) {
  var ref = window.db.ref(entity + '/' + id);
  await ref.update({
    ...data,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  });
};

window.softDeleteRecord = async function(entity, id, userId) {
  var ref = window.db.ref(entity + '/' + id);
  await ref.update({
    deleted: true,
    deletedAt: firebase.database.ServerValue.TIMESTAMP,
    deletedBy: userId
  });
};

window.writeAudit = async function(action, entity, entityId, description, userId, userName) {
  try {
    var auditRef = window.db.ref('auditLogs');
    var newAudit = auditRef.push();
    await newAudit.set({
      id: newAudit.key,
      userId: userId,
      userName: userName || 'Usuario',
      action: action,
      entity: entity,
      entityId: entityId,
      description: description,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  } catch (error) {
    console.warn('Error al escribir auditoría:', error);
  }
};

window.onConnectionChange = function(callback) {
  var connectedRef = window.db.ref('.info/connected');
  connectedRef.on('value', function(snap) {
    callback(snap.val() === true);
  });
};

// ================================================================
// 7. ESTADO DE LA APLICACIÓN
// ================================================================

var state = {
  currentUser: null,
  userProfile: null,
  data: {},
  listeners: [],
  currentSection: 'dashboard',
  currentChild: null,
  online: true,
  toastTimer: null,
  settings: {},
  isInitialized: false
};

// ================================================================
// 8. UI
// ================================================================

function initUI() {
  // Login
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      handleLogin(e);
    });
    
    var inputs = loginForm.querySelectorAll('input');
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
  
  var resetBtn = document.getElementById('reset-password');
  if (resetBtn) resetBtn.addEventListener('click', handleResetPassword);
  
  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  var fabBtn = document.getElementById('fab');
  if (fabBtn) fabBtn.addEventListener('click', showQuickMenu);
  
  var menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  
  var modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target.id === 'modal') closeModal();
    });
  }
  
  var quickMenu = document.getElementById('quick-menu');
  if (quickMenu) {
    quickMenu.addEventListener('click', function(e) {
      if (e.target.id === 'quick-menu') closeQuickMenu();
    });
  }
  
  document.addEventListener('click', handleGlobalClick);
  
  // Conexión
  window.onConnectionChange(function(online) {
    state.online = online;
    updateConnectionStatus();
  });
}

function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  
  var isOpen = sidebar.classList.contains('open');
  
  if (isOpen) {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
  } else {
    sidebar.classList.add('open');
    if (!overlay) {
      var newOverlay = document.createElement('div');
      newOverlay.id = 'sidebar-overlay';
      newOverlay.className = 'sidebar-overlay';
      newOverlay.addEventListener('click', toggleSidebar);
      document.body.appendChild(newOverlay);
    }
    var overlayEl = document.getElementById('sidebar-overlay');
    if (overlayEl) overlayEl.classList.add('visible');
  }
}

function updateConnectionStatus() {
  var el = document.getElementById('connection-status');
  if (el) {
    el.className = 'connection-status ' + (state.online ? 'online' : 'offline');
    el.title = state.online ? 'Conectado' : 'Desconectado';
  }
}

function showLogin() {
  var loginScreen = document.getElementById('login-screen');
  var appScreen = document.getElementById('app-screen');
  if (loginScreen) loginScreen.classList.remove('hidden');
  if (appScreen) appScreen.classList.add('hidden');
}

function showApp() {
  var loginScreen = document.getElementById('login-screen');
  var appScreen = document.getElementById('app-screen');
  if (loginScreen) loginScreen.classList.add('hidden');
  if (appScreen) appScreen.classList.remove('hidden');
}

// ================================================================
// 9. AUTENTICACIÓN
// ================================================================

function initAuth() {
  if (state.isInitialized) return;
  state.isInitialized = true;
  
  window.auth.onAuthStateChanged(async function(user) {
    try {
      if (user) {
        // Cargar perfil
        var userRef = window.db.ref('users/' + user.uid);
        var snap = await userRef.get();
        var profile = snap.val();
        
        if (!profile) {
          await window.auth.signOut();
          showLogin();
          showToast('Usuario no registrado en el sistema.');
          return;
        }
        
        if (profile.active === false) {
          await window.auth.signOut();
          showLogin();
          showToast('Usuario inactivo. Contacta al administrador.');
          return;
        }
        
        if (!profile.role) {
          profile.role = 'SOCIO';
          await userRef.update({ role: 'SOCIO' });
        }
        
        state.currentUser = user;
        state.userProfile = profile;
        state.data = {};
        
        showApp();
        await loadSettings();
        subscribeToAllEntities();
        renderAll();
        showToast('Bienvenido, ' + (profile.name || profile.email || 'Usuario'));
      } else {
        state.currentUser = null;
        state.userProfile = null;
        showLogin();
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      showLogin();
      showToast('Error al cargar perfil.');
    }
  });
}

async function loadSettings() {
  try {
    if (!state.currentUser) {
      console.warn('No hay usuario autenticado para cargar configuración');
      state.settings = window.DEFAULT_SETTINGS || {};
      return;
    }
    
    var settingsRef = window.db.ref('appSettings');
    var snap = await settingsRef.get();
    var settings = snap.val() || {};
    state.settings = settings;
    if (settings.currencySymbol) {
      window.APP_CONFIG.currencySymbol = settings.currencySymbol;
    }
  } catch (error) {
    if (error.code === 'PERMISSION_DENIED') {
      console.warn('Sin permisos para leer configuración, usando valores por defecto');
    } else {
      console.error('Error al cargar configuración:', error);
    }
    state.settings = window.DEFAULT_SETTINGS || {};
  }
}

function handleLogin(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var errorEl = document.getElementById('login-error');
  var btn = document.getElementById('login-btn');
  var btnContent = document.getElementById('login-btn-content');
  
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
  
  if (!email || !password) {
    if (errorEl) {
      errorEl.textContent = '⚠️ Por favor, completa todos los campos.';
      errorEl.classList.add('visible');
    }
    return;
  }
  
  if (!email.includes('@') || !email.includes('.')) {
    if (errorEl) {
      errorEl.textContent = '⚠️ Ingresa un correo electrónico válido.';
      errorEl.classList.add('visible');
    }
    return;
  }
  
  if (btn) btn.disabled = true;
  if (btnContent) btnContent.innerHTML = '<span class="spinner"></span> Cargando...';
  
  window.login(email, password)
    .catch(function(err) {
      console.error('Login error:', err);
      var errorMsg = '❌ Error al iniciar sesión.';
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
      } else if (err.code === 'auth/network-request-failed') {
        errorMsg = '⚠️ Error de red. Verifica tu conexión a internet.';
      }
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.classList.add('visible');
      }
      if (btn) btn.disabled = false;
      if (btnContent) btnContent.innerHTML = '<span class="btn-icon">🚀</span> Entrar';
    });
}

function handleResetPassword() {
  var email = document.getElementById('login-email').value.trim();
  if (!email) {
    showToast('Introduce tu email primero.');
    return;
  }
  window.resetPassword(email)
    .then(function() {
      showToast('Correo de recuperación enviado.');
    })
    .catch(function(err) {
      console.error('Reset password error:', err);
      if (err.code === 'auth/user-not-found') {
        showToast('No existe un usuario con ese email.');
      } else {
        showToast('Error al enviar el correo de recuperación.');
      }
    });
}

function handleLogout() {
  window.logout()
    .then(function() {
      showToast('Sesión cerrada correctamente.');
    })
    .catch(function(err) {
      console.error('Logout error:', err);
      showToast('Error al cerrar sesión.');
    });
}

// ================================================================
// 10. DATOS Y SUSCRIPCIONES
// ================================================================

function subscribeToAllEntities() {
  var entities = [
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
// 11. RENDER PRINCIPAL
// ================================================================

function renderAll() {
  renderNavigation();
  renderCurrentView();
  updateUserBadge();
}

function updateUserBadge() {
  var nameEl = document.getElementById('user-name');
  var avatarEl = document.getElementById('user-avatar');
  if (nameEl && state.userProfile) {
    nameEl.textContent = state.userProfile.name || state.userProfile.email || 'Usuario';
  }
  if (avatarEl && state.userProfile) {
    avatarEl.textContent = (state.userProfile.name || state.userProfile.email || 'U').charAt(0).toUpperCase();
  }
}

function renderNavigation() {
  var sidebar = document.getElementById('sidebar');
  var bottomNav = document.getElementById('bottom-nav');
  if (!sidebar || !bottomNav) return;

  var sidebarHtml = '';
  var bottomHtml = '';

  window.NAV_SECTIONS.forEach(function(section) {
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

    bottomHtml += '<button class="nav-btn ' + active + '" data-section="' + section.id + '">';
    bottomHtml += '<span class="nav-icon">' + section.icon + '</span>';
    bottomHtml += '<span class="nav-label">' + section.label + '</span>';
    bottomHtml += '</button>';
  });

  sidebar.innerHTML = sidebarHtml;
  bottomNav.innerHTML = bottomHtml;
}

function renderCurrentView() {
  var main = document.getElementById('main-content');
  if (!main) return;

  var section = null;

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
  
  try {
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
  } catch (error) {
    console.error('Error al renderizar:', error);
    content = '<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Error al cargar</div><div class="empty-desc">' + error.message + '</div></div>';
  }

  main.innerHTML = content;
  bindListSearch();
  bindFormEvents();
}

// ================================================================
// 12. DASHBOARD
// ================================================================

function renderDashboard() {
  try {
    var expenses = sumEntity('expenses', 'amount');
    var contributions = sumEntity('contributions', 'amount');
    var sales = sumEntity('sales', 'total');
    var seedsTotal = sumEntity('seeds', 'total');
    var productsTotal = sumEntity('agriculturalProducts', 'total');
    var workLogsTotal = sumEntity('workLogs', 'amount');
    var activitiesCost = sumEntity('cropActivities', 'cost');
    var incidentsCost = sumEntity('incidents', 'cost');
    var harvestKg = sumEntity('harvests', 'quantity');
    var salesKg = sumEntity('sales', 'quantity');
    
    var totalExpenses = expenses + seedsTotal + productsTotal + workLogsTotal + activitiesCost + incidentsCost;
    var totalIncome = contributions + sales;
    var resultado = totalIncome - totalExpenses;
    var totalPartners = 0;
    
    var partnersData = state.data.partners || {};
    totalPartners = Object.values(partnersData).filter(function(p) { return !p.deleted && p.status === 'ACTIVO'; }).length;

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
            <div class="stat-value">${safeFormatMoney(contributions)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label"><span class="label-icon">💸</span> Gastos totales</div>
            <div class="stat-value">${safeFormatMoney(totalExpenses)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label"><span class="label-icon">💰</span> Ingresos totales</div>
            <div class="stat-value">${safeFormatMoney(totalIncome)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label"><span class="label-icon">📊</span> Resultado</div>
            <div class="stat-value">${safeFormatMoney(resultado)}</div>
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
  } catch (error) {
    console.error('Error en renderDashboard:', error);
    return '<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Error al cargar el dashboard</div></div>';
  }
}

function safeFormatMoney(value) {
  try {
    return window.formatMoney(value);
  } catch (e) {
    console.warn('Error formateando moneda:', e);
    return '$0.00';
  }
}

function sumEntity(entity, field) {
  try {
    var records = Object.values(state.data[entity] || {}).filter(function(r) { return !r.deleted; });
    return records.reduce(function(sum, r) { return sum + (Number(r[field]) || 0); }, 0);
  } catch (e) {
    return 0;
  }
}

function computeAlerts() {
  var alerts = [];
  var now = Date.now();
  var in30Days = now + 30 * 24 * 60 * 60 * 1000;

  try {
    var lands = state.data.lands || {};
    Object.values(lands).filter(function(l) { return !l.deleted && l.status === 'ACTIVO'; }).forEach(function(land) {
      if (land.rentalEnd && new Date(land.rentalEnd).getTime() < in30Days) {
        alerts.push({ type: 'alert-warning', icon: '⚠️', message: 'Alquiler próximo a vencer: ' + land.name });
      }
    });
  } catch (e) {}

  try {
    var incidents = state.data.incidents || {};
    Object.values(incidents).filter(function(i) { return !i.deleted && i.status !== 'RESOLVED'; }).forEach(function(inc) {
      alerts.push({ type: 'alert-danger', icon: '🚨', message: 'Incidencia abierta: ' + (inc.description || '').substring(0, 40) });
    });
  } catch (e) {}

  try {
    var sales = state.data.sales || {};
    Object.values(sales).filter(function(s) { return !s.deleted && s.paymentStatus !== 'COBRADO'; }).forEach(function(sale) {
      alerts.push({ type: 'alert-warning', icon: '💳', message: 'Venta pendiente de cobro: ' + (sale.customer || 'Cliente') + ' - ' + safeFormatMoney(sale.total || 0) });
    });
  } catch (e) {}

  return alerts;
}

function getRecentActivity(limit) {
  limit = limit || 5;
  try {
    var logs = Object.values(state.data.auditLogs || {})
      .filter(function(l) { return l.timestamp; })
      .sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); })
      .slice(0, limit);
    return logs;
  } catch (e) {
    return [];
  }
}

// ================================================================
// 13. LISTAS
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

        if (field && field.type === 'date' && value) {
          html += '<span class="item-date">' + window.formatDate(value) + '</span>';
        } else if (field && (field.type === 'number' || fieldName.match(/amount|cost|price|total|rate|capital|rentalCost|contributionAmount/))) {
          html += '<span class="item-number">' + safeFormatMoney(value) + '</span>';
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
// 14. USUARIOS, ARCHIVOS, AUDITORÍA
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
// 15. CONFIGURACIÓN
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
    updatedBy: state.currentUser ? state.currentUser.uid : null
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
      updatedBy: state.currentUser ? state.currentUser.uid : null
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
// 16. FORMULARIOS
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
  
  var form = modal.querySelector('#entity-form');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    window.updateCalculatedFields(entity, form);
    handleFormSubmit(entity, record);
  });
  
  modal.querySelector('[data-dismiss]').addEventListener('click', closeModal);
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  
  setTimeout(function() {
    window.bindAutoCalculations(entity, form);
  }, 100);
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

      var calcAttr = field.calculatedFrom ? ' data-calc-from="' + field.calculatedFrom.join(',') + '"' : '';
      var readOnlyAttr = field.readOnly ? ' readonly' : '';

      html += '<div class="form-group">';
      html += '<label for="f_' + field.name + '">' + field.label + (field.required ? ' <span class="required">*</span>' : '') + '</label>';

      switch (field.type) {
        case 'textarea':
          html += '<textarea id="f_' + field.name + '" name="' + field.name + '" ' + (field.required ? 'required' : '') + ' rows="' + (field.rows || 3) + '" placeholder="' + (field.placeholder || '') + '"' + calcAttr + '>' + window.escapeHtml(value) + '</textarea>';
          break;
        case 'select':
          html += '<select id="f_' + field.name + '" name="' + field.name + '" ' + (field.required ? 'required' : '') + calcAttr + '>';
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
          html += '<input type="checkbox" id="f_' + field.name + '" name="' + field.name + '" ' + checked + calcAttr + '>';
          break;
        case 'number':
          html += '<input type="number" id="f_' + field.name + '" name="' + field.name + '" value="' + value + '" ' + (field.required ? 'required' : '') + ' ' + (field.step ? 'step="' + field.step + '"' : '') + ' ' + (field.min !== undefined ? 'min="' + field.min + '"' : '') + ' ' + (field.max !== undefined ? 'max="' + field.max + '"' : '') + ' placeholder="' + (field.placeholder || '') + '"' + calcAttr + readOnlyAttr + '>';
          break;
        default:
          html += '<input type="' + field.type + '" id="f_' + field.name + '" name="' + field.name + '" value="' + window.escapeHtml(value) + '" ' + (field.required ? 'required' : '') + ' ' + (field.min !== undefined ? 'min="' + field.min + '"' : '') + ' ' + (field.max !== undefined ? 'max="' + field.max + '"' : '') + ' placeholder="' + (field.placeholder || '') + '"' + calcAttr + readOnlyAttr + '>';
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
  
  window.updateCalculatedFields(entity, form);
  
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
    data.createdBy = state.currentUser ? state.currentUser.uid : null;
    data.createdAt = now;
    data.updatedAt = now;
  } else {
    data.updatedBy = state.currentUser ? state.currentUser.uid : null;
    data.updatedAt = now;
    data.createdBy = record.createdBy || (state.currentUser ? state.currentUser.uid : null);
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
      await window.writeAudit('update', entity, id, 'Modificó ' + config.singular.toLowerCase(), state.currentUser ? state.currentUser.uid : null, state.userProfile ? state.userProfile.name || state.userProfile.email : 'Usuario');
      showToast('✅ Registro actualizado correctamente');
    } else {
      data.createdBy = state.currentUser ? state.currentUser.uid : null;
      id = await window.createRecord(entity, data);
      await window.writeAudit('create', entity, id, 'Creó ' + config.singular.toLowerCase(), state.currentUser ? state.currentUser.uid : null, state.userProfile ? state.userProfile.name || state.userProfile.email : 'Usuario');
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

  window.softDeleteRecord(entity, id, state.currentUser ? state.currentUser.uid : null)
    .then(async function() {
      await window.writeAudit('delete', entity, id, 'Eliminó ' + config.singular.toLowerCase(), state.currentUser ? state.currentUser.uid : null, state.userProfile ? state.userProfile.name || state.userProfile.email : 'Usuario');
      showToast('✅ Registro eliminado');
      renderCurrentView();
    })
    .catch(function(err) {
      console.error('Error al eliminar:', err);
      showToast('❌ No se pudo eliminar. Verifica permisos.');
    });
}

// ================================================================
// 17. ACCIONES DE USUARIOS
// ================================================================

async function toggleUserRole(uid, newRole) {
  try {
    await window.updateRecord('users', uid, { role: newRole, updatedBy: state.currentUser ? state.currentUser.uid : null });
    showToast('✅ Rol actualizado a ' + newRole);
    renderCurrentView();
  } catch (err) {
    console.error('Error al cambiar rol:', err);
    showToast('❌ No se pudo cambiar el rol.');
  }
}

async function toggleUserActive(uid, active) {
  try {
    await window.updateRecord('users', uid, { active: active === 'true' || active === true, updatedBy: state.currentUser ? state.currentUser.uid : null });
    showToast(active ? '✅ Usuario activado' : '✅ Usuario desactivado');
    renderCurrentView();
  } catch (err) {
    console.error('Error al cambiar estado:', err);
    showToast('❌ No se pudo cambiar el estado.');
  }
}

// ================================================================
// 18. UTILIDADES UI
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
  var saveConfigBtn = document.getElementById('save-config-btn');
  if (saveConfigBtn) saveConfigBtn.addEventListener('click', saveConfig);
  var resetConfigBtn = document.getElementById('reset-config-btn');
  if (resetConfigBtn) resetConfigBtn.addEventListener('click', resetConfig);
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
  var modal = document.getElementById('modal');
  if (modal) modal.classList.add('hidden');
}

function closeQuickMenu() {
  var modal = document.getElementById('quick-menu');
  if (modal) modal.classList.add('hidden');
}

function showToast(message) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast';
  toast.classList.remove('hidden');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(function() {
    toast.classList.add('hidden');
  }, 4000);
}

// ================================================================
// 19. CLOUDINARY UPLOAD
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
          uploadedBy: state.currentUser ? state.currentUser.uid : null,
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
// 20. EVENTOS DE UPLOAD
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
// 21. INICIALIZACIÓN FINAL
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🌱 Malanga v2.1.0 - Iniciando...');
  initUI();
  initAuth();
  console.log('✅ Aplicación inicializada correctamente');
});

console.log('🔥 Firebase inicializado correctamente');
console.log('✅ formatMoney disponible:', typeof window.formatMoney === 'function');
console.log('✅ ENTITY_CONFIG cargado:', Object.keys(window.ENTITY_CONFIG).length, 'entidades');