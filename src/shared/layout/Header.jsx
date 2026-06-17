import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './Header.css';

const navLinks = [
  { to: '/sobre-mi', label: 'Sobre mí' },
  { to: '/ilustraciones', label: 'Ilustraciones' },
  { to: '/shop', label: 'Shop' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="header__logo" onClick={closeMenu}>
            Diana
          </Link>

          <nav className="header__nav header__nav--desktop">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `header__link ${isActive ? 'header__link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <Link to="/carrito" className="header__cart" onClick={closeMenu}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </Link>

            <button
              className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
              onClick={toggleMenu}
              aria-label="Menú"
              aria-expanded={menuOpen}
            >
              <span className="header__burger-line" />
              <span className="header__burger-line" />
              <span className="header__burger-line" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}
        onClick={closeMenu}
      >
        <nav className="mobile-menu__nav" onClick={(e) => e.stopPropagation()}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`
              }
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
