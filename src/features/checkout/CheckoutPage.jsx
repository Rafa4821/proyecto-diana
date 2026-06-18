import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { useCart } from '@/features/cart/CartContext';
import { useSiteSettings } from '@/app/providers/SiteSettingsContext';
import { createCheckoutOrder, validateCartItems, validateCheckoutForm } from './checkoutService';
import './CheckoutPage.css';

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  comuna: '',
  region: '',
  deliveryType: 'shipping',
  notes: '',
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const shippingCost = form.deliveryType === 'shipping'
    ? (settings.shippingCost || 5000)
    : 0;
  const total = subtotal + shippingCost;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    const { valid, errors } = validateCheckoutForm(form);
    if (!valid) {
      setFieldErrors(errors);
      setError('Completa los campos requeridos.');
      return;
    }

    try {
      setSubmitting(true);

      const validationErrors = await validateCartItems(items);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(' '));
        setSubmitting(false);
        return;
      }

      const customer = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };

      const shipping = {
        deliveryType: form.deliveryType,
        address: form.deliveryType === 'shipping' ? form.address.trim() : '',
        comuna: form.deliveryType === 'shipping' ? form.comuna.trim() : '',
        region: form.deliveryType === 'shipping' ? form.region.trim() : '',
        notes: form.notes.trim(),
      };

      const { orderId } = await createCheckoutOrder({
        customer,
        shipping,
        items,
        subtotal,
        shippingCost,
        total,
      });

      clearCart();
      navigate(`/pedido-recibido/${orderId}`);
    } catch (err) {
      setError('Error al procesar el pedido. Intenta de nuevo.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="checkout section">
        <div className="container">
          <h1>Checkout</h1>
          <div className="checkout__empty">
            <p>No hay productos en tu carrito.</p>
            <Button as={Link} to="/shop" variant="secondary">Ir al Shop</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout section">
      <div className="container">
        <h1>Checkout</h1>

        {error && <div className="checkout__error">{error}</div>}

        <form onSubmit={handleSubmit} className="checkout__layout">
          <div className="checkout__form">
            <fieldset className="checkout__fieldset">
              <legend>Datos de contacto</legend>
              <Field label="Nombre completo" value={form.name} onChange={(v) => update('name', v)} error={fieldErrors.name} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} error={fieldErrors.email} required />
              <Field label="Teléfono" type="tel" value={form.phone} onChange={(v) => update('phone', v)} error={fieldErrors.phone} required />
            </fieldset>

            <fieldset className="checkout__fieldset">
              <legend>Entrega</legend>
              <div className="checkout__delivery-options">
                <label className={`checkout__delivery-option ${form.deliveryType === 'shipping' ? 'checkout__delivery-option--active' : ''}`}>
                  <input type="radio" name="deliveryType" value="shipping" checked={form.deliveryType === 'shipping'} onChange={(e) => update('deliveryType', e.target.value)} />
                  <span>Despacho a domicilio</span>
                  <small>{formatPrice(settings.shippingCost || 5000)}</small>
                </label>
                <label className={`checkout__delivery-option ${form.deliveryType === 'pickup' ? 'checkout__delivery-option--active' : ''}`}>
                  <input type="radio" name="deliveryType" value="pickup" checked={form.deliveryType === 'pickup'} onChange={(e) => update('deliveryType', e.target.value)} />
                  <span>Retiro en persona</span>
                  <small>Gratis</small>
                </label>
              </div>

              {form.deliveryType === 'shipping' && (
                <>
                  <Field label="Dirección" value={form.address} onChange={(v) => update('address', v)} error={fieldErrors.address} required />
                  <Field label="Comuna" value={form.comuna} onChange={(v) => update('comuna', v)} error={fieldErrors.comuna} required />
                  <Field label="Región" value={form.region} onChange={(v) => update('region', v)} error={fieldErrors.region} required />
                </>
              )}
            </fieldset>

            <fieldset className="checkout__fieldset">
              <legend>Notas (opcional)</legend>
              <textarea
                className="checkout__textarea"
                rows={3}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Instrucciones especiales, horario de entrega, etc."
              />
            </fieldset>

            <fieldset className="checkout__fieldset">
              <legend>Método de pago</legend>
              <div className="checkout__payment-info">
                <p><strong>Transferencia bancaria</strong></p>
                <p className="checkout__payment-note">
                  Recibirás los datos para la transferencia una vez confirmado el pedido.
                  El pedido queda reservado por 48 horas mientras se procesa el pago.
                </p>
              </div>
            </fieldset>
          </div>

          <aside className="checkout__summary">
            <h2>Resumen del pedido</h2>
            <div className="checkout__items">
              {items.map((item) => (
                <div key={item.id} className="checkout__item">
                  <span className="checkout__item-name">{item.title} × {item.quantity}</span>
                  <span className="checkout__item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="checkout__totals">
              <div className="checkout__total-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="checkout__total-row">
                <span>Envío</span>
                <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
              </div>
              <div className="checkout__total-row checkout__total-row--total">
                <strong>Total</strong>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>
            <Button type="submit" size="lg" className="checkout__submit" disabled={submitting}>
              {submitting ? 'Procesando...' : 'Confirmar pedido'}
            </Button>
          </aside>
        </form>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text', error, required = false }) {
  return (
    <div className="checkout__field">
      <label className="checkout__label">
        {label} {required && <span className="checkout__required">*</span>}
      </label>
      <input
        className={`checkout__input ${error ? 'checkout__input--error' : ''}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span className="checkout__field-error">{error}</span>}
    </div>
  );
}
