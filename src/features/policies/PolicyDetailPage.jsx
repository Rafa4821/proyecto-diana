import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { Button } from '@/shared/ui';
import './PoliciesPage.css';

const POLICY_META = {
  envios: { title: 'Política de envíos', keys: ['envios'] },
  cambios: { title: 'Política de cambios y devoluciones', keys: ['cambios', 'devoluciones'] },
  encargos: { title: 'Encargos personalizados', keys: ['encargos'] },
  terminos: { title: 'Términos y condiciones', keys: ['terminos'] },
  privacidad: { title: 'Política de privacidad', keys: ['privacidad'] },
};

function renderText(text) {
  if (!text) return null;
  return text.split('\n\n').map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    return <p key={i}>{trimmed.split('\n').reduce((acc, line, j) => {
      if (j > 0) acc.push(<br key={`br-${j}`} />);
      acc.push(line);
      return acc;
    }, [])}</p>;
  });
}

export default function PolicyDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const meta = POLICY_META[slug];

  useEffect(() => {
    loadPolicy();
  }, [slug]);

  async function loadPolicy() {
    try {
      setLoading(true);
      setError(null);
      const snap = await getDoc(doc(db, 'pages/policies'));
      if (snap.exists()) {
        setData(snap.data());
      } else {
        setData({});
      }
    } catch (err) {
      setError('Error al cargar la política.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!meta) {
    return (
      <section className="policy-detail section">
        <div className="container">
          <h1>Página no encontrada</h1>
          <Button as={Link} to="/politicas" variant="secondary">Ver todas las políticas</Button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="policy-detail section">
        <div className="container">
          <p className="policy-detail__loading">Cargando...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="policy-detail section">
        <div className="container">
          <div className="policy-detail__error">{error}</div>
          <Button as={Link} to="/politicas" variant="secondary">Volver</Button>
        </div>
      </section>
    );
  }

  const hasContent = meta.keys.some((k) => data && data[k]);

  return (
    <section className="policy-detail section">
      <div className="container">
        <Link to="/politicas" className="policy-detail__back">← Todas las políticas</Link>
        <h1>{meta.title}</h1>

        {hasContent ? (
          <div className="policy-detail__content">
            {meta.keys.map((key) => (
              data[key] ? (
                <div key={key} className="policy-detail__section">
                  {meta.keys.length > 1 && key === 'devoluciones' && (
                    <h2>Devoluciones</h2>
                  )}
                  {renderText(data[key])}
                </div>
              ) : null
            ))}
          </div>
        ) : (
          <div className="policy-detail__empty">
            <p>Esta política aún no ha sido publicada.</p>
          </div>
        )}
      </div>
    </section>
  );
}
