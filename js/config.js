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
  cloudName: "TU_CLOUD_NAME",
  uploadPreset: "logistica",
  folder: "malanga"
};

window.APP_CONFIG = {
  currency: "USD", // Cambiado a Dólar Americano
  currencySymbol: "$",
  defaultProjectId: "malanga-2026",
  appName: "Malanga - Gestión Agrícola",
  version: "2.0.0"
};

// Navegación
window.NAV_SECTIONS = [
  { id: 'dashboard', label: 'Inicio', icon: '🏠', type: 'dashboard' },
  { id: 'journal', label: 'Actividad', icon: '📋', type: 'list', entity: 'journal' },
  { id: 'finanzas', label: 'Finanzas', icon: '💰', type: 'group', children: ['expenses', 'contributions', 'sales'] },
  { id: 'cultivo', label: 'Cultivo', icon: '🌱', type: 'group', children: ['lands', 'workers', 'workLogs', 'seeds', 'agriculturalProducts', 'cropActivities', 'incidents', 'harvests'] },
  { id: 'configuracion', label: 'Configuración', icon: '⚙️', type: 'config' },
  { id: 'mas', label: 'Más', icon: '⋯', type: 'group', children: ['attachments', 'auditLogs', 'users'] }
];

// Configuración de entidades con formularios avanzados
window.ENTITY_CONFIG = {
  // ===== NUEVO: Socios =====
  partners: {
    label: 'Socios', singular: 'Socio', icon: '👥',
    listFields: ['name', 'email', 'phone', 'status'],
    fields: [
      { 
        name: 'name', 
        label: 'Nombre completo', 
        type: 'text', 
        required: true,
        placeholder: 'Ej: Juan Pérez',
        validation: { minLength: 3, maxLength: 100 }
      },
      { 
        name: 'email', 
        label: 'Correo electrónico', 
        type: 'email', 
        required: true,
        placeholder: 'juan@email.com',
        validation: { pattern: 'email' }
      },
      { 
        name: 'phone', 
        label: 'Teléfono', 
        type: 'tel',
        placeholder: '+1 123 456 7890'
      },
      { 
        name: 'documentType', 
        label: 'Tipo de documento', 
        type: 'select',
        options: ['CEDULA', 'PASAPORTE', 'RUC', 'NIT']
      },
      { 
        name: 'documentNumber', 
        label: 'Número de documento', 
        type: 'text',
        placeholder: 'Ej: 12345678'
      },
      { 
        name: 'address', 
        label: 'Dirección', 
        type: 'textarea',
        placeholder: 'Dirección completa'
      },
      { 
        name: 'status', 
        label: 'Estado', 
        type: 'select',
        options: ['ACTIVO', 'INACTIVO', 'PENDIENTE'],
        defaultValue: 'ACTIVO'
      },
      { 
        name: 'contributionAmount', 
        label: 'Aporte inicial', 
        type: 'number',
        step: '0.01',
        min: 0,
        defaultValue: 0
      },
      { 
        name: 'joinDate', 
        label: 'Fecha de ingreso', 
        type: 'date',
        required: true
      },
      { 
        name: 'notes', 
        label: 'Notas', 
        type: 'textarea',
        placeholder: 'Información adicional...'
      }
    ],
    // Grupos para organizar el formulario
    fieldGroups: [
      { title: 'Información personal', fields: ['name', 'email', 'phone', 'documentType', 'documentNumber'] },
      { title: 'Dirección y estado', fields: ['address', 'status', 'joinDate'] },
      { title: 'Información financiera', fields: ['contributionAmount'] },
      { title: 'Notas', fields: ['notes'] }
    ]
  },

  lands: {
    label: 'Terrenos', singular: 'Terreno', icon: '🗺️',
    listFields: ['name', 'location', 'status', 'rentalCost'],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Ej: Terreno Norte' },
      { name: 'location', label: 'Ubicación', type: 'text', required: true, placeholder: 'Ej: Km 12, Carretera Principal' },
      { name: 'area', label: 'Área', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'areaUnit', label: 'Unidad de área', type: 'select', options: ['ha', 'm²', 'acres'] },
      { name: 'owner', label: 'Propietario', type: 'text', placeholder: 'Nombre del propietario' },
      { name: 'rentalStart', label: 'Inicio alquiler', type: 'date' },
      { name: 'rentalEnd', label: 'Fin alquiler', type: 'date' },
      { name: 'rentalCost', label: 'Coste alquiler', type: 'number', step: '0.01', min: 0 },
      { name: 'status', label: 'Estado', type: 'select', options: ['PLANIFICADO', 'ACTIVO', 'FINALIZADO'], defaultValue: 'PLANIFICADO' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Datos básicos', fields: ['name', 'location', 'area', 'areaUnit'] },
      { title: 'Propiedad', fields: ['owner', 'rentalStart', 'rentalEnd', 'rentalCost'] },
      { title: 'Estado y notas', fields: ['status', 'notes'] }
    ]
  },
  
  expenses: {
    label: 'Gastos', singular: 'Gasto', icon: '💸',
    listFields: ['date', 'category', 'concept', 'amount'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'category', label: 'Categoría', type: 'select', options: ['TERRENO', 'SEMILLA', 'ABONO', 'PRODUCTOS', 'TRABAJADORES', 'HERRAMIENTAS', 'MAQUINARIA', 'TRANSPORTE', 'COMBUSTIBLE', 'RIEGO', 'ALIMENTACION', 'REPARACION', 'OTROS'], required: true },
      { name: 'concept', label: 'Concepto', type: 'text', required: true, placeholder: 'Descripción del gasto' },
      { name: 'provider', label: 'Proveedor', type: 'text', placeholder: 'Nombre del proveedor' },
      { name: 'amount', label: 'Importe', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Datos del gasto', fields: ['date', 'category', 'concept', 'amount'] },
      { title: 'Información adicional', fields: ['provider', 'paymentMethod', 'landId'] },
      { title: 'Notas', fields: ['notes'] }
    ]
  },
  
  contributions: {
    label: 'Aportaciones', singular: 'Aportación', icon: '🏦',
    listFields: ['date', 'partnerName', 'amount', 'paymentMethod'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'partnerId', label: 'Socio', type: 'select', optionsFrom: 'partners', required: true },
      { name: 'amount', label: 'Importe', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'paymentMethod', label: 'Método', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
      { name: 'concept', label: 'Concepto', type: 'text', placeholder: 'Motivo de la aportación' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Datos de la aportación', fields: ['date', 'partnerId', 'amount'] },
      { title: 'Información adicional', fields: ['paymentMethod', 'concept'] },
      { title: 'Notas', fields: ['notes'] }
    ]
  },
  
  workers: {
    label: 'Trabajadores', singular: 'Trabajador', icon: '👤',
    listFields: ['name', 'phone', 'type', 'rate'],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre completo' },
      { name: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+1 123 456 7890' },
      { name: 'type', label: 'Tipo', type: 'select', options: ['FIJO', 'TEMPORAL', 'CONTRATISTA'] },
      { name: 'rate', label: 'Tarifa', type: 'number', step: '0.01', min: 0 },
      { name: 'rateUnit', label: 'Unidad de tarifa', type: 'select', options: ['hora', 'día', 'mes', 'tarea'] },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Datos personales', fields: ['name', 'phone'] },
      { title: 'Información laboral', fields: ['type', 'rate', 'rateUnit'] },
      { title: 'Notas', fields: ['notes'] }
    ]
  },
  
  workLogs: {
    label: 'Jornales', singular: 'Jornal', icon: '⏱️',
    listFields: ['date', 'workerName', 'activity', 'amount'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'workerId', label: 'Trabajador', type: 'select', optionsFrom: 'workers', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'activity', label: 'Actividad', type: 'text', required: true, placeholder: 'Descripción de la actividad' },
      { name: 'hours', label: 'Horas', type: 'number', step: '0.1', min: 0 },
      { name: 'days', label: 'Días', type: 'number', step: '0.1', min: 0 },
      { name: 'rate', label: 'Tarifa aplicada', type: 'number', step: '0.01', min: 0 },
      { name: 'amount', label: 'Importe total', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'paid', label: 'Pagado', type: 'checkbox' }
    ],
    fieldGroups: [
      { title: 'Datos del jornal', fields: ['date', 'workerId', 'landId', 'activity'] },
      { title: 'Cálculo', fields: ['hours', 'days', 'rate', 'amount'] },
      { title: 'Estado', fields: ['paid'] }
    ]
  },
  
  seeds: {
    label: 'Semillas', singular: 'Semilla', icon: '🌰',
    listFields: ['date', 'variety', 'quantity', 'total'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'provider', label: 'Proveedor', type: 'text', placeholder: 'Nombre del proveedor' },
      { name: 'variety', label: 'Variedad', type: 'text', required: true, placeholder: 'Ej: Híbrido 123' },
      { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'unit', label: 'Unidad', type: 'select', options: ['kg', 'g', 'unidades'] },
      { name: 'price', label: 'Precio unitario', type: 'number', step: '0.01', min: 0 },
      { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Datos de la semilla', fields: ['date', 'provider', 'variety'] },
      { title: 'Cantidad y precio', fields: ['quantity', 'unit', 'price', 'total'] },
      { title: 'Ubicación y notas', fields: ['landId', 'notes'] }
    ]
  },
  
  agriculturalProducts: {
    label: 'Abonos/Productos', singular: 'Producto', icon: '🧪',
    listFields: ['date', 'product', 'quantity', 'total'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'product', label: 'Producto', type: 'text', required: true, placeholder: 'Nombre del producto' },
      { name: 'type', label: 'Tipo', type: 'select', options: ['ABONO', 'FERTILIZANTE', 'HERBICIDA', 'INSECTICIDA', 'FUNGICIDA', 'OTRO'] },
      { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'unit', label: 'Unidad', type: 'select', options: ['kg', 'L', 'unidades'] },
      { name: 'price', label: 'Precio unitario', type: 'number', step: '0.01', min: 0 },
      { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'provider', label: 'Proveedor', type: 'text', placeholder: 'Nombre del proveedor' },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'applicationReason', label: 'Motivo de aplicación', type: 'text', placeholder: 'Para qué se aplica' },
      { name: 'dose', label: 'Dosis', type: 'text', placeholder: 'Ej: 2L/ha' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Datos del producto', fields: ['date', 'product', 'type'] },
      { title: 'Cantidad y precio', fields: ['quantity', 'unit', 'price', 'total'] },
      { title: 'Aplicación', fields: ['provider', 'landId', 'applicationReason', 'dose'] },
      { title: 'Notas', fields: ['notes'] }
    ]
  },
  
  cropActivities: {
    label: 'Labores', singular: 'Labor', icon: '🚜',
    listFields: ['date', 'activity', 'landName', 'cost'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands', required: true },
      { name: 'activity', label: 'Actividad', type: 'text', required: true, placeholder: 'Descripción de la labor' },
      { name: 'responsible', label: 'Responsable', type: 'text', placeholder: 'Nombre del responsable' },
      { name: 'workers', label: 'Trabajadores', type: 'text', placeholder: 'Nombres de los trabajadores' },
      { name: 'duration', label: 'Duración (horas)', type: 'number', step: '0.1', min: 0 },
      { name: 'materials', label: 'Materiales', type: 'text', placeholder: 'Materiales utilizados' },
      { name: 'cost', label: 'Coste', type: 'number', step: '0.01', min: 0 },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Datos de la labor', fields: ['date', 'landId', 'activity'] },
      { title: 'Recursos', fields: ['responsible', 'workers', 'duration', 'materials'] },
      { title: 'Coste y notas', fields: ['cost', 'notes'] }
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
      { name: 'description', label: 'Descripción', type: 'textarea', required: true, placeholder: 'Descripción detallada de la incidencia' },
      { name: 'action', label: 'Acción tomada', type: 'textarea', placeholder: 'Qué se hizo para resolver' },
      { name: 'cost', label: 'Coste', type: 'number', step: '0.01', min: 0 },
      { name: 'responsible', label: 'Responsable', type: 'text', placeholder: 'Quién atendió' },
      { name: 'status', label: 'Estado', type: 'select', options: ['OPEN', 'IN_PROGRESS', 'RESOLVED'] },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Datos de la incidencia', fields: ['date', 'landId', 'type', 'severity'] },
      { title: 'Descripción y acción', fields: ['description', 'action'] },
      { title: 'Gestión', fields: ['cost', 'responsible', 'status'] },
      { title: 'Notas', fields: ['notes'] }
    ]
  },
  
  harvests: {
    label: 'Cosechas', singular: 'Cosecha', icon: '🌾',
    listFields: ['date', 'landName', 'quantity', 'quality'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands', required: true },
      { name: 'quantity', label: 'Cantidad', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'unit', label: 'Unidad', type: 'select', options: ['kg', 't', 'unidades'] },
      { name: 'quality', label: 'Calidad', type: 'select', options: ['ALTA', 'MEDIA', 'BAJA'] },
      { name: 'destination', label: 'Destino', type: 'text', placeholder: 'A dónde fue la cosecha' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Datos de la cosecha', fields: ['date', 'landId', 'quantity', 'unit'] },
      { title: 'Calidad y destino', fields: ['quality', 'destination'] },
      { title: 'Notas', fields: ['notes'] }
    ]
  },
  
  sales: {
    label: 'Ventas', singular: 'Venta', icon: '💰',
    listFields: ['date', 'customer', 'quantity', 'total'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'customer', label: 'Cliente', type: 'text', required: true, placeholder: 'Nombre del cliente' },
      { name: 'quantity', label: 'Cantidad (kg)', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'price', label: 'Precio por kg', type: 'number', step: '0.01', min: 0 },
      { name: 'total', label: 'Total', type: 'number', step: '0.01', required: true, min: 0 },
      { name: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'] },
      { name: 'paymentStatus', label: 'Estado de pago', type: 'select', options: ['COBRADO', 'PENDIENTE', 'PARCIAL'] },
      { name: 'landId', label: 'Terreno', type: 'select', optionsFrom: 'lands' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Datos de la venta', fields: ['date', 'customer', 'quantity', 'price', 'total'] },
      { title: 'Pago', fields: ['paymentMethod', 'paymentStatus'] },
      { title: 'Ubicación y notas', fields: ['landId', 'notes'] }
    ]
  },
  
  journal: {
    label: 'Bitácora', singular: 'Nota', icon: '📋',
    listFields: ['date', 'title', 'content'],
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'title', label: 'Título', type: 'text', required: true, placeholder: 'Título de la nota' },
      { name: 'content', label: 'Contenido', type: 'textarea', required: true, placeholder: 'Contenido detallado...' },
      { name: 'notes', label: 'Notas adicionales', type: 'textarea', placeholder: 'Observaciones...' }
    ],
    fieldGroups: [
      { title: 'Información', fields: ['date', 'title'] },
      { title: 'Contenido', fields: ['content'] },
      { title: 'Notas', fields: ['notes'] }
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
  },

  // ===== NUEVO: Configuración de la aplicación =====
  appSettings: {
    label: 'Configuración', singular: 'Configuración', icon: '⚙️',
    listFields: ['key', 'value', 'updatedAt'],
    fields: [
      { name: 'key', label: 'Clave', type: 'text', required: true },
      { name: 'value', label: 'Valor', type: 'text', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Descripción de esta configuración' }
    ],
    fieldGroups: [
      { title: 'Configuración', fields: ['key', 'value'] },
      { title: 'Descripción', fields: ['description'] }
    ]
  }
};

// Configuración por defecto para la aplicación
window.DEFAULT_SETTINGS = {
  currency: 'USD',
  currencySymbol: '$',
  companyName: 'Malanga Agrícola',
  companyEmail: 'info@malanga.com',
  companyPhone: '+1 123 456 7890',
  taxRate: 0,
  defaultProject: 'malanga-2026'
};