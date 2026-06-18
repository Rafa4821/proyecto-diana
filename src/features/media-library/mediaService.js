import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db } from '@/firebase/firestore';
import { storage } from '@/firebase/storage';

const COLLECTION = 'media';

export async function getMediaFiles() {
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato no permitido. Solo JPG, PNG y WebP.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return `Archivo demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
  }
  return null;
}

export async function uploadMediaFile(file, folder = 'uploads') {
  const filename = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `${folder}/${filename}`);

  const metadata = { contentType: file.type };
  const snapshot = await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(snapshot.ref);

  const colRef = collection(db, COLLECTION);
  const docRef = await addDoc(colRef, {
    name: file.name,
    filename,
    folder,
    url,
    thumbnailUrl: null,
    type: file.type,
    size: file.size,
    storagePath: `${folder}/${filename}`,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, url, filename, name: file.name, type: file.type, size: file.size };
}

export async function deleteMediaFile(mediaDoc) {
  const storageRef = ref(storage, mediaDoc.storagePath);
  await deleteObject(storageRef);

  const docRef = doc(db, COLLECTION, mediaDoc.id);
  await deleteDoc(docRef);
}
