import { Outlet, Link } from 'react-router-dom';
import { SiteSettingsProvider, useSiteSettings } from '@/app/providers/SiteSettingsContext';
import { PagesProvider } from '@/app/providers/PagesContext';
import { CartProvider } from '@/features/cart/CartContext';
import Header from './Header';
import Footer from './Footer';
import './PublicLayout.css';

export default function PublicLayout() {
  return (
    <SiteSettingsProvider>
      <PagesProvider>
        <CartProvider>
          <PublicLayoutInner />
        </CartProvider>
      </PagesProvider>
    </SiteSettingsProvider>
  );
}

function PublicLayoutInner() {
  const { loading, error } = useSiteSettings();

  if (loading) {
    return (
      <div className="public-layout public-layout--loading">
        <div className="public-layout__loader">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="public-layout">
      <Header />
      <main className="public-layout__main">
        {error && (
          <div className="public-layout__error">
            <p>{error}</p>
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
      <Link to="/admin" className="admin-fab" title="Panel Admin">⚙</Link>
    </div>
  );
}
