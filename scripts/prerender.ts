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

console.log(`🚀 Prerendering ${routes.size} pages...`);

// 2. Iterate and render
for (const url of routes) {
  const context = {};
  const { html, head } = render(url, context);

  // Replace placeholders
  const appHtml = template
    .replace('<!-- app-head -->', head)
    .replace('<!-- app-html -->', html);

  // Determine file path
  // / -> index.html
  // /about -> about/index.html
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const filePath = cleanUrl === '' 
    ? 'dist/static/index.html' 
    : `dist/static${cleanUrl}/index.html`;

  const fullPath = toAbsolute(filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, appHtml);
  console.log(`✓ Generated ${filePath}`);
}

console.log('✨ Prerendering complete.');
