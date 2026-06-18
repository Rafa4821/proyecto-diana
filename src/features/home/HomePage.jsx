import { Link } from 'react-router-dom';
import { Button, Card, Grid } from '@/shared/ui';
import { useSiteSettings } from '@/app/providers/SiteSettingsContext';
import { usePages } from '@/app/providers/PagesContext';
import SEO from '@/shared/components/SEO';
import { artworks, products, formatPrice } from '@/shared/data/mockData';
import './HomePage.css';

const featuredArtworks = artworks.slice(0, 4);
const featuredProducts = products.filter((p) => p.featured).slice(0, 3);

export default function HomePage() {
  const { settings } = useSiteSettings();
  const { pages } = usePages();
  const page = pages.home;

  const heroTitle = page.heroTitle || settings.artistName || 'Diana';
  const heroSubtitle = page.heroSubtitle || settings.tagline || 'Ilustraciones y pinturas originales';
  const heroImage = page.heroImage || 'https://placehold.co/1200x600/f5f5f5/a3a3a3?text=Obra+Destacada';
  const ctaText = page.ctaText || '¿Te interesa una obra?';

  return (
    <>
      <SEO
        url="/"
        description={`${settings.artistName} — ${settings.tagline || 'Ilustraciones y pinturas originales'}`}
        image={heroImage}
      />
      <section className="hero section">
        <div className="container hero__inner">
          <span className="text-uppercase">Portfolio & Shop</span>
          <h1 className="hero__title">{heroTitle}</h1>
          <p className="hero__subtitle">{heroSubtitle}</p>
          <div className="hero__actions">
            <Button as={Link} to="/shop">Ver tienda</Button>
            <Button as={Link} to="/ilustraciones" variant="secondary">
              Explorar obras
            </Button>
          </div>
        </div>
      </section>

      <section className="hero-image section">
        <div className="container">
          <img
            className="hero-image__img"
            src={heroImage}
            alt="Obra destacada"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </section>

      {page.showFeaturedArtworks && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Ilustraciones destacadas</h2>
              <Link to="/ilustraciones" className="section-header__link text-uppercase">
                Ver todas →
              </Link>
            </div>
            <Grid>
              {featuredArtworks.map((work) => (
                <Card key={work.id}>
                  <Card.Image src={work.image} alt={work.title} />
                  <Card.Body>
                    <Card.Title>{work.title}</Card.Title>
                    <Card.Text>{work.technique}</Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </Grid>
          </div>
        </section>
      )}

      {page.showFeaturedProducts && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Obras disponibles</h2>
              <Link to="/shop" className="section-header__link text-uppercase">
                Ver shop →
              </Link>
            </div>
            <Grid>
              {featuredProducts.map((product) => (
                <Card key={product.id}>
                  <Card.Image src={product.images[0]} alt={product.title} />
                  <Card.Body>
                    <Card.Title>{product.title}</Card.Title>
                    <Card.Text>{formatPrice(product.price)}</Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </Grid>
          </div>
        </section>
      )}

      <section className="cta section">
        <div className="container cta__inner">
          <h2 className="cta__title">{ctaText}</h2>
          <p className="cta__text">
            Todas las piezas son originales y únicas. Visita la tienda para ver las obras disponibles.
          </p>
          <Button as={Link} to="/shop" size="lg">
            Ir al Shop
          </Button>
        </div>
      </section>
    </>
  );
}
