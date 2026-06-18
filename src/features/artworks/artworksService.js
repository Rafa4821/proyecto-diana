import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

const COLLECTION = 'artworks';

export async function getArtworks(filters = {}) {
  const ref = collection(db, COLLECTION);
  const constraints = [orderBy('sortOrder', 'asc')];

  if (filters.categoryId) {
    constraints.unshift(where('categoryId', '==', filters.categoryId));
  }
  if (filters.status) {
    constraints.unshift(where('status', '==', filters.status));
  }

  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPublishedArtworks(categoryId) {
  const ref = collection(db, COLLECTION);
  const constraints = [
    where('status', '==', 'published'),
    orderBy('sortOrder', 'asc'),
  ];
  if (categoryId) {
    constraints.unshift(where('categoryId', '==', categoryId));
  }
  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function archiveArtwork(id) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { status: 'archived', updatedAt: serverTimestamp() });
}

export async function publishArtwork(id) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { status: 'published', updatedAt: serverTimestamp() });
}

export async function getArtworkById(id) {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createArtwork(data) {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateArtwork(id, data) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteArtwork(id) {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}
