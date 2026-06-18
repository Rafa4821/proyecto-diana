import { useState, useEffect } from 'react';
import { getOrders, updateOrder } from '@/features/orders/ordersService';
import { getProductById, updateProductStatus, releaseReservation, markAsSold } from '@/features/products/productsService';
import './AdminOrdersPage.css';

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PAYMENT_STATUSES = [
  { value: 'pending_transfer', label: 'Pendiente transferencia' },
  { value: 'proof_uploaded', label: 'Comprobante subido' },
  { value: 'under_review', label: 'En revisión' },
  { value: 'paid', label: 'Pagado' },
  { value: 'rejected', label: 'Rechazado' },
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

  const [filterPayment, setFilterPayment] = useState('');
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

  const filtered = orders.filter((o) => {
    if (filterPayment && o.paymentStatus !== filterPayment) return false;
    if (filterOrder && o.orderStatus !== filterOrder) return false;
    if (search) {
      const q = search.toLowerCase();
      const num = (o.orderNumber || '').toLowerCase();
      const email = (o.customer?.email || '').toLowerCase();
      const name = (o.customer?.name || '').toLowerCase();
      if (!num.includes(q) && !email.includes(q) && !name.includes(q)) return false;
    }
    return true;
  });

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
      setActionMsg({ type: 'success', text: 'Acción realizada.' });
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Error al ejecutar la acción.' });
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

  if (selected) {
    return (
      <div className="admin-orders">
        <button type="button" className="admin-orders__back" onClick={closeDetail}>← Volver a pedidos</button>

        <div className="admin-orders__detail">
          <div className="admin-orders__detail-header">
            <h1>Pedido {selected.orderNumber || selected.id.slice(0, 8)}</h1>
            <span className="admin-orders__detail-date">{formatDate(selected.createdAt)}</span>
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
              </div>

              {/* Items */}
              <div className="admin-orders__card">
                <h3>Productos</h3>
                <div className="admin-orders__items">
                  {(selected.items || []).map((item, i) => (
                    <div key={i} className="admin-orders__item-row">
                      <div className="admin-orders__item-info">
                        <strong>{item.title}</strong>
                        {item.isUnique && <span className="admin-orders__unique">Única</span>}
                      </div>
                      <span>×{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="admin-orders__totals">
                  <div className="admin-orders__total-row">
                    <span>Subtotal</span><span>{formatPrice(selected.subtotal || 0)}</span>
                  </div>
                  <div className="admin-orders__total-row">
                    <span>Envío</span><span>{selected.shippingCost === 0 ? 'Gratis' : formatPrice(selected.shippingCost || 0)}</span>
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
                <p><strong>{selected.customer?.name}</strong></p>
                <p>{selected.customer?.email}</p>
                <p>{selected.customer?.phone}</p>
              </div>

              {/* Shipping */}
              <div className="admin-orders__card">
                <h3>Entrega</h3>
                <p><strong>{selected.shipping?.deliveryType === 'shipping' ? 'Despacho' : 'Retiro'}</strong></p>
                {selected.shipping?.deliveryType === 'shipping' && (
                  <>
                    <p>{selected.shipping.address}</p>
                    <p>{selected.shipping.comuna}, {selected.shipping.region}</p>
                  </>
                )}
                {selected.shipping?.notes && <p className="admin-orders__ship-note">Nota: {selected.shipping.notes}</p>}
              </div>

              {/* Actions */}
              <div className="admin-orders__card">
                <h3>Acciones de pago</h3>
                <div className="admin-orders__actions-list">
                  {selected.paymentStatus !== 'paid' && (
                    <button type="button" className="admin-orders__action-btn admin-orders__action-btn--green" onClick={() => handleChangePaymentStatus('paid')} disabled={actionLoading}>
                      Marcar como pagado
                    </button>
                  )}
                  {selected.paymentStatus === 'proof_uploaded' && (
                    <button type="button" className="admin-orders__action-btn admin-orders__action-btn--blue" onClick={() => handleChangePaymentStatus('under_review')} disabled={actionLoading}>
                      En revisión
                    </button>
                  )}
                  {(selected.paymentStatus === 'proof_uploaded' || selected.paymentStatus === 'under_review') && (
                    <button type="button" className="admin-orders__action-btn admin-orders__action-btn--red" onClick={() => handleChangePaymentStatus('rejected')} disabled={actionLoading}>
                      Rechazar comprobante
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-orders__card">
                <h3>Acciones de pedido</h3>
                <div className="admin-orders__actions-list">
                  {ORDER_STATUSES.filter((s) => s.value !== selected.orderStatus && s.value !== 'cancelled').map((s) => (
                    <button key={s.value} type="button" className="admin-orders__action-btn" onClick={() => handleChangeOrderStatus(s.value)} disabled={actionLoading}>
                      {s.label}
                    </button>
                  ))}
                  {selected.orderStatus !== 'cancelled' && (
                    <button type="button" className="admin-orders__action-btn admin-orders__action-btn--red" onClick={() => { if (window.confirm('¿Cancelar pedido? Se liberarán productos reservados.')) handleChangeOrderStatus('cancelled'); }} disabled={actionLoading}>
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

  return (
    <div className="admin-orders">
      <h1>Pedidos</h1>

      {error && <div className="admin-orders__msg admin-orders__msg--error">{error}</div>}

      {/* Filters */}
      <div className="admin-orders__filters">
        <input
          type="text"
          className="admin-orders__search"
          placeholder="Buscar por N° pedido, email o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="admin-orders__select">
          <option value="">Todos los pagos</option>
          {PAYMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterOrder} onChange={(e) => setFilterOrder(e.target.value)} className="admin-orders__select">
          <option value="">Todos los estados</option>
          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="admin-orders__loading">Cargando pedidos...</p>
      ) : filtered.length === 0 ? (
        <p className="admin-orders__empty">No se encontraron pedidos.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="admin-orders__table-wrap">
            <table className="admin-orders__table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.orderNumber || o.id.slice(0, 8)}</strong></td>
                    <td>
                      <div>{o.customer?.name || '—'}</div>
                      <div className="admin-orders__cell-email">{o.customer?.email || ''}</div>
                    </td>
                    <td>{formatPrice(o.total || 0)}</td>
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
                    <td className="admin-orders__date-cell">{formatDate(o.createdAt)}</td>
                    <td>
                      <button type="button" className="admin-orders__view-btn" onClick={() => openDetail(o)}>Ver</button>
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
                  <span>{o.customer?.name || '—'}</span>
                  <strong>{formatPrice(o.total || 0)}</strong>
                </div>
                <div className="admin-orders__mobile-row">
                  <span className={`admin-orders__badge admin-orders__badge--${o.orderStatus || 'waiting_payment'}`}>
                    {ORDER_LABELS[o.orderStatus] || 'Esperando'}
                  </span>
                  <span className="admin-orders__date-cell">{formatDate(o.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
