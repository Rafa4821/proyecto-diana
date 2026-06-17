import { Button } from '@/shared/ui';
import { siteConfig } from '@/shared/data/mockData';
import './ContactPage.css';

export default function ContactPage() {
  return (
    <section className="contact section">
      <div className="container">
        <div className="contact__grid">
          <div className="contact__info">
            <h1>Contacto</h1>
            <p className="contact__text">{siteConfig.contactText}</p>

            <div className="contact__channels">
              <div className="contact__channel">
                <span className="contact__channel-label">Email</span>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </div>
              <div className="contact__channel">
                <span className="contact__channel-label">Instagram</span>
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {siteConfig.instagramHandle}
                </a>
              </div>
            </div>
          </div>

          <form className="contact__form" onSubmit={(e) => e.preventDefault()}>
            <div className="contact__field">
              <label htmlFor="name">Nombre</label>
              <input type="text" id="name" placeholder="Tu nombre" />
            </div>
            <div className="contact__field">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="tu@email.com" />
            </div>
            <div className="contact__field">
              <label htmlFor="subject">Asunto</label>
              <input type="text" id="subject" placeholder="¿En qué puedo ayudarte?" />
            </div>
            <div className="contact__field">
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" rows="5" placeholder="Escribe tu mensaje aquí..." />
            </div>
            <Button type="submit">Enviar mensaje</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
