import { siteConfig } from '@/shared/data/mockData';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <section className="about section">
      <div className="container">
        <div className="about__grid">
          <div className="about__image-col">
            <img
              className="about__photo"
              src={siteConfig.profilePhoto}
              alt={siteConfig.artistName}
              loading="lazy"
            />
          </div>

          <div className="about__content-col">
            <span className="text-uppercase">Sobre mí</span>
            <h1 className="about__name">{siteConfig.artistName}</h1>

            <blockquote className="about__statement">
              {siteConfig.statement}
            </blockquote>

            <div className="about__bio">
              {siteConfig.bio.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="about__links">
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="about__instagram"
              >
                Instagram {siteConfig.instagramHandle}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
