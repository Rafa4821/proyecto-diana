import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '@/features/products/productsService';
import { getArtworks } from '@/features/artworks/artworksService';
import { getOrders } from '@/features/orders/ordersService';
import { getMediaFiles } from '@/features/media-library/mediaService';
import './DashboardPage.css';

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

function timeAgo(ts) {
  if (!ts) return '--';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `Hace ${days}d`;
  const months = Math.floor(days / 30);
  return `Hace ${months}m`;
}

function formatDate(ts) {
  if (!ts) return '--';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

const ORDER_STATUS_LABELS = {
  waiting_payment: 'Esperando pago',
  under_review: 'En revision',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const PAYMENT_STATUS_LABELS = {
  pending_transfer: 'Pendiente',
  proof_uploaded: 'Comprobante subido',
  confirmed: 'Confirmado',
  rejected: 'Rechazado',
};

const PRODUCT_STATUS_LABELS = {
  draft: 'Borrador',
  published: 'Publicado',
  reserved: 'Reservado',
  sold: 'Vendido',
  archived: 'Archivado',
};

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [mediaCount, setMediaCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [allOrders, allProducts, allArtworks, allMedia] = await Promise.all([
        getOrders(),
        getProducts(),
        getArtworks(),
        getMediaFiles(),
      ]);
      setOrders(allOrders);
      setProducts(allProducts);
      setArtworks(allArtworks);
      setMediaCount(allMedia.length);
    } catch (err) {
      setError('Error al cargar datos del dashboard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const confirmedOrders = orders.filter((o) => o.paymentStatus === 'confirmed');
    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.paymentStatus === 'pending_transfer' || o.paymentStatus === 'proof_uploaded').length,
      paidOrders: confirmedOrders.length,
      totalProducts: products.length,
      publishedProducts: products.filter((p) => p.status === 'published').length,
      reservedProducts: products.filter((p) => p.status === 'reserved').length,
      soldProducts: products.filter((p) => p.status === 'sold').length,
      totalArtworks: artworks.length,
      publishedArtworks: artworks.filter((a) => a.status === 'published').length,
      mediaFiles: mediaCount,
    };
  }, [orders, products, artworks, mediaCount]);

  const alertReserved = useMemo(() => products.filter((p) => {
    if (p.status !== 'reserved' || !p.reservedUntil) return false;
    const until = p.reservedUntil.toDate ? p.reservedUntil.toDate() : new Date(p.reservedUntil);
    return until.getTime() < Date.now() + 12 * 60 * 60 * 1000;
  }), [products]);

  const alertPendingOrders = useMemo(() => orders.filter(
    (o) => o.paymentStatus === 'pending_transfer' || o.paymentStatus === 'proof_uploaded'
  ), [orders]);

  const latestOrders = orders.slice(0, 5);
  const latestProducts = products.slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <h1>Dashboard</h1>
        </div>
        <p className="dashboard__loading">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <h1>Dashboard</h1>
        </div>
        <div className="dashboard__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard__subtitle">Resumen general de tu tienda y galeria</p>
        </div>
        <div className="dashboard__header-actions">
          <Link to="/admin/productos" className="admin-btn admin-btn--secondary">Ver productos</Link>
          <Link to="/admin/pedidos" className="admin-btn admin-btn--primary">Ver pedidos</Link>
        </div>
      </div>

      {/* Revenue + key stats row */}
      <div className="dashboard__stats-row">
        <div className="dashboard__revenue-card">
          <span className="dashboard__revenue-label">Ingresos confirmados</span>
          <span className="dashboard__revenue-value">{formatPrice(stats.totalRevenue)}</span>
          <span className="dashboard__revenue-detail">{stats.paidOrders} pedido(s) pagados</span>
        </div>
        <div className="dashboard__cards">
          <StatCard label="Pedidos" value={stats.totalOrders} sub={`${stats.pendingOrders} pendientes`} color="gray" />
          <StatCard label="Productos" value={stats.totalProducts} sub={`${stats.publishedProducts} publicados`} color="teal" />
          <StatCard label="Ilustraciones" value={stats.totalArtworks} sub={`${stats.publishedArtworks} publicadas`} color="indigo" />
          <StatCard label="Reservados" value={stats.reservedProducts} sub={`${stats.soldProducts} vendidos`} color="orange" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="dashboard__quick-actions">
        <Link to="/admin/productos" className="dashboard__quick-action">
          <span className="dashboard__quick-icon">+</span>
          <span>Nuevo producto</span>
        </Link>
        <Link to="/admin/ilustraciones" className="dashboard__quick-action">
          <span className="dashboard__quick-icon">+</span>
          <span>Nueva ilustracion</span>
        </Link>
        <Link to="/admin/media" className="dashboard__quick-action">
          <span className="dashboard__quick-icon">{stats.mediaFiles}</span>
          <span>Biblioteca de medios</span>
        </Link>
        <Link to="/admin/pedidos" className="dashboard__quick-action">
          <span className="dashboard__quick-icon">{stats.pendingOrders}</span>
          <span>Pedidos pendientes</span>
        </Link>
      </div>

      {/* Alerts */}
      {(alertReserved.length > 0 || alertPendingOrders.length > 0) && (
        <div className="dashboard__alerts">
          {alertPendingOrders.length > 0 && (
            <div className="dashboard__alert dashboard__alert--warning">
              <div className="dashboard__alert-header">
                <strong>{alertPendingOrders.length} pedido(s) requieren atencion</strong>
                <Link to="/admin/pedidos" className="dashboard__alert-link">Ver pedidos</Link>
              </div>
              <ul>
                {alertPendingOrders.slice(0, 5).map((o) => (
                  <li key={o.id}>
                    <Link to="/admin/pedidos">{o.orderNumber || o.id.slice(0, 8)}</Link>
                    {' — '}
                    {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus}
                    <span className="dashboard__alert-time">{timeAgo(o.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {alertReserved.length > 0 && (
            <div className="dashboard__alert dashboard__alert--danger">
              <div className="dashboard__alert-header">
                <strong>{alertReserved.length} producto(s) con reserva proxima a vencer</strong>
                <Link to="/admin/productos" className="dashboard__alert-link">Ver productos</Link>
              </div>
              <ul>
                {alertReserved.map((p) => (
                  <li key={p.id}>
                    <Link to="/admin/productos">{p.title}</Link>
                    {' — reservado hasta '}
                    {(p.reservedUntil.toDate ? p.reservedUntil.toDate() : new Date(p.reservedUntil)).toLocaleDateString('es-CL')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="dashboard__grid">
        {/* Latest orders */}
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h2>Ultimos pedidos</h2>
            <Link to="/admin/pedidos" className="dashboard__view-all">Ver todos</Link>
          </div>
          {latestOrders.length === 0 ? (
            <div className="dashboard__empty">
              <p>Sin pedidos aun.</p>
              <span className="dashboard__empty-hint">Los pedidos apareceran aqui cuando los clientes compren.</span>
            </div>
          ) : (
            <div className="dashboard__table-wrap">
              <table className="dashboard__table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Pago</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {latestOrders.map((o) => (
                    <tr key={o.id}>
                      <td><Link to="/admin/pedidos">{o.orderNumber || o.id.slice(0, 8)}</Link></td>
                      <td>{o.customer?.name || '--'}</td>
                      <td><strong>{formatPrice(o.total || 0)}</strong></td>
                      <td>
                        <span className={`dashboard__badge dashboard__badge--${o.paymentStatus || 'pending_transfer'}`}>
                          {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus || 'Pendiente'}
                        </span>
                      </td>
                      <td>{ORDER_STATUS_LABELS[o.orderStatus] || o.orderStatus || '--'}</td>
                      <td className="dashboard__date">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {latestOrders.length > 0 && (
            <div className="dashboard__mobile-cards">
              {latestOrders.map((o) => (
                <div key={o.id} className="dashboard__mobile-card">
                  <div className="dashboard__mobile-card-row">
                    <strong><Link to="/admin/pedidos">{o.orderNumber || o.id.slice(0, 8)}</Link></strong>
                    <span className={`dashboard__badge dashboard__badge--${o.paymentStatus || 'pending_transfer'}`}>
                      {PAYMENT_STATUS_LABELS[o.paymentStatus] || 'Pendiente'}
                    </span>
                  </div>
                  <div className="dashboard__mobile-card-row">
                    <span>{o.customer?.name || '--'}</span>
                    <strong>{formatPrice(o.total || 0)}</strong>
                  </div>
                  <div className="dashboard__mobile-card-row">
                    <span className="dashboard__date">{formatDate(o.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Latest products */}
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h2>Ultimos productos</h2>
            <Link to="/admin/productos" className="dashboard__view-all">Ver todos</Link>
          </div>
          {latestProducts.length === 0 ? (
            <div className="dashboard__empty">
              <p>Sin productos aun.</p>
              <span className="dashboard__empty-hint">Crea tu primer producto para comenzar a vender.</span>
            </div>
          ) : (
            <div className="dashboard__table-wrap">
              <table className="dashboard__table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Stock</th>
                    <th>Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {latestProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.mainImageUrl ? (
                          <img src={p.mainImageUrl} alt="" className="dashboard__product-thumb" loading="lazy" />
                        ) : (
                          <div className="dashboard__product-thumb dashboard__product-thumb--empty">--</div>
                        )}
                      </td>
                      <td><Link to="/admin/productos">{p.title}</Link></td>
                      <td><strong>{formatPrice(p.price || 0)}</strong></td>
                      <td>
                        <span className={`dashboard__badge dashboard__badge--product-${p.status}`}>
                          {PRODUCT_STATUS_LABELS[p.status] || p.status}
                        </span>
                      </td>
                      <td>{p.stock ?? '--'}</td>
                      <td className="dashboard__date">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {latestProducts.length > 0 && (
            <div className="dashboard__mobile-cards">
              {latestProducts.map((p) => (
                <div key={p.id} className="dashboard__mobile-card">
                  <div className="dashboard__mobile-card-row">
                    {p.mainImageUrl && <img src={p.mainImageUrl} alt="" className="dashboard__product-thumb" loading="lazy" />}
                    <strong>{p.title}</strong>
                    <span className={`dashboard__badge dashboard__badge--product-${p.status}`}>
                      {PRODUCT_STATUS_LABELS[p.status] || p.status}
                    </span>
                  </div>
                  <div className="dashboard__mobile-card-row">
                    <span>{formatPrice(p.price || 0)}</span>
                    <span>Stock: {p.stock ?? '--'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bottom info row */}
      <div className="dashboard__bottom-row">
        <section className="dashboard__section dashboard__section--compact">
          <div className="dashboard__section-header">
            <h2>Resumen de contenido</h2>
          </div>
          <div className="dashboard__content-summary">
            <div className="dashboard__content-item">
              <span className="dashboard__content-value">{stats.totalArtworks}</span>
              <span className="dashboard__content-label">Ilustraciones</span>
            </div>
            <div className="dashboard__content-item">
              <span className="dashboard__content-value">{stats.publishedArtworks}</span>
              <span className="dashboard__content-label">Publicadas</span>
            </div>
            <div className="dashboard__content-item">
              <span className="dashboard__content-value">{stats.totalProducts}</span>
              <span className="dashboard__content-label">Productos</span>
            </div>
            <div className="dashboard__content-item">
              <span className="dashboard__content-value">{stats.soldProducts}</span>
              <span className="dashboard__content-label">Vendidos</span>
            </div>
            <div className="dashboard__content-item">
              <span className="dashboard__content-value">{stats.mediaFiles}</span>
              <span className="dashboard__content-label">Archivos</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
      {sub && <span className="stat-card__sub">{sub}</span>}
    </div>
  );
}
