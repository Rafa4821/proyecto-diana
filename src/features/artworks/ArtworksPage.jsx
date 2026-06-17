import { useState } from 'react';
import { Card, Grid } from '@/shared/ui';
import { artworks, categories } from '@/shared/data/mockData';
import './ArtworksPage.css';

export default function ArtworksPage() {
  const [activeFilter, setActiveFilter] = useState('todas');

  const filtered = activeFilter === 'todas'
    ? artworks
    : artworks.filter((a) => a.category === activeFilter);

  return (
    <section className="artworks section">
      <div className="container">
        <div className="artworks__header">
          <h1>Ilustraciones</h1>
          <p className="artworks__intro">
            Una selección de trabajos en diferentes técnicas y formatos.
          </p>
        </div>

        <div className="artworks__filters">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`artworks__filter ${activeFilter === cat.id ? 'artworks__filter--active' : ''}`}
              onClick={() => setActiveFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <Grid>
          {filtered.map((work) => (
            <Card key={work.id}>
              <Card.Image src={work.image} alt={work.title} />
              <Card.Body>
                <Card.Title>{work.title}</Card.Title>
                <Card.Text>{work.technique} · {work.year}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </Grid>

        {filtered.length === 0 && (
          <p className="artworks__empty">No hay obras en esta categoría aún.</p>
        )}
      </div>
    </section>
  );
}
