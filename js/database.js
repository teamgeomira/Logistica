// Funciones globales de base de datos
window.subscribeToEntity = function(entity, callback) {
  const entityRef = window.db.ref(entity);
  return entityRef.on('value', (snapshot) => {
    callback(snapshot.val() || {});
  });
};

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

window.updateRecord = async function(entity, id, data) {
  const recordRef = window.db.ref(`${entity}/${id}`);
  await recordRef.update({
    ...data,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  });
};

window.softDeleteRecord = async function(entity, id, userId) {
  const recordRef = window.db.ref(`${entity}/${id}`);
  await recordRef.update({
    deleted: true,
    deletedAt: firebase.database.ServerValue.TIMESTAMP,
    deletedBy: userId
  });
};

window.writeAudit = async function(action, entity, entityId, description, userId, userName) {
  const auditRef = window.db.ref('auditLogs');
  const newAudit = auditRef.push();
  await newAudit.set({
    id: newAudit.key,
    userId,
    userName,
    action,
    entity,
    entityId,
    description,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
};

window.onConnectionChange = function(callback) {
  const connectedRef = window.db.ref('.info/connected');
  connectedRef.on('value', (snap) => {
    callback(snap.val() === true);
  });
};