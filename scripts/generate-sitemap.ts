import {writeFileSync} from 'node:fs';
import {MENU_ITEMS} from '../data/menu';
import {BLOG_POSTS} from '../data/blog';
import {SEO_LANDING_PAGES, pageAlternates} from '../data/seoLandingPages';

const DOMAIN='https://deadpixeltest.cc';
const staticPaths=['/about','/contact','/privacy-policy','/terms-of-service'];
const allPaths=new Set<string>();
for(const item of MENU_ITEMS){
 if(!item.isHeader && item.path.startsWith('/'))allPaths.add(item.path);
}
for(const page of SEO_LANDING_PAGES)allPaths.add(page.path);
for(const post of BLOG_POSTS)allPaths.add('/blog/'+post.slug);
for(const path of staticPaths)allPaths.add(path);
allPaths.add('/');
// Keep existing GSC-performing URLs. The root is the canonical dead-pixel landing
// page; the same React test is also available at /tests/dead-pixel but that
// duplicate path is intentionally excluded from the sitemap.
allPaths.delete('/tests/dead-pixel');
const escapeXml=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const canonical=(path:string)=>DOMAIN+(path==='/'?'':path);
const entries=[...allPaths].sort().map(path=>{
 const alternates=pageAlternates(path);
 const links=alternates.map(item=>'<xhtml:link rel="alternate" hreflang="'+item.lang+'" href="'+escapeXml(canonical(item.path))+'"/>').join('');
 return '  <url><loc>'+escapeXml(canonical(path))+'</loc>'+links+'</url>';
});
const xml='<?xml version="1.0" encoding="UTF-8"?>\n'+
 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+
 entries.join('\n')+'\n</urlset>\n';
writeFileSync('public/sitemap.xml',xml,'utf8');
console.log('Generated sitemap:',entries.length,'canonical routes; no artificial lastmod dates.');
