// ================================================================
// MALANGA - MÓDULO DE REPORTES v1.0
// ================================================================

(function() {
  'use strict';

  // ================================================================
  // 1. EXTENDER NAVEGACIÓN CON SECCIÓN DE REPORTES
  // ================================================================

  // Verificar si ya existe la sección para evitar duplicados
  var exists = window.NAV_SECTIONS.some(function(s) { return s.id === 'reportes'; });
  if (!exists) {
    window.NAV_SECTIONS.push({
      id: 'reportes',
      label: 'Reportes',
      icon: '📊',
      type: 'group',
      children: [
        { id: 'report-financiero', label: 'Financiero', icon: '💰' },
        { id: 'report-produccion', label: 'Producción', icon: '🌾' },
        { id: 'report-cultivo', label: 'Cultivo', icon: '🌱' },
        { id: 'report-trabajadores', label: 'Trabajadores', icon: '👤' },
        { id: 'report-ventas', label: 'Ventas', icon: '🛒' },
        { id: 'report-auditoria', label: 'Auditoría', icon: '🧾' }
      ]
    });
  }

  // ================================================================
  // 2. ESTADO INTERNO DE REPORTES
  // ================================================================

  var reportState = {
    activeReport: 'report-financiero',
    filters: {
      fechaDesde: '',
      fechaHasta: '',
      landId: '',
      partnerId: '',
      workerId: ''
    }
  };

  // ================================================================
  // 3. FUNCIONES AUXILIARES PARA REPORTES
  // ================================================================

  // Obtener registros de una entidad, con filtros opcionales
  function getRecords(entity, filterFn) {
    var data = window.state && window.state.data ? window.state.data[entity] : {};
    if (!data) return [];
    var records = Object.values(data).filter(function(r) { return !r.deleted; });
    if (filterFn) records = records.filter(filterFn);
    return records;
  }

  // Filtrar por rango de fechas (timestamp o string fecha)
  function filterByDateRange(records, dateField, desde, hasta) {
    if (!desde && !hasta) return records;
    return records.filter(function(r) {
      var val = r[dateField];
      if (!val) return false;
      var ts = typeof val === 'number' ? val : new Date(val).getTime();
      if (isNaN(ts)) return false;
      if (desde && ts < new Date(desde).getTime()) return false;
      if (hasta && ts > new Date(hasta).getTime() + 86400000) return false;
      return true;
    });
  }

  // Obtener nombre de entidad por ID
  function getEntityName(entity, id) {
    if (!id) return '';
    var data = window.state && window.state.data ? window.state.data[entity] : {};
    var item = data[id];
    if (!item) return id;
    return item.name || item.email || item.title || id;
  }

  // Formatear número con decimales
  function formatNumber(num, decimals) {
    if (num === undefined || num === null) return '0';
    var n = Number(num);
    if (isNaN(n)) return '0';
    return n.toFixed(decimals || 2);
  }

  // ================================================================
  // 4. RENDERIZADOR DE REPORTES (PRINCIPAL)
  // ================================================================

  function renderReports() {
    var main = document.getElementById('main-content');
    if (!main) return;

    // Determinar qué reporte mostrar
    var reportId = reportState.activeReport;

    var html = '';
    html += '<div class="reports-container animate-fade-in">';
    html += '  <div class="page-header">';
    html += '    <h1 class="page-title">📊 Reportes</h1>';
    html += '    <p class="page-subtitle">Análisis detallado de la información del proyecto</p>';
    html += '  </div>';

    // Barra de navegación secundaria (pestañas)
    html += '  <div class="subnav">';
    var children = window.NAV_SECTIONS.find(function(s) { return s.id === 'reportes'; }).children;
    children.forEach(function(child) {
      var active = child.id === reportId ? 'active' : '';
      html += '<button class="chip ' + active + '" data-report="' + child.id + '">';
      html += child.icon + ' ' + child.label;
      html += '</button>';
    });
    html += '  </div>';

    // Filtros comunes
    html += '  <div class="filters-bar" style="background:var(--surface);padding:0.75rem 1rem;border-radius:var(--radius);margin-bottom:1rem;border:1px solid var(--border);display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center;">';
    html += '    <div class="filter-group" style="display:flex;align-items:center;gap:0.5rem;">';
    html += '      <label style="font-size:0.8rem;font-weight:600;">Desde</label>';
    html += '      <input type="date" id="report-fecha-desde" value="' + reportState.filters.fechaDesde + '" style="padding:0.3rem 0.6rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);">';
    html += '    </div>';
    html += '    <div class="filter-group" style="display:flex;align-items:center;gap:0.5rem;">';
    html += '      <label style="font-size:0.8rem;font-weight:600;">Hasta</label>';
    html += '      <input type="date" id="report-fecha-hasta" value="' + reportState.filters.fechaHasta + '" style="padding:0.3rem 0.6rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);">';
    html += '    </div>';
    // Filtro de terreno (opcional)
    var lands = getRecords('lands');
    if (lands.length > 0) {
      html += '    <div class="filter-group" style="display:flex;align-items:center;gap:0.5rem;">';
      html += '      <label style="font-size:0.8rem;font-weight:600;">Terreno</label>';
      html += '      <select id="report-filter-land" style="padding:0.3rem 0.6rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);">';
      html += '        <option value="">Todos</option>';
      lands.forEach(function(l) {
        var selected = l.id === reportState.filters.landId ? 'selected' : '';
        html += '        <option value="' + l.id + '" ' + selected + '>' + l.name + '</option>';
      });
      html += '      </select>';
      html += '    </div>';
    }
    // Filtro de socio (opcional)
    var partners = getRecords('partners');
    if (partners.length > 0) {
      html += '    <div class="filter-group" style="display:flex;align-items:center;gap:0.5rem;">';
      html += '      <label style="font-size:0.8rem;font-weight:600;">Socio</label>';
      html += '      <select id="report-filter-partner" style="padding:0.3rem 0.6rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text);">';
      html += '        <option value="">Todos</option>';
      partners.forEach(function(p) {
        var selected = p.id === reportState.filters.partnerId ? 'selected' : '';
        html += '        <option value="' + p.id + '" ' + selected + '>' + p.name + '</option>';
      });
      html += '      </select>';
      html += '    </div>';
    }
    html += '    <button class="btn btn-primary btn-sm" id="report-apply-filters">Aplicar</button>';
    html += '    <button class="btn btn-secondary btn-sm" id="report-reset-filters">Limpiar</button>';
    html += '    <button class="btn btn-secondary btn-sm" id="report-export-csv">📥 Exportar CSV</button>';
    html += '  </div>';

    // Contenido del reporte específico
    html += '  <div id="report-content" style="background:var(--surface);border-radius:var(--radius);padding:1rem;border:1px solid var(--border);">';
    var content = '';
    switch (reportId) {
      case 'report-financiero':
        content = renderReportFinanciero();
        break;
      case 'report-produccion':
        content = renderReportProduccion();
        break;
      case 'report-cultivo':
        content = renderReportCultivo();
        break;
      case 'report-trabajadores':
        content = renderReportTrabajadores();
        break;
      case 'report-ventas':
        content = renderReportVentas();
        break;
      case 'report-auditoria':
        content = renderReportAuditoria();
        break;
      default:
        content = '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Reporte no encontrado</div></div>';
    }
    html += content;
    html += '  </div>';

    html += '</div>';

    main.innerHTML = html;

    // Bindings de eventos
    bindReportEvents();
  }

  // ================================================================
  // 5. REPORTE FINANCIERO
  // ================================================================

  function renderReportFinanciero() {
    var desde = document.getElementById('report-fecha-desde') ? document.getElementById('report-fecha-desde').value : '';
    var hasta = document.getElementById('report-fecha-hasta') ? document.getElementById('report-fecha-hasta').value : '';
    var landId = document.getElementById('report-filter-land') ? document.getElementById('report-filter-land').value : '';
    var partnerId = document.getElementById('report-filter-partner') ? document.getElementById('report-filter-partner').value : '';

    // Obtener datos con filtros
    var expenses = getRecords('expenses', function(r) {
      if (landId && r.landId !== landId) return false;
      if (partnerId && r.partnerId !== partnerId) return false;
      return true;
    });
    var contributions = getRecords('contributions', function(r) {
      if (partnerId && r.partnerId !== partnerId) return false;
      return true;
    });
    var sales = getRecords('sales', function(r) {
      if (landId && r.landId !== landId) return false;
      if (partnerId && r.partnerId !== partnerId) return false;
      return true;
    });
    var seeds = getRecords('seeds', function(r) {
      if (landId && r.landId !== landId) return false;
      if (partnerId && r.partnerId !== partnerId) return false;
      return true;
    });
    var products = getRecords('agriculturalProducts', function(r) {
      if (landId && r.landId !== landId) return false;
      if (partnerId && r.partnerId !== partnerId) return false;
      return true;
    });
    var workLogs = getRecords('workLogs', function(r) {
      if (landId && r.landId !== landId) return false;
      if (partnerId && r.partnerId !== partnerId) return false;
      return true;
    });
    var activities = getRecords('cropActivities', function(r) {
      if (landId && r.landId !== landId) return false;
      return true;
    });
    var incidents = getRecords('incidents', function(r) {
      if (landId && r.landId !== landId) return false;
      return true;
    });

    // Aplicar filtros de fecha si existen
    if (desde || hasta) {
      var filterDate = function(records, field) {
        return filterByDateRange(records, field, desde, hasta);
      };
      expenses = filterDate(expenses, 'date');
      contributions = filterDate(contributions, 'date');
      sales = filterDate(sales, 'date');
      seeds = filterDate(seeds, 'date');
      products = filterDate(products, 'date');
      workLogs = filterDate(workLogs, 'date');
      activities = filterDate(activities, 'date');
      incidents = filterDate(incidents, 'date');
    }

    // Calcular totales
    var totalExpenses = expenses.reduce(function(s, r) { return s + (Number(r.amount) || 0); }, 0);
    var totalSeeds = seeds.reduce(function(s, r) { return s + (Number(r.total) || 0); }, 0);
    var totalProducts = products.reduce(function(s, r) { return s + (Number(r.total) || 0); }, 0);
    var totalWorkLogs = workLogs.reduce(function(s, r) { return s + (Number(r.amount) || 0); }, 0);
    var totalActivities = activities.reduce(function(s, r) { return s + (Number(r.cost) || 0); }, 0);
    var totalIncidents = incidents.reduce(function(s, r) { return s + (Number(r.cost) || 0); }, 0);
    var totalGastos = totalExpenses + totalSeeds + totalProducts + totalWorkLogs + totalActivities + totalIncidents;

    var totalContributions = contributions.reduce(function(s, r) { return s + (Number(r.amount) || 0); }, 0);
    var totalSales = sales.reduce(function(s, r) { return s + (Number(r.total) || 0); }, 0);
    var totalIngresos = totalContributions + totalSales;

    var balance = totalIngresos - totalGastos;

    // Detalle por categoría de gastos
    var expensesByCategory = {};
    expenses.forEach(function(r) {
      var cat = r.category || 'OTROS';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (Number(r.amount) || 0);
    });
    // Añadir semillas, productos, jornales, actividades, incidentes como categorías
    expensesByCategory['SEMILLAS'] = (expensesByCategory['SEMILLAS'] || 0) + totalSeeds;
    expensesByCategory['ABONOS/PRODUCTOS'] = (expensesByCategory['ABONOS/PRODUCTOS'] || 0) + totalProducts;
    expensesByCategory['JORNALES'] = (expensesByCategory['JORNALES'] || 0) + totalWorkLogs;
    expensesByCategory['LABORES'] = (expensesByCategory['LABORES'] || 0) + totalActivities;
    expensesByCategory['INCIDENCIAS'] = (expensesByCategory['INCIDENCIAS'] || 0) + totalIncidents;

    // Construir HTML
    var html = '<div class="report-financiero">';
    html += '  <div class="report-summary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;margin-bottom:1.5rem;">';
    html += '    <div class="stat-card"><div class="stat-label">Ingresos totales</div><div class="stat-value" style="color:var(--success);">' + window.formatMoney(totalIngresos) + '</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Gastos totales</div><div class="stat-value" style="color:var(--danger);">' + window.formatMoney(totalGastos) + '</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Balance</div><div class="stat-value" style="color:' + (balance >= 0 ? 'var(--success)' : 'var(--danger)') + ';">' + window.formatMoney(balance) + '</div></div>';
    html += '  </div>';

    // Tabla de detalle de gastos por categoría
    html += '  <div style="margin-bottom:1.5rem;">';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">💸 Gastos por categoría</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Categoría</div><div class="header-cell" style="text-align:right;">Monto</div></div>';
    var sortedCat = Object.keys(expensesByCategory).sort();
    if (sortedCat.length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin datos</div></div>';
    } else {
      sortedCat.forEach(function(cat) {
        html += '      <div class="list-item"><div class="list-main"><span class="item-text">' + cat + '</span></div><div class="item-number">' + window.formatMoney(expensesByCategory[cat]) + '</div></div>';
      });
    }
    html += '    </div>';
    html += '  </div>';

    // Tabla de ingresos
    html += '  <div style="margin-bottom:1.5rem;">';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">💰 Ingresos</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Concepto</div><div class="header-cell" style="text-align:right;">Monto</div></div>';
    html += '      <div class="list-item"><div class="list-main"><span class="item-text">Aportaciones</span></div><div class="item-number">' + window.formatMoney(totalContributions) + '</div></div>';
    html += '      <div class="list-item"><div class="list-main"><span class="item-text">Ventas</span></div><div class="item-number">' + window.formatMoney(totalSales) + '</div></div>';
    html += '    </div>';
    html += '  </div>';

    // Lista de movimientos recientes
    var allMovements = [];
    expenses.forEach(function(r) { allMovements.push({ fecha: r.date, concepto: 'Gasto: ' + (r.concept || ''), monto: -Number(r.amount) || 0, tipo: 'Gasto' }); });
    seeds.forEach(function(r) { allMovements.push({ fecha: r.date, concepto: 'Semilla: ' + (r.variety || ''), monto: -Number(r.total) || 0, tipo: 'Gasto' }); });
    products.forEach(function(r) { allMovements.push({ fecha: r.date, concepto: 'Producto: ' + (r.product || ''), monto: -Number(r.total) || 0, tipo: 'Gasto' }); });
    workLogs.forEach(function(r) { allMovements.push({ fecha: r.date, concepto: 'Jornal: ' + (r.activity || ''), monto: -Number(r.amount) || 0, tipo: 'Gasto' }); });
    contributions.forEach(function(r) { allMovements.push({ fecha: r.date, concepto: 'Aportación', monto: Number(r.amount) || 0, tipo: 'Ingreso' }); });
    sales.forEach(function(r) { allMovements.push({ fecha: r.date, concepto: 'Venta a ' + (r.customer || ''), monto: Number(r.total) || 0, tipo: 'Ingreso' }); });

    allMovements.sort(function(a, b) { return (b.fecha || '').localeCompare(a.fecha || ''); });
    var recent = allMovements.slice(0, 20);

    html += '  <div>';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">📋 Movimientos recientes</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Fecha</div><div class="header-cell">Concepto</div><div class="header-cell" style="text-align:right;">Monto</div></div>';
    if (recent.length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin movimientos</div></div>';
    } else {
      recent.forEach(function(m) {
        var sign = m.monto >= 0 ? '+' : '';
        var color = m.monto >= 0 ? 'var(--success)' : 'var(--danger)';
        html += '      <div class="list-item"><div class="list-main"><span class="item-date">' + window.formatDate(m.fecha) + '</span><span class="item-text">' + m.concepto + '</span></div><div class="item-number" style="color:' + color + ';">' + sign + window.formatMoney(m.monto) + '</div></div>';
      });
    }
    html += '    </div>';
    html += '  </div>';

    html += '</div>';
    return html;
  }

  // ================================================================
  // 6. REPORTE DE PRODUCCIÓN
  // ================================================================

  function renderReportProduccion() {
    var desde = document.getElementById('report-fecha-desde') ? document.getElementById('report-fecha-desde').value : '';
    var hasta = document.getElementById('report-fecha-hasta') ? document.getElementById('report-fecha-hasta').value : '';
    var landId = document.getElementById('report-filter-land') ? document.getElementById('report-filter-land').value : '';

    var harvests = getRecords('harvests', function(r) {
      if (landId && r.landId !== landId) return false;
      return true;
    });
    if (desde || hasta) {
      harvests = filterByDateRange(harvests, 'date', desde, hasta);
    }

    // Resumen por terreno
    var byLand = {};
    var totalKg = 0;
    harvests.forEach(function(h) {
      var landName = getEntityName('lands', h.landId) || 'Sin terreno';
      var kg = 0;
      // Convertir a kg según unidad
      var unit = h.unit || 'kg';
      var qty = Number(h.quantity) || 0;
      if (unit === 'kg') kg = qty;
      else if (unit === 'libras') kg = qty * 0.453592;
      else if (unit === 'quintales') kg = qty * 45.3592;
      else if (unit === 'sacos') kg = qty * 50; // aprox
      else if (unit === 'toneladas') kg = qty * 1000;
      else if (unit === 'arrobas') kg = qty * 11.5;
      else if (unit === 'unidades') kg = qty * 0.5; // estimado
      if (!byLand[landName]) byLand[landName] = { kg: 0, count: 0, quality: { ALTA: 0, MEDIA: 0, BAJA: 0 } };
      byLand[landName].kg += kg;
      byLand[landName].count++;
      if (h.quality) byLand[landName].quality[h.quality] = (byLand[landName].quality[h.quality] || 0) + 1;
      totalKg += kg;
    });

    var html = '<div class="report-produccion">';
    html += '  <div class="report-summary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;margin-bottom:1.5rem;">';
    html += '    <div class="stat-card"><div class="stat-label">Total cosechado (kg)</div><div class="stat-value">' + formatNumber(totalKg, 0) + ' kg</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Número de cosechas</div><div class="stat-value">' + harvests.length + '</div></div>';
    html += '  </div>';

    // Tabla por terreno
    html += '  <div style="margin-bottom:1.5rem;">';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">📊 Producción por terreno</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Terreno</div><div class="header-cell" style="text-align:right;">Cantidad (kg)</div><div class="header-cell" style="text-align:right;">Cosechas</div><div class="header-cell" style="text-align:right;">Alta</div><div class="header-cell" style="text-align:right;">Media</div><div class="header-cell" style="text-align:right;">Baja</div></div>';
    if (Object.keys(byLand).length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin datos</div></div>';
    } else {
      Object.keys(byLand).forEach(function(name) {
        var data = byLand[name];
        html += '      <div class="list-item"><div class="list-main"><span class="item-text"><strong>' + name + '</strong></span></div><div class="item-number">' + formatNumber(data.kg, 0) + '</div><div class="item-number">' + data.count + '</div><div class="item-number">' + (data.quality.ALTA || 0) + '</div><div class="item-number">' + (data.quality.MEDIA || 0) + '</div><div class="item-number">' + (data.quality.BAJA || 0) + '</div></div>';
      });
    }
    html += '    </div>';
    html += '  </div>';

    // Detalle de cosechas recientes
    var recentHarvests = harvests.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); }).slice(0, 20);
    html += '  <div>';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">🌾 Últimas cosechas</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Fecha</div><div class="header-cell">Terreno</div><div class="header-cell" style="text-align:right;">Cantidad</div><div class="header-cell">Calidad</div></div>';
    if (recentHarvests.length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin cosechas</div></div>';
    } else {
      recentHarvests.forEach(function(h) {
        var landName = getEntityName('lands', h.landId) || 'Sin terreno';
        var qty = Number(h.quantity) || 0;
        var unit = h.unit || 'kg';
        html += '      <div class="list-item"><div class="list-main"><span class="item-date">' + window.formatDate(h.date) + '</span><span class="item-text">' + landName + '</span></div><div class="item-number">' + qty + ' ' + unit + '</div><span class="item-tag ' + (h.quality === 'ALTA' ? 'success' : h.quality === 'MEDIA' ? 'warning' : 'danger') + '">' + (h.quality || 'N/A') + '</span></div>';
      });
    }
    html += '    </div>';
    html += '  </div>';

    html += '</div>';
    return html;
  }

  // ================================================================
  // 7. REPORTE DE CULTIVO (Labores, semillas, productos, incidencias)
  // ================================================================

  function renderReportCultivo() {
    var desde = document.getElementById('report-fecha-desde') ? document.getElementById('report-fecha-desde').value : '';
    var hasta = document.getElementById('report-fecha-hasta') ? document.getElementById('report-fecha-hasta').value : '';
    var landId = document.getElementById('report-filter-land') ? document.getElementById('report-filter-land').value : '';

    // Actividades
    var activities = getRecords('cropActivities', function(r) {
      if (landId && r.landId !== landId) return false;
      return true;
    });
    if (desde || hasta) activities = filterByDateRange(activities, 'date', desde, hasta);

    // Semillas
    var seeds = getRecords('seeds', function(r) {
      if (landId && r.landId !== landId) return false;
      return true;
    });
    if (desde || hasta) seeds = filterByDateRange(seeds, 'date', desde, hasta);

    // Productos
    var products = getRecords('agriculturalProducts', function(r) {
      if (landId && r.landId !== landId) return false;
      return true;
    });
    if (desde || hasta) products = filterByDateRange(products, 'date', desde, hasta);

    // Incidencias
    var incidents = getRecords('incidents', function(r) {
      if (landId && r.landId !== landId) return false;
      return true;
    });
    if (desde || hasta) incidents = filterByDateRange(incidents, 'date', desde, hasta);

    // Resumen
    var totalActivities = activities.length;
    var totalSeeds = seeds.reduce(function(s, r) { return s + (Number(r.quantity) || 0); }, 0);
    var totalProducts = products.reduce(function(s, r) { return s + (Number(r.quantity) || 0); }, 0);
    var totalIncidents = incidents.length;
    var incidentOpen = incidents.filter(function(i) { return i.status !== 'RESOLVED'; }).length;

    var html = '<div class="report-cultivo">';
    html += '  <div class="report-summary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.75rem;margin-bottom:1.5rem;">';
    html += '    <div class="stat-card"><div class="stat-label">Labores</div><div class="stat-value">' + totalActivities + '</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Semillas (kg)</div><div class="stat-value">' + formatNumber(totalSeeds, 0) + '</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Productos (uds)</div><div class="stat-value">' + formatNumber(totalProducts, 0) + '</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Incidencias</div><div class="stat-value">' + totalIncidents + ' (<span style="color:var(--danger);">' + incidentOpen + ' abiertas</span>)</div></div>';
    html += '  </div>';

    // Tabla de labores recientes
    var recentActivities = activities.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); }).slice(0, 15);
    html += '  <div style="margin-bottom:1.5rem;">';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">🚜 Labores recientes</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Fecha</div><div class="header-cell">Terreno</div><div class="header-cell">Labor</div><div class="header-cell" style="text-align:right;">Coste</div></div>';
    if (recentActivities.length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin labores</div></div>';
    } else {
      recentActivities.forEach(function(a) {
        var landName = getEntityName('lands', a.landId) || 'Sin terreno';
        html += '      <div class="list-item"><div class="list-main"><span class="item-date">' + window.formatDate(a.date) + '</span><span class="item-text">' + landName + '</span><span class="item-text">' + (a.activity || '') + '</span></div><div class="item-number">' + window.formatMoney(a.cost || 0) + '</div></div>';
      });
    }
    html += '    </div>';
    html += '  </div>';

    // Incidencias
    var recentIncidents = incidents.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); }).slice(0, 15);
    html += '  <div>';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">⚠️ Incidencias recientes</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Fecha</div><div class="header-cell">Terreno</div><div class="header-cell">Tipo</div><div class="header-cell">Estado</div></div>';
    if (recentIncidents.length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin incidencias</div></div>';
    } else {
      recentIncidents.forEach(function(i) {
        var landName = getEntityName('lands', i.landId) || 'Sin terreno';
        html += '      <div class="list-item"><div class="list-main"><span class="item-date">' + window.formatDate(i.date) + '</span><span class="item-text">' + landName + '</span><span class="item-text">' + (i.type || '') + '</span><span class="item-tag ' + (i.status === 'RESOLVED' ? 'success' : 'warning') + '">' + (i.status || '') + '</span></div></div>';
      });
    }
    html += '    </div>';
    html += '  </div>';

    html += '</div>';
    return html;
  }

  // ================================================================
  // 8. REPORTE DE TRABAJADORES
  // ================================================================

  function renderReportTrabajadores() {
    var desde = document.getElementById('report-fecha-desde') ? document.getElementById('report-fecha-desde').value : '';
    var hasta = document.getElementById('report-fecha-hasta') ? document.getElementById('report-fecha-hasta').value : '';
    var landId = document.getElementById('report-filter-land') ? document.getElementById('report-filter-land').value : '';

    var workers = getRecords('workers');
    var workLogs = getRecords('workLogs', function(r) {
      if (landId && r.landId !== landId) return false;
      return true;
    });
    if (desde || hasta) workLogs = filterByDateRange(workLogs, 'date', desde, hasta);

    // Resumen por trabajador
    var byWorker = {};
    var totalJornales = workLogs.length;
    var totalDays = 0;
    var totalCost = 0;
    workLogs.forEach(function(w) {
      var workerName = getEntityName('workers', w.workerId) || 'Sin nombre';
      var days = Number(w.days) || 0;
      var amount = Number(w.amount) || 0;
      totalDays += days;
      totalCost += amount;
      if (!byWorker[workerName]) byWorker[workerName] = { days: 0, amount: 0, count: 0 };
      byWorker[workerName].days += days;
      byWorker[workerName].amount += amount;
      byWorker[workerName].count++;
    });

    var html = '<div class="report-trabajadores">';
    html += '  <div class="report-summary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.75rem;margin-bottom:1.5rem;">';
    html += '    <div class="stat-card"><div class="stat-label">Jornales totales</div><div class="stat-value">' + totalJornales + '</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Días trabajados</div><div class="stat-value">' + formatNumber(totalDays, 0) + '</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Coste total</div><div class="stat-value">' + window.formatMoney(totalCost) + '</div></div>';
    html += '  </div>';

    // Tabla por trabajador
    html += '  <div style="margin-bottom:1.5rem;">';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">👤 Resumen por trabajador</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Trabajador</div><div class="header-cell" style="text-align:right;">Jornales</div><div class="header-cell" style="text-align:right;">Días</div><div class="header-cell" style="text-align:right;">Total</div></div>';
    if (Object.keys(byWorker).length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin datos</div></div>';
    } else {
      Object.keys(byWorker).sort().forEach(function(name) {
        var data = byWorker[name];
        html += '      <div class="list-item"><div class="list-main"><span class="item-text"><strong>' + name + '</strong></span></div><div class="item-number">' + data.count + '</div><div class="item-number">' + formatNumber(data.days, 0) + '</div><div class="item-number">' + window.formatMoney(data.amount) + '</div></div>';
      });
    }
    html += '    </div>';
    html += '  </div>';

    // Últimos jornales
    var recentLogs = workLogs.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); }).slice(0, 20);
    html += '  <div>';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">⏱️ Últimos jornales</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Fecha</div><div class="header-cell">Trabajador</div><div class="header-cell">Actividad</div><div class="header-cell" style="text-align:right;">Días</div><div class="header-cell" style="text-align:right;">Total</div></div>';
    if (recentLogs.length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin jornales</div></div>';
    } else {
      recentLogs.forEach(function(w) {
        var workerName = getEntityName('workers', w.workerId) || 'Sin nombre';
        html += '      <div class="list-item"><div class="list-main"><span class="item-date">' + window.formatDate(w.date) + '</span><span class="item-text">' + workerName + '</span><span class="item-text">' + (w.activity || '') + '</span></div><div class="item-number">' + formatNumber(w.days, 0) + '</div><div class="item-number">' + window.formatMoney(w.amount || 0) + '</div></div>';
      });
    }
    html += '    </div>';
    html += '  </div>';

    html += '</div>';
    return html;
  }

  // ================================================================
  // 9. REPORTE DE VENTAS
  // ================================================================

  function renderReportVentas() {
    var desde = document.getElementById('report-fecha-desde') ? document.getElementById('report-fecha-desde').value : '';
    var hasta = document.getElementById('report-fecha-hasta') ? document.getElementById('report-fecha-hasta').value : '';
    var landId = document.getElementById('report-filter-land') ? document.getElementById('report-filter-land').value : '';
    var partnerId = document.getElementById('report-filter-partner') ? document.getElementById('report-filter-partner').value : '';

    var sales = getRecords('sales', function(r) {
      if (landId && r.landId !== landId) return false;
      if (partnerId && r.partnerId !== partnerId) return false;
      return true;
    });
    if (desde || hasta) sales = filterByDateRange(sales, 'date', desde, hasta);

    // Resumen
    var totalVentas = sales.length;
    var totalKg = 0;
    var totalAmount = 0;
    var totalPending = 0;
    sales.forEach(function(s) {
      var qty = Number(s.quantity) || 0;
      var unit = s.unit || 'kg';
      if (unit === 'kg') totalKg += qty;
      else if (unit === 'libras') totalKg += qty * 0.453592;
      else if (unit === 'quintales') totalKg += qty * 45.3592;
      else if (unit === 'sacos') totalKg += qty * 50;
      else if (unit === 'toneladas') totalKg += qty * 1000;
      else if (unit === 'arrobas') totalKg += qty * 11.5;
      else totalKg += qty; // fallback
      totalAmount += Number(s.total) || 0;
      if (s.paymentStatus !== 'COBRADO') totalPending += Number(s.total) || 0;
    });

    var html = '<div class="report-ventas">';
    html += '  <div class="report-summary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.75rem;margin-bottom:1.5rem;">';
    html += '    <div class="stat-card"><div class="stat-label">Ventas</div><div class="stat-value">' + totalVentas + '</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Cantidad (kg)</div><div class="stat-value">' + formatNumber(totalKg, 0) + ' kg</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Total facturado</div><div class="stat-value">' + window.formatMoney(totalAmount) + '</div></div>';
    html += '    <div class="stat-card"><div class="stat-label">Pendiente de cobro</div><div class="stat-value" style="color:var(--warning);">' + window.formatMoney(totalPending) + '</div></div>';
    html += '  </div>';

    // Ventas por cliente
    var byCustomer = {};
    sales.forEach(function(s) {
      var customer = s.customer || 'Cliente desconocido';
      if (!byCustomer[customer]) byCustomer[customer] = { amount: 0, count: 0, pending: 0 };
      byCustomer[customer].amount += Number(s.total) || 0;
      byCustomer[customer].count++;
      if (s.paymentStatus !== 'COBRADO') byCustomer[customer].pending += Number(s.total) || 0;
    });

    html += '  <div style="margin-bottom:1.5rem;">';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">👥 Ventas por cliente</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Cliente</div><div class="header-cell" style="text-align:right;">Ventas</div><div class="header-cell" style="text-align:right;">Total</div><div class="header-cell" style="text-align:right;">Pendiente</div></div>';
    if (Object.keys(byCustomer).length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin ventas</div></div>';
    } else {
      Object.keys(byCustomer).sort().forEach(function(cust) {
        var data = byCustomer[cust];
        html += '      <div class="list-item"><div class="list-main"><span class="item-text"><strong>' + cust + '</strong></span></div><div class="item-number">' + data.count + '</div><div class="item-number">' + window.formatMoney(data.amount) + '</div><div class="item-number" style="color:var(--warning);">' + window.formatMoney(data.pending) + '</div></div>';
      });
    }
    html += '    </div>';
    html += '  </div>';

    // Últimas ventas
    var recentSales = sales.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); }).slice(0, 20);
    html += '  <div>';
    html += '    <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;">🛒 Últimas ventas</h3>';
    html += '    <div class="list-container">';
    html += '      <div class="list-header"><div class="header-cell">Fecha</div><div class="header-cell">Cliente</div><div class="header-cell" style="text-align:right;">Cantidad</div><div class="header-cell" style="text-align:right;">Total</div><div class="header-cell">Estado</div></div>';
    if (recentSales.length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin ventas</div></div>';
    } else {
      recentSales.forEach(function(s) {
        var qty = Number(s.quantity) || 0;
        var unit = s.unit || 'kg';
        html += '      <div class="list-item"><div class="list-main"><span class="item-date">' + window.formatDate(s.date) + '</span><span class="item-text">' + (s.customer || '') + '</span></div><div class="item-number">' + qty + ' ' + unit + '</div><div class="item-number">' + window.formatMoney(s.total || 0) + '</div><span class="item-tag ' + (s.paymentStatus === 'COBRADO' ? 'success' : 'warning') + '">' + (s.paymentStatus || '') + '</span></div>';
      });
    }
    html += '    </div>';
    html += '  </div>';

    html += '</div>';
    return html;
  }

  // ================================================================
  // 10. REPORTE DE AUDITORÍA
  // ================================================================

  function renderReportAuditoria() {
    var desde = document.getElementById('report-fecha-desde') ? document.getElementById('report-fecha-desde').value : '';
    var hasta = document.getElementById('report-fecha-hasta') ? document.getElementById('report-fecha-hasta').value : '';

    var logs = getRecords('auditLogs');
    if (desde || hasta) logs = filterByDateRange(logs, 'timestamp', desde, hasta);
    logs.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });

    var html = '<div class="report-auditoria">';
    html += '  <div style="margin-bottom:1.5rem;">';
    html += '    <div class="stat-card" style="display:inline-block;"><div class="stat-label">Registros</div><div class="stat-value">' + logs.length + '</div></div>';
    html += '  </div>';

    html += '  <div class="list-container">';
    html += '    <div class="list-header"><div class="header-cell">Fecha</div><div class="header-cell">Usuario</div><div class="header-cell">Acción</div><div class="header-cell">Entidad</div><div class="header-cell">Descripción</div></div>';
    if (logs.length === 0) {
      html += '      <div class="empty-state" style="padding:1rem;"><div class="empty-title" style="font-size:0.9rem;">Sin registros de auditoría</div></div>';
    } else {
      logs.slice(0, 100).forEach(function(log) {
        html += '      <div class="list-item"><div class="list-main"><span class="item-date">' + window.formatDateTime(log.timestamp) + '</span><span class="item-text"><strong>' + (log.userName || '') + '</strong></span><span class="item-text">' + (log.action || '') + '</span><span class="item-text">' + (log.entity || '') + '</span><span class="item-text">' + (log.description || '') + '</span></div></div>';
      });
      if (logs.length > 100) {
        html += '      <div class="list-item"><div class="list-main"><span class="item-text text-muted">Mostrando los últimos 100 registros</span></div></div>';
      }
    }
    html += '  </div>';

    html += '</div>';
    return html;
  }

  // ================================================================
  // 11. EVENTOS Y FILTROS
  // ================================================================

  function bindReportEvents() {
    // Cambio de pestaña de reporte
    document.querySelectorAll('[data-report]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var reportId = this.dataset.report;
        reportState.activeReport = reportId;
        // Actualizar estado de filtros desde los inputs
        updateFiltersFromUI();
        renderReports();
      });
    });

    // Botón Aplicar filtros
    var applyBtn = document.getElementById('report-apply-filters');
    if (applyBtn) {
      applyBtn.addEventListener('click', function() {
        updateFiltersFromUI();
        renderReports();
      });
    }

    // Botón Limpiar filtros
    var resetBtn = document.getElementById('report-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        document.getElementById('report-fecha-desde').value = '';
        document.getElementById('report-fecha-hasta').value = '';
        var landSelect = document.getElementById('report-filter-land');
        if (landSelect) landSelect.value = '';
        var partnerSelect = document.getElementById('report-filter-partner');
        if (partnerSelect) partnerSelect.value = '';
        reportState.filters = { fechaDesde: '', fechaHasta: '', landId: '', partnerId: '', workerId: '' };
        renderReports();
      });
    }

    // Botón Exportar CSV
    var exportBtn = document.getElementById('report-export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        exportReportCSV();
      });
    }

    // Enter en campos de fecha para aplicar
    document.querySelectorAll('#report-fecha-desde, #report-fecha-hasta').forEach(function(input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          updateFiltersFromUI();
          renderReports();
        }
      });
    });
  }

  function updateFiltersFromUI() {
    reportState.filters.fechaDesde = document.getElementById('report-fecha-desde') ? document.getElementById('report-fecha-desde').value : '';
    reportState.filters.fechaHasta = document.getElementById('report-fecha-hasta') ? document.getElementById('report-fecha-hasta').value : '';
    reportState.filters.landId = document.getElementById('report-filter-land') ? document.getElementById('report-filter-land').value : '';
    reportState.filters.partnerId = document.getElementById('report-filter-partner') ? document.getElementById('report-filter-partner').value : '';
  }

  // ================================================================
  // 12. EXPORTAR A CSV
  // ================================================================

  function exportReportCSV() {
    // Obtener el contenido del reporte actual en formato tabla
    var reportId = reportState.activeReport;
    var data = extractReportData(reportId);
    if (!data || data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    // Cabeceras
    var headers = Object.keys(data[0]);
    var csvContent = headers.join(',') + '\n';
    data.forEach(function(row) {
      var values = headers.map(function(h) {
        var val = row[h] !== undefined ? row[h] : '';
        // Escapar comillas y comas
        if (typeof val === 'string') {
          val = val.replace(/"/g, '""');
          if (val.includes(',') || val.includes('"')) val = '"' + val + '"';
        }
        return val;
      });
      csvContent += values.join(',') + '\n';
    });

    // Descargar
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'reporte_' + reportId + '_' + new Date().toISOString().slice(0,10) + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function extractReportData(reportId) {
    // Extraer datos según el reporte activo
    var data = [];
    switch (reportId) {
      case 'report-financiero':
        // Usar movimientos recientes
        var desde = reportState.filters.fechaDesde;
        var hasta = reportState.filters.fechaHasta;
        var landId = reportState.filters.landId;
        var partnerId = reportState.filters.partnerId;

        var expenses = getRecords('expenses', function(r) {
          if (landId && r.landId !== landId) return false;
          if (partnerId && r.partnerId !== partnerId) return false;
          return true;
        });
        var contributions = getRecords('contributions', function(r) {
          if (partnerId && r.partnerId !== partnerId) return false;
          return true;
        });
        var sales = getRecords('sales', function(r) {
          if (landId && r.landId !== landId) return false;
          if (partnerId && r.partnerId !== partnerId) return false;
          return true;
        });
        var seeds = getRecords('seeds', function(r) {
          if (landId && r.landId !== landId) return false;
          if (partnerId && r.partnerId !== partnerId) return false;
          return true;
        });
        var products = getRecords('agriculturalProducts', function(r) {
          if (landId && r.landId !== landId) return false;
          if (partnerId && r.partnerId !== partnerId) return false;
          return true;
        });
        var workLogs = getRecords('workLogs', function(r) {
          if (landId && r.landId !== landId) return false;
          if (partnerId && r.partnerId !== partnerId) return false;
          return true;
        });
        var activities = getRecords('cropActivities', function(r) {
          if (landId && r.landId !== landId) return false;
          return true;
        });
        var incidents = getRecords('incidents', function(r) {
          if (landId && r.landId !== landId) return false;
          return true;
        });

        if (desde || hasta) {
          var filterFn = function(records, field) { return filterByDateRange(records, field, desde, hasta); };
          expenses = filterFn(expenses, 'date');
          contributions = filterFn(contributions, 'date');
          sales = filterFn(sales, 'date');
          seeds = filterFn(seeds, 'date');
          products = filterFn(products, 'date');
          workLogs = filterFn(workLogs, 'date');
          activities = filterFn(activities, 'date');
          incidents = filterFn(incidents, 'date');
        }

        var all = [];
        expenses.forEach(function(r) { all.push({ Fecha: window.formatDate(r.date), Concepto: 'Gasto: ' + (r.concept || ''), Monto: Number(r.amount) || 0, Tipo: 'Gasto' }); });
        seeds.forEach(function(r) { all.push({ Fecha: window.formatDate(r.date), Concepto: 'Semilla: ' + (r.variety || ''), Monto: -Number(r.total) || 0, Tipo: 'Gasto' }); });
        products.forEach(function(r) { all.push({ Fecha: window.formatDate(r.date), Concepto: 'Producto: ' + (r.product || ''), Monto: -Number(r.total) || 0, Tipo: 'Gasto' }); });
        workLogs.forEach(function(r) { all.push({ Fecha: window.formatDate(r.date), Concepto: 'Jornal: ' + (r.activity || ''), Monto: -Number(r.amount) || 0, Tipo: 'Gasto' }); });
        contributions.forEach(function(r) { all.push({ Fecha: window.formatDate(r.date), Concepto: 'Aportación', Monto: Number(r.amount) || 0, Tipo: 'Ingreso' }); });
        sales.forEach(function(r) { all.push({ Fecha: window.formatDate(r.date), Concepto: 'Venta a ' + (r.customer || ''), Monto: Number(r.total) || 0, Tipo: 'Ingreso' }); });
        all.sort(function(a, b) { return (a.Fecha || '').localeCompare(b.Fecha || ''); });
        data = all;
        break;

      case 'report-produccion':
        var harvests = getRecords('harvests');
        if (reportState.filters.fechaDesde || reportState.filters.fechaHasta) {
          harvests = filterByDateRange(harvests, 'date', reportState.filters.fechaDesde, reportState.filters.fechaHasta);
        }
        if (reportState.filters.landId) {
          harvests = harvests.filter(function(h) { return h.landId === reportState.filters.landId; });
        }
        data = harvests.map(function(h) {
          return {
            Fecha: window.formatDate(h.date),
            Terreno: getEntityName('lands', h.landId),
            Cantidad: Number(h.quantity) || 0,
            Unidad: h.unit || 'kg',
            Calidad: h.quality || 'N/A',
            'Valor estimado': window.formatMoney(h.estimatedValue || 0)
          };
        });
        break;

      case 'report-cultivo':
        var activities = getRecords('cropActivities');
        if (reportState.filters.fechaDesde || reportState.filters.fechaHasta) {
          activities = filterByDateRange(activities, 'date', reportState.filters.fechaDesde, reportState.filters.fechaHasta);
        }
        if (reportState.filters.landId) {
          activities = activities.filter(function(a) { return a.landId === reportState.filters.landId; });
        }
        data = activities.map(function(a) {
          return {
            Fecha: window.formatDate(a.date),
            Terreno: getEntityName('lands', a.landId),
            Labor: a.activity || '',
            'Detalle': a.activityDetail || '',
            Responsable: a.responsible || '',
            Coste: window.formatMoney(a.cost || 0)
          };
        });
        break;

      case 'report-trabajadores':
        var logs = getRecords('workLogs');
        if (reportState.filters.fechaDesde || reportState.filters.fechaHasta) {
          logs = filterByDateRange(logs, 'date', reportState.filters.fechaDesde, reportState.filters.fechaHasta);
        }
        if (reportState.filters.landId) {
          logs = logs.filter(function(l) { return l.landId === reportState.filters.landId; });
        }
        data = logs.map(function(l) {
          return {
            Fecha: window.formatDate(l.date),
            Trabajador: getEntityName('workers', l.workerId),
            Actividad: l.activity || '',
            Días: Number(l.days) || 0,
            'Total': window.formatMoney(l.amount || 0)
          };
        });
        break;

      case 'report-ventas':
        var sales = getRecords('sales');
        if (reportState.filters.fechaDesde || reportState.filters.fechaHasta) {
          sales = filterByDateRange(sales, 'date', reportState.filters.fechaDesde, reportState.filters.fechaHasta);
        }
        if (reportState.filters.landId) {
          sales = sales.filter(function(s) { return s.landId === reportState.filters.landId; });
        }
        if (reportState.filters.partnerId) {
          sales = sales.filter(function(s) { return s.partnerId === reportState.filters.partnerId; });
        }
        data = sales.map(function(s) {
          return {
            Fecha: window.formatDate(s.date),
            Cliente: s.customer || '',
            Cantidad: Number(s.quantity) || 0,
            Unidad: s.unit || 'kg',
            Total: window.formatMoney(s.total || 0),
            'Estado de pago': s.paymentStatus || ''
          };
        });
        break;

      case 'report-auditoria':
        var logs2 = getRecords('auditLogs');
        if (reportState.filters.fechaDesde || reportState.filters.fechaHasta) {
          logs2 = filterByDateRange(logs2, 'timestamp', reportState.filters.fechaDesde, reportState.filters.fechaHasta);
        }
        data = logs2.map(function(l) {
          return {
            Fecha: window.formatDateTime(l.timestamp),
            Usuario: l.userName || '',
            Acción: l.action || '',
            Entidad: l.entity || '',
            Descripción: l.description || ''
          };
        });
        break;

      default:
        data = [];
    }
    return data;
  }

  // ================================================================
  // 13. SOBRESCRIBIR renderCurrentView PARA INCLUIR REPORTES
  // ================================================================

  // Guardar la función original
  var originalRenderCurrentView = window.renderCurrentView;

  // Nueva función que maneja reportes
  window.renderCurrentView = function() {
    // Determinar la sección actual a partir de la navegación activa
    var activeItem = document.querySelector('.nav-item.active');
    var activeId = activeItem ? activeItem.dataset.section : null;
    // Si no hay activo, usar state.currentSection (puede estar en el closure)
    // Como state no está expuesto, usamos el valor de la variable global window.__state si existe
    // o intentamos obtener de otro modo. Por simplicidad, usamos el valor guardado en reportState.
    // Pero necesitamos saber si estamos en reportes. Podemos usar la URL o el estado.
    // Como no podemos acceder a state, usamos un truco: si activeId es 'reportes' o un hijo de reportes,
    // renderizamos reportes. Para ello, necesitamos conocer los hijos de reportes.
    var reportChildren = window.NAV_SECTIONS.find(function(s) { return s.id === 'reportes'; });
    var isReport = false;
    if (reportChildren && reportChildren.children) {
      isReport = reportChildren.children.some(function(c) { return c.id === activeId; });
    }
    if (activeId === 'reportes') isReport = true;

    if (isReport) {
      // Actualizar el estado interno con el reporte activo
      if (activeId && activeId !== 'reportes') {
        reportState.activeReport = activeId;
      } else if (activeId === 'reportes') {
        // Si es la sección padre, elegir el primer reporte
        if (reportChildren && reportChildren.children.length > 0) {
          reportState.activeReport = reportChildren.children[0].id;
        }
      }
      renderReports();
    } else {
      // Llamar a la función original
      originalRenderCurrentView();
    }
  };

  // También necesitamos que al hacer clic en un item de navegación se actualice correctamente,
  // pero los eventos ya están manejados en app.js. Simplemente forzamos una re-renderización de la navegación
  // para que los nuevos items aparezcan.

  // Forzar render de navegación
  if (typeof window.renderNavigation === 'function') {
    window.renderNavigation();
  }

  console.log('✅ Módulo de reportes cargado correctamente');

})();
