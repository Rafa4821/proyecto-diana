import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { useCart } from './CartContext';
import SEO from '@/shared/components/SEO';
import './CartPage.css';

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="cart section">
        <SEO title="Carrito" noindex />
        <div className="container">
          <h1>Carrito</h1>
          <div className="cart__empty">
            <p>Tu carrito está vacío.</p>
            <Button as={Link} to="/shop" variant="secondary">
              Explorar el Shop
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart section">
      <SEO title="Carrito" noindex />
      <div className="container">
        <div className="cart__header">
          <h1>Carrito</h1>
          <button type="button" className="cart__clear-btn" onClick={clearCart}>
            Vaciar carrito
          </button>
        </div>

        <div className="cart__layout">
          <div className="cart__items">
            {items.map((item) => {
              const maxQty = item.isUnique ? 1 : item.stock;
              return (
                <div key={item.id} className="cart-item">
                  <Link to={`/shop/${item.slug}`} className="cart-item__image-link">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="cart-item__image" loading="lazy" />
                    ) : (
                      <div className="cart-item__no-image">—</div>
                    )}
                  </Link>

                  <div className="cart-item__info">
                    <Link to={`/shop/${item.slug}`} className="cart-item__title">{item.title}</Link>
                    <p className="cart-item__price">{formatPrice(item.price)}</p>
                    {item.isUnique && <span className="cart-item__unique-label">Pieza única</span>}
                  </div>

                  <div className="cart-item__quantity">
                    <button
                      type="button"
                      className="cart-item__qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="cart-item__qty-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="cart-item__qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= maxQty}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item__subtotal">
                    {formatPrice(item.price * item.quantity)}
                  </div>

                  <button
                    type="button"
                    className="cart-item__remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <aside className="cart__summary">
            <h2>Resumen</h2>
            <div className="cart__summary-row">
              <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <p className="cart__summary-note">Envío calculado en el checkout.</p>
            <Button as={Link} to="/checkout" size="lg" className="cart__checkout-btn">
              Ir al checkout
            </Button>
            <Link to="/shop" className="cart__continue">← Seguir comprando</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
