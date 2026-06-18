import { useState, useEffect } from 'react';
import {
  getArtworks,
  deleteArtwork,
  archiveArtwork,
  publishArtwork,
} from '@/features/artworks/artworksService';
import ArtworkForm from './ArtworkForm';
import './AdminArtworksPage.css';

const STATUS_LABELS = {
  draft: 'Borrador',
  published: 'Publicada',
  archived: 'Archivada',
};

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (view === 'list') loadArtworks();
  }, [view]);

  async function loadArtworks() {
    try {
      setLoading(true);
      setError(null);
      const data = await getArtworks();
      setArtworks(data);
    } catch (err) {
      setError('Error al cargar las ilustraciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    try {
      await deleteArtwork(item.id);
      setArtworks((prev) => prev.filter((a) => a.id !== item.id));
      setConfirmDelete(null);
      showSuccess('Ilustración eliminada.');
    } catch (err) {
      setError('Error al eliminar.');
      console.error(err);
    }
  }

  async function handleStatusChange(item, action) {
    try {
      setError(null);
      if (action === 'publish') await publishArtwork(item.id);
      if (action === 'archive') await archiveArtwork(item.id);
      await loadArtworks();
      showSuccess('Estado actualizado.');
    } catch (err) {
      setError('Error al cambiar estado.');
      console.error(err);
    }
  }

  function showSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  function handleEdit(item) {
    setEditing(item);
    setView('edit');
  }

  function handleFormDone() {
    setEditing(null);
    setView('list');
  }

  if (view === 'create') {
    return <ArtworkForm onDone={handleFormDone} onCancel={() => setView('list')} />;
  }

  if (view === 'edit' && editing) {
    return <ArtworkForm artwork={editing} onDone={handleFormDone} onCancel={() => setView('list')} />;
  }

  return (
    <div className="admin-page admin-artworks">
      <div className="admin-page__header">
        <h1>Ilustraciones</h1>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setView('create')}>
          + Nueva ilustración
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      {loading ? (
        <p className="admin-loading">Cargando ilustraciones...</p>
      ) : artworks.length === 0 ? (
        <p className="admin-loading">No hay ilustraciones. Crea la primera.</p>
      ) : (
        <div className="admin-artworks__grid">
          {artworks.map((item) => (
            <div key={item.id} className="admin-artworks__card">
              <div className="admin-artworks__card-img">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} loading="lazy" />
                ) : (
                  <span className="admin-artworks__card-placeholder">Sin imagen</span>
                )}
              </div>
              <div className="admin-artworks__card-body">
                <h3>{item.title}</h3>
                <div className="admin-artworks__card-meta">
                  <span className={`admin-artworks__status admin-artworks__status--${item.status}`}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                  {item.featured && <span className="admin-artworks__badge">Destacada</span>}
                  <span className="admin-artworks__order">#{item.sortOrder || 0}</span>
                </div>
                <div className="admin-artworks__card-actions">
                  <button type="button" className="admin-products__action-btn" onClick={() => handleEdit(item)}>Editar</button>
                  {item.status === 'draft' && (
                    <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(item, 'publish')}>Publicar</button>
                  )}
                  {item.status === 'published' && (
                    <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(item, 'archive')}>Archivar</button>
                  )}
                  {item.status === 'archived' && (
                    <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(item, 'publish')}>Re-publicar</button>
                  )}
                  {confirmDelete === item.id ? (
                    <>
                      <button type="button" className="admin-products__action-btn admin-products__action-btn--danger" onClick={() => handleDelete(item)}>Confirmar</button>
                      <button type="button" className="admin-products__action-btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                    </>
                  ) : (
                    <button type="button" className="admin-products__action-btn admin-products__action-btn--danger" onClick={() => setConfirmDelete(item.id)}>Eliminar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
