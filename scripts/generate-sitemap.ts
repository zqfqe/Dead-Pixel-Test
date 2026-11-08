import {writeFileSync} from 'node:fs';
import {MENU_ITEMS} from '../data/menu';
import {BLOG_POSTS} from '../data/blog';
import {SEO_LANDING_PAGES, pageAlternates} from '../data/seoLandingPages';

const configuredSiteUrl=process.env.PUBLIC_SITE_URL?.trim();
let origin='';
if(configuredSiteUrl){
 const parsed=new URL(configuredSiteUrl);
 if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.pathname!=='/'||parsed.search||parsed.hash){
  throw new Error('PUBLIC_SITE_URL must be the HTTPS origin only, e.g. https://your-domain.com');
 }
 origin=parsed.origin;
}

const escapeXml=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const canonical=(path:string)=>origin+(path==='/'?'/':path.replace(/\/+$/,''));
const allPaths=new Set<string>();
if(origin){
 const staticPaths=['/about','/contact','/privacy-policy','/terms-of-service'];
 for(const item of MENU_ITEMS){
  if(!item.isHeader&&item.path.startsWith('/'))allPaths.add(item.path);
 }
 for(const page of SEO_LANDING_PAGES)if(page.indexable)allPaths.add(page.path);
for(const page of SEO_LANDING_PAGES)if(!page.indexable)allPaths.delete(page.path);
 for(const post of BLOG_POSTS)allPaths.add('/blog/'+post.slug);
 for(const path of staticPaths)allPaths.add(path);
 allPaths.add('/');
 // The old hash/client test route is not a separate index target.
 allPaths.delete('/tests/dead-pixel');
}

const entries=[...allPaths].sort().map(path=>{
 const alternates=pageAlternates(path);
 const links=alternates.map(item=>'<xhtml:link rel="alternate" hreflang="'+item.lang+'" href="'+escapeXml(canonical(item.path))+'"/>').join('');
 return '  <url><loc>'+escapeXml(canonical(path))+'</loc>'+links+'</url>';
});
const xml='<?xml version="1.0" encoding="UTF-8"?>\n'+
 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+
 entries.join('\n')+'\n</urlset>\n';
const robots=origin
 ? 'User-agent: *\nAllow: /\n\nSitemap: '+origin+'/sitemap.xml\n'
 : 'User-agent: *\nAllow: /\n';
writeFileSync('public/sitemap.xml',xml,'utf8');
writeFileSync('public/robots.txt',robots,'utf8');
console.log(origin
 ? 'Generated sitemap for '+entries.length+' canonical routes.'
 : 'PUBLIC_SITE_URL is not configured: generated an empty sitemap and crawlable robots.txt; page HTML will be noindex until a real domain is configured.');
