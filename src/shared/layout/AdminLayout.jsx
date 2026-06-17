import { Outlet, NavLink } from 'react-router-dom';
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
];

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
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
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
