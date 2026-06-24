import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

const COLLECTION = 'categories';

export async function getCategories(type) {
  const ref = collection(db, COLLECTION);
  const constraints = [orderBy('order', 'asc')];
  if (type) {
    constraints.unshift(where('type', '==', type));
  }
  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createCategory(data) {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    type: data.type || 'artwork',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCategory(id, data) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCategory(id) {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}
