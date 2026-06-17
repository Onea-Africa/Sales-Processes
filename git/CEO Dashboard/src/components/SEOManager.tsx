import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  getCanonicalUrl,
  getMeta,
  getStructuredData,
  normalizePathname,
  shouldNoIndex,
} from '../seo/siteMetadata';

export default function SEOManager() {
  const { pathname, search } = useLocation();
  const normalizedPathname = normalizePathname(pathname);
  const meta = getMeta(normalizedPathname);
  const canonical = getCanonicalUrl(normalizedPathname);
  const isArticle = normalizedPathname.startsWith('/blog/') || normalizedPathname.startsWith('/case-studies/');
  const robots = shouldNoIndex(normalizedPathname, search) ? 'noindex, nofollow' : 'index, follow';
  const structuredData = getStructuredData(normalizedPathname);

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={isArticle ? 'article' : 'website'} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:site_name" content="Onea Africa" />
      <meta property="og:image" content="https://onea.africa/og-image.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content="https://onea.africa/og-image.png" />

      {structuredData.map((entry, index) => (
        <script key={`${normalizedPathname}-schema-${index}`} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  );
}
