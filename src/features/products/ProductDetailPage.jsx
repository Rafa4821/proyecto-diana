import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { useCart } from '@/features/cart/CartContext';
import SEO from '@/shared/components/SEO';
import { getProductBySlug } from '@/features/products/productsService';
import './ProductDetailPage.css';

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

const STATUS_LABELS = {
  published: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
};

const TYPE_LABELS = {
  original: 'Obra original única',
  print: 'Print / Lámina',
  commission: 'Encargo',
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [addedMsg, setAddedMsg] = useState(null);
  const { addItem, items } = useCart();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  async function loadProduct() {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductBySlug(slug);
      setProduct(data);
    } catch (err) {
      setError('Error al cargar el producto.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="product-detail__loading">Cargando...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <p className="product-detail__error">{error}</p>
          <Button as={Link} to="/shop" variant="secondary">Volver al shop</Button>
        </div>
      </section>
    );
  }

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

  const images = product.images && product.images.length > 0
    ? product.images
    : product.mainImageUrl
      ? [product.mainImageUrl]
      : ['https://placehold.co/600x750/f5f5f5/a3a3a3?text=Sin+imagen'];

  const canBuy = product.status === 'published' && product.stock > 0;

  return (
    <section className="product-detail section">
      <div className="container">
        <Link to="/shop" className="product-detail__back text-uppercase">
          ← Volver al shop
        </Link>

        <SEO
          title={product.title}
          description={product.description || `${product.title} — ${product.technique || 'Obra original'}`}
          image={images[0]}
          url={`/shop/${product.slug}`}
          type="product"
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.description || '',
            image: images,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'CLP',
              availability: product.status === 'published'
                ? 'https://schema.org/InStock'
                : product.status === 'reserved'
                  ? 'https://schema.org/LimitedAvailability'
                  : 'https://schema.org/SoldOut',
            },
          }}
        />
        <div className="product-detail__grid">
          <div className="product-detail__gallery">
            <div className="product-detail__main-image">
              <img
                src={images[activeImage]}
                alt={product.title}
                loading="eager"
                decoding="async"
              />
            </div>
            {images.length > 1 && (
              <div className="product-detail__thumbs">
                {images.map((img, i) => (
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
              {STATUS_LABELS[product.status] || product.status}
            </span>
            <h1 className="product-detail__title">{product.title}</h1>
            <p className="product-detail__price">{formatPrice(product.price)}</p>

            <div className="product-detail__meta">
              {product.technique && (
                <div className="product-detail__meta-item">
                  <span className="product-detail__meta-label">Técnica</span>
                  <span className="product-detail__meta-value">{product.technique}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="product-detail__meta-item">
                  <span className="product-detail__meta-label">Dimensiones</span>
                  <span className="product-detail__meta-value">{product.dimensions}</span>
                </div>
              )}
              {product.year && (
                <div className="product-detail__meta-item">
                  <span className="product-detail__meta-label">Año</span>
                  <span className="product-detail__meta-value">{product.year}</span>
                </div>
              )}
              {product.material && (
                <div className="product-detail__meta-item">
                  <span className="product-detail__meta-label">Material</span>
                  <span className="product-detail__meta-value">{product.material}</span>
                </div>
              )}
              <div className="product-detail__meta-item">
                <span className="product-detail__meta-label">Tipo</span>
                <span className="product-detail__meta-value">{TYPE_LABELS[product.productType] || product.productType}</span>
              </div>
            </div>

            {product.description && (
              <p className="product-detail__description">{product.description}</p>
            )}

            {canBuy && (
              <>
                <Button
                  size="lg"
                  className="product-detail__cta"
                  onClick={() => {
                    const result = addItem(product);
                    if (result.success) {
                      setAddedMsg('Producto agregado al carrito');
                    } else {
                      setAddedMsg(result.message);
                    }
                    setTimeout(() => setAddedMsg(null), 2500);
                  }}
                  disabled={items.some((i) => i.id === product.id && i.quantity >= (product.isUnique ? 1 : product.stock))}
                >
                  {items.some((i) => i.id === product.id) ? 'Ya en el carrito' : 'Agregar al carrito'}
                </Button>
                {addedMsg && <p className="product-detail__added-msg">{addedMsg}</p>}
              </>
            )}

            {product.status === 'reserved' && (
              <p className="product-detail__unavailable">
                Esta obra está reservada actualmente.
              </p>
            )}

            {product.status === 'sold' && (
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
