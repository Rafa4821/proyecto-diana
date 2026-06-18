import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/storage';
import { Button } from '@/shared/ui';
import { useSiteSettings } from '@/app/providers/SiteSettingsContext';
import { getOrderById, updateOrder } from './ordersService';
import './OrderConfirmationPage.css';

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024;

const PAYMENT_STATUS_LABELS = {
  pending_transfer: 'Pendiente de transferencia',
  proof_uploaded: 'Comprobante enviado',
  confirmed: 'Pago confirmado',
  rejected: 'Pago rechazado',
};

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { settings } = useSiteSettings();
  const fileInputRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError('Error al cargar el pedido.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Formato no permitido. Usa JPG, PNG, WEBP o PDF.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setUploadError('El archivo excede 5MB.');
      return;
    }

    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const filename = `${orderId}_${Date.now()}.${ext}`;
      const storageRef = ref(storage, `transfer-proofs/${filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await updateOrder(orderId, {
        transferProofUrl: url,
        paymentStatus: 'proof_uploaded',
        orderStatus: 'under_review',
      });

      setOrder((prev) => ({
        ...prev,
        transferProofUrl: url,
        paymentStatus: 'proof_uploaded',
        orderStatus: 'under_review',
      }));

      setUploadSuccess('Comprobante subido correctamente. Revisaremos tu pago pronto.');
    } catch (err) {
      setUploadError('Error al subir el comprobante. Intenta de nuevo.');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (loading) {
    return (
      <section className="order-confirm section">
        <div className="container">
          <p className="order-confirm__loading">Cargando pedido...</p>
        </div>
      </section>
    );
  }

  if (error && !order) {
    return (
      <section className="order-confirm section">
        <div className="container">
          <div className="order-confirm__error">{error}</div>
          <Button as={Link} to="/shop" variant="secondary">Ir al Shop</Button>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="order-confirm section">
        <div className="container">
          <h1>Pedido no encontrado</h1>
          <p>El pedido que buscas no existe o el enlace es incorrecto.</p>
          <Button as={Link} to="/shop" variant="secondary">Ir al Shop</Button>
        </div>
      </section>
    );
  }

  const paymentStatus = order.paymentStatus || 'pending_transfer';
  const proofUploaded = !!order.transferProofUrl;

  return (
    <section className="order-confirm section">
      <div className="container">
        <div className="order-confirm__header">
          <div className="order-confirm__check">✓</div>
          <h1>¡Pedido recibido!</h1>
          <p className="order-confirm__subtitle">
            Pedido <strong>{order.orderNumber}</strong> registrado exitosamente.
          </p>
        </div>

        {/* Payment status */}
        <div className="order-confirm__status-bar">
          <span className="order-confirm__status-label">Estado del pago:</span>
          <span className={`order-confirm__status-value order-confirm__status-value--${paymentStatus}`}>
            {PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}
          </span>
        </div>

        {/* Bank details */}
        <div className="order-confirm__card">
          <h2>Datos bancarios para transferencia</h2>
          <div className="order-confirm__bank-data">
            {settings.bankName && (
              <div className="order-confirm__bank-row">
                <span>Banco</span><strong>{settings.bankName}</strong>
              </div>
            )}
            {settings.bankAccountType && (
              <div className="order-confirm__bank-row">
                <span>Tipo de cuenta</span><strong>{settings.bankAccountType}</strong>
              </div>
            )}
            {settings.bankAccountNumber && (
              <div className="order-confirm__bank-row">
                <span>N° de cuenta</span><strong>{settings.bankAccountNumber}</strong>
              </div>
            )}
            {settings.bankRut && (
              <div className="order-confirm__bank-row">
                <span>RUT</span><strong>{settings.bankRut}</strong>
              </div>
            )}
            {settings.bankHolder && (
              <div className="order-confirm__bank-row">
                <span>Titular</span><strong>{settings.bankHolder}</strong>
              </div>
            )}
            {settings.bankEmail && (
              <div className="order-confirm__bank-row">
                <span>Email notificación</span><strong>{settings.bankEmail}</strong>
              </div>
            )}
            <div className="order-confirm__bank-row order-confirm__bank-row--total">
              <span>Monto a transferir</span><strong>{formatPrice(order.total)}</strong>
            </div>
          </div>
          <p className="order-confirm__bank-note">
            Incluye el número de pedido <strong>{order.orderNumber}</strong> en el comentario de la transferencia.
          </p>
        </div>

        {/* Instructions */}
        <div className="order-confirm__instructions">
          <h3>Instrucciones</h3>
          <ol>
            <li>Realiza la transferencia con los datos indicados arriba.</li>
            <li>Sube el comprobante de transferencia usando el formulario de abajo.</li>
            <li>Recibirás confirmación una vez que verifiquemos el pago.</li>
          </ol>
          <p className="order-confirm__note">
            Tu pedido queda reservado por 48 horas. Si no recibimos el pago en ese tiempo,
            los productos volverán a estar disponibles.
          </p>
        </div>

        {/* Upload proof */}
        <div className="order-confirm__upload">
          <h3>Subir comprobante de transferencia</h3>

          {proofUploaded && !uploadSuccess && (
            <div className="order-confirm__proof-sent">
              <p>Ya has enviado un comprobante. Puedes subir uno nuevo si es necesario.</p>
            </div>
          )}

          {uploadError && <div className="order-confirm__upload-error">{uploadError}</div>}
          {uploadSuccess && <div className="order-confirm__upload-success">{uploadSuccess}</div>}

          <div className="order-confirm__upload-field">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="order-confirm__file-input"
            />
            <p className="order-confirm__upload-hint">
              Formatos: JPG, PNG, WEBP, PDF. Máximo 5MB.
            </p>
            {uploading && <p className="order-confirm__uploading">Subiendo comprobante...</p>}
          </div>
        </div>

        {/* Order summary */}
        <div className="order-confirm__details">
          <h3>Resumen del pedido</h3>
          <div className="order-confirm__items">
            {order.items && order.items.map((item, i) => (
              <div key={i} className="order-confirm__item">
                <span>{item.title} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="order-confirm__totals">
            <div className="order-confirm__total-row">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="order-confirm__total-row">
              <span>Envío</span>
              <span>{order.shippingCost === 0 ? 'Gratis' : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="order-confirm__total-row order-confirm__total-row--total">
              <strong>Total</strong>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </div>
        </div>

        <div className="order-confirm__actions">
          <Button as={Link} to="/shop">Seguir comprando</Button>
        </div>
      </div>
    </section>
  );
}
