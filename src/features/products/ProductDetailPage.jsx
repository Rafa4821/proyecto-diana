import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { products, formatPrice, getStatusLabel } from '@/shared/data/mockData';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <section className="section">
        <div className="container">
          <h1>Producto no encontrado</h1>
          <p>La obra que buscas no existe.</p>
          <Button as={Link} to="/shop" variant="secondary">Volver al shop</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="product-detail section">
      <div className="container">
        <Link to="/shop" className="product-detail__back text-uppercase">
          ← Volver al shop
        </Link>

        <div className="product-detail__grid">
          <div className="product-detail__gallery">
            <div className="product-detail__main-image">
              <img
                src={product.images[activeImage]}
                alt={product.title}
                loading="lazy"
              />
            </div>
            {product.images.length > 1 && (
              <div className="product-detail__thumbs">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-detail__thumb ${i === activeImage ? 'product-detail__thumb--active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`${product.title} vista ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail__info">
            <span className={`product-detail__status product-detail__status--${product.status}`}>
              {getStatusLabel(product.status)}
            </span>
            <h1 className="product-detail__title">{product.title}</h1>
            <p className="product-detail__price">{formatPrice(product.price)}</p>

            <div className="product-detail__meta">
              <div className="product-detail__meta-item">
                <span className="product-detail__meta-label">Técnica</span>
                <span className="product-detail__meta-value">{product.technique}</span>
              </div>
              <div className="product-detail__meta-item">
                <span className="product-detail__meta-label">Dimensiones</span>
                <span className="product-detail__meta-value">{product.dimensions}</span>
              </div>
              <div className="product-detail__meta-item">
                <span className="product-detail__meta-label">Tipo</span>
                <span className="product-detail__meta-value">Obra original única</span>
              </div>
            </div>

            <p className="product-detail__description">{product.description}</p>

            {product.status === 'disponible' && (
              <Button size="lg" className="product-detail__cta">
                Agregar al carrito
              </Button>
            )}

            {product.status === 'reservado' && (
              <p className="product-detail__unavailable">
                Esta obra está reservada actualmente.
              </p>
            )}

            {product.status === 'vendido' && (
              <p className="product-detail__unavailable">
                Esta obra ya fue vendida.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
