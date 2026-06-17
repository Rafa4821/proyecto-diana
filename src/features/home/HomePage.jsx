import { Link } from 'react-router-dom';
import { Button, Card, Grid } from '@/shared/ui';
import { siteConfig, artworks, products, formatPrice } from '@/shared/data/mockData';
import './HomePage.css';

const featuredArtworks = artworks.slice(0, 4);
const featuredProducts = products.filter((p) => p.featured).slice(0, 3);

export default function HomePage() {
  return (
    <>
      <section className="hero section">
        <div className="container hero__inner">
          <span className="text-uppercase">Portfolio & Shop</span>
          <h1 className="hero__title">{siteConfig.artistName}</h1>
          <p className="hero__subtitle">{siteConfig.heroPhrase}</p>
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
            src={siteConfig.heroImage}
            alt="Obra destacada"
            loading="lazy"
          />
        </div>
      </section>

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

      <section className="cta section">
        <div className="container cta__inner">
          <h2 className="cta__title">¿Te interesa una obra?</h2>
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
