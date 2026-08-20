// Configuración pública (global)
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
  cloudName: "TU_CLOUD_NAME", // <- cambiar por el cloud name real
  uploadPreset: "logistica",
  folder: "malanga"
};

window.APP_CONFIG = {
  currency: "EUR",
  defaultProjectId: "malanga-2026"
};

window.NAV_SECTIONS = [
  { id: 'dashboard', label: 'Inicio', icon: '🏠', type: 'dashboard' },
  { id: 'journal', label: 'Actividad', icon: '📋', type: 'list', entity: 'journal' },
  { id: 'finanzas', label: 'Finanzas', icon: '💰', type: 'group', children: ['expenses', 'contributions', 'sales'] },
  { id: 'cultivo', label: 'Cultivo', icon: '🌱', type: 'group', children: ['lands', 'workers', 'workLogs', 'seeds', 'agriculturalProducts', 'cropActivities', 'incidents', 'harvests'] },
  { id: 'mas', label: 'Más', icon: '⋯', type: 'group', children: ['attachments', 'auditLogs', 'users'] }
];

window.ENTITY_CONFIG = {
  lands: {
    label: 'Terrenos', singular: 'Terreno', icon: '🗺️',
    listFields: ['name', 'location', 'status', 'rentalCost'],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'location', label: 'Ubicación', type: 'text' },
      { name: 'area', label: 'Área', type: 'number', step: '0.01' },
      { name: 'areaUnit', label: 'Unidad de área', type: 'select', options: ['ha', 'm²', 'acres'] },
      { name: 'owner', label: 'Propietario', type: 'text' },
      { name: 'rentalStart', label: 'Inicio alquiler', type: 'date' },
      { name: 'rentalEnd', label: 'Fin alquiler', type: 'date' },
      { name: 'rentalCost', label: 'Coste alquiler', type: 'number', step: '0.01' },
      { name: 'status', label: 'Estado', type: 'select', options: ['PLANIFICADO', 'ACTIVO', 'FINALIZADO'] },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  expenses: {
    label: 'Gastos', singular: 'Gasto', icon: '💸',
    listFields: ['date', 'category', 'concept', 'amount'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'category', label: 'Categoría', type: 'select', options: ['TERRENO', 'SEMILLA', 'ABONO', 'PRODUCTOS', 'TRABAJADORES', 'HERRAMIENTAS', 'MAQUINARIA', 'TRANSPORTE', 'COMBUSTIBLE', 'RIEGO', 'ALIMENTACION', 'REPARACION', 'OTROS'], required: true },
      { name: 'concept', label: 'Concepto', type: 'text', required: true },
      { name: 'provider', label: 'Proveedor', type: 'text' },
      { name: 'amount', label: 'Importe (€)', type: 'number', step: '0.01', required: true },
      { name: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  contributions: {
    label: 'Aportaciones', singular: 'Aportación', icon: '🏦',
    listFields: ['date', 'partnerId', 'amount', 'paymentMethod'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'partnerId', label: 'Socio', type: 'select', optionsFrom: 'users', required: true },
      { name: 'amount', label: 'Importe (€)', type: 'number', step: '0.01', required: true },
      { name: 'paymentMethod', label: 'Método', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
      { name: 'concept', label: 'Concepto', type: 'text' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  workers: {
    label: 'Trabajadores', singular: 'Trabajador', icon: '👤',
    listFields: ['name', 'phone', 'type', 'rate'],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'phone', label: 'Teléfono', type: 'text' },
      { name: 'type', label: 'Tipo', type: 'select', options: ['FIJO', 'TEMPORAL', 'CONTRATISTA'] },
      { name: 'rate', label: 'Tarifa', type: 'number', step: '0.01' },
      { name: 'rateUnit', label: 'Unidad de tarifa', type: 'select', options: ['hora', 'día', 'mes', 'tarea'] },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  workLogs: {
    label: 'Jornales', singular: 'Jornal', icon: '⏱️',
    listFields: ['date', 'workerId', 'activity', 'amount'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'workerId', label: 'Trabajador', type: 'select', optionsFrom: 'workers', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'activity', label: 'Actividad', type: 'text' },
      { name: 'hours', label: 'Horas', type: 'number', step: '0.1' },
      { name: 'days', label: 'Días', type: 'number', step: '0.1' },
      { name: 'rate', label: 'Tarifa aplicada', type: 'number', step: '0.01' },
      { name: 'amount', label: 'Importe total', type: 'number', step: '0.01', required: true },
      { name: 'paid', label: 'Pagado', type: 'checkbox' }
    ]
  },
  seeds: {
    label: 'Semillas', singular: 'Semilla', icon: '🌰',
    listFields: ['date', 'variety', 'quantity', 'total'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'provider', label: 'Proveedor', type: 'text' },
      { name: 'variety', label: 'Variedad', type: 'text' },
      { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true },
      { name: 'unit', label: 'Unidad', type: 'select', options: ['kg', 'g', 'unidades'] },
      { name: 'price', label: 'Precio unitario', type: 'number', step: '0.01' },
      { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  agriculturalProducts: {
    label: 'Abonos/Productos', singular: 'Producto', icon: '🧪',
    listFields: ['date', 'product', 'quantity', 'total'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'product', label: 'Producto', type: 'text', required: true },
      { name: 'type', label: 'Tipo', type: 'select', options: ['ABONO', 'FERTILIZANTE', 'HERBICIDA', 'INSECTICIDA', 'FUNGICIDA', 'OTRO'] },
      { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true },
      { name: 'unit', label: 'Unidad', type: 'select', options: ['kg', 'L', 'unidades'] },
      { name: 'price', label: 'Precio unitario', type: 'number', step: '0.01' },
      { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true },
      { name: 'provider', label: 'Proveedor', type: 'text' },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'applicationReason', label: 'Motivo de aplicación', type: 'text' },
      { name: 'dose', label: 'Dosis', type: 'text' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  cropActivities: {
    label: 'Labores', singular: 'Labor', icon: '🚜',
    listFields: ['date', 'activity', 'landId', 'cost'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands', required: true },
      { name: 'activity', label: 'Actividad', type: 'text', required: true },
      { name: 'responsible', label: 'Responsable', type: 'text' },
      { name: 'workers', label: 'Trabajadores', type: 'text' },
      { name: 'duration', label: 'Duración (horas)', type: 'number', step: '0.1' },
      { name: 'materials', label: 'Materiales', type: 'text' },
      { name: 'cost', label: 'Coste', type: 'number', step: '0.01' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  incidents: {
    label: 'Incidencias', singular: 'Incidencia', icon: '⚠️',
    listFields: ['date', 'type', 'severity', 'status'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'type', label: 'Tipo', type: 'select', options: ['PLAGA', 'ENFERMEDAD', 'CLIMA', 'RIEGO', 'MAQUINARIA', 'OTRO'] },
      { name: 'severity', label: 'Severidad', type: 'select', options: ['BAJA', 'MEDIA', 'ALTA'] },
      { name: 'description', label: 'Descripción', type: 'textarea', required: true },
      { name: 'action', label: 'Acción tomada', type: 'textarea' },
      { name: 'cost', label: 'Coste', type: 'number', step: '0.01' },
      { name: 'responsible', label: 'Responsable', type: 'text' },
      { name: 'status', label: 'Estado', type: 'select', options: ['OPEN', 'IN_PROGRESS', 'RESOLVED'] },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  harvests: {
    label: 'Cosechas', singular: 'Cosecha', icon: '🌾',
    listFields: ['date', 'landId', 'quantity', 'quality'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands', required: true },
      { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true },
      { name: 'unit', label: 'Unidad', type: 'select', options: ['kg', 't', 'unidades'] },
      { name: 'quality', label: 'Calidad', type: 'select', options: ['ALTA', 'MEDIA', 'BAJA'] },
      { name: 'destination', label: 'Destino', type: 'text' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  sales: {
    label: 'Ventas', singular: 'Venta', icon: '💰',
    listFields: ['date', 'customer', 'quantity', 'total'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'customer', label: 'Cliente', type: 'text', required: true },
      { name: 'quantity', label: 'Cantidad (kg)', type: 'number', step: '0.01', required: true },
      { name: 'price', label: 'Precio por kg', type: 'number', step: '0.01' },
      { name: 'total', label: 'Total (€)', type: 'number', step: '0.01', required: true },
      { name: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
      { name: 'paymentStatus', label: 'Estado de pago', type: 'select', options: ['COBRADO', 'PENDIENTE', 'PARCIAL'] },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  journal: {
    label: 'Bitácora', singular: 'Nota', icon: '📋',
    listFields: ['date', 'title', 'content'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'content', label: 'Contenido', type: 'textarea', required: true },
      { name: 'notes', label: 'Notas adicionales', type: 'textarea' }
    ]
  },
  auditLogs: {
    label: 'Auditoría', singular: 'Registro', icon: '🧾',
    listFields: ['timestamp', 'userName', 'action', 'description'],
    fields: []
  },
  attachments: {
    label: 'Archivos', singular: 'Archivo', icon: '📎',
    listFields: ['fileName', 'uploadedAt', 'uploadedBy'],
    fields: []
  },
  users: {
    label: 'Usuarios', singular: 'Usuario', icon: '👥',
    listFields: ['name', 'email', 'role', 'active'],
    fields: []
  }
};