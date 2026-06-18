import { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '@/features/products/productsService';
import { getCategories } from '@/features/artworks/categoriesService';
import {
  PRODUCT_TYPES,
  PRODUCT_STATUSES,
  generateSlug,
  validateProduct,
  applyProductRules,
} from '@/features/products/productValidators';
import ImagePicker from '@/features/media-library/ImagePicker';

const DEFAULT_PRODUCT = {
  title: '',
  slug: '',
  description: '',
  price: 0,
  productType: 'original',
  isUnique: true,
  stock: 1,
  status: 'draft',
  categoryId: '',
  technique: '',
  dimensions: '',
  year: new Date().getFullYear(),
  material: '',
  images: [],
  mainImageUrl: '',
  featured: false,
  showInShop: true,
  showInPortfolio: false,
  seoTitle: '',
  seoDescription: '',
  reservedByOrderId: null,
  reservedUntil: null,
  soldAt: null,
};

export default function ProductForm({ product, onDone, onCancel }) {
  const isEditing = !!product;
  const [formData, setFormData] = useState({ ...DEFAULT_PRODUCT, ...(product || {}) });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  }

  function update(field, value) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !isEditing) {
        next.slug = generateSlug(value);
      }
      if (field === 'productType') {
        if (value === 'original') {
          next.isUnique = true;
          next.stock = 1;
        }
      }
      if (field === 'isUnique' && value) {
        next.stock = 1;
      }
      return next;
    });
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const processed = applyProductRules(formData);
    const { valid, errors } = validateProduct(processed);
    if (!valid) {
      setFieldErrors(errors);
      setError('Corrige los errores antes de guardar.');
      return;
    }

    try {
      setSaving(true);
      const { id, ...dataToSave } = processed;
      if (isEditing) {
        await updateProduct(product.id, dataToSave);
      } else {
        await createProduct(dataToSave);
      }
      onDone();
    } catch (err) {
      setError('Error al guardar el producto.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{isEditing ? 'Editar producto' : 'Nuevo producto'}</h1>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel}>
          ← Volver a la lista
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Información básica</h2>
          <div className="admin-form__grid">
            <FormField label="Título" value={formData.title} onChange={(v) => update('title', v)} error={fieldErrors.title} />
            <FormField label="Slug" value={formData.slug} onChange={(v) => update('slug', v)} error={fieldErrors.slug} />
            <FormField label="Precio (CLP)" type="number" value={formData.price} onChange={(v) => update('price', Number(v))} error={fieldErrors.price} />
            <FormSelect label="Tipo" value={formData.productType} onChange={(v) => update('productType', v)} options={PRODUCT_TYPES} error={fieldErrors.productType} />
            <FormSelect label="Estado" value={formData.status} onChange={(v) => update('status', v)} options={PRODUCT_STATUSES} error={fieldErrors.status} />
            <FormSelect
              label="Categoría"
              value={formData.categoryId}
              onChange={(v) => update('categoryId', v)}
              options={[{ value: '', label: 'Sin categoría' }, ...categories.map((c) => ({ value: c.id, label: c.label || c.name }))]}
            />
            <FormCheckbox label="Pieza única" checked={formData.isUnique} onChange={(v) => update('isUnique', v)} />
            <FormField label="Stock" type="number" value={formData.stock} onChange={(v) => update('stock', Number(v))} error={fieldErrors.stock} disabled={formData.isUnique} />
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Detalles</h2>
          <div className="admin-form__grid">
            <div className="admin-field admin-field--full">
              <label className="admin-field__label">Descripción</label>
              <textarea className="admin-field__textarea" rows={4} value={formData.description} onChange={(e) => update('description', e.target.value)} />
            </div>
            <FormField label="Técnica" value={formData.technique} onChange={(v) => update('technique', v)} />
            <FormField label="Dimensiones" value={formData.dimensions} onChange={(v) => update('dimensions', v)} placeholder="Ej: 30 x 40 cm" />
            <FormField label="Año" type="number" value={formData.year} onChange={(v) => update('year', Number(v))} />
            <FormField label="Material" value={formData.material} onChange={(v) => update('material', v)} />
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Imágenes</h2>
          <div className="admin-form__grid">
            <ImagePicker label="Imagen principal" value={formData.mainImageUrl} onChange={(v) => update('mainImageUrl', v)} />
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Visibilidad</h2>
          <div className="admin-form__grid">
            <FormCheckbox label="Producto destacado" checked={formData.featured} onChange={(v) => update('featured', v)} />
            <FormCheckbox label="Mostrar en Shop" checked={formData.showInShop} onChange={(v) => update('showInShop', v)} />
            <FormCheckbox label="Mostrar en Portfolio" checked={formData.showInPortfolio} onChange={(v) => update('showInPortfolio', v)} />
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__section-title">SEO</h2>
          <div className="admin-form__grid">
            <FormField label="SEO Título" value={formData.seoTitle} onChange={(v) => update('seoTitle', v)} placeholder="Título para buscadores" />
            <FormField label="SEO Descripción" value={formData.seoDescription} onChange={(v) => update('seoDescription', v)} placeholder="Descripción para buscadores" />
          </div>
        </section>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear producto')}
          </button>
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', error, placeholder = '', disabled = false }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      <input
        className={`admin-field__input ${error ? 'admin-field__input--error' : ''}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && <span className="admin-field__error">{error}</span>}
    </div>
  );
}

function FormSelect({ label, value, onChange, options, error }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      <select
        className={`admin-field__select ${error ? 'admin-field__input--error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="admin-field__error">{error}</span>}
    </div>
  );
}

function FormCheckbox({ label, checked, onChange }) {
  return (
    <div className="admin-field admin-field--checkbox">
      <label className="admin-field__checkbox-label">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
      </label>
    </div>
  );
}
