import { useState, useEffect } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/features/artworks/categoriesService';
import './CategoryManager.css';

export default function CategoryManager({ type = 'artwork' }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);
      const cats = await getCategories(type);
      setCategories(cats);
    } catch (err) {
      setError('Error al cargar las categorías.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSaving(true);
      setError(null);
      const order = categories.length;
      await createCategory({ name: newName.trim(), label: newName.trim(), order, type });
      setNewName('');
      await loadCategories();
      showSuccess('Categoría creada.');
    } catch (err) {
      setError('Error al crear la categoría.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setEditName(cat.label || cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
  }

  async function handleUpdate(id) {
    if (!editName.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await updateCategory(id, { name: editName.trim(), label: editName.trim() });
      setEditingId(null);
      setEditName('');
      await loadCategories();
      showSuccess('Categoría actualizada.');
    } catch (err) {
      setError('Error al actualizar la categoría.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      setSaving(true);
      setError(null);
      await deleteCategory(id);
      setConfirmDelete(null);
      await loadCategories();
      showSuccess('Categoría eliminada.');
    } catch (err) {
      setError('Error al eliminar la categoría.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleReorder(id, direction) {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    try {
      await Promise.all([
        updateCategory(categories[idx].id, { order: swapIdx }),
        updateCategory(categories[swapIdx].id, { order: idx }),
      ]);
      await loadCategories();
    } catch (err) {
      setError('Error al reordenar.');
      console.error(err);
    }
  }

  function showSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  return (
    <div className="cat-manager">
      <div className="cat-manager__header">
        <h2>Categorías</h2>
        <p className="cat-manager__hint">
          Organiza tus {type === 'product' ? 'productos' : 'ilustraciones'} por categoría. El orden se refleja en los filtros del sitio.
        </p>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <form className="cat-manager__add" onSubmit={handleCreate}>
        <input
          className="admin-field__input"
          type="text"
          placeholder="Nueva categoría..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving || !newName.trim()}>
          Agregar
        </button>
      </form>

      {loading ? (
        <p className="admin-loading">Cargando categorías...</p>
      ) : categories.length === 0 ? (
        <div className="cat-manager__empty">
          <p>No hay categorías. Crea la primera para organizar tus {type === 'product' ? 'productos' : 'ilustraciones'}.</p>
        </div>
      ) : (
        <div className="cat-manager__list">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="cat-manager__item">
              <div className="cat-manager__reorder">
                <button
                  type="button"
                  className="cat-manager__reorder-btn"
                  disabled={idx === 0}
                  onClick={() => handleReorder(cat.id, 'up')}
                  title="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="cat-manager__reorder-btn"
                  disabled={idx === categories.length - 1}
                  onClick={() => handleReorder(cat.id, 'down')}
                  title="Bajar"
                >
                  ↓
                </button>
              </div>

              {editingId === cat.id ? (
                <div className="cat-manager__edit-row">
                  <input
                    className="admin-field__input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(cat.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    type="button"
                    className="admin-products__action-btn"
                    onClick={() => handleUpdate(cat.id)}
                    disabled={saving}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="admin-products__action-btn"
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <span className="cat-manager__name">{cat.label || cat.name}</span>
                  <div className="cat-manager__actions">
                    <button
                      type="button"
                      className="admin-products__action-btn"
                      onClick={() => startEdit(cat)}
                    >
                      Editar
                    </button>
                    {confirmDelete === cat.id ? (
                      <>
                        <button
                          type="button"
                          className="admin-products__action-btn admin-products__action-btn--danger"
                          onClick={() => handleDelete(cat.id)}
                          disabled={saving}
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          className="admin-products__action-btn"
                          onClick={() => setConfirmDelete(null)}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="admin-products__action-btn admin-products__action-btn--danger"
                        onClick={() => setConfirmDelete(cat.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
