import { useState, useEffect, useMemo } from 'react';
import { Card, Grid, SkeletonGrid, Button } from '@/shared/ui';
import SEO from '@/shared/components/SEO';
import { getPublishedArtworks } from './artworksService';
import { getCategories } from './categoriesService';
import './ArtworksPage.css';

const ITEMS_PER_PAGE = 12;

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadArtworks(activeFilter || undefined);
  }, [activeFilter]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [arts, cats] = await Promise.all([
        getPublishedArtworks(),
        getCategories('artwork'),
      ]);
      setArtworks(arts);
      setCategories(cats);
    } catch (err) {
      setError('Error al cargar las ilustraciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadArtworks(categoryId) {
    try {
      setError(null);
      setVisibleCount(ITEMS_PER_PAGE);
      const arts = await getPublishedArtworks(categoryId);
      setArtworks(arts);
    } catch (err) {
      setError('Error al filtrar ilustraciones.');
      console.error(err);
    }
  }

  const visibleArtworks = useMemo(
    () => artworks.slice(0, visibleCount),
    [artworks, visibleCount]
  );

  const hasMore = visibleCount < artworks.length;

  return (
    <section className="artworks section">
      <SEO
        title="Ilustraciones"
        description="Galería de ilustraciones originales en diferentes técnicas y formatos."
        url="/ilustraciones"
      />
      <div className="container">
        <div className="artworks__header">
          <h1>Ilustraciones</h1>
          <p className="artworks__intro">
            Una selección de trabajos en diferentes técnicas y formatos.
          </p>
        </div>

        {error && <div className="artworks__error">{error}</div>}

        {categories.length > 0 && (
          <div className="artworks__filters">
            <button
              className={`artworks__filter ${activeFilter === '' ? 'artworks__filter--active' : ''}`}
              onClick={() => setActiveFilter('')}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`artworks__filter ${activeFilter === cat.id ? 'artworks__filter--active' : ''}`}
                onClick={() => setActiveFilter(cat.id)}
              >
                {cat.label || cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <SkeletonGrid count={8} />
        ) : artworks.length === 0 ? (
          <div className="artworks__empty">
            <p>No hay ilustraciones disponibles en este momento.</p>
          </div>
        ) : (
          <>
            <Grid>
              {visibleArtworks.map((work) => (
                <Card key={work.id}>
                  <Card.Image
                    src={work.imageUrl || 'https://placehold.co/400x500/f5f5f5/a3a3a3?text=Sin+imagen'}
                    alt={work.title}
                  />
                  <Card.Body>
                    <Card.Title>{work.title}</Card.Title>
                    <Card.Text>
                      {[work.technique, work.dimensions, work.year].filter(Boolean).join(' · ')}
                    </Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </Grid>
            {hasMore && (
              <div className="artworks__load-more">
                <Button
                  variant="secondary"
                  onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                >
                  Cargar más ilustraciones
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
