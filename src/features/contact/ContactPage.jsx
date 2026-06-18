import { Button } from '@/shared/ui';
import { useSiteSettings } from '@/app/providers/SiteSettingsContext';
import { usePages } from '@/app/providers/PagesContext';
import SEO from '@/shared/components/SEO';
import './ContactPage.css';

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const { pages } = usePages();
  const page = pages.contact;

  const email = page.visibleEmail || settings.email || '';
  const instagram = page.visibleInstagram || settings.instagram || '';
  const instagramUrl = instagram.startsWith('http')
    ? instagram
    : `https://instagram.com/${instagram.replace('@', '')}`;
  const contactText = page.text || settings.contactText || 'Si tienes alguna consulta, no dudes en escribirme.';

  return (
    <section className="contact section">
      <SEO
        title="Contacto"
        description="Consultas sobre obras, encargos personalizados o cualquier otra cosa."
        url="/contacto"
      />
      <div className="container">
        <div className="contact__grid">
          <div className="contact__info">
            <h1>{page.title || 'Contacto'}</h1>
            <p className="contact__text">{contactText}</p>

            <div className="contact__channels">
              {email && (
                <div className="contact__channel">
                  <span className="contact__channel-label">Email</span>
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
              )}
              {instagram && (
                <div className="contact__channel">
                  <span className="contact__channel-label">Instagram</span>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {instagram}
                  </a>
                </div>
              )}
              {settings.whatsapp && (
                <div className="contact__channel">
                  <span className="contact__channel-label">WhatsApp</span>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {settings.whatsapp}
                  </a>
                </div>
              )}
            </div>

            {page.customOrdersText && (
              <div className="contact__custom-orders">
                <h3>Encargos personalizados</h3>
                <p>{page.customOrdersText}</p>
              </div>
            )}
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
