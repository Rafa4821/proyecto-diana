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

const COLLECTION = 'products';

export async function getProducts(filters = {}) {
  const ref = collection(db, COLLECTION);
  const constraints = [orderBy('createdAt', 'desc')];

  if (filters.status) {
    constraints.unshift(where('status', '==', filters.status));
  }
  if (filters.type) {
    constraints.unshift(where('type', '==', filters.type));
  }

  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProductById(id) {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getProductBySlug(slug) {
  const ref = collection(db, COLLECTION);
  const q = query(ref, where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function createProduct(data) {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(id, data) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id) {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}

export async function updateProductStatus(id, status, extra = {}) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { status, ...extra, updatedAt: serverTimestamp() });
}

export async function archiveProduct(id) {
  return updateProductStatus(id, 'archived');
}

export async function publishProduct(id) {
  return updateProductStatus(id, 'published');
}

export async function markAsSold(id) {
  return updateProductStatus(id, 'sold', { soldAt: serverTimestamp() });
}

export async function reserveProduct(id, orderId, hours = 48) {
  const reservedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
  return updateProductStatus(id, 'reserved', { reservedByOrderId: orderId, reservedUntil });
}

export async function releaseReservation(id) {
  return updateProductStatus(id, 'published', { reservedByOrderId: null, reservedUntil: null });
}

export async function canDeleteProduct(id) {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('productIds', 'array-contains', id));
  const snap = await getDocs(q);
  return snap.empty;
}
