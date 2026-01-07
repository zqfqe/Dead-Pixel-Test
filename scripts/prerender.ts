import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MENU_ITEMS } from '../data/menu';
import { BLOG_POSTS } from '../data/blog';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p: string) => path.resolve(__dirname, '..', p);

const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8');
const { render } = await import(toAbsolute('dist/server/entry-server.js'));

// 1. Gather all routes
const routes = new Set<string>();

// Add core pages from menu
MENU_ITEMS.forEach(item => {
  if (item.isHeader || item.path.startsWith('http')) return;
  routes.add(item.path);
});

// Add blog posts
BLOG_POSTS.forEach(post => {
  routes.add(`/blog/${post.slug}`);
});

// Add static footer pages
['/about', '/contact', '/privacy-policy', '/terms-of-service'].forEach(p => routes.add(p));

// Add 404 explicitly
routes.add('/404');

console.log(`🚀 Prerendering ${routes.size} pages...`);

// 2. Iterate and render
for (const url of routes) {
  const context = {};
  // For 404, we render the generic Not Found component (mapped to *)
  // We pass the explicit url so the router matches it.
  const renderUrl = url === '/404' ? '/non-existent-route-trigger-404' : url;
  
  const { html, head } = render(renderUrl, context);

  // Replace placeholders
  const appHtml = template
    .replace('<!-- app-head -->', head)
    .replace('<!-- app-html -->', html);

  // Determine file path
  let filePath = '';
  if (url === '/404') {
    filePath = 'dist/static/404.html';
  } else {
    // / -> index.html
    // /about -> about/index.html
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    filePath = cleanUrl === '' 
      ? 'dist/static/index.html' 
      : `dist/static${cleanUrl}/index.html`;
  }

  const fullPath = toAbsolute(filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, appHtml);
  console.log(`✓ Generated ${filePath}`);
}

console.log('✨ Prerendering complete.');