import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '@/features/products/productsService';
import { getOrders } from '@/features/orders/ordersService';
import './DashboardPage.css';

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

function timeAgo(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days}d`;
}

const ORDER_STATUS_LABELS = {
  waiting_payment: 'Esperando pago',
  under_review: 'En revisión',
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

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [allOrders, allProducts] = await Promise.all([
        getOrders(),
        getProducts(),
      ]);
      setOrders(allOrders);
      setProducts(allProducts);
    } catch (err) {
      setError('Error al cargar datos del dashboard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p className="dashboard__loading">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <div className="dashboard__error">{error}</div>
      </div>
    );
  }

  const totalOrders = orders.length;
  const pendingTransfer = orders.filter((o) => o.paymentStatus === 'pending_transfer').length;
  const proofUploaded = orders.filter((o) => o.paymentStatus === 'proof_uploaded').length;
  const paidOrders = orders.filter((o) => o.paymentStatus === 'confirmed').length;

  const publishedProducts = products.filter((p) => p.status === 'published').length;
  const reservedProducts = products.filter((p) => p.status === 'reserved').length;
  const soldProducts = products.filter((p) => p.status === 'sold').length;
  const availableProducts = products.filter((p) => p.status === 'published' && p.stock > 0).length;

  const latestOrders = orders.slice(0, 5);
  const latestProducts = products.slice(0, 5);

  const alertReserved = products.filter((p) => {
    if (p.status !== 'reserved' || !p.reservedUntil) return false;
    const until = p.reservedUntil.toDate ? p.reservedUntil.toDate() : new Date(p.reservedUntil);
    return until.getTime() < Date.now() + 12 * 60 * 60 * 1000;
  });

  const alertPendingOrders = orders.filter(
    (o) => o.paymentStatus === 'pending_transfer' || o.paymentStatus === 'proof_uploaded'
  );

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Stats cards */}
      <div className="dashboard__cards">
        <StatCard label="Total pedidos" value={totalOrders} color="gray" />
        <StatCard label="Pendientes transferencia" value={pendingTransfer} color="yellow" />
        <StatCard label="Comprobante subido" value={proofUploaded} color="blue" />
        <StatCard label="Pedidos pagados" value={paidOrders} color="green" />
        <StatCard label="Obras disponibles" value={availableProducts} color="teal" />
        <StatCard label="Obras reservadas" value={reservedProducts} color="orange" />
        <StatCard label="Obras vendidas" value={soldProducts} color="purple" />
        <StatCard label="Productos publicados" value={publishedProducts} color="indigo" />
      </div>

      {/* Alerts */}
      {(alertReserved.length > 0 || alertPendingOrders.length > 0) && (
        <div className="dashboard__alerts">
          {alertPendingOrders.length > 0 && (
            <div className="dashboard__alert dashboard__alert--warning">
              <strong>{alertPendingOrders.length} pedido(s) requieren atención</strong>
              <ul>
                {alertPendingOrders.slice(0, 5).map((o) => (
                  <li key={o.id}>
                    <Link to="/admin/pedidos">{o.orderNumber || o.id}</Link>
                    {' — '}
                    {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {alertReserved.length > 0 && (
            <div className="dashboard__alert dashboard__alert--danger">
              <strong>{alertReserved.length} producto(s) con reserva próxima a vencer</strong>
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
            <h2>Últimos pedidos</h2>
            <Link to="/admin/pedidos" className="dashboard__view-all">Ver todos →</Link>
          </div>
          {latestOrders.length === 0 ? (
            <p className="dashboard__empty">Sin pedidos aún.</p>
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
                      <td>{o.customer?.name || '—'}</td>
                      <td>{formatPrice(o.total || 0)}</td>
                      <td>
                        <span className={`dashboard__badge dashboard__badge--${o.paymentStatus || 'pending_transfer'}`}>
                          {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus || 'Pendiente'}
                        </span>
                      </td>
                      <td>{ORDER_STATUS_LABELS[o.orderStatus] || o.orderStatus || '—'}</td>
                      <td className="dashboard__date">{timeAgo(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile cards */}
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
                    <span>{o.customer?.name || '—'}</span>
                    <strong>{formatPrice(o.total || 0)}</strong>
                  </div>
                  <div className="dashboard__mobile-card-row">
                    <span className="dashboard__date">{timeAgo(o.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Latest products */}
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h2>Últimos productos</h2>
            <Link to="/admin/productos" className="dashboard__view-all">Ver todos →</Link>
          </div>
          {latestProducts.length === 0 ? (
            <p className="dashboard__empty">Sin productos aún.</p>
          ) : (
            <div className="dashboard__table-wrap">
              <table className="dashboard__table">
                <thead>
                  <tr>
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
                      <td>{p.title}</td>
                      <td>{formatPrice(p.price || 0)}</td>
                      <td>
                        <span className={`dashboard__badge dashboard__badge--product-${p.status}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.stock ?? '—'}</td>
                      <td className="dashboard__date">{timeAgo(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile cards */}
          {latestProducts.length > 0 && (
            <div className="dashboard__mobile-cards">
              {latestProducts.map((p) => (
                <div key={p.id} className="dashboard__mobile-card">
                  <div className="dashboard__mobile-card-row">
                    <strong>{p.title}</strong>
                    <span className={`dashboard__badge dashboard__badge--product-${p.status}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="dashboard__mobile-card-row">
                    <span>{formatPrice(p.price || 0)}</span>
                    <span>Stock: {p.stock ?? '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
