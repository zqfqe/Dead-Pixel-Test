import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
const origin='https://deadpixeltest.cc';
const required=[
'/','/tests/refresh-rate','/tests/local-dimming','/tests/color-gradient','/tests/audio-sync','/tests/test-patterns',
'/laptop-screen-dead-pixel-test/','/dead-pixel-fixer/','/phone-screen-dead-pixel-test/','/what-is-a-dead-pixel/',
'/dead-pixel-line-test/','/image-retention-test/','/screen-resolution-test/','/screen-contrast-test/',
'/pt-br/','/pt-br/pixel-morto-notebook/','/pt-br/pixel-morto-iphone/','/pt-br/reparar-pixel-preso/',
'/pt-br/o-que-e-dead-pixel/','/pt-br/teste-de-cores/'
];
const errors=[];
const urls=readFileSync('dist/sitemap.xml','utf8');
for(const path of required){
 const output=join('dist',path==='/'?'index.html':path.replace(/^\//,'').replace(/\/$/,'')+'/index.html');
 if(!existsSync(output)){errors.push('Missing static HTML: '+output);continue;}
 const html=readFileSync(output,'utf8');
 if(!/<title>[^<]+<\/title>/.test(html))errors.push('Missing title: '+path);
 if(!/rel="canonical"/.test(html))errors.push('Missing canonical: '+path);
 if(!/<meta name="description"/.test(html))errors.push('Missing description: '+path);
 const expected=origin+path;
 if(!urls.includes(expected))errors.push('Missing sitemap entry: '+expected);
 if(path.startsWith('/pt-br/')&&!/lang="pt-BR"/.test(html))errors.push('Missing pt-BR HTML lang: '+path);
 if(path.startsWith('/pt-br/') && !/<h1/.test(html))errors.push('Missing static H1: '+path);
}
if(urls.includes('<lastmod>'))errors.push('Sitemap contains invented lastmod dates.');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('PASS: '+required.length+' Astro routes, meta, indexable pt-BR content and sitemap preservation.');
