import { writeFileSync } from 'fs';
import { MENU_ITEMS } from '../data/menu';
import { BLOG_POSTS } from '../data/blog';

// Configuration
const DOMAIN = 'https://deadpixeltest.cc';
const OUTPUT_PATH = 'public/sitemap.xml';

// Static pages that are not in the main menu but should be indexed
const STATIC_PAGES = [
  { path: '/about', priority: '0.5', changefreq: 'yearly' },
  { path: '/contact', priority: '0.5', changefreq: 'yearly' },
  { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.4', changefreq: 'yearly' },
];

const generateSitemap = () => {
  const urls: string[] = [];
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Helper to add URL
  const addUrl = (path: string, priority: string, changefreq: string) => {
    // Remove trailing slash for consistency, but ensure domain has no trailing slash
    let cleanPath = path.startsWith('/') ? path : `/${path}`;
    // Encode URL to handle special characters safely
    const loc = `${DOMAIN}${cleanPath === '/' ? '' : cleanPath}`;
    
    urls.push(`<url><loc>${loc}</loc><lastmod>${date}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`);
  };

  console.log('🔍 Scanning routes...');

  // 1. Core Tools from Menu
  MENU_ITEMS.forEach(item => {
    // Skip headers and external links
    if (item.isHeader || item.path.startsWith('http')) return;

    // Determine priority
    let priority = '0.8';
    let changefreq = 'monthly';

    if (item.path === '/') {
      priority = '1.0';
      changefreq = 'weekly';
    } else if (item.path === '/blog') {
      priority = '0.9';
      changefreq = 'daily';
    }

    addUrl(item.path, priority, changefreq);
  });

  // 2. Blog Posts
  BLOG_POSTS.forEach(post => {
    addUrl(`/blog/${post.slug}`, '0.7', 'monthly');
  });

  // 3. Static Footer Pages
  STATIC_PAGES.forEach(page => {
    addUrl(page.path, page.priority, page.changefreq);
  });

  // Construct XML - NO WHITESPACE before <?xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  // Write file
  try {
    writeFileSync(OUTPUT_PATH, sitemap.trim());
    console.log(`✅ Sitemap generated successfully at ${OUTPUT_PATH}`);
    console.log(`   - Total URLs: ${urls.length}`);
  } catch (error) {
    console.error('❌ Error writing sitemap:', error);
    (process as any).exit(1);
  }
};

generateSitemap();