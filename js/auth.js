import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export function watchAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = ref(db, `users/${user.uid}`);
        const snap = await get(userRef);
        const profile = snap.val();
        if (!profile || profile.active === false) {
          await signOut(auth);
          callback(null, { error: 'Usuario inactivo o no autorizado.' });
        } else {
          callback(user, profile);
        }
      } catch (error) {
        await signOut(auth);
        callback(null, { error: 'Error al cargar perfil.' });
      }
    } else {
      callback(null, null);
    }
  });
}