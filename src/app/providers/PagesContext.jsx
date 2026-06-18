import { createContext, useContext, useState, useEffect } from 'react';
import { getPage } from '@/features/admin/pagesService';

const PagesContext = createContext(null);

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

export function PagesProvider({ children }) {
  const [pages, setPages] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      setLoading(true);
      const [home, about, contact] = await Promise.all([
        getPage('home'),
        getPage('about'),
        getPage('contact'),
      ]);
      setPages({
        home: { ...DEFAULTS.home, ...(home || {}) },
        about: { ...DEFAULTS.about, ...(about || {}) },
        contact: { ...DEFAULTS.contact, ...(contact || {}) },
      });
    } catch (err) {
      console.error('Error loading pages:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PagesContext.Provider value={{ pages, loading }}>
      {children}
    </PagesContext.Provider>
  );
}

export function usePages() {
  const ctx = useContext(PagesContext);
  if (!ctx) {
    throw new Error('usePages must be used within PagesProvider');
  }
  return ctx;
}
