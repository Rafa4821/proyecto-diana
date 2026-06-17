import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__logo">Diana</span>
            <p className="footer__tagline">Arte & Ilustración</p>
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
          </nav>
        </div>

        <div className="footer__bottom">
          <small>&copy; {new Date().getFullYear()} Diana. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  );
}
