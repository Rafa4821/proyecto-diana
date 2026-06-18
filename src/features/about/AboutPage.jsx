import { useSiteSettings } from '@/app/providers/SiteSettingsContext';
import { usePages } from '@/app/providers/PagesContext';
import SEO from '@/shared/components/SEO';
import './AboutPage.css';

export default function AboutPage() {
  const { settings } = useSiteSettings();
  const { pages } = usePages();
  const page = pages.about;

  const photo = page.profilePhoto || 'https://placehold.co/500x600/f5f5f5/a3a3a3?text=Retrato';
  const bio = page.bio || '';
  const statement = page.statement || '';
  const instagram = settings.instagram || '';
  const instagramUrl = instagram.startsWith('http')
    ? instagram
    : `https://instagram.com/${instagram.replace('@', '')}`;

  return (
    <section className="about section">
      <SEO
        title="Sobre mí"
        description={`Conoce a ${settings.artistName} — Ilustradora y pintora.`}
        image={photo}
        url="/sobre-mi"
      />
      <div className="container">
        <div className="about__grid">
          <div className="about__image-col">
            <img
              className="about__photo"
              src={photo}
              alt={settings.artistName}
              loading="lazy"
            />
          </div>

          <div className="about__content-col">
            <span className="text-uppercase">{page.title || 'Sobre mí'}</span>
            <h1 className="about__name">{settings.artistName || 'Diana'}</h1>

            {statement && (
              <blockquote className="about__statement">
                {statement}
              </blockquote>
            )}

            {bio && (
              <div className="about__bio">
                {bio.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {instagram && (
              <div className="about__links">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about__instagram"
                >
                  Instagram {instagram}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
