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
import './ProductForm.css';

const STATUS_DESCS = {
  draft: 'No visible en la tienda',
  published: 'Disponible para compra',
  reserved: 'Reservado por un cliente',
  sold: 'Vendido',
  archived: 'Oculto de la tienda',
};

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
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const cats = await getCategories('product');
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
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);

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
        setSuccess('Cambios guardados correctamente.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        await createProduct(dataToSave);
        onDone();
      }
    } catch (err) {
      setError('Error al guardar el producto.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function formatPrice(v) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(v || 0);
  }

  return (
    <div className="admin-page product-form-page">
      <div className="product-form-page__topbar">
        <button type="button" className="product-form-page__back" onClick={onCancel}>
          ← Volver
        </button>
        <h1 className="product-form-page__title">
          {isEditing ? 'Editar producto' : 'Nuevo producto'}
        </h1>
        <div className="product-form-page__topbar-actions">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="admin-btn admin-btn--primary" disabled={saving} onClick={handleSubmit}>
            {saving ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear producto')}
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <form onSubmit={handleSubmit} className="product-form-page__layout">
        <div className="product-form-page__main">
          <section className="product-form-card">
            <h2 className="product-form-card__title">Informacion general</h2>
            <div className="product-form-card__fields">
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">Titulo <span className="admin-field__required">*</span></label>
                <input
                  className={`admin-field__input ${fieldErrors.title ? 'admin-field__input--error' : ''}`}
                  value={formData.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="Nombre del producto"
                />
                {fieldErrors.title && <span className="admin-field__error">{fieldErrors.title}</span>}
              </div>
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">Slug (URL)</label>
                <input
                  className={`admin-field__input ${fieldErrors.slug ? 'admin-field__input--error' : ''}`}
                  value={formData.slug}
                  onChange={(e) => update('slug', e.target.value)}
                />
                {fieldErrors.slug && <span className="admin-field__error">{fieldErrors.slug}</span>}
                <span className="admin-field__hint">Se genera automaticamente desde el titulo</span>
              </div>
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">Descripcion</label>
                <textarea
                  className="admin-field__textarea"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe el producto, materiales, inspiracion..."
                />
                <span className="admin-field__hint">{formData.description.length} caracteres</span>
              </div>
            </div>
          </section>

          <section className="product-form-card">
            <h2 className="product-form-card__title">Precio y disponibilidad</h2>
            <div className="product-form-card__fields product-form-card__fields--grid">
              <div className="admin-field">
                <label className="admin-field__label">Precio (CLP) <span className="admin-field__required">*</span></label>
                <input
                  className={`admin-field__input ${fieldErrors.price ? 'admin-field__input--error' : ''}`}
                  type="number"
                  value={formData.price}
                  onChange={(e) => update('price', Number(e.target.value))}
                  min="0"
                />
                {fieldErrors.price && <span className="admin-field__error">{fieldErrors.price}</span>}
                {formData.price > 0 && <span className="admin-field__hint">{formatPrice(formData.price)}</span>}
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Tipo de producto <span className="admin-field__required">*</span></label>
                <select
                  className={`admin-field__select ${fieldErrors.productType ? 'admin-field__input--error' : ''}`}
                  value={formData.productType}
                  onChange={(e) => update('productType', e.target.value)}
                >
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {fieldErrors.productType && <span className="admin-field__error">{fieldErrors.productType}</span>}
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Stock</label>
                <input
                  className={`admin-field__input ${fieldErrors.stock ? 'admin-field__input--error' : ''}`}
                  type="number"
                  value={formData.stock}
                  onChange={(e) => update('stock', Number(e.target.value))}
                  min="0"
                  disabled={formData.isUnique}
                />
                {fieldErrors.stock && <span className="admin-field__error">{fieldErrors.stock}</span>}
                {formData.isUnique && <span className="admin-field__hint">Pieza unica: stock fijo en 1</span>}
              </div>
              <div className="admin-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label className="product-form__toggle">
                  <div className="product-form__toggle-info">
                    <span className="product-form__toggle-name">Pieza unica</span>
                    <span className="product-form__toggle-desc">Solo existe una unidad</span>
                  </div>
                  <div className={`product-form__switch ${formData.isUnique ? 'product-form__switch--on' : ''}`} onClick={() => update('isUnique', !formData.isUnique)}>
                    <span className="product-form__switch-thumb" />
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section className="product-form-card">
            <h2 className="product-form-card__title">Detalles del producto</h2>
            <div className="product-form-card__fields product-form-card__fields--grid">
              <div className="admin-field">
                <label className="admin-field__label">Tecnica</label>
                <input className="admin-field__input" value={formData.technique} onChange={(e) => update('technique', e.target.value)} placeholder="Ej: Acuarela, Oleo..." />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Material</label>
                <input className="admin-field__input" value={formData.material} onChange={(e) => update('material', e.target.value)} placeholder="Ej: Papel, Lienzo..." />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Dimensiones</label>
                <input className="admin-field__input" value={formData.dimensions} onChange={(e) => update('dimensions', e.target.value)} placeholder="Ej: 30 x 40 cm" />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Ano</label>
                <input className="admin-field__input" type="number" value={formData.year} onChange={(e) => update('year', Number(e.target.value))} min="1900" max="2099" />
              </div>
            </div>
          </section>

          <section className="product-form-card">
            <h2 className="product-form-card__title">Imagen</h2>
            <p className="product-form-card__desc">Selecciona la imagen principal del producto desde la biblioteca de medios.</p>
            <ImagePicker label="Imagen principal" value={formData.mainImageUrl} onChange={(v) => update('mainImageUrl', v)} />
          </section>

          <section className="product-form-card">
            <h2 className="product-form-card__title">SEO</h2>
            <p className="product-form-card__desc">Optimiza como aparece tu producto en buscadores como Google.</p>
            <div className="product-form-card__fields product-form-card__fields--grid">
              <div className="admin-field">
                <label className="admin-field__label">Titulo SEO</label>
                <input className="admin-field__input" value={formData.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} placeholder="Titulo para buscadores" />
                <span className="admin-field__hint">{formData.seoTitle.length}/60 caracteres</span>
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Descripcion SEO</label>
                <input className="admin-field__input" value={formData.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} placeholder="Descripcion para buscadores" />
                <span className="admin-field__hint">{formData.seoDescription.length}/160 caracteres</span>
              </div>
            </div>
          </section>
        </div>

        <div className="product-form-page__sidebar">
          <section className="product-form-card">
            <h2 className="product-form-card__title">Publicacion</h2>
            <div className="admin-field">
              <label className="admin-field__label">Estado</label>
              <div className="product-form__status-options">
                {PRODUCT_STATUSES.map((s) => (
                  <label
                    key={s.value}
                    className={`product-form__status-option ${formData.status === s.value ? 'product-form__status-option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s.value}
                      checked={formData.status === s.value}
                      onChange={(e) => update('status', e.target.value)}
                      className="visually-hidden"
                    />
                    <span className="product-form__status-label">{s.label}</span>
                    <span className="product-form__status-desc">{STATUS_DESCS[s.value]}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="product-form-card">
            <h2 className="product-form-card__title">Organizacion</h2>
            <div className="admin-field">
              <label className="admin-field__label">Categoria</label>
              <select
                className="admin-field__select"
                value={formData.categoryId}
                onChange={(e) => update('categoryId', e.target.value)}
              >
                <option value="">Sin categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label || c.name}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="product-form-card">
            <h2 className="product-form-card__title">Visibilidad</h2>
            <div className="product-form__toggle-group">
              <label className="product-form__toggle">
                <div className="product-form__toggle-info">
                  <span className="product-form__toggle-name">Producto destacado</span>
                  <span className="product-form__toggle-desc">Aparece en secciones destacadas</span>
                </div>
                <div className={`product-form__switch ${formData.featured ? 'product-form__switch--on' : ''}`} onClick={() => update('featured', !formData.featured)}>
                  <span className="product-form__switch-thumb" />
                </div>
              </label>
              <label className="product-form__toggle">
                <div className="product-form__toggle-info">
                  <span className="product-form__toggle-name">Mostrar en tienda</span>
                  <span className="product-form__toggle-desc">Visible en la seccion de Shop</span>
                </div>
                <div className={`product-form__switch ${formData.showInShop ? 'product-form__switch--on' : ''}`} onClick={() => update('showInShop', !formData.showInShop)}>
                  <span className="product-form__switch-thumb" />
                </div>
              </label>
              <label className="product-form__toggle">
                <div className="product-form__toggle-info">
                  <span className="product-form__toggle-name">Mostrar en portfolio</span>
                  <span className="product-form__toggle-desc">Visible en la galeria de portfolio</span>
                </div>
                <div className={`product-form__switch ${formData.showInPortfolio ? 'product-form__switch--on' : ''}`} onClick={() => update('showInPortfolio', !formData.showInPortfolio)}>
                  <span className="product-form__switch-thumb" />
                </div>
              </label>
            </div>
          </section>

          <div className="product-form-page__sidebar-actions">
            <button type="submit" className="admin-btn admin-btn--primary product-form-page__save-btn" disabled={saving}>
              {saving ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear producto')}
            </button>
            <button type="button" className="admin-btn admin-btn--secondary product-form-page__cancel-btn" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
