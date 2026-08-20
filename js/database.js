import { db } from './firebase.js';
import {
  ref,
  onValue,
  push,
  set,
  update,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

export function subscribeToEntity(entity, callback) {
  const entityRef = ref(db, entity);
  return onValue(entityRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
}

export async function createRecord(entity, data) {
  const listRef = ref(db, entity);
  const newRef = push(listRef);
  const record = {
    ...data,
    id: newRef.key,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await set(newRef, record);
  return newRef.key;
}

export async function updateRecord(entity, id, data) {
  const recordRef = ref(db, `${entity}/${id}`);
  await update(recordRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function softDeleteRecord(entity, id, userId) {
  const recordRef = ref(db, `${entity}/${id}`);
  await update(recordRef, {
    deleted: true,
    deletedAt: serverTimestamp(),
    deletedBy: userId
  });
}

export async function writeAudit(action, entity, entityId, description, userId, userName) {
  const auditRef = ref(db, 'auditLogs');
  const newAudit = push(auditRef);
  await set(newAudit, {
    id: newAudit.key,
    userId,
    userName,
    action,
    entity,
    entityId,
    description,
    timestamp: serverTimestamp()
  });
}

export function onConnectionChange(callback) {
  const connectedRef = ref(db, '.info/connected');
  return onValue(connectedRef, (snap) => {
    callback(snap.val() === true);
  });
}