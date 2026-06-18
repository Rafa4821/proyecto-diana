import { Link } from 'react-router-dom';
import SEO from '@/shared/components/SEO';
import './PoliciesPage.css';

const POLICY_LINKS = [
  { to: '/politicas/envios', label: 'Política de envíos' },
  { to: '/politicas/cambios', label: 'Política de cambios y devoluciones' },
  { to: '/politicas/encargos', label: 'Encargos personalizados' },
  { to: '/politicas/terminos', label: 'Términos y condiciones' },
  { to: '/politicas/privacidad', label: 'Política de privacidad' },
];

export default function PoliciesPage() {
  return (
    <section className="policies section">
      <SEO
        title="Políticas"
        description="Información legal, políticas de envío, cambios y términos del servicio."
        url="/politicas"
      />
      <div className="container">
        <h1>Políticas</h1>
        <p className="policies__intro">Información legal y de servicio.</p>
        <nav className="policies__nav">
          {POLICY_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="policies__link">
              <span>{link.label}</span>
              <span className="policies__arrow">→</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
