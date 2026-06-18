import { useState, useEffect } from 'react';
import { getPage, updatePage } from './pagesService';
import ImagePicker from '@/features/media-library/ImagePicker';
import './AdminContentPage.css';

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'Sobre mí' },
  { id: 'contact', label: 'Contacto' },
];

const DEFAULTS = {
  home: {
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    ctaText: '',
    showFeaturedProducts: true,
    showFeaturedArtworks: true,
  },
  about: {
    title: 'Sobre mí',
    bio: '',
    statement: '',
    profilePhoto: '',
  },
  contact: {
    title: 'Contacto',
    text: '',
    visibleEmail: '',
    visibleInstagram: '',
    customOrdersText: '',
  },
};

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [data, setData] = useState({ home: DEFAULTS.home, about: DEFAULTS.about, contact: DEFAULTS.contact });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);
      const [home, about, contact] = await Promise.all([
        getPage('home'),
        getPage('about'),
        getPage('contact'),
      ]);
      setData({
        home: { ...DEFAULTS.home, ...(home || {}) },
        about: { ...DEFAULTS.about, ...(about || {}) },
        contact: { ...DEFAULTS.contact, ...(contact || {}) },
      });
    } catch (err) {
      setError('Error al cargar el contenido.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const { id, ...pageData } = data[activeTab];
      await updatePage(activeTab, pageData);
      setSuccess('Contenido guardado correctamente.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al guardar. Intenta de nuevo.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function update(field, value) {
    setData((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: value },
    }));
  }

  if (loading) {
    return <div className="admin-page"><p className="admin-loading">Cargando contenido...</p></div>;
  }

  const current = data[activeTab];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Editar contenido</h1>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-tabs__btn ${activeTab === tab.id ? 'admin-tabs__btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="admin-form">
        {activeTab === 'home' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Página de inicio</h2>
            <div className="admin-form__grid">
              <div className="admin-field">
                <label className="admin-field__label">Título hero</label>
                <input className="admin-field__input" value={current.heroTitle} onChange={(e) => update('heroTitle', e.target.value)} placeholder="Nombre o frase principal" />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Subtítulo hero</label>
                <input className="admin-field__input" value={current.heroSubtitle} onChange={(e) => update('heroSubtitle', e.target.value)} placeholder="Frase secundaria" />
              </div>
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">Texto CTA</label>
                <input className="admin-field__input" value={current.ctaText} onChange={(e) => update('ctaText', e.target.value)} placeholder="Texto del llamado a la acción" />
              </div>
              <ImagePicker label="Imagen principal hero" value={current.heroImage} onChange={(v) => update('heroImage', v)} />
              <div className="admin-field admin-field--checkbox">
                <label className="admin-field__checkbox-label">
                  <input type="checkbox" checked={current.showFeaturedProducts} onChange={(e) => update('showFeaturedProducts', e.target.checked)} />
                  <span>Mostrar productos destacados</span>
                </label>
              </div>
              <div className="admin-field admin-field--checkbox">
                <label className="admin-field__checkbox-label">
                  <input type="checkbox" checked={current.showFeaturedArtworks} onChange={(e) => update('showFeaturedArtworks', e.target.checked)} />
                  <span>Mostrar ilustraciones destacadas</span>
                </label>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'about' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Página Sobre mí</h2>
            <div className="admin-form__grid">
              <div className="admin-field">
                <label className="admin-field__label">Título</label>
                <input className="admin-field__input" value={current.title} onChange={(e) => update('title', e.target.value)} />
              </div>
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">Bio</label>
                <textarea className="admin-field__textarea" rows={6} value={current.bio} onChange={(e) => update('bio', e.target.value)} placeholder="Escribe tu biografía..." />
              </div>
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">Statement artístico</label>
                <textarea className="admin-field__textarea" rows={3} value={current.statement} onChange={(e) => update('statement', e.target.value)} placeholder="Tu declaración artística..." />
              </div>
              <ImagePicker label="Foto de perfil" value={current.profilePhoto} onChange={(v) => update('profilePhoto', v)} />
            </div>
          </section>
        )}

        {activeTab === 'contact' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Página de contacto</h2>
            <div className="admin-form__grid">
              <div className="admin-field">
                <label className="admin-field__label">Título</label>
                <input className="admin-field__input" value={current.title} onChange={(e) => update('title', e.target.value)} />
              </div>
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">Texto de contacto</label>
                <textarea className="admin-field__textarea" rows={3} value={current.text} onChange={(e) => update('text', e.target.value)} placeholder="Texto introductorio de la página de contacto" />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Email visible</label>
                <input className="admin-field__input" type="email" value={current.visibleEmail} onChange={(e) => update('visibleEmail', e.target.value)} placeholder="email@ejemplo.com" />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Instagram visible</label>
                <input className="admin-field__input" value={current.visibleInstagram} onChange={(e) => update('visibleInstagram', e.target.value)} placeholder="@usuario" />
              </div>
              <div className="admin-field admin-field--full">
                <label className="admin-field__label">Texto encargos personalizados</label>
                <textarea className="admin-field__textarea" rows={3} value={current.customOrdersText} onChange={(e) => update('customOrdersText', e.target.value)} placeholder="¿Aceptas encargos? Describe aquí..." />
              </div>
            </div>
          </section>
        )}

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar contenido'}
          </button>
        </div>
      </form>
    </div>
  );
}
