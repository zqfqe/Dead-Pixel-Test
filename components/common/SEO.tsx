import React from 'react';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'article' | 'WebApplication';
  image?: string;
  keywords?: string[];
  jsonLd?: Record<string, any>;
  breadcrumbs?: BreadcrumbItem[];
  noindex?: boolean;
  language?: 'en' | 'pt-BR';
  alternates?: {lang:string;path:string}[];
  disableSuffix?: boolean;
}

const configuredOrigin = import.meta.env.PUBLIC_SITE_URL?.trim();
const ORIGIN = configuredOrigin ? new URL(configuredOrigin).origin : '';

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  type = 'website',
  image = '/og-image.jpg',
  keywords = [],
  jsonLd,
  breadcrumbs,
  noindex = false,
  language,
  alternates = [],
  disableSuffix = false
}) => {
  // Astro owns production metadata. Legacy React islands must not duplicate it.
  if (typeof document !== 'undefined' && document.documentElement.hasAttribute('data-astro-site')) {
    return null;
  }

  const siteTitle = 'DeadPixelTest';
  const fullTitle = disableSuffix ? title : (title === siteTitle ? title : title + ' | ' + siteTitle);
  const url = canonical && ORIGIN ? new URL(canonical, ORIGIN).toString() : undefined;
  const fullImage = image.startsWith('http') ? image : (ORIGIN ? new URL(image, ORIGIN).toString() : undefined);
  const breadcrumbSchema = ORIGIN && breadcrumbs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, ORIGIN).toString()
    }))
  } : null;

  return (
    <Helmet>
      {language && <html lang={language} />}
      {ORIGIN && alternates.map(item=><link key={item.lang} rel="alternate" hrefLang={item.lang} href={new URL(item.path, ORIGIN).toString()} />)}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      {url && <link rel="canonical" href={url} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {fullImage && <meta property="og:image" content={fullImage} />}
      <meta property="og:site_name" content={siteTitle} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {fullImage && <meta name="twitter:image" content={fullImage} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c')}</script>}
    </Helmet>
  );
};
