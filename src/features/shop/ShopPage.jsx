import { Link } from 'react-router-dom';
import { Button, Grid } from '@/shared/ui';
import { products, formatPrice, getStatusLabel } from '@/shared/data/mockData';
import './ShopPage.css';

export default function ShopPage() {
  return (
    <section className="shop section">
      <div className="container">
        <div className="shop__header">
          <h1>Shop</h1>
          <p className="shop__intro">
            Obras originales disponibles para compra. Cada pieza es única.
          </p>
        </div>

        <Grid>
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <Link to={`/shop/${product.slug}`} className="product-card__link">
                <div className="product-card__image-wrapper">
                  <img
                    className="product-card__image"
                    src={product.images[0]}
                    alt={product.title}
                    loading="lazy"
                  />
                  <span className={`product-card__badge product-card__badge--${product.status}`}>
                    {getStatusLabel(product.status)}
                  </span>
                </div>
                <div className="product-card__body">
                  <h3 className="product-card__title">{product.title}</h3>
                  <p className="product-card__price">{formatPrice(product.price)}</p>
                  <p className="product-card__technique">{product.technique}</p>
                </div>
              </Link>
              <div className="product-card__actions">
                <Button as={Link} to={`/shop/${product.slug}`} variant="secondary" size="sm">
                  Ver detalle
                </Button>
              </div>
            </article>
          ))}
        </Grid>
      </div>
    </section>
  );
}
