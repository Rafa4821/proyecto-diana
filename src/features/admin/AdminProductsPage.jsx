import { useState, useEffect, useMemo } from 'react';
import {
  getProducts,
  deleteProduct,
  archiveProduct,
  publishProduct,
  markAsSold,
  releaseReservation,
  canDeleteProduct,
} from '@/features/products/productsService';
import { PRODUCT_STATUSES, PRODUCT_TYPES } from '@/features/products/productValidators';
import { getCategories } from '@/features/artworks/categoriesService';
import ProductForm from './ProductForm';
import CategoryManager from './CategoryManager';
import './AdminProductsPage.css';

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

const STATUS_LABELS = Object.fromEntries(PRODUCT_STATUSES.map((s) => [s.value, s.label]));
const TYPE_LABELS = Object.fromEntries(PRODUCT_TYPES.map((t) => [t.value, t.label]));

const TABS = [
  { id: 'list', label: 'Productos' },
  { id: 'categories', label: 'Categorias' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [view, setView] = useState('list');
  const [activeTab, setActiveTab] = useState('list');
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (view === 'list') loadData();
  }, [view]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [prods, cats] = await Promise.all([getProducts(), getCategories('product')]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setError('Error al cargar los productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (typeFilter !== 'all' && p.productType !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.title?.toLowerCase().includes(q) || p.technique?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, statusFilter, typeFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts = { all: products.length };
    PRODUCT_STATUSES.forEach((s) => { counts[s.value] = 0; });
    products.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return counts;
  }, [products]);

  function getCategoryName(id) {
    const cat = categories.find((c) => c.id === id);
    return cat ? (cat.label || cat.name) : '';
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

  function renderActions(p) {
    return (
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
    );
  }

  return (
    <div className="admin-page admin-products">
      <div className="admin-page__header">
        <div>
          <h1>Productos</h1>
          <p className="admin-page__subtitle">{products.length} productos en total</p>
        </div>
        {activeTab === 'list' && (
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setView('create')}>
            + Nuevo producto
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

      {activeTab === 'categories' && <CategoryManager type="product" />}

      {activeTab === 'list' && (
        <>
          <div className="admin-products__toolbar">
            <div className="admin-products__filters">
              {['all', ...PRODUCT_STATUSES.map((s) => s.value)].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`admin-products__filter-btn ${statusFilter === s ? 'admin-products__filter-btn--active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
                  <span className="admin-products__filter-count">{statusCounts[s] || 0}</span>
                </button>
              ))}
            </div>
            <div className="admin-products__toolbar-right">
              <select
                className="admin-field__select admin-products__type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {PRODUCT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                type="text"
                className="admin-field__input admin-products__search"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="admin-loading">Cargando productos...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-products__empty">
              {products.length === 0 ? (
                <>
                  <span className="admin-products__empty-icon">+</span>
                  <h3>Aun no hay productos</h3>
                  <p>Comienza creando tu primer producto para vender en tu tienda.</p>
                  <button type="button" className="admin-btn admin-btn--primary" onClick={() => setView('create')}>
                    + Crear primer producto
                  </button>
                </>
              ) : (
                <p>No se encontraron productos con los filtros aplicados.</p>
              )}
            </div>
          ) : (
            <>
              <div className="admin-products__table-wrapper">
                <table className="admin-products__table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Tipo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.mainImageUrl ? (
                            <img src={p.mainImageUrl} alt={p.title} className="admin-products__thumb" loading="lazy" onClick={() => handleEdit(p)} style={{ cursor: 'pointer' }} />
                          ) : (
                            <div className="admin-products__no-img">--</div>
                          )}
                        </td>
                        <td>
                          <div className="admin-products__product-info">
                            <strong className="admin-products__product-title" onClick={() => handleEdit(p)}>
                              {p.title}
                            </strong>
                            {p.featured && <span className="admin-products__badge-feat">Destacado</span>}
                            {p.categoryId && (
                              <span className="admin-products__cat-badge">{getCategoryName(p.categoryId)}</span>
                            )}
                            {p.isUnique && <span className="admin-products__unique-badge">Unica</span>}
                          </div>
                        </td>
                        <td><strong>{formatPrice(p.price || 0)}</strong></td>
                        <td>
                          <span className={`admin-products__status admin-products__status--${p.status}`}>
                            {STATUS_LABELS[p.status] || p.status}
                          </span>
                        </td>
                        <td className="admin-products__type">{TYPE_LABELS[p.productType] || p.productType || '--'}</td>
                        <td>{renderActions(p)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-products__mobile-list">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="admin-products__mobile-card">
                    <div className="admin-products__mobile-top">
                      {p.mainImageUrl ? (
                        <img src={p.mainImageUrl} alt={p.title} className="admin-products__mobile-img" loading="lazy" />
                      ) : (
                        <div className="admin-products__no-img">--</div>
                      )}
                      <div className="admin-products__mobile-info">
                        <strong>{p.title}</strong>
                        {p.featured && <span className="admin-products__badge-feat">Destacado</span>}
                        <div className="admin-products__mobile-meta">
                          <span>{formatPrice(p.price || 0)}</span>
                          <span className={`admin-products__status admin-products__status--${p.status}`}>
                            {STATUS_LABELS[p.status] || p.status}
                          </span>
                          <span className="admin-products__type">{TYPE_LABELS[p.productType] || '--'}</span>
                        </div>
                      </div>
                    </div>
                    {renderActions(p)}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
