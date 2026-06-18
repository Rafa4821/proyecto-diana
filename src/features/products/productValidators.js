export const PRODUCT_TYPES = [
  { value: 'original', label: 'Original' },
  { value: 'print', label: 'Print / Lámina' },
  { value: 'commission', label: 'Encargo' },
];

export const PRODUCT_STATUSES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'sold', label: 'Vendido' },
  { value: 'archived', label: 'Archivado' },
];

export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function validateProduct(data) {
  const errors = {};

  if (!data.title || data.title.trim().length < 2) {
    errors.title = 'El título es obligatorio (mínimo 2 caracteres).';
  }

  if (!data.slug || data.slug.trim().length < 2) {
    errors.slug = 'El slug es obligatorio.';
  }

  if (!data.price || data.price <= 0) {
    errors.price = 'El precio debe ser mayor a 0.';
  }

  if (!data.productType) {
    errors.productType = 'Selecciona un tipo de producto.';
  }

  if (!data.status) {
    errors.status = 'Selecciona un estado.';
  }

  if (data.isUnique && data.stock !== 1) {
    errors.stock = 'Los productos únicos deben tener stock 1.';
  }

  if (!data.isUnique && (!data.stock || data.stock < 0)) {
    errors.stock = 'El stock debe ser 0 o mayor.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function applyProductRules(data) {
  const result = { ...data };

  if (result.productType === 'original') {
    result.isUnique = true;
  }

  if (result.isUnique) {
    result.stock = 1;
  }

  return result;
}
