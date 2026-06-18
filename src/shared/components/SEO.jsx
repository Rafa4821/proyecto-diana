import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '@/app/providers/SiteSettingsContext';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.dianamorales.cl';

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  jsonLd,
  noindex = false,
}) {
  const { settings } = useSiteSettings();

  const siteName = settings.artistName || 'Diana';
  const fullTitle = title ? `${title} — ${siteName}` : `${siteName} — ${settings.tagline || 'Arte & Ilustración'}`;
  const metaDescription = description || settings.tagline || 'Ilustraciones y pinturas originales';
  const metaImage = image || settings.socialImageUrl || `${SITE_URL}/og-image.jpg`;
  const metaUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="es_CL" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Canonical */}
      <link rel="canonical" href={metaUrl} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
