import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type PatternName = 'Black'|'White'|'Red'|'Green'|'Blue'|'Cyan'|'Magenta'|'Yellow'|'Gray'|'Horizontal'|'Vertical'|'Checkerboard'|'Gradient';
type Marker = { id:number; x:number; y:number; seenOn:string; notes:string };
const COLOR_PATTERNS: {name:PatternName; color?:string; background?:string}[] = [
  {name:'Black',color:'#000000'}, {name:'White',color:'#ffffff'},
  {name:'Red',color:'#ff0000'}, {name:'Green',color:'#00ff00'},
  {name:'Blue',color:'#0000ff'}, {name:'Cyan',color:'#00ffff'},
  {name:'Magenta',color:'#ff00ff'}, {name:'Yellow',color:'#ffff00'},
  {name:'Gray',color:'#808080'},
  {name:'Horizontal',background:'repeating-linear-gradient(0deg,#000 0px,#000 12px,#fff 12px,#fff 24px)'},
  {name:'Vertical',background:'repeating-linear-gradient(90deg,#000 0px,#000 12px,#fff 12px,#fff 24px)'},
  {name:'Checkerboard',background:'repeating-conic-gradient(#222 0% 25%,#ddd 0% 50%) 50% / 64px 64px'},
  {name:'Gradient',background:'linear-gradient(90deg,#000,#444,#888,#ccc,#fff)'}
];
const LIMIT = 50;
const translations = {
 en:{start:'Start full-screen inspection',close:'Exit test',prev:'Previous color',next:'Next color',mark:'Mark suspect spot',stopMark:'Stop marking',show:'Show marks',hide:'Hide marks',undo:'Undo mark',export:'Export self-check JSON',marks:'Suspect spots',hint:'Inspect this static color carefully. Use Next / Previous, or arrow keys. Marking mode records approximate screen locations.',noCert:'User-observed self-check. This is not an automated hardware diagnosis, certification or warranty determination.',fullscreen:'Native fullscreen may be unavailable in this browser; the on-page overlay still works.',patch:'Static comparison patch',clear:'Clear spots'},
 pt:{start:'Iniciar inspeção em tela cheia',close:'Sair do teste',prev:'Cor anterior',next:'Próxima cor',mark:'Marcar ponto suspeito',stopMark:'Parar marcação',show:'Mostrar marcas',hide:'Ocultar marcas',undo:'Desfazer marca',export:'Exportar inspeção JSON',marks:'Pontos suspeitos',hint:'Observe cada cor estática. Use as setas para alternar e marque pontos suspeitos para revisão.',noCert:'Registro visual feito pelo usuário. Não é laudo, diagnóstico automático nem certificado de garantia.',fullscreen:'Se a tela cheia não funcionar neste navegador, a sobreposição continua disponível.',patch:'Área de comparação estática',clear:'Limpar marcas'}
};

export const ScreenInspection:React.FC<{mode?:'pixels'|'fixer'|'lines'|'retention'|'contrast';lang?:'en'|'pt-BR'}> = ({mode='pixels',lang='en'}) => {
 const copy=lang==='pt-BR'?translations.pt:translations.en;
 const allowedPatterns = useMemo(()=> {
   if(mode==='lines')return COLOR_PATTERNS;
   if(mode==='retention'||mode==='contrast')return COLOR_PATTERNS.filter(x=>['Black','White','Gray','Gradient','Checkerboard','Red','Green','Blue'].includes(x.name));
   if(mode==='fixer')return COLOR_PATTERNS.filter(x=>x.color);
   return COLOR_PATTERNS.filter(x=>x.color);
 },[mode]);
 const [active,setActive]=useState(false);
 const [patternIndex,setPatternIndex]=useState(0);
 const [markMode,setMarkMode]=useState(false);
 const [showMarks,setShowMarks]=useState(false);
 const [marks,setMarks]=useState<Marker[]>([]);
 const [patchPos,setPatchPos]=useState({x:50,y:50});
 const [patchSize,setPatchSize]=useState(140);
 const [patchColor,setPatchColor]=useState('#ff0000');
 const [fsWarn,setFsWarn]=useState(false);
 const ref=useRef<HTMLDivElement>(null);
 const nativeFullscreen=useRef(false);
 const current=allowedPatterns[patternIndex]??allowedPatterns[0];
 const next=useCallback(()=>setPatternIndex(i=>(i+1)%allowedPatterns.length),[allowedPatterns.length]);
 const prev=useCallback(()=>setPatternIndex(i=>(i-1+allowedPatterns.length)%allowedPatterns.length),[allowedPatterns.length]);
 const exit=useCallback(()=>{
   setActive(false);setMarkMode(false);
   if(nativeFullscreen.current && document.fullscreenElement){document.exitFullscreen().catch(()=>{});}
   nativeFullscreen.current=false;
 },[]);
 useEffect(()=>{
   if(!active)return;
   const oldOverflow=document.body.style.overflow;
   document.body.style.overflow='hidden';
   const onKey=(e:KeyboardEvent)=>{
     if(e.key==='Escape'){exit();return;}
     if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();e.key==='ArrowRight'?next():prev();}
   };
   const onVisibility=()=>{if(document.visibilityState==='hidden')exit();};
   const onFullscreen=()=>{if(nativeFullscreen.current && !document.fullscreenElement)exit();};
   document.addEventListener('keydown',onKey);
   document.addEventListener('visibilitychange',onVisibility);
   document.addEventListener('fullscreenchange',onFullscreen);
   return ()=>{document.body.style.overflow=oldOverflow;document.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onVisibility);document.removeEventListener('fullscreenchange',onFullscreen);};
 },[active,exit,next,prev]);
 const start=async()=>{
   setPatternIndex(0);setMarkMode(false);setShowMarks(false);setActive(true);setFsWarn(false);
   // Always render a fixed viewport overlay, including browsers that reject native fullscreen.
   if(ref.current && typeof ref.current.requestFullscreen==='function'){
     try {await ref.current.requestFullscreen();nativeFullscreen.current=true;} catch {setFsWarn(true);}
   }else{setFsWarn(true);}
 };
 const onCanvasClick=(e:React.MouseEvent<HTMLDivElement>)=>{
   if(!markMode && mode!=='fixer')return;
   const b=e.currentTarget.getBoundingClientRect();
   const x=Math.max(0,Math.min(1,(e.clientX-b.left)/b.width));
   const y=Math.max(0,Math.min(1,(e.clientY-b.top)/b.height));
   if(mode==='fixer' && !markMode){setPatchPos({x:x*100,y:y*100});return;}
   setMarks(items=>items.length>=LIMIT?items:[...items,{id:Date.now()+Math.random(),x,y,seenOn:current.name,notes:''}]);
   setShowMarks(true);
 };
 const download=()=>{
   const payload={
     kind:'user_observed_screen_inspection',certified:false,
     disclaimer:copy.noCert,createdAt:new Date().toISOString(),
     mode,locale:lang,viewport:{cssWidth:innerWidth,cssHeight:innerHeight,devicePixelRatio:devicePixelRatio},
     marks:marks.map(m=>({xRatio:m.x,yRatio:m.y,observedOn:m.seenOn,notes:m.notes}))
   };
   const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
   const url=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=url;a.download='screen-self-check.json';a.click();
   window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const patch=(mode==='fixer');
 return <>
   <div className="flex flex-wrap gap-3 items-center">
     <button type="button" onClick={start} className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 min-h-[48px]">{copy.start}</button>
     <span className="text-sm text-neutral-400">{copy.noCert}</span>
   </div>
   {marks.length>0 && <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
      <span className="text-neutral-300">{copy.marks}: {marks.length}</span>
      <button type="button" onClick={download} className="rounded border border-white/20 px-3 py-2 hover:bg-white/10">{copy.export}</button>
      <button type="button" onClick={()=>setMarks([])} className="rounded border border-white/20 px-3 py-2 hover:bg-white/10">{copy.clear}</button>
   </div>}
   {active && <div ref={ref} className="fixed inset-0 z-[110] bg-black text-white" role="dialog" aria-modal="true" aria-label={lang==='pt-BR'?'Inspeção de tela':'Screen inspection'}>
     <div className="absolute inset-0" role="presentation" onClick={onCanvasClick} style={{
       backgroundColor:current.color || '#000',
       backgroundImage:current.background?.split(' 50% /')[0],
       backgroundSize:current.background?.includes('50% /')?'64px 64px':undefined,
       cursor:markMode?'crosshair':patch?'crosshair':'default'
     }}>
       {patch && <div aria-hidden="true" className="absolute border-2 border-white shadow-lg pointer-events-none" style={{
         left:patchPos.x+'%',top:patchPos.y+'%',width:patchSize,height:patchSize,
         transform:'translate(-50%, -50%)',backgroundColor:patchColor,
         boxShadow:'0 0 0 2px #000'
       }}/>}
       {showMarks && marks.map((m,index)=><div aria-hidden="true" key={m.id} className="absolute h-6 w-6 rounded-full border-[3px] border-orange-500 pointer-events-none" style={{left:m.x*100+'%',top:m.y*100+'%',transform:'translate(-50%,-50%)',boxShadow:'0 0 0 1px #000'}}><span className="absolute bottom-full text-xs bg-black text-white px-1">{index+1}</span></div>)}
     </div>
     <div className="absolute left-3 top-3 right-3 flex flex-wrap gap-2 items-center justify-between rounded-lg bg-neutral-950/90 p-2 text-white text-sm border border-white/20">
       <span className="font-semibold px-2">{current.name} ({patternIndex+1}/{allowedPatterns.length})</span>
       <button type="button" onClick={exit} className="rounded-md px-4 py-2 min-h-[44px] bg-red-700 hover:bg-red-600">{copy.close} ×</button>
     </div>
     <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-neutral-950/95 border border-white/20 text-white p-3">
       {fsWarn && <p className="text-xs text-amber-300 pb-2">{copy.fullscreen}</p>}
       <p className="text-xs text-neutral-300 pb-2">{copy.hint}</p>
       <div className="flex flex-wrap gap-2 items-center justify-center">
         <button type="button" onClick={prev} className="rounded-md bg-white/15 hover:bg-white/25 px-3 py-2 min-h-[44px]">{copy.prev}</button>
         <button type="button" onClick={next} className="rounded-md bg-white/15 hover:bg-white/25 px-3 py-2 min-h-[44px]">{copy.next}</button>
         <button type="button" onClick={()=>setMarkMode(v=>!v)} className={'rounded-md px-3 py-2 min-h-[44px] '+(markMode?'bg-orange-600':'bg-white/15 hover:bg-white/25')}>{markMode?copy.stopMark:copy.mark}</button>
         <button type="button" onClick={()=>setShowMarks(v=>!v)} aria-pressed={showMarks} className="rounded-md bg-white/15 hover:bg-white/25 px-3 py-2 min-h-[44px]">{showMarks?copy.hide:copy.show} ({marks.length})</button>
         {marks.length>0 && <button type="button" onClick={()=>setMarks(m=>m.slice(0,-1))} className="rounded-md bg-white/15 hover:bg-white/25 px-3 py-2 min-h-[44px]">{copy.undo}</button>}
         {patch && <>
           <label className="text-xs">Patch <input aria-label="Static patch color" type="color" value={patchColor} onChange={e=>setPatchColor(e.target.value)} className="align-middle w-10 h-8"/></label>
           <label className="text-xs">Size <input aria-label="Patch size" type="range" min={40} max={320} value={patchSize} onChange={e=>setPatchSize(+e.target.value)}/></label>
         </>}
       </div>
       {marks.length>0 && <div className="flex justify-between items-center pt-2 text-xs text-neutral-300"><span>{copy.marks}: {marks.length}; CSS viewport coordinates, not physical pixel coordinates.</span><button type="button" onClick={download} className="underline text-blue-300">{copy.export}</button></div>}
     </div>
   </div>}
 </>;
};
export default ScreenInspection;
