import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';
import './AdminUsersPage.css';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const ref = collection(db, 'adminUsers');
      const q = query(ref, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setError('Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId) {
    if (userId === user.uid) {
      setError('No puedes eliminar tu propia cuenta desde aquí.');
      setConfirmDelete(null);
      return;
    }

    try {
      await deleteDoc(doc(db, 'adminUsers', userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
      setError('Error al eliminar usuario.');
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="admin-users">
      <div className="admin-users__header">
        <div>
          <h1>Usuarios Admin</h1>
          <p className="admin-users__subtitle">
            Administra quién tiene acceso al panel.
          </p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <p className="admin-loading">Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <div className="admin-users__empty">
          <p>No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="admin-users__list">
          {users.map((u) => (
            <div key={u.id} className="admin-users__card">
              <div className="admin-users__card-avatar">
                {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="admin-users__card-info">
                <span className="admin-users__card-name">
                  {u.displayName || 'Sin nombre'}
                  {u.id === user.uid && <span className="admin-users__badge">Tú</span>}
                </span>
                <span className="admin-users__card-email">{u.email}</span>
                <span className="admin-users__card-date">Registrado: {formatDate(u.createdAt)}</span>
              </div>
              <div className="admin-users__card-actions">
                {u.id !== user.uid && (
                  <>
                    {confirmDelete === u.id ? (
                      <div className="admin-users__confirm">
                        <span>¿Eliminar?</span>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger admin-btn--sm"
                          onClick={() => handleDelete(u.id)}
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--secondary admin-btn--sm"
                          onClick={() => setConfirmDelete(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        onClick={() => setConfirmDelete(u.id)}
                      >
                        Eliminar acceso
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-users__help">
        <h3>¿Cómo agregar un nuevo admin?</h3>
        <p>
          Comparte el enlace de registro <code>/admin/registro</code> con la persona
          que necesita acceso. Al registrarse, aparecerá en esta lista automáticamente.
        </p>
      </div>
    </div>
  );
}
