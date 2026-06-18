import { useState, useEffect } from 'react';
import { createArtwork, updateArtwork } from '@/features/artworks/artworksService';
import { getCategories } from '@/features/artworks/categoriesService';
import ImagePicker from '@/features/media-library/ImagePicker';

const STATUSES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicada' },
  { value: 'archived', label: 'Archivada' },
];

const DEFAULT_ARTWORK = {
  title: '',
  slug: '',
  description: '',
  imageUrl: '',
  categoryId: '',
  year: new Date().getFullYear(),
  technique: '',
  featured: false,
  status: 'draft',
  sortOrder: 0,
  showInHome: false,
};

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ArtworkForm({ artwork, onDone, onCancel }) {
  const isEditing = !!artwork;
  const [formData, setFormData] = useState({ ...DEFAULT_ARTWORK, ...(artwork || {}) });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      const { id, ...dataToSave } = formData;
      dataToSave.sortOrder = Number(dataToSave.sortOrder) || 0;
      dataToSave.year = Number(dataToSave.year) || new Date().getFullYear();

      if (isEditing) {
        await updateArtwork(artwork.id, dataToSave);
      } else {
        await createArtwork(dataToSave);
      }
      onDone();
    } catch (err) {
      setError('Error al guardar la ilustración.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{isEditing ? 'Editar ilustración' : 'Nueva ilustración'}</h1>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel}>
          ← Volver a la lista
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Información</h2>
          <div className="admin-form__grid">
            <div className="admin-field">
              <label className="admin-field__label">Título</label>
              <input className="admin-field__input" value={formData.title} onChange={(e) => update('title', e.target.value)} placeholder="Título de la ilustración" />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Slug</label>
              <input className="admin-field__input" value={formData.slug} onChange={(e) => update('slug', e.target.value)} />
            </div>
            <div className="admin-field admin-field--full">
              <label className="admin-field__label">Descripción</label>
              <textarea className="admin-field__textarea" rows={3} value={formData.description} onChange={(e) => update('description', e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Técnica</label>
              <input className="admin-field__input" value={formData.technique} onChange={(e) => update('technique', e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Año</label>
              <input className="admin-field__input" type="number" value={formData.year} onChange={(e) => update('year', e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Categoría</label>
              <select className="admin-field__select" value={formData.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label || c.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Estado</label>
              <select className="admin-field__select" value={formData.status} onChange={(e) => update('status', e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Orden</label>
              <input className="admin-field__input" type="number" value={formData.sortOrder} onChange={(e) => update('sortOrder', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Imagen</h2>
          <div className="admin-form__grid">
            <ImagePicker label="Imagen de la ilustración" value={formData.imageUrl} onChange={(v) => update('imageUrl', v)} />
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__section-title">Visibilidad</h2>
          <div className="admin-form__grid">
            <div className="admin-field admin-field--checkbox">
              <label className="admin-field__checkbox-label">
                <input type="checkbox" checked={formData.featured} onChange={(e) => update('featured', e.target.checked)} />
                <span>Destacada</span>
              </label>
            </div>
            <div className="admin-field admin-field--checkbox">
              <label className="admin-field__checkbox-label">
                <input type="checkbox" checked={formData.showInHome} onChange={(e) => update('showInHome', e.target.checked)} />
                <span>Mostrar en Home</span>
              </label>
            </div>
          </div>
        </section>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear ilustración')}
          </button>
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
