import { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from './siteSettingsService';
import './SiteSettingsPage.css';

const TABS = [
  { id: 'brand', label: 'Identidad' },
  { id: 'contact', label: 'Contacto' },
  { id: 'banking', label: 'Datos bancarios' },
  { id: 'shipping', label: 'Envíos' },
  { id: 'appearance', label: 'Apariencia' },
];

const DEFAULT_DATA = {
  artistName: '',
  logoUrl: '',
  useLogo: false,
  logoSizeDesktop: 120,
  logoSizeMobile: 80,
  faviconUrl: '',
  socialImageUrl: '',
  tagline: '',

  email: '',
  instagram: '',
  whatsapp: '',
  contactText: '',

  bankHolder: '',
  bankName: '',
  bankAccountType: 'corriente',
  bankAccountNumber: '',
  bankRut: '',
  bankEmail: '',
  bankInstructions: '',
  reservationHours: 48,

  pickupEnabled: false,
  shippingEnabled: true,
  shippingCost: 0,
  freeShippingFrom: 0,
  coveredComunas: '',
  coveredRegions: '',
  shippingNotes: '',

  colorBg: '#fafafa',
  colorText: '#1a1a1a',
  colorSecondary: '#737373',
  cardSize: 'medium',
  cardRatio: '4/5',
  columnsDesktop: 4,
  columnsTablet: 3,
  columnsMobile: 1,
  showSoldProducts: true,
  showOutOfStock: false,
};

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState('brand');
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const data = await getSiteSettings();
      if (data) {
        setFormData((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      setError('Error al cargar la configuración.');
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
      setSuccess(false);
      const { id, ...dataToSave } = formData;
      await updateSiteSettings(dataToSave);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Error al guardar. Intenta de nuevo.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return <div className="admin-page"><p className="admin-loading">Cargando configuración...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Configuración del sitio</h1>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">Configuración guardada correctamente.</div>}

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tabs__btn ${activeTab === tab.id ? 'admin-tabs__btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="admin-form">
        {activeTab === 'brand' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Identidad de marca</h2>
            <div className="admin-form__grid">
              <Field label="Nombre artístico" value={formData.artistName} onChange={(v) => updateField('artistName', v)} />
              <Field label="Logo URL" value={formData.logoUrl} onChange={(v) => updateField('logoUrl', v)} placeholder="https://..." />
              <FieldCheckbox label="Usar logo en vez de texto" checked={formData.useLogo} onChange={(v) => updateField('useLogo', v)} />
              <Field label="Tamaño logo desktop (px)" type="number" value={formData.logoSizeDesktop} onChange={(v) => updateField('logoSizeDesktop', Number(v))} />
              <Field label="Tamaño logo mobile (px)" type="number" value={formData.logoSizeMobile} onChange={(v) => updateField('logoSizeMobile', Number(v))} />
              <Field label="Favicon URL" value={formData.faviconUrl} onChange={(v) => updateField('faviconUrl', v)} placeholder="https://..." />
              <Field label="Imagen social (Open Graph)" value={formData.socialImageUrl} onChange={(v) => updateField('socialImageUrl', v)} placeholder="https://... (1200×630px recomendado)" />
              <Field label="Frase corta de marca" value={formData.tagline} onChange={(v) => updateField('tagline', v)} />
            </div>
          </section>
        )}

        {activeTab === 'contact' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Contacto</h2>
            <div className="admin-form__grid">
              <Field label="Email" type="email" value={formData.email} onChange={(v) => updateField('email', v)} />
              <Field label="Instagram" value={formData.instagram} onChange={(v) => updateField('instagram', v)} placeholder="@usuario" />
              <Field label="WhatsApp (opcional)" value={formData.whatsapp} onChange={(v) => updateField('whatsapp', v)} placeholder="+56 9 ..." />
              <FieldTextarea label="Texto de contacto" value={formData.contactText} onChange={(v) => updateField('contactText', v)} />
            </div>
          </section>
        )}

        {activeTab === 'banking' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Datos bancarios</h2>
            <div className="admin-form__grid">
              <Field label="Titular" value={formData.bankHolder} onChange={(v) => updateField('bankHolder', v)} />
              <Field label="Banco" value={formData.bankName} onChange={(v) => updateField('bankName', v)} />
              <FieldSelect
                label="Tipo de cuenta"
                value={formData.bankAccountType}
                onChange={(v) => updateField('bankAccountType', v)}
                options={[
                  { value: 'corriente', label: 'Cuenta corriente' },
                  { value: 'vista', label: 'Cuenta vista / RUT' },
                  { value: 'ahorro', label: 'Cuenta de ahorro' },
                ]}
              />
              <Field label="Número de cuenta" value={formData.bankAccountNumber} onChange={(v) => updateField('bankAccountNumber', v)} />
              <Field label="RUT" value={formData.bankRut} onChange={(v) => updateField('bankRut', v)} placeholder="12.345.678-9" />
              <Field label="Email de pago" type="email" value={formData.bankEmail} onChange={(v) => updateField('bankEmail', v)} />
              <FieldTextarea label="Instrucciones de transferencia" value={formData.bankInstructions} onChange={(v) => updateField('bankInstructions', v)} />
              <Field label="Horas de reserva del pedido" type="number" value={formData.reservationHours} onChange={(v) => updateField('reservationHours', Number(v))} />
            </div>
          </section>
        )}

        {activeTab === 'shipping' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Envíos</h2>
            <div className="admin-form__grid">
              <FieldCheckbox label="Retiro en persona habilitado" checked={formData.pickupEnabled} onChange={(v) => updateField('pickupEnabled', v)} />
              <FieldCheckbox label="Despacho habilitado" checked={formData.shippingEnabled} onChange={(v) => updateField('shippingEnabled', v)} />
              <Field label="Costo fijo de envío ($)" type="number" value={formData.shippingCost} onChange={(v) => updateField('shippingCost', Number(v))} />
              <Field label="Envío gratis desde ($)" type="number" value={formData.freeShippingFrom} onChange={(v) => updateField('freeShippingFrom', Number(v))} />
              <FieldTextarea label="Comunas cubiertas" value={formData.coveredComunas} onChange={(v) => updateField('coveredComunas', v)} placeholder="Separadas por coma" />
              <FieldTextarea label="Regiones cubiertas" value={formData.coveredRegions} onChange={(v) => updateField('coveredRegions', v)} placeholder="Separadas por coma" />
              <FieldTextarea label="Notas de envío" value={formData.shippingNotes} onChange={(v) => updateField('shippingNotes', v)} />
            </div>
          </section>
        )}

        {activeTab === 'appearance' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Apariencia</h2>
            <div className="admin-form__grid">
              <FieldColor label="Color de fondo" value={formData.colorBg} onChange={(v) => updateField('colorBg', v)} />
              <FieldColor label="Color de texto" value={formData.colorText} onChange={(v) => updateField('colorText', v)} />
              <FieldColor label="Color secundario" value={formData.colorSecondary} onChange={(v) => updateField('colorSecondary', v)} />
              <FieldSelect
                label="Tamaño de cards"
                value={formData.cardSize}
                onChange={(v) => updateField('cardSize', v)}
                options={[
                  { value: 'small', label: 'Pequeño' },
                  { value: 'medium', label: 'Mediano' },
                  { value: 'large', label: 'Grande' },
                ]}
              />
              <FieldSelect
                label="Proporción de cards"
                value={formData.cardRatio}
                onChange={(v) => updateField('cardRatio', v)}
                options={[
                  { value: '1/1', label: 'Cuadrado (1:1)' },
                  { value: '4/5', label: 'Retrato (4:5)' },
                  { value: '3/4', label: 'Retrato (3:4)' },
                  { value: '16/9', label: 'Paisaje (16:9)' },
                ]}
              />
              <Field label="Columnas desktop" type="number" value={formData.columnsDesktop} onChange={(v) => updateField('columnsDesktop', Number(v))} />
              <Field label="Columnas tablet" type="number" value={formData.columnsTablet} onChange={(v) => updateField('columnsTablet', Number(v))} />
              <Field label="Columnas mobile" type="number" value={formData.columnsMobile} onChange={(v) => updateField('columnsMobile', Number(v))} />
              <FieldCheckbox label="Mostrar productos vendidos" checked={formData.showSoldProducts} onChange={(v) => updateField('showSoldProducts', v)} />
              <FieldCheckbox label="Mostrar productos agotados" checked={formData.showOutOfStock} onChange={(v) => updateField('showOutOfStock', v)} />
            </div>
          </section>
        )}

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      <input
        className="admin-field__input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function FieldTextarea({ label, value, onChange, placeholder = '' }) {
  return (
    <div className="admin-field admin-field--full">
      <label className="admin-field__label">{label}</label>
      <textarea
        className="admin-field__textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
      />
    </div>
  );
}

function FieldCheckbox({ label, checked, onChange }) {
  return (
    <div className="admin-field admin-field--checkbox">
      <label className="admin-field__checkbox-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{label}</span>
      </label>
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      <select
        className="admin-field__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function FieldColor({ label, value, onChange }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      <div className="admin-field__color-wrapper">
        <input
          type="color"
          className="admin-field__color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className="admin-field__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
