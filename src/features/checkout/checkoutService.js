import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

function generateOrderNumber() {
  const now = new Date();
  const ts = now.getFullYear().toString().slice(2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

export async function validateCartItems(items) {
  const errors = [];
  for (const item of items) {
    const ref = doc(db, PRODUCTS_COLLECTION, item.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      errors.push(`"${item.title}" ya no existe.`);
      continue;
    }
    const product = snap.data();
    if (product.status === 'sold') {
      errors.push(`"${item.title}" ya fue vendido.`);
    } else if (product.status === 'reserved') {
      errors.push(`"${item.title}" está reservado.`);
    } else if (product.status !== 'published') {
      errors.push(`"${item.title}" no está disponible.`);
    }
  }
  return errors;
}

export async function reserveUniqueProducts(items, orderId) {
  const reservedUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);
  for (const item of items) {
    if (item.isUnique) {
      const ref = doc(db, PRODUCTS_COLLECTION, item.id);
      await updateDoc(ref, {
        status: 'reserved',
        reservedByOrderId: orderId,
        reservedUntil,
        updatedAt: serverTimestamp(),
      });
    }
  }
}

export async function createCheckoutOrder({ customer, shipping, items, subtotal, shippingCost, total }) {
  const orderNumber = generateOrderNumber();

  const orderData = {
    orderNumber,
    customer,
    shipping,
    items: items.map((i) => ({
      productId: i.id,
      title: i.title,
      slug: i.slug,
      price: i.price,
      quantity: i.quantity,
      imageUrl: i.imageUrl || '',
      isUnique: i.isUnique || false,
    })),
    productIds: items.map((i) => i.id),
    subtotal,
    shippingCost,
    total,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'pending_transfer',
    orderStatus: 'waiting_payment',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = collection(db, ORDERS_COLLECTION);
  const docRef = await addDoc(ref, orderData);

  await reserveUniqueProducts(items, docRef.id);

  return { orderId: docRef.id, orderNumber };
}

export function validateCheckoutForm(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) errors.name = 'Nombre es obligatorio.';
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Email inválido.';
  if (!data.phone || data.phone.trim().length < 7) errors.phone = 'Teléfono es obligatorio.';

  if (data.deliveryType === 'shipping') {
    if (!data.address || data.address.trim().length < 3) errors.address = 'Dirección es obligatoria.';
    if (!data.comuna || data.comuna.trim().length < 2) errors.comuna = 'Comuna es obligatoria.';
    if (!data.region || data.region.trim().length < 2) errors.region = 'Región es obligatoria.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
