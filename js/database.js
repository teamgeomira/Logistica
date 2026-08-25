// ================================================================
// FUNCIONES DE BASE DE DATOS
// ================================================================

// Suscribirse a cambios en una entidad
window.subscribeToEntity = function(entity, callback) {
  const entityRef = window.db.ref(entity);
  return entityRef.on('value', function(snapshot) {
    callback(snapshot.val() || {});
  });
};

// Crear un nuevo registro
window.createRecord = async function(entity, data) {
  const listRef = window.db.ref(entity);
  const newRef = listRef.push();
  const record = {
    ...data,
    id: newRef.key,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };
  await newRef.set(record);
  return newRef.key;
};

// Actualizar un registro existente
window.updateRecord = async function(entity, id, data) {
  const recordRef = window.db.ref(entity + '/' + id);
  await recordRef.update({
    ...data,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  });
};

// Eliminar un registro (soft delete)
window.softDeleteRecord = async function(entity, id, userId) {
  const recordRef = window.db.ref(entity + '/' + id);
  await recordRef.update({
    deleted: true,
    deletedAt: firebase.database.ServerValue.TIMESTAMP,
    deletedBy: userId
  });
};

// Escribir en el registro de auditoría
window.writeAudit = async function(action, entity, entityId, description, userId, userName) {
  try {
    const auditRef = window.db.ref('auditLogs');
    const newAudit = auditRef.push();
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

// Observar cambios en la conexión
window.onConnectionChange = function(callback) {
  const connectedRef = window.db.ref('.info/connected');
  connectedRef.on('value', function(snap) {
    callback(snap.val() === true);
  });
};