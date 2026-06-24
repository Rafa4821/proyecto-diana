import { useState, useEffect, useMemo } from 'react';
import { getOrders, updateOrder } from '@/features/orders/ordersService';
import { getProductById, updateProductStatus, releaseReservation, markAsSold } from '@/features/products/productsService';
import './AdminOrdersPage.css';

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

function formatDate(ts) {
  if (!ts) return '--';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatShortDate(ts) {
  if (!ts) return '--';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
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
  return `Hace ${days}d`;
}

const PAYMENT_STATUSES = [
  { value: 'pending_transfer', label: 'Pendiente transferencia', short: 'Pendiente' },
  { value: 'proof_uploaded', label: 'Comprobante subido', short: 'Comprobante' },
  { value: 'under_review', label: 'En revision', short: 'Revision' },
  { value: 'paid', label: 'Pagado', short: 'Pagado' },
  { value: 'rejected', label: 'Rechazado', short: 'Rechazado' },
];

const ORDER_STATUSES = [
  { value: 'waiting_payment', label: 'Esperando pago' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const PAYMENT_LABELS = Object.fromEntries(PAYMENT_STATUSES.map((s) => [s.value, s.label]));
const ORDER_LABELS = Object.fromEntries(ORDER_STATUSES.map((s) => [s.value, s.label]));

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterPayment, setFilterPayment] = useState('all');
  const [filterOrder, setFilterOrder] = useState('');
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      setLoading(true); setError(null);
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError('Error al cargar pedidos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const paymentCounts = useMemo(() => {
    const counts = { all: orders.length };
    PAYMENT_STATUSES.forEach((s) => {
      counts[s.value] = orders.filter((o) => o.paymentStatus === s.value).length;
    });
    return counts;
  }, [orders]);

  const stats = useMemo(() => {
    const confirmed = orders.filter((o) => o.paymentStatus === 'paid');
    const revenue = confirmed.reduce((sum, o) => sum + (o.total || 0), 0);
    const needsAction = orders.filter((o) => o.paymentStatus === 'proof_uploaded' || o.paymentStatus === 'under_review').length;
    const pending = orders.filter((o) => o.paymentStatus === 'pending_transfer').length;
    return { revenue, needsAction, pending, paid: confirmed.length };
  }, [orders]);

  const filtered = useMemo(() => orders.filter((o) => {
    if (filterPayment !== 'all' && o.paymentStatus !== filterPayment) return false;
    if (filterOrder && o.orderStatus !== filterOrder) return false;
    if (search) {
      const q = search.toLowerCase();
      const num = (o.orderNumber || '').toLowerCase();
      const email = (o.customer?.email || '').toLowerCase();
      const name = (o.customer?.name || '').toLowerCase();
      if (!num.includes(q) && !email.includes(q) && !name.includes(q)) return false;
    }
    return true;
  }), [orders, filterPayment, filterOrder, search]);

  function openDetail(order) {
    setSelected(order);
    setActionMsg(null);
    setNoteText('');
  }

  function closeDetail() {
    setSelected(null);
    setActionMsg(null);
  }

  async function runAction(fn) {
    try {
      setActionLoading(true); setActionMsg(null);
      await fn();
      await loadOrders();
      const updated = (await getOrders()).find((o) => o.id === selected.id);
      if (updated) setSelected(updated);
      setActionMsg({ type: 'success', text: 'Accion realizada correctamente.' });
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Error al ejecutar la accion.' });
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleChangePaymentStatus(newStatus) {
    await runAction(async () => {
      const updates = { paymentStatus: newStatus };

      if (newStatus === 'paid') {
        updates.orderStatus = 'preparing';
        await updateOrder(selected.id, updates);
        if (selected.items) {
          for (const item of selected.items) {
            const product = await getProductById(item.productId);
            if (product && product.status === 'reserved' && item.isUnique) {
              await markAsSold(item.productId);
            } else if (product && product.status !== 'sold') {
              const newStock = Math.max(0, (product.stock || 1) - item.quantity);
              await updateProductStatus(item.productId, newStock === 0 ? 'sold' : product.status, { stock: newStock });
            }
          }
        }
      } else if (newStatus === 'rejected') {
        updates.orderStatus = 'waiting_payment';
        await updateOrder(selected.id, updates);
      } else {
        await updateOrder(selected.id, updates);
      }
    });
  }

  async function handleChangeOrderStatus(newStatus) {
    await runAction(async () => {
      const updates = { orderStatus: newStatus };

      if (newStatus === 'cancelled') {
        updates.paymentStatus = selected.paymentStatus === 'paid' ? 'paid' : selected.paymentStatus;
        await updateOrder(selected.id, updates);
        if (selected.items) {
          for (const item of selected.items) {
            const product = await getProductById(item.productId);
            if (product && product.status === 'reserved') {
              await releaseReservation(item.productId);
            }
          }
        }
      } else {
        await updateOrder(selected.id, updates);
      }
    });
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    await runAction(async () => {
      const notes = selected.adminNotes || [];
      notes.push({ text: noteText.trim(), date: new Date().toISOString() });
      await updateOrder(selected.id, { adminNotes: notes });
      setNoteText('');
    });
  }

  /* ═══════ DETAIL VIEW ═══════ */
  if (selected) {
    return (
      <div className="admin-orders">
        <div className="admin-orders__detail-topbar">
          <button type="button" className="admin-orders__back" onClick={closeDetail}>← Volver a pedidos</button>
          <div className="admin-orders__detail-topbar-right">
            <span className={`admin-orders__badge admin-orders__badge--lg admin-orders__badge--${selected.paymentStatus}`}>
              {PAYMENT_LABELS[selected.paymentStatus] || selected.paymentStatus}
            </span>
            <span className={`admin-orders__badge admin-orders__badge--lg admin-orders__badge--${selected.orderStatus}`}>
              {ORDER_LABELS[selected.orderStatus] || selected.orderStatus}
            </span>
          </div>
        </div>

        <div className="admin-orders__detail">
          <div className="admin-orders__detail-header">
            <div>
              <h1>Pedido {selected.orderNumber || selected.id.slice(0, 8)}</h1>
              <span className="admin-orders__detail-date">{formatDate(selected.createdAt)} · {timeAgo(selected.createdAt)}</span>
            </div>
            <div className="admin-orders__detail-total">
              <span className="admin-orders__detail-total-label">Total</span>
              <span className="admin-orders__detail-total-value">{formatPrice(selected.total || 0)}</span>
            </div>
          </div>

          {actionMsg && (
            <div className={`admin-orders__msg admin-orders__msg--${actionMsg.type}`}>{actionMsg.text}</div>
          )}

          <div className="admin-orders__detail-grid">
            {/* Left column */}
            <div className="admin-orders__detail-main">
              {/* Status cards */}
              <div className="admin-orders__status-cards">
                <div className="admin-orders__status-card">
                  <span className="admin-orders__status-label">Estado del pago</span>
                  <span className={`admin-orders__badge admin-orders__badge--${selected.paymentStatus}`}>
                    {PAYMENT_LABELS[selected.paymentStatus] || selected.paymentStatus}
                  </span>
                </div>
                <div className="admin-orders__status-card">
                  <span className="admin-orders__status-label">Estado del pedido</span>
                  <span className={`admin-orders__badge admin-orders__badge--${selected.orderStatus}`}>
                    {ORDER_LABELS[selected.orderStatus] || selected.orderStatus}
                  </span>
                </div>
                <div className="admin-orders__status-card">
                  <span className="admin-orders__status-label">Entrega</span>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>
                    {selected.shipping?.deliveryType === 'shipping' ? 'Despacho' : 'Retiro en tienda'}
                  </strong>
                </div>
                <div className="admin-orders__status-card">
                  <span className="admin-orders__status-label">Items</span>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>
                    {(selected.items || []).reduce((s, i) => s + i.quantity, 0)} producto(s)
                  </strong>
                </div>
              </div>

              {/* Items */}
              <div className="admin-orders__card">
                <h3>Productos del pedido</h3>
                <div className="admin-orders__items">
                  {(selected.items || []).map((item, i) => (
                    <div key={i} className="admin-orders__item-row">
                      {item.imageUrl && <img src={item.imageUrl} alt="" className="admin-orders__item-thumb" loading="lazy" />}
                      <div className="admin-orders__item-info">
                        <strong>{item.title}</strong>
                        {item.isUnique && <span className="admin-orders__unique">Unica</span>}
                      </div>
                      <span className="admin-orders__item-qty">x{item.quantity}</span>
                      <span className="admin-orders__item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="admin-orders__totals">
                  <div className="admin-orders__total-row">
                    <span>Subtotal</span><span>{formatPrice(selected.subtotal || 0)}</span>
                  </div>
                  <div className="admin-orders__total-row">
                    <span>Envio</span><span>{selected.shippingCost === 0 ? 'Gratis' : formatPrice(selected.shippingCost || 0)}</span>
                  </div>
                  <div className="admin-orders__total-row admin-orders__total-row--total">
                    <strong>Total</strong><strong>{formatPrice(selected.total || 0)}</strong>
                  </div>
                </div>
              </div>

              {/* Transfer proof */}
              {selected.transferProofUrl && (
                <div className="admin-orders__card">
                  <h3>Comprobante de transferencia</h3>
                  <div className="admin-orders__proof">
                    {selected.transferProofUrl.match(/\.pdf/i) ? (
                      <a href={selected.transferProofUrl} target="_blank" rel="noopener noreferrer" className="admin-orders__proof-link">
                        Ver PDF del comprobante
                      </a>
                    ) : (
                      <a href={selected.transferProofUrl} target="_blank" rel="noopener noreferrer">
                        <img src={selected.transferProofUrl} alt="Comprobante" className="admin-orders__proof-img" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="admin-orders__card">
                <h3>Notas internas</h3>
                {(selected.adminNotes && selected.adminNotes.length > 0) ? (
                  <div className="admin-orders__notes">
                    {selected.adminNotes.map((n, i) => (
                      <div key={i} className="admin-orders__note">
                        <span className="admin-orders__note-date">{new Date(n.date).toLocaleString('es-CL')}</span>
                        <p>{n.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-orders__empty-notes">Sin notas.</p>
                )}
                <div className="admin-orders__add-note">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Agregar nota interna..."
                    rows={2}
                  />
                  <button type="button" onClick={handleAddNote} disabled={actionLoading || !noteText.trim()}>
                    Agregar nota
                  </button>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="admin-orders__detail-sidebar">
              {/* Customer */}
              <div className="admin-orders__card">
                <h3>Cliente</h3>
                <div className="admin-orders__customer-info">
                  <div className="admin-orders__customer-avatar">
                    {(selected.customer?.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p><strong>{selected.customer?.name || '--'}</strong></p>
                    <p>{selected.customer?.email || '--'}</p>
                    {selected.customer?.phone && <p>{selected.customer.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="admin-orders__card">
                <h3>Entrega</h3>
                <p><strong>{selected.shipping?.deliveryType === 'shipping' ? 'Despacho a domicilio' : 'Retiro en tienda'}</strong></p>
                {selected.shipping?.deliveryType === 'shipping' && (
                  <div className="admin-orders__address">
                    <p>{selected.shipping.address}</p>
                    <p>{selected.shipping.comuna}, {selected.shipping.region}</p>
                  </div>
                )}
                {selected.shipping?.notes && <p className="admin-orders__ship-note">Nota: {selected.shipping.notes}</p>}
              </div>

              {/* Payment Actions */}
              <div className="admin-orders__card">
                <h3>Acciones de pago</h3>
                <div className="admin-orders__actions-list">
                  {selected.paymentStatus !== 'paid' && (
                    <button type="button" className="admin-orders__action-btn admin-orders__action-btn--green" onClick={() => handleChangePaymentStatus('paid')} disabled={actionLoading}>
                      Confirmar pago
                    </button>
                  )}
                  {selected.paymentStatus === 'proof_uploaded' && (
                    <button type="button" className="admin-orders__action-btn admin-orders__action-btn--blue" onClick={() => handleChangePaymentStatus('under_review')} disabled={actionLoading}>
                      Marcar en revision
                    </button>
                  )}
                  {(selected.paymentStatus === 'proof_uploaded' || selected.paymentStatus === 'under_review') && (
                    <button type="button" className="admin-orders__action-btn admin-orders__action-btn--red" onClick={() => handleChangePaymentStatus('rejected')} disabled={actionLoading}>
                      Rechazar comprobante
                    </button>
                  )}
                  {selected.paymentStatus === 'paid' && (
                    <p className="admin-orders__action-done">Pago confirmado</p>
                  )}
                </div>
              </div>

              {/* Order Actions */}
              <div className="admin-orders__card">
                <h3>Acciones de pedido</h3>
                <div className="admin-orders__actions-list">
                  {ORDER_STATUSES.filter((s) => s.value !== selected.orderStatus && s.value !== 'cancelled').map((s) => (
                    <button key={s.value} type="button" className="admin-orders__action-btn" onClick={() => handleChangeOrderStatus(s.value)} disabled={actionLoading}>
                      {s.label}
                    </button>
                  ))}
                  {selected.orderStatus !== 'cancelled' && (
                    <button type="button" className="admin-orders__action-btn admin-orders__action-btn--red" onClick={() => { if (window.confirm('Cancelar pedido? Se liberaran productos reservados.')) handleChangeOrderStatus('cancelled'); }} disabled={actionLoading}>
                      Cancelar pedido
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════ LIST VIEW ═══════ */
  return (
    <div className="admin-orders">
      <div className="admin-orders__header">
        <div>
          <h1>Pedidos</h1>
          <p className="admin-orders__subtitle">{orders.length} pedido(s) en total</p>
        </div>
      </div>

      {/* Stats row */}
      {!loading && orders.length > 0 && (
        <div className="admin-orders__stats">
          <div className="admin-orders__stat admin-orders__stat--dark">
            <span className="admin-orders__stat-value">{formatPrice(stats.revenue)}</span>
            <span className="admin-orders__stat-label">Ingresos</span>
          </div>
          <div className="admin-orders__stat">
            <span className="admin-orders__stat-value">{stats.paid}</span>
            <span className="admin-orders__stat-label">Pagados</span>
          </div>
          <div className="admin-orders__stat">
            <span className="admin-orders__stat-value">{stats.needsAction}</span>
            <span className="admin-orders__stat-label">Requieren accion</span>
          </div>
          <div className="admin-orders__stat">
            <span className="admin-orders__stat-value">{stats.pending}</span>
            <span className="admin-orders__stat-label">Pendientes</span>
          </div>
        </div>
      )}

      {error && <div className="admin-orders__msg admin-orders__msg--error">{error}</div>}

      {/* Toolbar */}
      <div className="admin-orders__toolbar">
        <div className="admin-orders__filters">
          {[{ value: 'all', label: 'Todos' }, ...PAYMENT_STATUSES.map((s) => ({ value: s.value, label: s.short }))].map((s) => (
            <button
              key={s.value}
              type="button"
              className={`admin-orders__filter-btn ${filterPayment === s.value ? 'admin-orders__filter-btn--active' : ''}`}
              onClick={() => setFilterPayment(s.value)}
            >
              {s.label}
              <span className="admin-orders__filter-count">{paymentCounts[s.value] || 0}</span>
            </button>
          ))}
        </div>
        <div className="admin-orders__toolbar-right">
          <select value={filterOrder} onChange={(e) => setFilterOrder(e.target.value)} className="admin-orders__select">
            <option value="">Todos los estados</option>
            {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input
            type="text"
            className="admin-orders__search"
            placeholder="Buscar pedido, email, nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="admin-orders__loading">Cargando pedidos...</p>
      ) : filtered.length === 0 ? (
        <div className="admin-orders__empty-state">
          <p>No se encontraron pedidos</p>
          {(filterPayment !== 'all' || filterOrder || search) && (
            <button type="button" className="admin-btn admin-btn--secondary" onClick={() => { setFilterPayment('all'); setFilterOrder(''); setSearch(''); }}>
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="admin-orders__table-wrap">
            <table className="admin-orders__table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="admin-orders__row" onClick={() => openDetail(o)}>
                    <td>
                      <strong className="admin-orders__order-num">{o.orderNumber || o.id.slice(0, 8)}</strong>
                    </td>
                    <td>
                      <div className="admin-orders__cell-name">{o.customer?.name || '--'}</div>
                      <div className="admin-orders__cell-email">{o.customer?.email || ''}</div>
                    </td>
                    <td>
                      <span className="admin-orders__item-count">{(o.items || []).reduce((s, i) => s + i.quantity, 0)} item(s)</span>
                    </td>
                    <td><strong>{formatPrice(o.total || 0)}</strong></td>
                    <td>
                      <span className={`admin-orders__badge admin-orders__badge--${o.paymentStatus || 'pending_transfer'}`}>
                        {PAYMENT_LABELS[o.paymentStatus] || 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-orders__badge admin-orders__badge--${o.orderStatus || 'waiting_payment'}`}>
                        {ORDER_LABELS[o.orderStatus] || 'Esperando'}
                      </span>
                    </td>
                    <td className="admin-orders__date-cell">
                      <div>{formatShortDate(o.createdAt)}</div>
                      <div className="admin-orders__time-ago">{timeAgo(o.createdAt)}</div>
                    </td>
                    <td>
                      <button type="button" className="admin-orders__view-btn" onClick={(e) => { e.stopPropagation(); openDetail(o); }}>Ver detalle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="admin-orders__mobile-list">
            {filtered.map((o) => (
              <button key={o.id} type="button" className="admin-orders__mobile-item" onClick={() => openDetail(o)}>
                <div className="admin-orders__mobile-row">
                  <strong>{o.orderNumber || o.id.slice(0, 8)}</strong>
                  <span className={`admin-orders__badge admin-orders__badge--${o.paymentStatus || 'pending_transfer'}`}>
                    {PAYMENT_LABELS[o.paymentStatus] || 'Pendiente'}
                  </span>
                </div>
                <div className="admin-orders__mobile-row">
                  <span>{o.customer?.name || '--'}</span>
                  <strong>{formatPrice(o.total || 0)}</strong>
                </div>
                <div className="admin-orders__mobile-row">
                  <span className={`admin-orders__badge admin-orders__badge--${o.orderStatus || 'waiting_payment'}`}>
                    {ORDER_LABELS[o.orderStatus] || 'Esperando'}
                  </span>
                  <span className="admin-orders__date-cell">{timeAgo(o.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
