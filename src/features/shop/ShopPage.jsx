import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Grid, SkeletonGrid } from '@/shared/ui';
import { useSiteSettings } from '@/app/providers/SiteSettingsContext';
import SEO from '@/shared/components/SEO';
import { getProducts } from '@/features/products/productsService';
import './ShopPage.css';

const ITEMS_PER_PAGE = 12;

function formatPrice(p) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(p);
}

const STATUS_LABELS = {
  published: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
};

export default function ShopPage() {
  const { settings } = useSiteSettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const all = await getProducts();
      const filtered = all.filter((p) => {
        if (!p.showInShop) return false;
        if (p.status === 'draft' || p.status === 'archived') return false;
        if (p.status === 'sold' && !settings.showSoldProducts) return false;
        if (p.status === 'reserved' && !settings.showOutOfStock) return false;
        return true;
      });
      setProducts(filtered);
    } catch (err) {
      setError('Error al cargar los productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount]
  );

  const hasMore = visibleCount < products.length;

  return (
    <section className="shop section">
      <SEO
        title="Shop"
        description="Obras originales disponibles para compra. Cada pieza es única."
        url="/shop"
      />
      <div className="container">
        <div className="shop__header">
          <h1>Shop</h1>
          <p className="shop__intro">
            Obras originales disponibles para compra. Cada pieza es única.
          </p>
        </div>

        {error && <div className="shop__error">{error}</div>}

        {loading ? (
          <SkeletonGrid count={8} />
        ) : products.length === 0 ? (
          <div className="shop__empty">
            <p>No hay productos disponibles en este momento.</p>
          </div>
        ) : (
          <>
            <Grid>
              {visibleProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <Link to={`/shop/${product.slug}`} className="product-card__link">
                    <div className="product-card__image-wrapper">
                      <img
                        className="product-card__image"
                        src={product.mainImageUrl || (product.images && product.images[0]) || 'https://placehold.co/400x500/f5f5f5/a3a3a3?text=Sin+imagen'}
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                      />
                      {product.status !== 'published' && (
                        <span className={`product-card__badge product-card__badge--${product.status}`}>
                          {STATUS_LABELS[product.status] || product.status}
                        </span>
                      )}
                    </div>
                    <div className="product-card__body">
                      <h3 className="product-card__title">{product.title}</h3>
                      <p className="product-card__price">{formatPrice(product.price)}</p>
                      {product.technique && (
                        <p className="product-card__technique">{product.technique}</p>
                      )}
                    </div>
                  </Link>
                  <div className="product-card__actions">
                    {product.status === 'published' ? (
                      <Button as={Link} to={`/shop/${product.slug}`} variant="secondary" size="sm">
                        Ver detalle
                      </Button>
                    ) : (
                      <span className="product-card__unavailable-label">
                        {STATUS_LABELS[product.status]}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </Grid>
            {hasMore && (
              <div className="shop__load-more">
                <Button
                  variant="secondary"
                  onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                >
                  Cargar más productos
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
