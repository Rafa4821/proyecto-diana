import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import './AdminLayout.css';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/ilustraciones', label: 'Ilustraciones' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/contenido', label: 'Contenido' },
  { to: '/admin/configuracion', label: 'Configuración' },
  { to: '/admin/politicas', label: 'Políticas' },
  { to: '/admin/usuarios', label: 'Usuarios' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="admin-layout">
      {/* Mobile top bar */}
      <div className="admin-layout__topbar">
        <button
          type="button"
          className="admin-layout__menu-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>
        <span className="admin-layout__topbar-title">Panel Admin</span>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="admin-layout__overlay" onClick={closeSidebar} />
      )}

      <aside className={`admin-layout__sidebar ${sidebarOpen ? 'admin-layout__sidebar--open' : ''}`}>
        <div className="admin-layout__brand">Panel Admin</div>
        <nav className="admin-layout__nav">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `admin-layout__link ${isActive ? 'admin-layout__link--active' : ''}`
              }
              onClick={closeSidebar}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-layout__user">
          {user && (
            <>
              <span className="admin-layout__user-email">{user.email}</span>
              <button type="button" className="admin-layout__logout" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </aside>
      <main className="admin-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
