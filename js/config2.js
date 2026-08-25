// ================================================================
// CONFIGURACIÓN GLOBAL DE LA APLICACIÓN MALANGA
// ================================================================

// Configuración de Firebase
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBI4O0d_Mec38FDiuhirujCnX99PFKiXW4",
  authDomain: "projekt-pc.firebaseapp.com",
  databaseURL: "https://projekt-pc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "projekt-pc",
  storageBucket: "projekt-pc.appspot.com",
  messagingSenderId: "90098431634",
  appId: "1:90098431634:web:7cb61800d03533c2a6984b"
};

// Configuración de Cloudinary
window.CLOUDINARY_CONFIG = {
  cloudName: "TU_CLOUD_NAME",
  uploadPreset: "logistica",
  folder: "malanga"
};

// Configuración general de la aplicación
window.APP_CONFIG = {
  currency: "USD",
  currencySymbol: "$",
  defaultProjectId: "malanga-2026",
  appName: "Malanga - Gestión Agrícola",
  version: "2.0.0"
};

// ================================================================
// NAVEGACIÓN PRINCIPAL - ESTRUCTURA COMPLETA
// ================================================================
window.NAV_SECTIONS = [
  // 1. Inicio - Dashboard
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: '🏠',
    type: 'dashboard',
    description: 'Panel de control principal'
  },
  
  // 2. Socios - Gestión de socios
  {
    id: 'partners',
    label: 'Socios',
    icon: '👥',
    type: 'list',
    entity: 'partners',
    description: 'Gestión de socios del proyecto'
  },
  
  // 3. Finanzas - Agrupa Gastos, Aportaciones y Ventas
  {
    id: 'finanzas',
    label: 'Finanzas',
    icon: '💰',
    type: 'group',
    description: 'Gestión financiera del proyecto',
    children: [
      { id: 'expenses', label: 'Gastos', icon: '💸', entity: 'expenses' },
      { id: 'contributions', label: 'Aportaciones', icon: '🏦', entity: 'contributions' },
      { id: 'sales', label: 'Ventas', icon: '💰', entity: 'sales' }
    ]
  },
  
  // 4. Cultivo - Agrupa todas las entidades agrícolas
  {
    id: 'cultivo',
    label: 'Cultivo',
    icon: '🌱',
    type: 'group',
    description: 'Gestión de cultivos y producción',
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
  
  // 5. Actividad - Bitácora
  {
    id: 'journal',
    label: 'Bitácora',
    icon: '📋',
    type: 'list',
    entity: 'journal',
    description: 'Registro de actividades y notas'
  },
  
  // 6. Configuración - ACCESIBLE PARA ADMIN
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: '⚙️',
    type: 'config',
    description: 'Configuración de la aplicación'
  },
  
  // 7. Más - Archivos, Auditoría y Usuarios
  {
    id: 'mas',
    label: 'Más',
    icon: '⋯',
    type: 'group',
    description: 'Otras herramientas',
    children: [
      { id: 'attachments', label: 'Archivos', icon: '📎', entity: 'attachments' },
      { id: 'auditLogs', label: 'Auditoría', icon: '🧾', entity: 'auditLogs' },
      { id: 'users', label: 'Usuarios', icon: '👥', entity: 'users' }
    ]
  }
];

// ================================================================
// CONFIGURACIÓN DE ENTIDADES - FORMULARIOS COMPLETOS CON CÁLCULOS
// ================================================================
window.ENTITY_CONFIG = {

  // ============================================================
  // 1. SOCIOS (PARTNERS)
  // ============================================================
  partners: {
    label: 'Socios',
    singular: 'Socio',
    icon: '👥',
    description: 'Gestión de socios del proyecto agrícola',
    listFields: ['name', 'email', 'phone', 'status', 'balance'],
    fields: [
      { name: 'name', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez Gómez' },
      { name: 'email', label: 'Correo electrónico', type: 'email', required: true, placeholder: 'juan.perez@email.com' },
      { name: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+1 123 456 7890' },
      { name: 'documentType', label: 'Tipo de documento', type: 'select', options: ['CEDULA', 'PASAPORTE', 'RUC', 'NIT', 'OTRO'], defaultValue: 'CEDULA' },
      { name: 'documentNumber', label: 'Número de documento', type: 'text', placeholder: 'Ej: 12345678' },
      { name: 'address', label: 'Dirección', type: 'textarea', placeholder: 'Dirección completa del socio' },
      { name: 'status', label: 'Estado', type: 'select', options: ['ACTIVO', 'INACTIVO', 'PENDIENTE'], defaultValue: 'ACTIVO' },
      { name: 'initialBalance', label: 'Saldo inicial', type: 'number', step: '0.01', min: 0, defaultValue: 0, placeholder: '0.00' },
      { name: 'joinDate', label: 'Fecha de ingreso', type: 'date', required: true },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Información adicional sobre el socio' }
    ],
    fieldGroups: [
      { title: '📋 Información personal', fields: ['name', 'email', 'phone', 'documentType', 'documentNumber'] },
      { title: '📍 Dirección y estado', fields: ['address', 'status', 'joinDate'] },
      { title: '💰 Saldo', fields: ['initialBalance'] },
      { title: '📝 Notas', fields: ['notes'] }
    ],
    // Campos calculados - no se muestran en el formulario
    calculatedFields: ['balance']
  },

  // ============================================================
  // 2. TERRENOS (LANDS)
  // ============================================================
  lands: {
    label: 'Terrenos',
    singular: 'Terreno',
    icon: '🗺️',
    description: 'Gestión de terrenos agrícolas',
    listFields: ['name', 'location', 'area', 'status', 'rentalCost'],
    fields: [
      { name: 'name', label: 'Nombre del terreno', type: 'text', required: true, placeholder: 'Ej: Terreno Norte' },
      { name: 'location', label: 'Ubicación', type: 'text', required: true, placeholder: 'Ej: Km 12, Carretera Principal' },
      { name: 'area', label: 'Área', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'areaUnit', label: 'Unidad de área', type: 'select', options: ['ha', 'm²', 'acres'], defaultValue: 'ha' },
      { name: 'owner', label: 'Propietario', type: 'text', placeholder: 'Nombre del propietario' },
      { name: 'rentalStart', label: 'Inicio de alquiler', type: 'date' },
      { name: 'rentalEnd', label: 'Fin de alquiler', type: 'date' },
      { name: 'rentalCost', label: 'Coste de alquiler', type: 'number', step: '0.01', min: 0, placeholder: '0.00' },
      { name: 'status', label: 'Estado', type: 'select', options: ['PLANIFICADO', 'ACTIVO', 'FINALIZADO'], defaultValue: 'PLANIFICADO' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones sobre el terreno' }
    ],
    fieldGroups: [
      { title: '📍 Datos básicos', fields: ['name', 'location', 'area', 'areaUnit'] },
      { title: '🏠 Propiedad', fields: ['owner', 'rentalStart', 'rentalEnd', 'rentalCost'] },
      { title: '📊 Estado', fields: ['status'] },
      { title: '📝 Notas', fields: ['notes'] }
    ]
  },

  // ============================================================
  // 3. GASTOS (EXPENSES) - CON ACTUALIZACIÓN DE SALDO
  // ============================================================
  expenses: {
    label: 'Gastos',
    singular: 'Gasto',
    icon: '💸',
    description: 'Registro de gastos del proyecto',
    listFields: ['date', 'category', 'concept', 'amount', 'paymentMethod'],
    fields: [
      { name: 'date', label: 'Fecha del gasto', type: 'date', required: true },
      { name: 'category', label: 'Categoría', type: 'select', required: true, options: ['TERRENO', 'SEMILLA', 'ABONO', 'PRODUCTOS', 'TRABAJADORES', 'HERRAMIENTAS', 'MAQUINARIA', 'TRANSPORTE', 'COMBUSTIBLE', 'RIEGO', 'ALIMENTACION', 'REPARACION', 'OTROS'] },
      { name: 'concept', label: 'Concepto', type: 'text', required: true, placeholder: 'Descripción detallada del gasto' },
      { name: 'provider', label: 'Proveedor', type: 'text', placeholder: 'Nombre del proveedor' },
      { name: 'amount', label: 'Importe', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'partnerId', label: 'Socio responsable', type: 'select', optionsFrom: 'partners' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones sobre el gasto' }
    ],
    fieldGroups: [
      { title: '📋 Datos del gasto', fields: ['date', 'category', 'concept', 'amount'] },
      { title: 'ℹ️ Información adicional', fields: ['provider', 'paymentMethod', 'landId', 'partnerId'] },
      { title: '📝 Notas', fields: ['notes'] }
    ],
    // Este tipo de transacción afecta al saldo (reduce)
    transactionType: 'expense'
  },

  // ============================================================
  // 4. APORTACIONES (CONTRIBUTIONS) - CON ACTUALIZACIÓN DE SALDO
  // ============================================================
  contributions: {
    label: 'Aportaciones',
    singular: 'Aportación',
    icon: '🏦',
    description: 'Registro de aportaciones de los socios',
    listFields: ['date', 'partnerName', 'amount', 'paymentMethod'],
    fields: [
      { name: 'date', label: 'Fecha de aportación', type: 'date', required: true },
      { name: 'partnerId', label: 'Socio', type: 'select', optionsFrom: 'partners', required: true },
      { name: 'amount', label: 'Importe', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
      { name: 'concept', label: 'Concepto', type: 'text', placeholder: 'Motivo de la aportación' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones sobre la aportación' }
    ],
    fieldGroups: [
      { title: '📋 Datos de la aportación', fields: ['date', 'partnerId', 'amount'] },
      { title: 'ℹ️ Información adicional', fields: ['paymentMethod', 'concept'] },
      { title: '📝 Notas', fields: ['notes'] }
    ],
    // Este tipo de transacción afecta al saldo (aumenta)
    transactionType: 'income'
  },

  // ============================================================
  // 5. TRABAJADORES (WORKERS)
  // ============================================================
  workers: {
    label: 'Trabajadores',
    singular: 'Trabajador',
    icon: '👤',
    description: 'Gestión de trabajadores agrícolas',
    listFields: ['name', 'phone', 'type', 'rate', 'rateUnit'],
    fields: [
      { name: 'name', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Nombre del trabajador' },
      { name: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+1 123 456 7890' },
      { name: 'type', label: 'Tipo de trabajador', type: 'select', options: ['FIJO', 'TEMPORAL', 'CONTRATISTA'], defaultValue: 'TEMPORAL' },
      { name: 'rate', label: 'Tarifa', type: 'number', step: '0.01', min: 0, placeholder: '0.00' },
      { name: 'rateUnit', label: 'Unidad de tarifa', type: 'select', options: ['hora', 'día', 'mes', 'tarea'] },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones sobre el trabajador' }
    ],
    fieldGroups: [
      { title: '👤 Datos personales', fields: ['name', 'phone'] },
      { title: '💼 Información laboral', fields: ['type', 'rate', 'rateUnit'] },
      { title: '📝 Notas', fields: ['notes'] }
    ]
  },

  // ============================================================
  // 6. JORNALES (WORKLOGS) - CON ACTUALIZACIÓN DE SALDO
  // ============================================================
  workLogs: {
    label: 'Jornales',
    singular: 'Jornal',
    icon: '⏱️',
    description: 'Registro de jornales y trabajo realizado',
    listFields: ['date', 'workerName', 'activity', 'hours', 'amount'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'workerId', label: 'Trabajador', type: 'select', optionsFrom: 'workers', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'activity', label: 'Actividad realizada', type: 'text', required: true, placeholder: 'Descripción de la actividad' },
      { name: 'hours', label: 'Horas trabajadas', type: 'number', step: '0.1', min: 0, placeholder: '0.0' },
      { name: 'days', label: 'Días trabajados', type: 'number', step: '0.1', min: 0, placeholder: '0.0' },
      { name: 'rate', label: 'Tarifa aplicada', type: 'number', step: '0.01', min: 0, placeholder: '0.00' },
      { name: 'amount', label: 'Importe total', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'paid', label: 'Pagado', type: 'checkbox' }
    ],
    fieldGroups: [
      { title: '📋 Datos del jornal', fields: ['date', 'workerId', 'landId', 'activity'] },
      { title: '🧮 Cálculo', fields: ['hours', 'days', 'rate', 'amount'] },
      { title: '💰 Estado de pago', fields: ['paid'] }
    ],
    transactionType: 'expense'
  },

  // ============================================================
  // 7. SEMILLAS (SEEDS) - CON ACTUALIZACIÓN DE SALDO
  // ============================================================
  seeds: {
    label: 'Semillas',
    singular: 'Semilla',
    icon: '🌰',
    description: 'Registro de compra y uso de semillas',
    listFields: ['date', 'variety', 'quantity', 'unit', 'total'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'provider', label: 'Proveedor', type: 'text', placeholder: 'Nombre del proveedor' },
      { name: 'variety', label: 'Variedad', type: 'text', required: true, placeholder: 'Ej: Híbrido 123' },
      { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'unit', label: 'Unidad', type: 'select', options: ['kg', 'g', 'unidades'], defaultValue: 'kg' },
      { name: 'price', label: 'Precio unitario', type: 'number', step: '0.01', min: 0, placeholder: '0.00' },
      { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'partnerId', label: 'Socio responsable', type: 'select', optionsFrom: 'partners' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones sobre las semillas' }
    ],
    fieldGroups: [
      { title: '📋 Datos de la semilla', fields: ['date', 'provider', 'variety'] },
      { title: '📊 Cantidad y precio', fields: ['quantity', 'unit', 'price', 'total'] },
      { title: '📍 Ubicación y responsable', fields: ['landId', 'partnerId'] },
      { title: '📝 Notas', fields: ['notes'] }
    ],
    transactionType: 'expense'
  },

  // ============================================================
  // 8. ABONOS / PRODUCTOS (AGRICULTURAL PRODUCTS) - CON ACTUALIZACIÓN DE SALDO
  // ============================================================
  agriculturalProducts: {
    label: 'Abonos/Productos',
    singular: 'Producto',
    icon: '🧪',
    description: 'Registro de productos agrícolas',
    listFields: ['date', 'product', 'type', 'quantity', 'total'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'product', label: 'Nombre del producto', type: 'text', required: true, placeholder: 'Nombre del producto' },
      { name: 'type', label: 'Tipo de producto', type: 'select', options: ['ABONO', 'FERTILIZANTE', 'HERBICIDA', 'INSECTICIDA', 'FUNGICIDA', 'OTRO'] },
      { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'unit', label: 'Unidad', type: 'select', options: ['kg', 'L', 'unidades'], defaultValue: 'kg' },
      { name: 'price', label: 'Precio unitario', type: 'number', step: '0.01', min: 0, placeholder: '0.00' },
      { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'provider', label: 'Proveedor', type: 'text', placeholder: 'Nombre del proveedor' },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'partnerId', label: 'Socio responsable', type: 'select', optionsFrom: 'partners' },
      { name: 'applicationReason', label: 'Motivo de aplicación', type: 'text', placeholder: 'Para qué se aplica' },
      { name: 'dose', label: 'Dosis', type: 'text', placeholder: 'Ej: 2L/ha' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones sobre el producto' }
    ],
    fieldGroups: [
      { title: '📋 Datos del producto', fields: ['date', 'product', 'type'] },
      { title: '📊 Cantidad y precio', fields: ['quantity', 'unit', 'price', 'total'] },
      { title: '🧪 Aplicación', fields: ['provider', 'landId', 'partnerId', 'applicationReason', 'dose'] },
      { title: '📝 Notas', fields: ['notes'] }
    ],
    transactionType: 'expense'
  },

  // ============================================================
  // 9. LABORES (CROP ACTIVITIES)
  // ============================================================
  cropActivities: {
    label: 'Labores',
    singular: 'Labor',
    icon: '🚜',
    description: 'Registro de actividades agrícolas',
    listFields: ['date', 'activity', 'landName', 'responsible', 'cost'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands', required: true },
      { name: 'activity', label: 'Actividad realizada', type: 'text', required: true, placeholder: 'Descripción de la labor' },
      { name: 'responsible', label: 'Responsable', type: 'text', placeholder: 'Nombre del responsable' },
      { name: 'workers', label: 'Trabajadores', type: 'text', placeholder: 'Nombres de los trabajadores' },
      { name: 'duration', label: 'Duración (horas)', type: 'number', step: '0.1', min: 0, placeholder: '0.0' },
      { name: 'materials', label: 'Materiales', type: 'text', placeholder: 'Materiales utilizados' },
      { name: 'cost', label: 'Coste', type: 'number', step: '0.01', min: 0, placeholder: '0.00' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones sobre la labor' }
    ],
    fieldGroups: [
      { title: '📋 Datos de la labor', fields: ['date', 'landId', 'activity'] },
      { title: '👥 Recursos', fields: ['responsible', 'workers', 'duration', 'materials'] },
      { title: '💰 Coste', fields: ['cost'] },
      { title: '📝 Notas', fields: ['notes'] }
    ],
    transactionType: 'expense'
  },

  // ============================================================
  // 10. INCIDENCIAS (INCIDENTS)
  // ============================================================
  incidents: {
    label: 'Incidencias',
    singular: 'Incidencia',
    icon: '⚠️',
    description: 'Registro de incidencias y problemas',
    listFields: ['date', 'type', 'severity', 'status', 'description'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'type', label: 'Tipo de incidencia', type: 'select', options: ['PLAGA', 'ENFERMEDAD', 'CLIMA', 'RIEGO', 'MAQUINARIA', 'OTRO'] },
      { name: 'severity', label: 'Severidad', type: 'select', options: ['BAJA', 'MEDIA', 'ALTA'] },
      { name: 'description', label: 'Descripción', type: 'textarea', required: true, placeholder: 'Descripción detallada de la incidencia' },
      { name: 'action', label: 'Acción tomada', type: 'textarea', placeholder: 'Qué se hizo para resolver' },
      { name: 'cost', label: 'Coste', type: 'number', step: '0.01', min: 0, placeholder: '0.00' },
      { name: 'responsible', label: 'Responsable', type: 'text', placeholder: 'Quién atendió la incidencia' },
      { name: 'status', label: 'Estado', type: 'select', options: ['OPEN', 'IN_PROGRESS', 'RESOLVED'], defaultValue: 'OPEN' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones adicionales' }
    ],
    fieldGroups: [
      { title: '📋 Datos de la incidencia', fields: ['date', 'landId', 'type', 'severity'] },
      { title: '📝 Descripción y acción', fields: ['description', 'action'] },
      { title: '👤 Gestión', fields: ['cost', 'responsible', 'status'] },
      { title: '📝 Notas', fields: ['notes'] }
    ],
    transactionType: 'expense'
  },

  // ============================================================
  // 11. COSECHAS (HARVESTS)
  // ============================================================
  harvests: {
    label: 'Cosechas',
    singular: 'Cosecha',
    icon: '🌾',
    description: 'Registro de cosechas y producción',
    listFields: ['date', 'landName', 'quantity', 'unit', 'quality'],
    fields: [
      { name: 'date', label: 'Fecha de cosecha', type: 'date', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands', required: true },
      { name: 'quantity', label: 'Cantidad cosechada', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'unit', label: 'Unidad', type: 'select', options: ['kg', 't', 'unidades'], defaultValue: 'kg' },
      { name: 'quality', label: 'Calidad', type: 'select', options: ['ALTA', 'MEDIA', 'BAJA'] },
      { name: 'destination', label: 'Destino', type: 'text', placeholder: 'A dónde fue la cosecha' },
      { name: 'estimatedValue', label: 'Valor estimado', type: 'number', step: '0.01', min: 0, placeholder: '0.00' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones sobre la cosecha' }
    ],
    fieldGroups: [
      { title: '📋 Datos de la cosecha', fields: ['date', 'landId', 'quantity', 'unit'] },
      { title: '⭐ Calidad y destino', fields: ['quality', 'destination', 'estimatedValue'] },
      { title: '📝 Notas', fields: ['notes'] }
    ],
    transactionType: 'income'
  },

  // ============================================================
  // 12. VENTAS (SALES) - CON ACTUALIZACIÓN DE SALDO
  // ============================================================
  sales: {
    label: 'Ventas',
    singular: 'Venta',
    icon: '💰',
    description: 'Registro de ventas de productos',
    listFields: ['date', 'customer', 'quantity', 'total', 'paymentStatus'],
    fields: [
      { name: 'date', label: 'Fecha de venta', type: 'date', required: true },
      { name: 'customer', label: 'Cliente', type: 'text', required: true, placeholder: 'Nombre del cliente' },
      { name: 'quantity', label: 'Cantidad (kg)', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'price', label: 'Precio por kg', type: 'number', step: '0.01', min: 0, placeholder: '0.00' },
      { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true, min: 0, placeholder: '0.00' },
      { name: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
      { name: 'paymentStatus', label: 'Estado de pago', type: 'select', options: ['COBRADO', 'PENDIENTE', 'PARCIAL'] },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'partnerId', label: 'Socio responsable', type: 'select', optionsFrom: 'partners' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones sobre la venta' }
    ],
    fieldGroups: [
      { title: '📋 Datos de la venta', fields: ['date', 'customer', 'quantity', 'price', 'total'] },
      { title: '💳 Pago', fields: ['paymentMethod', 'paymentStatus'] },
      { title: '📍 Ubicación y responsable', fields: ['landId', 'partnerId'] },
      { title: '📝 Notas', fields: ['notes'] }
    ],
    transactionType: 'income'
  },

  // ============================================================
  // 13. BITÁCORA (JOURNAL)
  // ============================================================
  journal: {
    label: 'Bitácora',
    singular: 'Nota',
    icon: '📋',
    description: 'Registro de actividades y notas del proyecto',
    listFields: ['date', 'title', 'content'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'title', label: 'Título', type: 'text', required: true, placeholder: 'Título de la nota' },
      { name: 'content', label: 'Contenido', type: 'textarea', required: true, placeholder: 'Contenido detallado de la nota', rows: 5 },
      { name: 'notes', label: 'Notas adicionales', type: 'textarea', placeholder: 'Observaciones adicionales' }
    ],
    fieldGroups: [
      { title: '📋 Información', fields: ['date', 'title'] },
      { title: '📝 Contenido', fields: ['content'] },
      { title: '📝 Notas', fields: ['notes'] }
    ]
  },

  // ============================================================
  // 14. USUARIOS (USERS) - Solo administradores
  // ============================================================
  users: {
    label: 'Usuarios',
    singular: 'Usuario',
    icon: '👥',
    description: 'Gestión de usuarios del sistema',
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
  },

  // ============================================================
  // 15. ARCHIVOS (ATTACHMENTS)
  // ============================================================
  attachments: {
    label: 'Archivos',
    singular: 'Archivo',
    icon: '📎',
    description: 'Gestión de archivos y documentos',
    listFields: ['fileName', 'uploadedAt', 'uploadedBy'],
    fields: []
  },

  // ============================================================
  // 16. AUDITORÍA (AUDIT LOGS)
  // ============================================================
  auditLogs: {
    label: 'Auditoría',
    singular: 'Registro',
    icon: '🧾',
    description: 'Historial de cambios y actividades',
    listFields: ['timestamp', 'userName', 'action', 'entity', 'description'],
    fields: []
  },

  // ============================================================
  // 17. CONFIGURACIÓN (APP SETTINGS) - ACCESIBLE PARA ADMIN
  // ============================================================
  appSettings: {
    label: 'Configuración',
    singular: 'Configuración',
    icon: '⚙️',
    description: 'Configuración de la aplicación',
    listFields: ['key', 'value', 'description'],
    fields: [
      { name: 'key', label: 'Clave', type: 'text', required: true },
      { name: 'value', label: 'Valor', type: 'text', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Descripción de esta configuración' }
    ],
    fieldGroups: [
      { title: '⚙️ Configuración', fields: ['key', 'value'] },
      { title: '📝 Descripción', fields: ['description'] }
    ]
  }
};

// ================================================================
// CONFIGURACIÓN POR DEFECTO DE LA APLICACIÓN
// ================================================================
window.DEFAULT_SETTINGS = {
  currency: 'USD',
  currencySymbol: '$',
  companyName: 'Malanga Agrícola',
  companyEmail: 'info@malanga.com',
  companyPhone: '+1 123 456 7890',
  taxRate: 0,
  defaultProject: 'malanga-2026',
  totalBalance: 0,
  totalCapital: 0,
  totalExpenses: 0,
  totalIncome: 0
};