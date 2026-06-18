import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/app/providers/SiteSettingsContext';
import './Footer.css';

export default function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__logo">{settings.artistName || 'Diana'}</span>
            <p className="footer__tagline">{settings.tagline || 'Arte & Ilustración'}</p>
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="footer__email">{settings.email}</a>
            )}
          </div>

          <nav className="footer__nav">
            <span className="footer__nav-title">Explorar</span>
            <Link to="/ilustraciones">Ilustraciones</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/sobre-mi">Sobre mí</Link>
            <Link to="/contacto">Contacto</Link>
          </nav>

          <nav className="footer__nav">
            <span className="footer__nav-title">Legal</span>
            <Link to="/politicas">Políticas de envío</Link>
            <Link to="/politicas">Cambios y devoluciones</Link>
            {settings.instagram && (
              <a
                href={settings.instagram.startsWith('http') ? settings.instagram : `https://instagram.com/${settings.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
          </nav>
        </div>

        <div className="footer__bottom">
          <small>&copy; {new Date().getFullYear()} {settings.artistName || 'Diana'}. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  );
}
