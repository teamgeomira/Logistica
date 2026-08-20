import { db } from './firebase.js';
import { ref, onValue, push, set, update, serverTimestamp } from 'firebase/database';

export function subscribeToEntity(entity, callback) {
  const entityRef = ref(db, entity);
  return onValue(entityRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
}

export async function createRecord(entity, data) {
  const listRef = ref(db, entity);
  const newRef = push(listRef);
  const timestamp = serverTimestamp();
  const record = {
    ...data,
    id: newRef.key,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await set(newRef, record);
  return newRef.key;
}

export async function updateRecord(entity, id, data) {
  const recordRef = ref(db, `${entity}/${id}`);
  const timestamp = serverTimestamp();
  await update(recordRef, {
    ...data,
    updatedAt: timestamp
  });
}

export async function softDeleteRecord(entity, id, userId) {
  const recordRef = ref(db, `${entity}/${id}`);
  const timestamp = serverTimestamp();
  await update(recordRef, {
    deleted: true,
    deletedAt: timestamp,
    deletedBy: userId
  });
}

export async function writeAudit(action, entity, entityId, description, userId, userName) {
  const auditRef = ref(db, 'auditLogs');
  const newAudit = push(auditRef);
  const timestamp = serverTimestamp();
  await set(newAudit, {
    id: newAudit.key,
    userId,
    userName,
    action,
    entity,
    entityId,
    description,
    timestamp
  });
}

export function onConnectionChange(callback) {
  const connectedRef = ref(db, '.info/connected');
  return onValue(connectedRef, (snap) => {
    callback(snap.val() === true);
  });
}