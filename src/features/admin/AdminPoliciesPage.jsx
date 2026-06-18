import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import './AdminPoliciesPage.css';

const POLICIES = [
  { key: 'envios', label: 'Política de envíos' },
  { key: 'cambios', label: 'Política de cambios' },
  { key: 'devoluciones', label: 'Política de devoluciones' },
  { key: 'encargos', label: 'Encargos personalizados' },
  { key: 'terminos', label: 'Términos y condiciones' },
  { key: 'privacidad', label: 'Política de privacidad' },
];

const DOC_PATH = 'pages/policies';

export default function AdminPoliciesPage() {
  const [activeTab, setActiveTab] = useState(POLICIES[0].key);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const snap = await getDoc(doc(db, DOC_PATH));
      if (snap.exists()) setData(snap.data());
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Error al cargar políticas.' });
    } finally {
      setLoading(false);
    }
  }

  function updateField(key, value) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    try {
      setSaving(true); setMsg(null);
      await setDoc(doc(db, DOC_PATH), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      setMsg({ type: 'success', text: 'Políticas guardadas.' });
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Error al guardar.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-policies">
        <h1>Políticas</h1>
        <p className="admin-policies__loading">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="admin-policies">
      <div className="admin-policies__header">
        <h1>Políticas</h1>
        <button type="button" className="admin-policies__save" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar todo'}
        </button>
      </div>

      {msg && (
        <div className={`admin-policies__msg admin-policies__msg--${msg.type}`}>{msg.text}</div>
      )}

      <div className="admin-policies__tabs">
        {POLICIES.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`admin-policies__tab ${activeTab === p.key ? 'admin-policies__tab--active' : ''}`}
            onClick={() => setActiveTab(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="admin-policies__editor">
        {POLICIES.map((p) => (
          activeTab === p.key && (
            <div key={p.key} className="admin-policies__field">
              <label>{p.label}</label>
              <textarea
                value={data[p.key] || ''}
                onChange={(e) => updateField(p.key, e.target.value)}
                rows={18}
                placeholder={`Escribe aquí la ${p.label.toLowerCase()}...\n\nPuedes usar líneas en blanco para separar párrafos.`}
              />
            </div>
          )
        ))}
      </div>
    </div>
  );
}
