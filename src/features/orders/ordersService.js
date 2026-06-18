import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

const COLLECTION = 'orders';

export async function getOrders(filters = {}) {
  const ref = collection(db, COLLECTION);
  const constraints = [orderBy('createdAt', 'desc')];

  if (filters.status) {
    constraints.unshift(where('status', '==', filters.status));
  }

  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getOrderById(id) {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createOrder(data) {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    status: 'pendiente',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateOrderStatus(id, status) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

export async function updateOrder(id, data) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function attachPaymentProof(id, proofUrl) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    paymentProofUrl: proofUrl,
    status: 'comprobante_enviado',
    updatedAt: serverTimestamp(),
  });
}
