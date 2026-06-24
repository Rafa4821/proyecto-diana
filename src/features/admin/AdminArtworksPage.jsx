import { useState, useEffect, useMemo } from 'react';
import {
  getArtworks,
  deleteArtwork,
  archiveArtwork,
  publishArtwork,
} from '@/features/artworks/artworksService';
import { getCategories } from '@/features/artworks/categoriesService';
import ArtworkForm from './ArtworkForm';
import CategoryManager from './CategoryManager';
import './AdminArtworksPage.css';

const STATUS_LABELS = {
  draft: 'Borrador',
  published: 'Publicada',
  archived: 'Archivada',
};

const TABS = [
  { id: 'list', label: 'Ilustraciones' },
  { id: 'categories', label: 'Categorías' },
];

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [view, setView] = useState('list');
  const [activeTab, setActiveTab] = useState('list');
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (view === 'list') loadData();
  }, [view]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [arts, cats] = await Promise.all([getArtworks(), getCategories('artwork')]);
      setArtworks(arts);
      setCategories(cats);
    } catch (err) {
      setError('Error al cargar las ilustraciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredArtworks = useMemo(() => {
    return artworks.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.title?.toLowerCase().includes(q) ||
          item.technique?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [artworks, statusFilter, categoryFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts = { all: artworks.length, draft: 0, published: 0, archived: 0 };
    artworks.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return counts;
  }, [artworks]);

  function getCategoryName(id) {
    const cat = categories.find((c) => c.id === id);
    return cat ? (cat.label || cat.name) : '';
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
      await loadData();
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
        <div>
          <h1>Ilustraciones</h1>
          <p className="admin-page__subtitle">{artworks.length} ilustraciones en total</p>
        </div>
        {activeTab === 'list' && (
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setView('create')}>
            + Nueva ilustración
          </button>
        )}
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-tabs__btn ${activeTab === tab.id ? 'admin-tabs__btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      {activeTab === 'categories' && <CategoryManager type="artwork" />}

      {activeTab === 'list' && (
        <>
          <div className="admin-artworks__toolbar">
            <div className="admin-artworks__filters">
              {['all', 'published', 'draft', 'archived'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`admin-artworks__filter-btn ${statusFilter === s ? 'admin-artworks__filter-btn--active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === 'all' ? 'Todas' : STATUS_LABELS[s]}
                  <span className="admin-artworks__filter-count">{statusCounts[s] || 0}</span>
                </button>
              ))}
            </div>
            <div className="admin-artworks__toolbar-right">
              {categories.length > 0 && (
                <select
                  className="admin-field__select admin-artworks__cat-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label || c.name}</option>
                  ))}
                </select>
              )}
              <input
                type="text"
                className="admin-field__input admin-artworks__search"
                placeholder="Buscar ilustración..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="admin-loading">Cargando ilustraciones...</p>
          ) : filteredArtworks.length === 0 ? (
            <div className="admin-artworks__empty">
              {artworks.length === 0 ? (
                <>
                  <span className="admin-artworks__empty-icon">✦</span>
                  <h3>Aún no hay ilustraciones</h3>
                  <p>Comienza creando tu primera ilustración para mostrarla en tu portafolio.</p>
                  <button type="button" className="admin-btn admin-btn--primary" onClick={() => setView('create')}>
                    + Crear primera ilustración
                  </button>
                </>
              ) : (
                <p>No se encontraron ilustraciones con los filtros aplicados.</p>
              )}
            </div>
          ) : (
            <div className="admin-artworks__grid">
              {filteredArtworks.map((item) => (
                <div key={item.id} className="admin-artworks__card">
                  <div className="admin-artworks__card-img" onClick={() => handleEdit(item)}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} loading="lazy" />
                    ) : (
                      <span className="admin-artworks__card-placeholder">Sin imagen</span>
                    )}
                    <div className="admin-artworks__card-overlay">
                      <span>Editar</span>
                    </div>
                  </div>
                  <div className="admin-artworks__card-body">
                    <h3 className="admin-artworks__card-title">{item.title}</h3>
                    <div className="admin-artworks__card-meta">
                      <span className={`admin-artworks__status admin-artworks__status--${item.status}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                      {item.categoryId && (
                        <span className="admin-artworks__cat-badge">{getCategoryName(item.categoryId)}</span>
                      )}
                      {item.featured && <span className="admin-artworks__badge">Destacada</span>}
                    </div>
                    <div className="admin-artworks__card-details">
                      {item.technique && <span>{item.technique}</span>}
                      {item.year && <span>{item.year}</span>}
                      {item.dimensions && <span>{item.dimensions}</span>}
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
        </>
      )}
    </div>
  );
}
