import { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from './siteSettingsService';
import './SiteSettingsPage.css';

const TABS = [
  { id: 'brand', label: 'Identidad' },
  { id: 'contact', label: 'Contacto' },
  { id: 'banking', label: 'Datos bancarios' },
  { id: 'shipping', label: 'Envios' },
  { id: 'cards', label: 'Cards y grilla' },
  { id: 'appearance', label: 'Colores' },
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
  cardGap: 16,
  cardBorderRadius: 8,
  cardHoverEffect: true,
  columnsDesktop: 4,
  columnsTablet: 3,
  columnsMobile: 1,
  showSoldProducts: true,
  showOutOfStock: false,
};

const CARD_SIZES = [
  { value: 'small', label: 'Pequeno', minWidth: '240px' },
  { value: 'medium', label: 'Mediano', minWidth: '280px' },
  { value: 'large', label: 'Grande', minWidth: '340px' },
];

const CARD_RATIOS = [
  { value: '1/1', label: '1:1', desc: 'Cuadrado' },
  { value: '4/5', label: '4:5', desc: 'Retrato' },
  { value: '3/4', label: '3:4', desc: 'Retrato alto' },
  { value: '2/3', label: '2:3', desc: 'Retrato largo' },
  { value: '16/9', label: '16:9', desc: 'Paisaje' },
];

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
      setError('Error al cargar la configuracion.');
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
    return <div className="admin-page site-settings"><p className="admin-loading">Cargando configuracion...</p></div>;
  }

  return (
    <div className="admin-page site-settings">
      <div className="site-settings__header">
        <h1>Configuracion del sitio</h1>
        <p className="site-settings__subtitle">Administra la identidad, contacto, pagos, envios y apariencia de tu tienda.</p>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">Configuracion guardada correctamente.</div>}

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
        {/* ─── IDENTIDAD ─── */}
        {activeTab === 'brand' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Identidad de marca</h2>
            <p className="admin-form__section-desc">Nombre, logo y metadatos de tu sitio.</p>
            <div className="admin-form__grid">
              <Field label="Nombre artistico" value={formData.artistName} onChange={(v) => updateField('artistName', v)} hint="Se muestra en el header y metadata del sitio" />
              <Field label="Frase de marca (tagline)" value={formData.tagline} onChange={(v) => updateField('tagline', v)} hint="Aparece debajo del nombre en el sitio" />
              <Field label="Logo URL" value={formData.logoUrl} onChange={(v) => updateField('logoUrl', v)} placeholder="https://..." hint="URL de la imagen del logo" />
              <FieldCheckbox label="Usar logo en vez de texto" checked={formData.useLogo} onChange={(v) => updateField('useLogo', v)} />
              {formData.useLogo && (
                <>
                  <Field label="Tamano logo desktop (px)" type="number" value={formData.logoSizeDesktop} onChange={(v) => updateField('logoSizeDesktop', Number(v))} />
                  <Field label="Tamano logo mobile (px)" type="number" value={formData.logoSizeMobile} onChange={(v) => updateField('logoSizeMobile', Number(v))} />
                </>
              )}
              <Field label="Favicon URL" value={formData.faviconUrl} onChange={(v) => updateField('faviconUrl', v)} placeholder="https://..." hint="Icono de pestana del navegador (32x32px)" />
              <Field label="Imagen social (Open Graph)" value={formData.socialImageUrl} onChange={(v) => updateField('socialImageUrl', v)} placeholder="https://..." hint="Para compartir en redes (1200x630px)" />
            </div>
          </section>
        )}

        {/* ─── CONTACTO ─── */}
        {activeTab === 'contact' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Contacto</h2>
            <p className="admin-form__section-desc">Informacion de contacto visible para los visitantes.</p>
            <div className="admin-form__grid">
              <Field label="Email" type="email" value={formData.email} onChange={(v) => updateField('email', v)} hint="Email principal de contacto" />
              <Field label="Instagram" value={formData.instagram} onChange={(v) => updateField('instagram', v)} placeholder="@usuario" hint="Perfil de Instagram" />
              <Field label="WhatsApp" value={formData.whatsapp} onChange={(v) => updateField('whatsapp', v)} placeholder="+56 9 ..." hint="Numero con codigo de pais" />
              <FieldTextarea label="Texto de contacto" value={formData.contactText} onChange={(v) => updateField('contactText', v)} hint="Texto que se muestra en la pagina de contacto" />
            </div>
          </section>
        )}

        {/* ─── BANCARIOS ─── */}
        {activeTab === 'banking' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Datos bancarios</h2>
            <p className="admin-form__section-desc">Informacion de pago por transferencia que se muestra al cliente.</p>
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
              <Field label="Numero de cuenta" value={formData.bankAccountNumber} onChange={(v) => updateField('bankAccountNumber', v)} />
              <Field label="RUT" value={formData.bankRut} onChange={(v) => updateField('bankRut', v)} placeholder="12.345.678-9" />
              <Field label="Email de pago" type="email" value={formData.bankEmail} onChange={(v) => updateField('bankEmail', v)} hint="Email asociado a la cuenta bancaria" />
              <FieldTextarea label="Instrucciones de transferencia" value={formData.bankInstructions} onChange={(v) => updateField('bankInstructions', v)} hint="Instrucciones extra que ve el cliente al pagar" />
              <Field label="Horas de reserva" type="number" value={formData.reservationHours} onChange={(v) => updateField('reservationHours', Number(v))} hint="Horas que el producto queda reservado al crear la orden" />
            </div>
          </section>
        )}

        {/* ─── ENVIOS ─── */}
        {activeTab === 'shipping' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Envios y entregas</h2>
            <p className="admin-form__section-desc">Configura las opciones de envio y retiro disponibles.</p>
            <div className="admin-form__grid">
              <FieldCheckbox label="Retiro en persona habilitado" checked={formData.pickupEnabled} onChange={(v) => updateField('pickupEnabled', v)} />
              <FieldCheckbox label="Despacho habilitado" checked={formData.shippingEnabled} onChange={(v) => updateField('shippingEnabled', v)} />
              <Field label="Costo fijo de envio ($)" type="number" value={formData.shippingCost} onChange={(v) => updateField('shippingCost', Number(v))} hint="Si es 0, se considera gratis" />
              <Field label="Envio gratis desde ($)" type="number" value={formData.freeShippingFrom} onChange={(v) => updateField('freeShippingFrom', Number(v))} hint="Monto minimo para envio gratis (0 = sin minimo)" />
              <FieldTextarea label="Comunas cubiertas" value={formData.coveredComunas} onChange={(v) => updateField('coveredComunas', v)} placeholder="Santiago, Providencia, Las Condes..." hint="Separadas por coma" />
              <FieldTextarea label="Regiones cubiertas" value={formData.coveredRegions} onChange={(v) => updateField('coveredRegions', v)} placeholder="Region Metropolitana..." hint="Separadas por coma" />
              <FieldTextarea label="Notas de envio" value={formData.shippingNotes} onChange={(v) => updateField('shippingNotes', v)} hint="Info adicional visible al cliente en checkout" />
            </div>
          </section>
        )}

        {/* ─── CARDS Y GRILLA ─── */}
        {activeTab === 'cards' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Cards y grilla</h2>
            <p className="admin-form__section-desc">Ajusta el tamano, proporcion y layout de las cards de productos e ilustraciones.</p>

            {/* Live preview */}
            <div className="settings-preview">
              <div className="settings-preview__label">Vista previa</div>
              <div
                className="settings-preview__grid"
                style={{
                  gridTemplateColumns: `repeat(${formData.columnsDesktop}, 1fr)`,
                  gap: `${formData.cardGap}px`,
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`settings-preview__card ${formData.cardHoverEffect ? 'settings-preview__card--hover' : ''}`}
                    style={{ borderRadius: `${formData.cardBorderRadius}px` }}
                  >
                    <div
                      className="settings-preview__card-img"
                      style={{ aspectRatio: formData.cardRatio }}
                    />
                    <div className="settings-preview__card-body">
                      <div className="settings-preview__card-title" />
                      <div className="settings-preview__card-text" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card size */}
            <div className="settings-cards-section">
              <h3 className="settings-cards-section__title">Tamano de card</h3>
              <p className="settings-cards-section__desc">Ancho minimo de cada card en la grilla.</p>
              <div className="settings-size-options">
                {CARD_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`settings-size-option ${formData.cardSize === s.value ? 'settings-size-option--active' : ''}`}
                    onClick={() => updateField('cardSize', s.value)}
                  >
                    <span className="settings-size-option__label">{s.label}</span>
                    <span className="settings-size-option__value">{s.minWidth}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card ratio */}
            <div className="settings-cards-section">
              <h3 className="settings-cards-section__title">Proporcion de imagen</h3>
              <p className="settings-cards-section__desc">Aspect ratio de la imagen dentro de la card.</p>
              <div className="settings-ratio-options">
                {CARD_RATIOS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    className={`settings-ratio-option ${formData.cardRatio === r.value ? 'settings-ratio-option--active' : ''}`}
                    onClick={() => updateField('cardRatio', r.value)}
                  >
                    <div className="settings-ratio-option__preview" style={{ aspectRatio: r.value }} />
                    <span className="settings-ratio-option__label">{r.label}</span>
                    <span className="settings-ratio-option__desc">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gap & radius */}
            <div className="settings-cards-section">
              <h3 className="settings-cards-section__title">Espaciado y bordes</h3>
              <div className="admin-form__grid">
                <FieldRange label="Espacio entre cards (gap)" value={formData.cardGap} onChange={(v) => updateField('cardGap', Number(v))} min={0} max={48} unit="px" />
                <FieldRange label="Radio de bordes" value={formData.cardBorderRadius} onChange={(v) => updateField('cardBorderRadius', Number(v))} min={0} max={24} unit="px" />
              </div>
            </div>

            {/* Columns */}
            <div className="settings-cards-section">
              <h3 className="settings-cards-section__title">Columnas de la grilla</h3>
              <p className="settings-cards-section__desc">Cantidad de columnas en cada breakpoint.</p>
              <div className="admin-form__grid admin-form__grid--3">
                <Field label="Desktop" type="number" value={formData.columnsDesktop} onChange={(v) => updateField('columnsDesktop', Math.max(1, Math.min(6, Number(v))))} hint=">1024px" />
                <Field label="Tablet" type="number" value={formData.columnsTablet} onChange={(v) => updateField('columnsTablet', Math.max(1, Math.min(4, Number(v))))} hint="768-1024px" />
                <Field label="Mobile" type="number" value={formData.columnsMobile} onChange={(v) => updateField('columnsMobile', Math.max(1, Math.min(2, Number(v))))} hint="<768px" />
              </div>
            </div>

            {/* Visibility */}
            <div className="settings-cards-section">
              <h3 className="settings-cards-section__title">Visibilidad y efectos</h3>
              <div className="admin-form__grid">
                <FieldCheckbox label="Efecto hover en cards (zoom)" checked={formData.cardHoverEffect} onChange={(v) => updateField('cardHoverEffect', v)} />
                <FieldCheckbox label="Mostrar productos vendidos" checked={formData.showSoldProducts} onChange={(v) => updateField('showSoldProducts', v)} />
                <FieldCheckbox label="Mostrar productos agotados" checked={formData.showOutOfStock} onChange={(v) => updateField('showOutOfStock', v)} />
              </div>
            </div>
          </section>
        )}

        {/* ─── COLORES ─── */}
        {activeTab === 'appearance' && (
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Colores del sitio</h2>
            <p className="admin-form__section-desc">Define la paleta de colores de tu tienda publica.</p>

            <div className="settings-colors-preview" style={{ background: formData.colorBg, color: formData.colorText, borderRadius: '12px', padding: '24px', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>Vista previa de colores</p>
              <p style={{ color: formData.colorSecondary, fontSize: '14px' }}>Texto secundario con el color elegido</p>
            </div>

            <div className="admin-form__grid">
              <FieldColor label="Color de fondo" value={formData.colorBg} onChange={(v) => updateField('colorBg', v)} hint="Fondo general del sitio" />
              <FieldColor label="Color de texto" value={formData.colorText} onChange={(v) => updateField('colorText', v)} hint="Titulos y texto principal" />
              <FieldColor label="Color secundario" value={formData.colorSecondary} onChange={(v) => updateField('colorSecondary', v)} hint="Texto secundario, labels, hints" />
            </div>
          </section>
        )}

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar configuracion'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════ Field components ═══════ */

function Field({ label, value, onChange, type = 'text', placeholder = '', hint = '' }) {
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
      {hint && <span className="admin-field__hint">{hint}</span>}
    </div>
  );
}

function FieldTextarea({ label, value, onChange, placeholder = '', hint = '' }) {
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
      {hint && <span className="admin-field__hint">{hint}</span>}
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

function FieldColor({ label, value, onChange, hint = '' }) {
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
      {hint && <span className="admin-field__hint">{hint}</span>}
    </div>
  );
}

function FieldRange({ label, value, onChange, min = 0, max = 100, unit = '' }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      <div className="admin-field__range-wrapper">
        <input
          type="range"
          className="admin-field__range"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
        />
        <span className="admin-field__range-value">{value}{unit}</span>
      </div>
    </div>
  );
}
