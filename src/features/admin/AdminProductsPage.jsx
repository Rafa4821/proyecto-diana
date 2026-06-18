import { useState, useEffect } from 'react';
import {
  getProducts,
  deleteProduct,
  archiveProduct,
  publishProduct,
  markAsSold,
  releaseReservation,
  canDeleteProduct,
} from '@/features/products/productsService';
import { PRODUCT_STATUSES } from '@/features/products/productValidators';
import ProductForm from './ProductForm';
import './AdminProductsPage.css';

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [view, setView] = useState('list'); // list | create | edit
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (view === 'list') loadProducts();
  }, [view]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Error al cargar los productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(product) {
    try {
      const canDel = await canDeleteProduct(product.id);
      if (!canDel) {
        setError('No se puede eliminar: tiene pedidos asociados. Usa "Archivar" en su lugar.');
        setConfirmDelete(null);
        return;
      }
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setConfirmDelete(null);
      showSuccess('Producto eliminado.');
    } catch (err) {
      setError('Error al eliminar.');
      console.error(err);
    }
  }

  async function handleStatusChange(product, action) {
    try {
      setError(null);
      if (action === 'publish') await publishProduct(product.id);
      if (action === 'archive') await archiveProduct(product.id);
      if (action === 'sold') await markAsSold(product.id);
      if (action === 'release') await releaseReservation(product.id);
      await loadProducts();
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

  function handleEdit(product) {
    setEditingProduct(product);
    setView('edit');
  }

  function handleFormDone() {
    setEditingProduct(null);
    setView('list');
  }

  if (view === 'create') {
    return <ProductForm onDone={handleFormDone} onCancel={() => setView('list')} />;
  }

  if (view === 'edit' && editingProduct) {
    return <ProductForm product={editingProduct} onDone={handleFormDone} onCancel={() => setView('list')} />;
  }

  return (
    <div className="admin-page admin-products">
      <div className="admin-page__header">
        <h1>Productos</h1>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setView('create')}>
          + Nuevo producto
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      {loading ? (
        <p className="admin-loading">Cargando productos...</p>
      ) : products.length === 0 ? (
        <p className="admin-loading">No hay productos. Crea el primero.</p>
      ) : (
        <>
        <div className="admin-products__table-wrapper">
          <table className="admin-products__table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Título</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.mainImageUrl ? (
                      <img src={p.mainImageUrl} alt={p.title} className="admin-products__thumb" loading="lazy" />
                    ) : (
                      <div className="admin-products__no-img">—</div>
                    )}
                  </td>
                  <td>
                    <strong>{p.title}</strong>
                    {p.featured && <span className="admin-products__badge-feat">Destacado</span>}
                  </td>
                  <td>{formatPrice(p.price || 0)}</td>
                  <td>
                    <span className={`admin-products__status admin-products__status--${p.status}`}>
                      {PRODUCT_STATUSES.find((s) => s.value === p.status)?.label || p.status}
                    </span>
                  </td>
                  <td className="admin-products__type">{p.productType || '—'}</td>
                  <td>
                    <div className="admin-products__actions">
                      <button type="button" className="admin-products__action-btn" onClick={() => handleEdit(p)}>Editar</button>

                      {p.status === 'draft' && (
                        <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(p, 'publish')}>Publicar</button>
                      )}
                      {p.status === 'published' && (
                        <>
                          <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(p, 'sold')}>Vendido</button>
                          <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(p, 'archive')}>Archivar</button>
                        </>
                      )}
                      {p.status === 'reserved' && (
                        <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(p, 'release')}>Liberar</button>
                      )}
                      {p.status === 'archived' && (
                        <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(p, 'publish')}>Re-publicar</button>
                      )}

                      {confirmDelete === p.id ? (
                        <>
                          <button type="button" className="admin-products__action-btn admin-products__action-btn--danger" onClick={() => handleDelete(p)}>Confirmar</button>
                          <button type="button" className="admin-products__action-btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                        </>
                      ) : (
                        <button type="button" className="admin-products__action-btn admin-products__action-btn--danger" onClick={() => setConfirmDelete(p.id)}>Eliminar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-products__mobile-list">
          {products.map((p) => (
            <div key={p.id} className="admin-products__mobile-card">
              <div className="admin-products__mobile-top">
                {p.mainImageUrl ? (
                  <img src={p.mainImageUrl} alt={p.title} className="admin-products__mobile-img" loading="lazy" />
                ) : (
                  <div className="admin-products__no-img">—</div>
                )}
                <div className="admin-products__mobile-info">
                  <strong>{p.title}</strong>
                  {p.featured && <span className="admin-products__badge-feat">Destacado</span>}
                  <div className="admin-products__mobile-meta">
                    <span>{formatPrice(p.price || 0)}</span>
                    <span className={`admin-products__status admin-products__status--${p.status}`}>
                      {PRODUCT_STATUSES.find((s) => s.value === p.status)?.label || p.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="admin-products__actions">
                <button type="button" className="admin-products__action-btn" onClick={() => handleEdit(p)}>Editar</button>
                {p.status === 'draft' && (
                  <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(p, 'publish')}>Publicar</button>
                )}
                {p.status === 'published' && (
                  <>
                    <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(p, 'sold')}>Vendido</button>
                    <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(p, 'archive')}>Archivar</button>
                  </>
                )}
                {p.status === 'reserved' && (
                  <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(p, 'release')}>Liberar</button>
                )}
                {p.status === 'archived' && (
                  <button type="button" className="admin-products__action-btn" onClick={() => handleStatusChange(p, 'publish')}>Re-publicar</button>
                )}
                {confirmDelete === p.id ? (
                  <>
                    <button type="button" className="admin-products__action-btn admin-products__action-btn--danger" onClick={() => handleDelete(p)}>Confirmar</button>
                    <button type="button" className="admin-products__action-btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                  </>
                ) : (
                  <button type="button" className="admin-products__action-btn admin-products__action-btn--danger" onClick={() => setConfirmDelete(p.id)}>Eliminar</button>
                )}
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
