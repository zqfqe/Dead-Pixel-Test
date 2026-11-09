import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
type Name='Black'|'White'|'Red'|'Green'|'Blue'|'Cyan'|'Magenta'|'Yellow'|'Gray'|'Gray steps'|'Near black'|'Near white'|'Horizontal'|'Vertical'|'Horizontal fine'|'Vertical fine'|'Grid'|'Checkerboard'|'Gradient'|'Red gradient'|'Green gradient'|'Blue gradient'|'Black levels'|'White levels'|'Color bars';
type Pattern={name:Name;color?:string;background?:string;backgroundSize?:string};
type Category='unclassified'|'dark'|'bright'|'stuck-color'|'dust-or-surface'|'line-or-other'|'uncertain';
type Mark={id:string;x:number;y:number;colors:string[];notVisibleOn:string[];category:Category;notes:string;viewport:{width:number;height:number;dpr:number;orientation:string}};
const CORE:Name[]=['Black','White','Red','Green','Blue','Cyan','Magenta','Yellow'];
const PATTERNS:Pattern[]=[
{name:'Black',color:'#000'},{name:'White',color:'#fff'},{name:'Red',color:'#f00'},{name:'Green',color:'#0f0'},
{name:'Blue',color:'#00f'},{name:'Cyan',color:'#0ff'},{name:'Magenta',color:'#f0f'},{name:'Yellow',color:'#ff0'},
{name:'Gray',color:'#808080'},
{name:'Gray steps',background:'linear-gradient(90deg,#000 0 12.5%,#101010 12.5% 25%,#202020 25% 37.5%,#404040 37.5% 50%,#808080 50% 62.5%,#b0b0b0 62.5% 75%,#e0e0e0 75% 87.5%,#fff 87.5% 100%)'},
{name:'Near black',background:'linear-gradient(90deg,#000 0 12.5%,#010101 12.5% 25%,#020202 25% 37.5%,#030303 37.5% 50%,#050505 50% 62.5%,#080808 62.5% 75%,#0c0c0c 75% 87.5%,#101010 87.5% 100%)'},
{name:'Near white',background:'linear-gradient(90deg,#efefef 0 12.5%,#f2f2f2 12.5% 25%,#f5f5f5 25% 37.5%,#f7f7f7 37.5% 50%,#f9f9f9 50% 62.5%,#fbfbfb 62.5% 75%,#fdfdfd 75% 87.5%,#fff 87.5% 100%)'},
{name:'Horizontal',background:'repeating-linear-gradient(0deg,#000 0 12px,#fff 12px 24px)'},
{name:'Vertical',background:'repeating-linear-gradient(90deg,#000 0 12px,#fff 12px 24px)'},
{name:'Horizontal fine',background:'repeating-linear-gradient(0deg,#000 0 1px,#fff 1px 2px)'},
{name:'Vertical fine',background:'repeating-linear-gradient(90deg,#000 0 1px,#fff 1px 2px)'},
{name:'Grid',color:'#000',background:'repeating-linear-gradient(0deg,transparent 0 15px,#fff 15px 16px),repeating-linear-gradient(90deg,transparent 0 15px,#fff 15px 16px)'},
{name:'Checkerboard',background:'repeating-conic-gradient(#222 0% 25%,#ddd 0% 50%)',backgroundSize:'64px 64px'},
{name:'Gradient',background:'linear-gradient(90deg,#000,#444,#888,#ccc,#fff)'},
{name:'Red gradient',background:'linear-gradient(90deg,#000000,#550000,#aa0000,#ff0000)'},
{name:'Green gradient',background:'linear-gradient(90deg,#000000,#005500,#00aa00,#00ff00)'},
{name:'Blue gradient',background:'linear-gradient(90deg,#000000,#000055,#0000aa,#0000ff)'},
{name:'Black levels',background:'linear-gradient(90deg,#000 0 12.5%,#020202 12.5% 25%,#040404 25% 37.5%,#060606 37.5% 50%,#080808 50% 62.5%,#0b0b0b 62.5% 75%,#0d0d0d 75% 87.5%,#101010 87.5% 100%)'},
{name:'White levels',background:'linear-gradient(90deg,#efefef 0 12.5%,#f2f2f2 12.5% 25%,#f5f5f5 25% 37.5%,#f8f8f8 37.5% 50%,#fafafa 50% 62.5%,#fcfcfc 62.5% 75%,#fefefe 75% 87.5%,#ffffff 87.5% 100%)'},
{name:'Color bars',background:'linear-gradient(90deg,#fff 0 14.285%,#ff0 14.285% 28.57%,#0ff 28.57% 42.855%,#0f0 42.855% 57.14%,#f0f 57.14% 71.425%,#f00 71.425% 85.71%,#00f 85.71% 100%)'}
];
const PT_PATTERN_NAMES: Partial<Record<Name,string>>={
 Black:'Preto',White:'Branco',Red:'Vermelho',Green:'Verde',Blue:'Azul',
 Cyan:'Ciano',Magenta:'Magenta',Yellow:'Amarelo',Gray:'Cinza',
 'Gray steps':'Escala de cinza','Near black':'Quase preto','Near white':'Quase branco',
 Horizontal:'Linhas horizontais',Vertical:'Linhas verticais',
 'Horizontal fine':'Linhas horizontais finas','Vertical fine':'Linhas verticais finas',
 Grid:'Grade',Checkerboard:'Xadrez',Gradient:'Gradiente','Red gradient':'Gradiente vermelho','Green gradient':'Gradiente verde','Blue gradient':'Gradiente azul','Black levels':'Níveis próximos do preto','White levels':'Níveis próximos do branco','Color bars':'Barras de cores'
};
const TEXT={
 en:{start:'Start full-screen inspection',exit:'Exit test',prev:'Previous color',next:'Next color',mark:'Mark suspect spot',stop:'Stop marking',show:'Show marks',hide:'Hide marks',undo:'Undo mark',export:'Export self-check JSON',print:'Download printable HTML report',hint:'Inspect this static pattern. Arrow keys move between patterns. Marked positions are approximate CSS viewport ratios, not physical panel pixels.',disclaimer:'User-observed self-check only. Not an automated hardware diagnosis, certification or warranty decision.',fullscreen:'Native fullscreen was denied or unavailable. The on-page overlay remains usable.',device:'Device',monitor:'Monitor',laptop:'Laptop',phone:'Phone',tablet:'Tablet',other:'Other',marks:'Suspect spots',category:'Observation',uncategorized:'Not classified',dark:'Dark / black spot',bright:'Bright spot',stuck:'Color appears stuck',line:'Line or other pattern',unknown:'Not sure',dust:'Dust / surface mark',notes:'Notes',remove:'Remove',selected:'Selected spot',recheck:'Still visible on this color',notSeen:'Not visible on this color',clearCheck:'Clear this color check',recheckState:'This color',recordedVisible:'Visible',recordedAbsent:'Not visible',recordedUnknown:'Not checked',absentColors:'Not visible on',none:'No suspect spots recorded.',report:'Screen self-check report',created:'Created',screen:'Browser screen (CSS px)',viewport:'Viewport (CSS px)',dpr:'Device pixel ratio',orientation:'Orientation',colors:'Observed on',position:'Approximate position',clear:'Clear marks',patterns:'Patterns',jump:'Jump to',swipe:'Swipe horizontally on the test area to change patterns (or use the arrow keys).',maximum:'Maximum 50 spots. Remove a mark to add another.',preflight:'Before you start',preflightNote:'This checklist is a guide, not a requirement to start. Press Escape or use Exit test at any time.',session:'Session only — no automatic upload or saved account.',progress:'Patterns viewed',newSession:'New empty session',import:'Import previous JSON report (local only)',importOk:'Previous self-check loaded locally. Review each marked spot before continuing.',importInvalid:'This JSON is not a valid self-check report (up to 50 spots, max 128 KB).',minimal:'Hide controls',controls:'Show controls'},
 pt:{start:'Iniciar inspeção em tela cheia',exit:'Sair do teste',prev:'Cor anterior',next:'Próxima cor',mark:'Marcar ponto suspeito',stop:'Parar marcação',show:'Mostrar marcas',hide:'Ocultar marcas',undo:'Desfazer marca',export:'Exportar inspeção JSON',print:'Baixar relatório HTML para impressão',hint:'Observe este padrão estático. Use as setas para alternar. As posições são proporções aproximadas da área CSS visível, não pixels físicos.',disclaimer:'Registro visual do usuário. Não é diagnóstico automático, laudo técnico ou garantia.',fullscreen:'A tela cheia nativa não está disponível. A sobreposição continua funcionando.',device:'Dispositivo',monitor:'Monitor',laptop:'Notebook',phone:'Celular',tablet:'Tablet',other:'Outro',marks:'Pontos suspeitos',category:'Observação',uncategorized:'Não classificado',dark:'Ponto escuro / preto',bright:'Ponto brilhante',stuck:'Cor aparentemente presa',line:'Linha ou outro padrão',unknown:'Não sei',dust:'Poeira / marca na superfície',notes:'Observações',remove:'Remover',selected:'Ponto selecionado',recheck:'Ainda visível nesta cor',notSeen:'Não visível nesta cor',clearCheck:'Limpar confirmação desta cor',recheckState:'Nesta cor',recordedVisible:'Visível',recordedAbsent:'Não visível',recordedUnknown:'Não verificado',absentColors:'Não visível em',none:'Nenhum ponto suspeito registrado.',report:'Relatório de inspeção visual',created:'Criado em',screen:'Tela do navegador (px CSS)',viewport:'Área visível (px CSS)',dpr:'Proporção de pixels do dispositivo',orientation:'Orientação',colors:'Observado em',position:'Posição aproximada',clear:'Limpar marcas',patterns:'Padrões',jump:'Ir para',swipe:'Deslize na horizontal sobre a área do teste para mudar o padrão (ou use as setas do teclado).',maximum:'Limite de 50 pontos. Remova uma marca para adicionar outra.',preflight:'Antes de começar',preflightNote:'Este roteiro é uma orientação, não é obrigatório para iniciar. Pressione Escape ou use Sair do teste quando desejar.',session:'Somente nesta sessão — sem envio automático ou conta salva.',progress:'Padrões observados',newSession:'Nova sessão vazia',import:'Importar relatório JSON anterior (somente local)',importOk:'Inspeção anterior carregada localmente. Revise os pontos antes de continuar.',importInvalid:'O arquivo JSON não é um relatório de inspeção válido (até 50 pontos e 128 KB).',minimal:'Ocultar controles',controls:'Mostrar controles'}
};
const PRECHECK={
 en:[
  'Clean the glass gently and check whether dust or a screen protector could explain a spot.',
  'Move the browser window to the screen being checked and reduce bright reflections.',
  'Note Night Shift, HDR, display scaling and adaptive brightness before interpreting colors.',
  'Use comfortable brightness; never press, heat or strike the panel.'
 ],
 pt:[
  'Limpe o vidro com cuidado e veja se poeira ou película podem explicar o ponto.',
  'Mova a janela para a tela a testar e reduza reflexos intensos.',
  'Observe Night Shift, HDR, escala da tela e brilho automático antes de interpretar as cores.',
  'Use brilho confortável; nunca pressione, aqueça ou bata no painel.'
 ]
};
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const save=(body:string,type:string,name:string)=>{const u=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
export const ScreenInspection:React.FC<{mode?:'pixels'|'fixer'|'lines'|'retention'|'contrast';lang?:'en'|'pt-BR'}>=({mode='pixels',lang='en'})=>{
 const t=lang==='pt-BR'?TEXT.pt:TEXT.en;
 const patterns=useMemo(()=>{
 const select=(names:Name[])=>names.map(name=>PATTERNS.find(p=>p.name===name)).filter((p):p is Pattern=>Boolean(p));
 if(mode==='lines')return select(['Black','White','Red','Green','Blue','Horizontal','Vertical','Horizontal fine','Vertical fine','Grid']);
 if(mode==='retention')return select(['Gray','Near black','Near white','White','Black','Red','Green','Blue']);
 if(mode==='contrast')return select(['Black','White','Gray','Gray steps','Black levels','White levels','Gradient','Red gradient','Green gradient','Blue gradient','Color bars','Checkerboard','Near black','Near white']);
 return select(CORE);
},[mode]);
const modeHint=mode==='lines'
 ? (lang==='pt-BR'?'Compare fundos sólidos e padrões de linhas grossas e finas. Linhas finas são pixels CSS e podem não coincidir com pixels físicos do painel.':'Compare solid-color fields with coarse and fine line patterns. Fine lines are CSS pixels and may not align with physical panel pixels.')
 : mode==='retention'
 ? (lang==='pt-BR'?'Observe um fundo cinza neutro em busca de contornos residuais. Alterne cores por pouco tempo; este teste não distingue nem repara burn-in permanente.':'Look for a ghost outline on neutral gray. Change patterns briefly; this test cannot distinguish or repair permanent burn-in.')
 : mode==='contrast' ? (lang==='pt-BR'?'Compare níveis de preto e branco, gradientes suaves e barras de cor. Isto não mede nits, contraste físico ou cobertura de gama.':'Compare black and white levels, smooth color ramps and color bars. This is not a calibrated measurement of nits, physical contrast or gamut.') : t.hint;
 const [importStatus,setImportStatus]=useState(''),[active,setActive]=useState(false),[index,setIndex]=useState(0),[viewed,setViewed]=useState<Name[]>([]),[hideControls,setHideControls]=useState(false),[markMode,setMarkMode]=useState(false),[showMarks,setShowMarks]=useState(false),[marks,setMarks]=useState<Mark[]>([]),[selected,setSelected]=useState(''),[device,setDevice]=useState('monitor'),[started,setStarted]=useState(''),[ran,setRan]=useState(false),[warning,setWarning]=useState(false),[patchColor,setPatchColor]=useState('#f00'),[patchSize,setPatchSize]=useState(140),[patchPos,setPatchPos]=useState({x:50,y:50});
 const root=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDivElement>(null),startButton=useRef<HTMLButtonElement>(null),native=useRef(false);
 const touchStart=useRef<{x:number;y:number}|null>(null);
 const patternLabel=(name:Name)=>lang==='pt-BR'?(PT_PATTERN_NAMES[name]??name):name;
 const current=patterns[index]??patterns[0],isFixer=mode==='fixer';
 useEffect(()=>{if(active)setViewed(prev=>prev.includes(current.name)?prev:[...prev,current.name]);},[active,current.name]);
 const beginNewSession=()=>{setImportStatus('');setMarks([]);setSelected('');setStarted('');setViewed([]);setRan(false);setShowMarks(false);setMarkMode(false);};
 const next=useCallback(()=>setIndex(i=>(i+1)%patterns.length),[patterns.length]),prev=useCallback(()=>setIndex(i=>(i-1+patterns.length)%patterns.length),[patterns.length]);
 const onTouchStart=(e:React.TouchEvent<HTMLDivElement>)=>{
   if(markMode||isFixer||e.touches.length!==1){touchStart.current=null;return;}
   touchStart.current={x:e.touches[0].clientX,y:e.touches[0].clientY};
 };
 const onTouchEnd=(e:React.TouchEvent<HTMLDivElement>)=>{
   const begin=touchStart.current;touchStart.current=null;
   if(!begin||markMode||isFixer||!e.changedTouches.length)return;
   const dx=e.changedTouches[0].clientX-begin.x;
   const dy=e.changedTouches[0].clientY-begin.y;
   if(Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy)*1.4){dx<0?next():prev();}
 };
 const view=()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,orientation:screen.orientation?.type??(innerWidth>=innerHeight?'landscape':'portrait')});
 const exit=useCallback(()=>{setActive(false);setMarkMode(false);if(native.current&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});native.current=false;requestAnimationFrame(()=>startButton.current?.focus());},[]);
 useEffect(()=>{if(!active)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';
 const key=(e:KeyboardEvent)=>{const el=e.target as HTMLElement;const form=['INPUT','SELECT','TEXTAREA'].includes(el?.tagName)||el?.isContentEditable;if(e.key==='Escape'){e.preventDefault();exit();}else if(e.key==='Tab'){const list=dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])');if(list?.length){const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}else if(!form&&e.key==='ArrowRight'){e.preventDefault();next();}else if(!form&&e.key==='ArrowLeft'){e.preventDefault();prev();}};
 const visibility=()=>{if(document.visibilityState==='hidden')exit();},full=()=>{if(native.current&&!document.fullscreenElement)exit();};
 document.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);document.addEventListener('fullscreenchange',full);dialog.current?.querySelector<HTMLElement>('button')?.focus();
 return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('fullscreenchange',full);};
 },[active,exit,next,prev]);
 const start=async()=>{touchStart.current=null;setHideControls(false);setIndex(0);setMarkMode(false);setShowMarks(false);setActive(true);setWarning(false);setRan(true);setStarted(x=>x||new Date().toISOString());if(root.current&&typeof root.current.requestFullscreen==='function'){try{await root.current.requestFullscreen();native.current=true;}catch{setWarning(true);}}else setWarning(true);};
 const mark=(e:React.MouseEvent<HTMLDivElement>)=>{if(!markMode&&!isFixer)return;const b=e.currentTarget.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-b.left)/b.width)),y=Math.max(0,Math.min(1,(e.clientY-b.top)/b.height));if(isFixer&&!markMode){setPatchPos({x:x*100,y:y*100});return;}if(marks.length>=50)return;const id=crypto.randomUUID?.()??String(Date.now());setMarks(v=>[...v,{id,x,y,colors:[current.name],notVisibleOn:[],category:'unclassified',notes:'',viewport:view()}]);setSelected(id);setShowMarks(true);};
 const update=(id:string,p:Partial<Mark>)=>setMarks(v=>v.map(m=>m.id===id?{...m,...p}:m));
 const setColorObservation=(id:string,color:Name,status:'visible'|'absent'|'unknown')=>{
   setMarks(items=>items.map(item=>{
     if(item.id!==id)return item;
     const colors=item.colors.filter(name=>name!==color);
     const notVisibleOn=item.notVisibleOn.filter(name=>name!==color);
     if(status==='visible')colors.push(color);
     if(status==='absent')notVisibleOn.push(color);
     return {...item,colors,notVisibleOn};
   }));
 };
 const currentMark=marks.find(m=>m.id===selected);
 const currentObservation=currentMark?.colors.includes(current.name)?'visible':currentMark?.notVisibleOn.includes(current.name)?'absent':'unknown';
 const payload=()=>({kind:'user_observed_screen_inspection',certified:false,disclaimer:t.disclaimer,createdAt:started||new Date().toISOString(),deviceType:device,browserScreen:{cssWidth:screen.width,cssHeight:screen.height},viewport:view(),observedPatterns:viewed,observedCount:viewed.length,totalPatterns:patterns.length,marks:marks.map(m=>({xRatio:m.x,yRatio:m.y,observedOn:m.colors,notObservedOn:m.notVisibleOn,category:m.category,notes:m.notes,viewportAtMark:m.viewport}))});
 const importJson=async(e:React.ChangeEvent<HTMLInputElement>)=>{
  const file=e.currentTarget.files?.[0];
  e.currentTarget.value='';
  if(!file)return;
  try{
    if(file.size<2||file.size>128*1024)throw Error('invalid file size');
    const raw:unknown=JSON.parse(await file.text());
    if(!raw||typeof raw!=='object')throw Error('invalid JSON');
    const report=raw as Record<string,unknown>;
    if(report.kind!=='user_observed_screen_inspection'||report.certified!==false||!Array.isArray(report.marks)||report.marks.length>50)throw Error('incorrect report type');
    const allowedCategories=new Set<Category>(['unclassified','dark','bright','stuck-color','dust-or-surface','line-or-other','uncertain']);
    const allowedPatterns=new Set<string>(PATTERNS.map(p=>p.name));
    const normalizeNames=(value:unknown):string[]=>{
      if(!Array.isArray(value)||value.length>30||!value.every(x=>typeof x==='string'&&allowedPatterns.has(x)))throw Error('invalid pattern names');
      return [...new Set(value as string[])];
    };
    const imported:Mark[]=report.marks.map((row:unknown)=>{
      if(!row||typeof row!=='object')throw Error('invalid mark');
      const m=row as Record<string,unknown>;
      const x=Number(m.xRatio),y=Number(m.yRatio);
      if(typeof m.xRatio!=='number'||typeof m.yRatio!=='number'||!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1||y<0||y>1)throw Error('invalid coordinates');
      const colors=normalizeNames(m.observedOn);
      const notVisibleOn=normalizeNames(m.notObservedOn??[]);
      if(colors.some(c=>notVisibleOn.includes(c)))throw Error('conflicting observations');
      if(typeof m.category!=='string'||!allowedCategories.has(m.category as Category))throw Error('unknown category');
      if(typeof m.notes!=='string'||m.notes.length>500)throw Error('invalid notes');
      const v=m.viewportAtMark;
      const viewport= v&&typeof v==='object' ? v as Record<string,unknown> : null;
      const measured=viewport&&
        typeof viewport.width==='number'&&Number.isFinite(viewport.width)&&viewport.width>0&&viewport.width<25000&&
        typeof viewport.height==='number'&&Number.isFinite(viewport.height)&&viewport.height>0&&viewport.height<25000&&
        typeof viewport.dpr==='number'&&Number.isFinite(viewport.dpr)&&viewport.dpr>0&&viewport.dpr<=20&&
        typeof viewport.orientation==='string'&&viewport.orientation.length<=80
        ? {width:viewport.width as number,height:viewport.height as number,dpr:viewport.dpr as number,orientation:viewport.orientation as string}
        : view();
      return {id:crypto.randomUUID?.()??String(Date.now()+Math.random()),x,y,colors,notVisibleOn,category:m.category as Category,notes:m.notes,viewport:measured};
    });
    const observed=report.observedPatterns===undefined?[]:normalizeNames(report.observedPatterns);
    const validDate=typeof report.createdAt==='string'&&report.createdAt.length<=40&&!Number.isNaN(Date.parse(report.createdAt));
    const deviceType=typeof report.deviceType==='string'&&['monitor','laptop','phone','tablet','other'].includes(report.deviceType)?report.deviceType:'other';
    setMarks(imported);
    setSelected(imported[0]?.id??'');
    setShowMarks(imported.length>0);
    setViewed(observed as Name[]);
    setDevice(deviceType);
    setStarted(validDate?report.createdAt as string:new Date().toISOString());
    setRan(true);
    setImportStatus(t.importOk);
  }catch{
    setImportStatus(t.importInvalid);
  }
};
const exportJson=()=>save(JSON.stringify(payload(),null,2),'application/json;charset=utf-8','screen-self-check.json');
 const printReport=()=>{const p=payload(),rows=marks.map((m,i)=>'<tr><td>'+(i+1)+'</td><td>'+(m.x*100).toFixed(1)+'%, '+(m.y*100).toFixed(1)+'%</td><td>'+esc(m.colors.join(', ')||'—')+'</td><td>'+esc(m.notVisibleOn.join(', ')||'—')+'</td><td>'+esc(m.category)+'</td><td>'+esc(m.notes||'—')+'</td></tr>').join('');const html='<!doctype html><html lang="'+(lang==='pt-BR'?'pt-BR':'en')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>'+t.report+'</title><style>body{font:16px/1.5 system-ui;max-width:900px;margin:32px auto;padding:0 20px;color:#17202c}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccd3dc;padding:8px;text-align:left}.notice{padding:12px;background:#eef2f7}@media print{body{margin:0}}</style></head><body><h1>'+t.report+'</h1><p class="notice">'+t.disclaimer+'</p><p>'+t.created+': '+esc(p.createdAt)+'</p><p>'+t.device+': '+esc(device)+'</p><p>'+t.screen+': '+screen.width+' × '+screen.height+'</p><p>'+t.viewport+': '+innerWidth+' × '+innerHeight+'</p><p>'+t.dpr+': '+devicePixelRatio+'</p><h2>'+t.marks+': '+marks.length+'</h2>'+(rows?'<table><thead><tr><th>#</th><th>'+t.position+'</th><th>'+t.colors+'</th><th>'+t.absentColors+'</th><th>'+t.category+'</th><th>'+t.notes+'</th></tr></thead><tbody>'+rows+'</tbody></table>':'<p>'+t.none+'</p>')+'<p class="notice">'+t.hint+'</p><p>'+t.progress+': '+p.observedCount+'/'+p.totalPatterns+'</p><p><button type="button" onclick="window.print()" style="font:inherit;padding:10px 18px;cursor:pointer">Print this report</button></p><small>'+(lang==='pt-BR'?'As coordenadas são proporções da área visível, não pixels físicos. Nenhuma imagem da tela é capturada.':'Coordinates are viewport ratios, not physical pixels. No screen image is captured.')+'</small></body></html>';save(html,'text/html;charset=utf-8','screen-self-check-report.html');};
 return <div ref={root}>
 <div className="mb-4 rounded-xl border border-white/10 bg-neutral-900/60 p-4">
  <h3 className="mb-2 text-sm font-semibold text-white">{t.preflight}</h3>
  <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-neutral-300">{(lang==='pt-BR'?PRECHECK.pt:PRECHECK.en).map(item=><li key={item}>{item}</li>)}</ul>
  <p className="mt-3 text-xs text-neutral-400">{t.preflightNote}</p>
 </div>
 <div className="mt-3 mb-3 flex flex-wrap items-center gap-3 text-sm">
  <label className="font-medium text-neutral-300">{t.import}
    <input type="file" accept=".json,application/json" aria-label={t.import} onChange={importJson}
      className="ml-2 max-w-full rounded-lg border border-white/25 bg-neutral-900 p-2 text-xs text-white file:mr-3 file:rounded file:border-0 file:bg-blue-700 file:px-3 file:py-2 file:text-white" />
  </label>
  {importStatus&&<p role="status" className="text-xs text-neutral-200">{importStatus}</p>}
 </div>
 <div className="flex flex-wrap items-center gap-3"><button ref={startButton} type="button" onClick={start} className="rounded-lg bg-blue-600 px-6 py-3 min-h-[48px] font-semibold text-white">{t.start}</button><label className="flex items-center gap-2 text-sm">{t.device}<select value={device} onChange={e=>setDevice(e.target.value)} className="rounded border border-white/20 bg-neutral-900 p-2 text-white"><option value="monitor">{t.monitor}</option><option value="laptop">{t.laptop}</option><option value="phone">{t.phone}</option><option value="tablet">{t.tablet}</option><option value="other">{t.other}</option></select></label><span className="text-sm text-neutral-400">{t.disclaimer}</span></div>
 <p className="mt-3 text-xs text-neutral-400">{t.session}{ran?' · '+t.progress+': '+viewed.length+'/'+patterns.length:''}</p>
 {ran&&<div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={exportJson} className="rounded border border-white/20 px-3 py-2 text-sm">{t.export}</button><button type="button" onClick={printReport} className="rounded border border-white/20 px-3 py-2 text-sm">{t.print}</button>{marks.length>0&&<button type="button" onClick={()=>{setMarks([]);setSelected('');}} className="rounded border border-white/20 px-3 py-2 text-sm">{t.clear}</button>}
 <button type="button" onClick={beginNewSession} className="rounded border border-white/20 px-3 py-2 text-sm">{t.newSession}</button></div>}
 {marks.length>0&&<section className="mt-4 rounded-xl border border-white/10 bg-neutral-950 p-4"><h3 className="mb-3 font-semibold">{t.marks}: {marks.length}</h3>{marks.map((m,i)=><article key={m.id} className="mb-3 rounded-lg border border-white/10 p-3"><div className="flex justify-between gap-2"><strong>{t.selected} {i+1}</strong><button type="button" onClick={()=>{setMarks(v=>v.filter(x=>x.id!==m.id));if(selected===m.id)setSelected('');}} className="text-sm text-red-300 underline">{t.remove}</button></div><p className="mt-1 text-xs text-neutral-400">{t.position}: {(m.x*100).toFixed(1)}%, {(m.y*100).toFixed(1)}% · {t.colors}: {m.colors.join(', ')||'—'} · {t.absentColors}: {m.notVisibleOn.join(', ')||'—'}</p><label className="mt-3 block text-sm">{t.category}<select value={m.category} onChange={e=>update(m.id,{category:e.target.value as Category})} className="mt-1 block w-full rounded border border-white/20 bg-neutral-900 p-2">{Object.entries({unclassified:t.uncategorized,dark:t.dark,bright:t.bright,'stuck-color':t.stuck,'dust-or-surface':t.dust,'line-or-other':t.line,uncertain:t.unknown}).map(([v,l])=><option value={v}>{l}</option>)}</select></label><label className="mt-3 block text-sm">{t.notes}<textarea value={m.notes} maxLength={500} rows={2} onChange={e=>update(m.id,{notes:e.target.value})} className="mt-1 block w-full rounded border border-white/20 bg-neutral-900 p-2"/></label></article>)}</section>}
 {active&&<div ref={dialog} role="dialog" aria-modal="true" aria-label={lang==='pt-BR'?'Inspeção de tela':'Screen inspection'} tabIndex={-1} className="fixed inset-0 z-[110] bg-black text-white">
 <div role="presentation" onClick={mark} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="absolute inset-0 select-none" style={{backgroundColor:current.color||'#000',backgroundImage:current.background,backgroundSize:current.backgroundSize,cursor:markMode||isFixer?'crosshair':'default',touchAction:markMode||isFixer?'none':'pan-y'}}>
 {isFixer&&<div aria-hidden="true" className="pointer-events-none absolute border-2 border-white" style={{left:patchPos.x+'%',top:patchPos.y+'%',width:patchSize,height:patchSize,transform:'translate(-50%,-50%)',background:patchColor}}/>}
 {showMarks&&marks.map((m,i)=><div aria-hidden="true" key={m.id} className="pointer-events-none absolute h-6 w-6 rounded-full border-[3px] border-orange-500" style={{left:m.x*100+'%',top:m.y*100+'%',transform:'translate(-50%,-50%)'}}><span className="absolute bottom-full bg-black px-1 text-xs">{i+1}</span></div>)}</div>
 <div className="absolute left-3 right-3 top-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/20 bg-neutral-950/95 p-2 text-sm"><span aria-live="polite" className="px-2 font-semibold">{patternLabel(current.name)} ({index+1}/{patterns.length})</span>
 <div className="flex items-center gap-2"><button type="button" onClick={()=>setHideControls(v=>!v)} aria-expanded={!hideControls} className="min-h-[44px] rounded-md border border-white/40 bg-neutral-800 px-3 py-2">{hideControls?t.controls:t.minimal}</button><button type="button" onClick={exit} className="min-h-[44px] rounded-md bg-red-700 px-4 py-2">{t.exit} ×</button></div></div>
 {!hideControls&&<div className="absolute bottom-3 left-3 right-3 max-h-[45vh] overflow-y-auto rounded-xl border border-white/20 bg-neutral-950/95 p-3"><p className="pb-2 text-xs text-neutral-300">{warning&&t.fullscreen} {modeHint}</p><div className="flex flex-wrap items-center justify-center gap-2"><button type="button" onClick={prev} className="min-h-[44px] rounded bg-white/15 px-3 py-2">{t.prev}</button><button type="button" onClick={next} className="min-h-[44px] rounded bg-white/15 px-3 py-2">{t.next}</button><button type="button" onClick={()=>setMarkMode(v=>!v)} className="min-h-[44px] rounded bg-orange-700 px-3 py-2" aria-pressed={markMode}>{markMode?t.stop:t.mark}</button><button type="button" onClick={()=>setShowMarks(v=>!v)} aria-pressed={showMarks} className="min-h-[44px] rounded bg-white/15 px-3 py-2">{showMarks?t.hide:t.show} ({marks.length})</button>{marks.length>0&&<button type="button" onClick={()=>{setMarks(v=>v.slice(0,-1));setSelected(marks.length>1?marks[marks.length-2].id:'');}} className="min-h-[44px] rounded bg-white/15 px-3 py-2">{t.undo}</button>}{marks.length>0&&<label className="text-xs">{t.selected}<select aria-label={t.selected} value={selected} onChange={e=>setSelected(e.target.value)} className="ml-2 rounded bg-neutral-900 p-2">{marks.map((m,i)=><option value={m.id}>{t.selected} {i+1}</option>)}</select></label>}{currentMark && <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-neutral-900/75 p-2" role="group" aria-label={t.recheckState+': '+patternLabel(current.name)}>
 <span className="text-xs text-neutral-300">{t.recheckState}: <strong>{currentObservation==='visible'?t.recordedVisible:currentObservation==='absent'?t.recordedAbsent:t.recordedUnknown}</strong></span>
 <button type="button" aria-pressed={currentObservation==='visible'} onClick={()=>setColorObservation(selected,current.name,'visible')} className="min-h-[44px] rounded bg-blue-700 px-3 py-2 text-xs">{t.recheck}</button>
 <button type="button" aria-pressed={currentObservation==='absent'} onClick={()=>setColorObservation(selected,current.name,'absent')} className="min-h-[44px] rounded bg-neutral-700 px-3 py-2 text-xs">{t.notSeen}</button>
 <button type="button" onClick={()=>setColorObservation(selected,current.name,'unknown')} className="min-h-[44px] rounded border border-white/30 px-3 py-2 text-xs">{t.clearCheck}</button>
 </div>}{isFixer&&<><label className="text-xs">Patch <input aria-label="Static patch color" type="color" value={patchColor} onChange={e=>setPatchColor(e.target.value)} className="h-8 w-10 align-middle"/></label><label className="text-xs">Size <input aria-label="Patch size" type="range" min={40} max={320} value={patchSize} onChange={e=>setPatchSize(Number(e.target.value))}/></label></>}</div><div className="mt-3 border-t border-white/15 pt-3">
  <p className="mb-2 text-xs text-neutral-300">{t.patterns} · {t.swipe}</p>
  <div role="group" aria-label={t.patterns} className="flex gap-2 overflow-x-auto pb-2">
    {patterns.map((pattern,i)=><button key={pattern.name} type="button" onClick={()=>setIndex(i)}
      aria-label={t.jump+' '+patternLabel(pattern.name)}
      aria-current={i===index?'step':undefined}
      className={'shrink-0 min-h-[44px] rounded-md border px-3 text-xs font-semibold '+(i===index?'border-blue-400 bg-blue-700 text-white':'border-white/25 bg-white/10 text-white')}
    >{i+1}. {patternLabel(pattern.name)}</button>)}
  </div>
</div>
{marks.length>=50&&<p role="status" className="pt-2 text-center text-xs text-amber-200">{t.maximum}</p>}
<p className="pt-2 text-center text-xs text-neutral-400">{t.disclaimer}</p></div>}
 </div>}
 </div>;
};
export default ScreenInspection;
