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
  jsonLd?: Record<string, any>; // Custom Structured Data
  breadcrumbs?: BreadcrumbItem[]; // New prop for breadcrumbs
  noindex?: boolean; // New prop to prevent indexing
}

const DOMAIN = 'https://deadpixeltest.cc';

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  canonical, 
  type = 'website', 
  image = '/og-image.jpg', 
  keywords = [],
  jsonLd,
  breadcrumbs,
  noindex = false
}) => {
  const siteTitle = 'DeadPixelTest.cc';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
  const url = canonical ? `${DOMAIN}${canonical}` : DOMAIN;
  const fullImage = image.startsWith('http') ? image : `${DOMAIN}${image}`;

  // Construct Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${DOMAIN}${item.path}`
    }))
  } : null;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={url} />
      
      {/* Robots Control */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
      
      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
};