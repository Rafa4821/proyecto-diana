import { createContext, useContext, useState, useEffect } from 'react';
import { getSiteSettings } from '@/features/site-settings/siteSettingsService';

const SiteSettingsContext = createContext(null);

const FALLBACK = {
  artistName: 'Diana',
  tagline: 'Arte & Ilustración',
  logoUrl: '',
  useLogo: false,
  logoSizeDesktop: 120,
  logoSizeMobile: 80,
  email: '',
  instagram: '',
  whatsapp: '',
  contactText: '',
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

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    applyThemeVars(settings);
  }, [settings]);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await getSiteSettings();
      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Error loading site settings:', err);
      setError('No se pudo cargar la configuración del sitio.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return ctx;
}

function applyThemeVars(s) {
  const root = document.documentElement;
  if (s.colorBg) root.style.setProperty('--color-bg', s.colorBg);
  if (s.colorText) root.style.setProperty('--color-text', s.colorText);
  if (s.colorSecondary) root.style.setProperty('--color-text-muted', s.colorSecondary);

  const cardMinMap = { small: '240px', medium: '280px', large: '340px' };
  root.style.setProperty('--card-min-width', cardMinMap[s.cardSize] || '280px');
  root.style.setProperty('--card-ratio', s.cardRatio || '4/5');
  root.style.setProperty('--grid-columns-desktop', s.columnsDesktop || 4);
  root.style.setProperty('--grid-columns-tablet', s.columnsTablet || 2);
  root.style.setProperty('--grid-columns-mobile', s.columnsMobile || 1);
}
