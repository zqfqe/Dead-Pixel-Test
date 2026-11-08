import React, {useEffect} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {SEO} from '../common/SEO';
import {SEO_PAGE_BY_PATH, pageAlternates} from '../../data/seoLandingPages';
import ScreenInspection from '../tests/ScreenInspection';

const ScreenInfo:React.FC=()=>{
 const [dimensions,setDimensions]=React.useState<{screenW:number;screenH:number;viewportW:number;viewportH:number;dpr:number}|null>(null);
 useEffect(()=>{
  const update=()=>setDimensions({screenW:window.screen.width,screenH:window.screen.height,viewportW:window.innerWidth,viewportH:window.innerHeight,dpr:window.devicePixelRatio});
  update();window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update);
 },[]);
 if(!dimensions)return <p className="text-neutral-400">Screen dimensions become available when JavaScript loads.</p>;
 return <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{[
  ['Screen width (CSS px)',dimensions.screenW],['Screen height (CSS px)',dimensions.screenH],
  ['Viewport width (CSS px)',dimensions.viewportW],['Viewport height (CSS px)',dimensions.viewportH],
  ['Device pixel ratio',dimensions.dpr]
 ].map(([name,value])=><div key={name} className="rounded-xl border border-white/10 bg-white/5 p-4">
  <dt className="text-xs text-neutral-400">{name}</dt><dd className="text-xl font-mono font-bold pt-1">{value}</dd>
 </div>)}</div>;
};

const SeoLandingPage:React.FC = ()=>{
 const location=useLocation();
 const path=location.pathname.replace(/\/$/,'')||'/';
 const page=SEO_PAGE_BY_PATH[path];
 if(!page)return <div className="max-w-3xl mx-auto py-20"><h1 className="text-3xl font-bold">Page unavailable</h1><Link to="/">Go to screen test</Link></div>;
 const isBR=page.lang==='pt-BR';
 const alternates=pageAlternates(page.path);
 const testingMode=page.mode==='guide'?'pixels':page.mode==='resolution'?'pixels':page.mode;
 const sections=page.mode==='fixer'?[isBR?'Inspeção sem flashes':'Static pixel comparison']:page.mode==='guide'?[isBR?'Como diferenciar pixels':'How to distinguish pixel faults']:[isBR?'Teste visual gratuito':'Free visual self-test'];
 const related=(isBR?['/pt-br/','/pt-br/pixel-morto-notebook/','/pt-br/pixel-morto-iphone/','/pt-br/reparar-pixel-preso/','/pt-br/o-que-e-dead-pixel/','/pt-br/teste-de-cores/']:['/','/laptop-screen-dead-pixel-test/','/dead-pixel-fixer/','/phone-screen-dead-pixel-test/','/what-is-a-dead-pixel/','/dead-pixel-line-test/','/image-retention-test/','/screen-resolution-test/','/screen-contrast-test/']).filter(p=>p!==page.path);
 return <>
 <SEO title={page.title} description={page.description} canonical={page.path} disableSuffix
   language={page.lang} alternates={alternates}
   jsonLd={{'@context':'https://schema.org','@type':page.mode==='guide'?'WebPage':'WebApplication',
     name:page.h1,url:'https://deadpixeltest.cc'+page.path,description:page.description,
     ...(page.mode==='guide'?{}:{applicationCategory:'UtilitiesApplication',operatingSystem:'Web Browser',
     offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}})}}
 />
 <div className="max-w-5xl mx-auto py-4 md:py-8">
   <nav aria-label="Breadcrumb" className="text-xs text-neutral-400 pb-6 flex gap-2"><Link to="/" className="hover:text-blue-300">Home</Link><span>/</span><span>{page.h1}</span></nav>
   <div className="rounded-2xl border border-blue-900/30 bg-neutral-950 px-5 py-8 md:px-9 md:py-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">{isBR?'Ferramenta online gratuita':'Free browser-based screen check'}</p>
      <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">{page.h1}</h1>
      <p className="text-neutral-300 text-base md:text-lg leading-8 max-w-3xl mt-5">{page.lead}</p>
      <div className="mt-7">
        {page.mode==='resolution'?<ScreenInfo/>:<ScreenInspection mode={testingMode as 'pixels'|'fixer'|'lines'|'retention'|'contrast'} lang={page.lang}/>}
      </div>
      <p className="mt-5 text-xs text-neutral-500">{isBR?'Inspeção visual manual. Sem diagnóstico automático ou certificação.':'Visual inspection only. This tool does not automatically detect hardware faults or issue a certified report.'}</p>
   </div>
   <section className="mt-12 grid md:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)] gap-8">
     <div>
       <h2 className="text-2xl font-bold">{isBR?'Como fazer o teste':'How to run this check'}</h2>
       <ol className="mt-5 space-y-4">{page.steps.map((step,i)=><li key={i} className="flex gap-4 leading-7 text-neutral-300"><span className="shrink-0 h-7 w-7 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-bold flex items-center justify-center">{i+1}</span>{step}</li>)}</ol>
     </div>
     <aside className="rounded-xl p-5 bg-neutral-900 border border-white/10">
       <h2 className="font-semibold text-lg">{isBR?'Atenção antes do teste':'Before you begin'}</h2>
       <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
        <li>{isBR?'Limpe a tela e reduza reflexos.':'Clean the surface and reduce reflections.'}</li>
        <li>{isBR?'Use a tela que deseja avaliar; ajuste brilho com cuidado.':'Check the intended display and choose comfortable brightness.'}</li>
        <li>{isBR?'Considere HDR, filtros de luz azul e zoom.':'Account for HDR, night filters and display zoom.'}</li>
       </ul>
     </aside>
   </section>
   <section className="mt-12">
     {sections.map(s=><h2 key={s} className="text-2xl font-bold mb-5">{s}</h2>)}
     <div className="grid sm:grid-cols-2 gap-4">{page.notes.map((note,i)=><div key={i} className="border border-white/10 bg-neutral-900/40 p-5 rounded-xl leading-7 text-neutral-300">{note}</div>)}</div>
   </section>
   <section className="mt-12">
     <h2 className="text-2xl font-bold">{isBR?'Perguntas frequentes':'Frequently asked questions'}</h2>
     <div className="mt-5 space-y-4">{page.faq.map((faq,i)=><article key={i} className="border border-white/10 rounded-xl p-5"><h3 className="text-lg font-semibold">{faq.question}</h3><p className="mt-3 text-neutral-300 leading-7">{faq.answer}</p></article>)}</div>
   </section>
   <section className="mt-12 border-t border-white/10 pt-10">
     <h2 className="text-2xl font-bold mb-5">{isBR?'Outras ferramentas':'Related screen tests'}</h2>
     <div className="flex flex-wrap gap-3">{related.map(route=>{
       const target=SEO_PAGE_BY_PATH[route.replace(/\/$/,'')||'/'];
       const label=target?.h1 || (route==='/'?'Dead Pixel Test':'Teste de Pixel Morto');
       return <Link key={route} to={route} className="rounded-lg border border-white/15 px-4 py-3 text-sm hover:border-blue-400 hover:text-blue-300">{label}</Link>;
     })}</div>
   </section>
 </div>
 </>;
};
export default SeoLandingPage;
