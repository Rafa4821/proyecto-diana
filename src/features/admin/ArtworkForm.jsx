import { useState, useEffect } from 'react';
import { createArtwork, updateArtwork } from '@/features/artworks/artworksService';
import { getCategories } from '@/features/artworks/categoriesService';
import ImagePicker from '@/features/media-library/ImagePicker';
import './ArtworkForm.css';

const STATUSES = [
  { value: 'draft', label: 'Borrador', desc: 'No visible en el sitio' },
  { value: 'published', label: 'Publicada', desc: 'Visible en el portafolio' },
  { value: 'archived', label: 'Archivada', desc: 'Oculta del portafolio' },
];

const DEFAULT_ARTWORK = {
  title: '',
  slug: '',
  description: '',
  imageUrl: '',
  categoryId: '',
  year: new Date().getFullYear(),
  technique: '',
  dimensions: '',
  medium: '',
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
  const [success, setSuccess] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const cats = await getCategories('artwork');
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

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function getFieldError(field) {
    if (!touched[field]) return null;
    if (field === 'title' && !formData.title.trim()) return 'El titulo es obligatorio';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setTouched({ title: true });
    if (!formData.title.trim()) {
      setError('Por favor completa los campos obligatorios.');
      return;
    }

    try {
      setSaving(true);
      const { id, ...dataToSave } = formData;
      dataToSave.sortOrder = Number(dataToSave.sortOrder) || 0;
      dataToSave.year = Number(dataToSave.year) || new Date().getFullYear();

      if (isEditing) {
        await updateArtwork(artwork.id, dataToSave);
        setSuccess('Cambios guardados correctamente.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        await createArtwork(dataToSave);
        onDone();
      }
    } catch (err) {
      setError('Error al guardar la ilustracion.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleSaveAndContinue() {
    // triggers same submit
  }

  const currentStatus = STATUSES.find((s) => s.value === formData.status);

  return (
    <div className="admin-page artwork-form-page">
      <div className="artwork-form-page__topbar">
        <button type="button" className="artwork-form-page__back" onClick={onCancel}>
          ← Volver
        </button>
        <h1 className="artwork-form-page__title">
          {isEditing ? 'Editar ilustracion' : 'Nueva ilustracion'}
        </h1>
        <div className="artwork-form-page__topbar-actions">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear ilustracion')}
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <form onSubmit={handleSubmit} className="artwork-form-page__layout">
        <div className="artwork-form-page__main">
          <section className="artwork-form-card">
            <h2 className="artwork-form-card__title">Informacion general</h2>
            <div className="artwork-form-card__fields">
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">
                  Titulo <span className="admin-field__required">*</span>
                </label>
                <input
                  className={`admin-field__input ${getFieldError('title') ? 'admin-field__input--error' : ''}`}
                  value={formData.title}
                  onChange={(e) => update('title', e.target.value)}
                  onBlur={() => touch('title')}
                  placeholder="Titulo de la ilustracion"
                />
                {getFieldError('title') && (
                  <span className="admin-field__error">{getFieldError('title')}</span>
                )}
              </div>
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">Slug (URL)</label>
                <input
                  className="admin-field__input"
                  value={formData.slug}
                  onChange={(e) => update('slug', e.target.value)}
                />
                <span className="admin-field__hint">Se genera automaticamente desde el titulo</span>
              </div>
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">Descripcion</label>
                <textarea
                  className="admin-field__textarea"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe la obra, su contexto, inspiracion..."
                />
                <span className="admin-field__hint">{formData.description.length} caracteres</span>
              </div>
            </div>
          </section>

          <section className="artwork-form-card">
            <h2 className="artwork-form-card__title">Detalles de la obra</h2>
            <div className="artwork-form-card__fields artwork-form-card__fields--grid">
              <div className="admin-field">
                <label className="admin-field__label">Tecnica</label>
                <input
                  className="admin-field__input"
                  value={formData.technique}
                  onChange={(e) => update('technique', e.target.value)}
                  placeholder="Ej: Acuarela, Oleo, Tinta..."
                />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Soporte / Medio</label>
                <input
                  className="admin-field__input"
                  value={formData.medium}
                  onChange={(e) => update('medium', e.target.value)}
                  placeholder="Ej: Papel, Lienzo, Digital..."
                />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Dimensiones</label>
                <input
                  className="admin-field__input"
                  value={formData.dimensions}
                  onChange={(e) => update('dimensions', e.target.value)}
                  placeholder="Ej: 30 x 40 cm"
                />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Ano</label>
                <input
                  className="admin-field__input"
                  type="number"
                  value={formData.year}
                  onChange={(e) => update('year', e.target.value)}
                  min="1900"
                  max="2099"
                />
              </div>
            </div>
          </section>

          <section className="artwork-form-card">
            <h2 className="artwork-form-card__title">Imagen</h2>
            <p className="artwork-form-card__desc">
              Selecciona una imagen desde la biblioteca de medios o sube una nueva directamente.
            </p>
            <ImagePicker
              label="Imagen principal"
              value={formData.imageUrl}
              onChange={(v) => update('imageUrl', v)}
            />
          </section>
        </div>

        <div className="artwork-form-page__sidebar">
          <section className="artwork-form-card">
            <h2 className="artwork-form-card__title">Publicacion</h2>

            <div className="admin-field">
              <label className="admin-field__label">Estado</label>
              <div className="artwork-form__status-options">
                {STATUSES.map((s) => (
                  <label
                    key={s.value}
                    className={`artwork-form__status-option ${formData.status === s.value ? 'artwork-form__status-option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s.value}
                      checked={formData.status === s.value}
                      onChange={(e) => update('status', e.target.value)}
                      className="visually-hidden"
                    />
                    <span className="artwork-form__status-label">{s.label}</span>
                    <span className="artwork-form__status-desc">{s.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="artwork-form-card">
            <h2 className="artwork-form-card__title">Organizacion</h2>

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

            <div className="admin-field">
              <label className="admin-field__label">Orden de visualizacion</label>
              <input
                className="admin-field__input"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => update('sortOrder', e.target.value)}
              />
              <span className="admin-field__hint">Menor numero = aparece primero</span>
            </div>
          </section>

          <section className="artwork-form-card">
            <h2 className="artwork-form-card__title">Visibilidad</h2>

            <div className="artwork-form__toggle-group">
              <label className="artwork-form__toggle">
                <div className="artwork-form__toggle-info">
                  <span className="artwork-form__toggle-name">Destacada</span>
                  <span className="artwork-form__toggle-desc">Aparece en secciones destacadas</span>
                </div>
                <div className={`artwork-form__switch ${formData.featured ? 'artwork-form__switch--on' : ''}`} onClick={() => update('featured', !formData.featured)}>
                  <span className="artwork-form__switch-thumb" />
                </div>
              </label>

              <label className="artwork-form__toggle">
                <div className="artwork-form__toggle-info">
                  <span className="artwork-form__toggle-name">Mostrar en Home</span>
                  <span className="artwork-form__toggle-desc">Visible en la pagina principal</span>
                </div>
                <div className={`artwork-form__switch ${formData.showInHome ? 'artwork-form__switch--on' : ''}`} onClick={() => update('showInHome', !formData.showInHome)}>
                  <span className="artwork-form__switch-thumb" />
                </div>
              </label>
            </div>
          </section>

          <div className="artwork-form-page__sidebar-actions">
            <button
              type="submit"
              className="admin-btn admin-btn--primary artwork-form-page__save-btn"
              disabled={saving}
            >
              {saving ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear ilustracion')}
            </button>
            <button type="button" className="admin-btn admin-btn--secondary artwork-form-page__cancel-btn" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
