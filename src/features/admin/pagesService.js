import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

const COLLECTION = 'pages';

export async function getPage(pageId) {
  const ref = doc(db, COLLECTION, pageId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllPages() {
  const ref = collection(db, COLLECTION);
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updatePage(pageId, data) {
  const ref = doc(db, COLLECTION, pageId);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
