import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MENU_ITEMS } from '../data/menu';
import { BLOG_POSTS } from '../data/blog';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p: string) => path.resolve(__dirname, '..', p);

const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8');

// Load Server Entry
const { render } = await import(toAbsolute('dist/server/entry-server.js'));

// Determine Routes
const routesToPrerender = ['/'];

// Add Menu Items
MENU_ITEMS.forEach(item => {
  if (!item.isHeader && !item.path.startsWith('http')) {
    routesToPrerender.push(item.path);
  }
});

// Add Blog Posts
BLOG_POSTS.forEach(post => {
  routesToPrerender.push(`/blog/${post.slug}`);
});

// Static Pages
routesToPrerender.push('/about', '/contact', '/privacy-policy', '/terms-of-service');

// Add specific 404 route for generation
routesToPrerender.push('/404');

// Deduplicate
const uniqueRoutes = [...new Set(routesToPrerender)];

(async () => {
  console.log(`🚀 Prerendering ${uniqueRoutes.length} routes...`);

  for (const url of uniqueRoutes) {
    try {
      const { html: appHtml, helmet } = render(url);
      
      // Inject Helmet Head Tags
      let headTags = '';
      if (helmet) {
        if (helmet.title) headTags += helmet.title.toString();
        if (helmet.meta) headTags += helmet.meta.toString();
        if (helmet.link) headTags += helmet.link.toString();
        if (helmet.script) headTags += helmet.script.toString();
      }

      // Replace placeholders
      // Note: We inject headTags before </head>
      // We inject appHtml into #root
      
      let html = template
        .replace(`<!--app-html-->`, appHtml)
        .replace(`<div id="root"></div>`, `<div id="root">${appHtml}</div>`);
      
      if (headTags) {
        html = html.replace(`</head>`, `${headTags}</head>`);
      }

      // Determine File Path
      let filePath;
      
      if (url === '/404') {
        // Special handling for 404: Save as 404.html in root
        // This allows Cloudflare/Netlify/Vercel to serve it as the actual 404 page
        filePath = 'dist/static/404.html';
      } else {
        // Standard handling: e.g. /about -> about/index.html
        filePath = `dist/static${url === '/' ? '/index.html' : `${url}/index.html`}`;
      }

      const absoluteFilePath = toAbsolute(filePath);
      const dir = path.dirname(absoluteFilePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(absoluteFilePath, html);
      console.log(`✨ Generated: ${url} -> ${filePath}`);
    } catch (e) {
      console.error(`❌ Error generating ${url}:`, e);
    }
  }
  
  console.log('✅ Prerendering complete.');
})();