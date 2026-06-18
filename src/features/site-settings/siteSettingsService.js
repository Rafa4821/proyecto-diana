import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

const COLLECTION = 'siteSettings';
const DOC_ID = 'main';

export async function getSiteSettings() {
  const ref = doc(db, COLLECTION, DOC_ID);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateSiteSettings(data) {
  const ref = doc(db, COLLECTION, DOC_ID);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
