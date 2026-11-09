import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Search,ArrowRight,CornerDownLeft,Command,X} from 'lucide-react';
import {MENU_ITEMS} from '../../data/menu';

const canonicalToolPath=(path:string)=>path==='/'?'/':path.replace(/\/+$/,'');
const matchingTools=(query:string)=>MENU_ITEMS.filter(item=>
 !item.isHeader&&item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())
);

const CommandPalette:React.FC=()=>{
 const [isOpen,setIsOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [selectedIndex,setSelectedIndex]=useState(0);
 const selectedRef=useRef(0);
 const inputRef=useRef<HTMLInputElement>(null);
 const dialogRef=useRef<HTMLDivElement>(null);
 const openerRef=useRef<HTMLElement|null>(null);
 const filteredItems=matchingTools(query);

 const close=useCallback(()=>{
  setIsOpen(false);
  const previous=openerRef.current;
  window.requestAnimationFrame(()=>{if(previous?.isConnected)previous.focus();});
 },[]);

 useEffect(()=>{
  const toggle=(event:KeyboardEvent)=>{
   if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
    event.preventDefault();
    if(isOpen)close();
    else{
     openerRef.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
     setIsOpen(true);
    }
   }else if(isOpen&&event.key==='Escape'){
    event.preventDefault();close();
   }
  };
  window.addEventListener('keydown',toggle);
  return()=>window.removeEventListener('keydown',toggle);
 },[isOpen,close]);

 useEffect(()=>{
  if(!isOpen){setQuery('');return;}
  selectedRef.current=0;
  setSelectedIndex(0);
  const frame=window.requestAnimationFrame(()=>inputRef.current?.focus());
  return()=>window.cancelAnimationFrame(frame);
 },[isOpen]);

 useEffect(()=>{
  if(!isOpen)return;
  const handleNav=(event:KeyboardEvent)=>{
   // Leave native Enter/Space behavior untouched for focused links and buttons.
   if(document.activeElement!==inputRef.current)return;
   const matches=matchingTools(inputRef.current?.value??'');
   if(event.key==='ArrowDown'||event.key==='ArrowUp'){
    event.preventDefault();
    if(!matches.length)return;
    const delta=event.key==='ArrowDown'?1:-1;
    const next=(selectedRef.current+delta+matches.length)%matches.length;
    selectedRef.current=next;
    setSelectedIndex(next);
   }else if(event.key==='Enter'&&matches[selectedRef.current]){
    event.preventDefault();
    // Always load Astro's own document so canonical/robots metadata is correct.
    window.location.assign(canonicalToolPath(matches[selectedRef.current].path));
   }
  };
  window.addEventListener('keydown',handleNav);
  return()=>window.removeEventListener('keydown',handleNav);
 },[isOpen]);

 // A modal must also retain focus if a browser/assistive-technology action
 // attempts to focus the background (not only when Tab bubbles from a child).
 useEffect(()=>{
  if(!isOpen)return;
  const keepFocusInside=(event:FocusEvent)=>{
   if(dialogRef.current&&event.target instanceof Node&&!dialogRef.current.contains(event.target)){
    inputRef.current?.focus();
   }
  };
  document.addEventListener('focusin',keepFocusInside);
  return()=>document.removeEventListener('focusin',keepFocusInside);
 },[isOpen]);

 const trapTab=(event:React.KeyboardEvent<HTMLDivElement>)=>{
  if(event.key!=='Tab')return;
  const nodes=[...(dialogRef.current?.querySelectorAll<HTMLElement>(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])'
  )??[])].filter(node=>node.getClientRects().length>0);
  if(!nodes.length)return;
  const first=nodes[0],last=nodes[nodes.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  else if(!dialogRef.current?.contains(document.activeElement)){event.preventDefault();first.focus();}
 };

 if(!isOpen)return null;
 return (
  <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
   <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} aria-hidden="true" />
   <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Search tools" onKeyDown={trapTab}
    className="relative w-full max-w-lg rounded-xl border border-white/15 bg-[#111B1A] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
     <Search className="text-neutral-400" size={20} aria-hidden="true" />
     <input ref={inputRef} autoFocus type="text" aria-label="Search tools" aria-controls="tool-search-results"
      placeholder="Search tools..." className="flex-1 min-w-0 bg-transparent text-white placeholder-neutral-400 outline-none text-sm h-9 focus-visible:ring-2 focus-visible:ring-[#C5F277] rounded"
      value={query} onChange={event=>{setQuery(event.target.value);selectedRef.current=0;setSelectedIndex(0);}} />
     <button type="button" onClick={close} aria-label="Close search"
      className="min-h-[40px] min-w-[40px] rounded-md border border-white/20 text-neutral-200 hover:text-white focus-visible:outline-2 focus-visible:outline-[#C5F277]">
      <X size={18} className="mx-auto" aria-hidden="true" />
     </button>
    </div>
    <nav id="tool-search-results" aria-label="Search results" className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
     {filteredItems.length===0?(
      <p className="px-4 py-8 text-center text-neutral-300 text-sm">No results found.</p>
     ):filteredItems.map((item,idx)=>(
      <a key={item.path} href={canonicalToolPath(item.path)}
       onMouseEnter={()=>{selectedRef.current=idx;setSelectedIndex(idx);}}
       onFocus={()=>{selectedRef.current=idx;setSelectedIndex(idx);}}
       className={'mx-2 flex items-center justify-between rounded-lg px-4 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5F277] '+
        (idx===selectedIndex?'bg-[#345343] text-[#F3FFDD]':'text-neutral-300 hover:text-white hover:bg-white/10')}>
       <span className="flex items-center gap-3">
        <span className={'rounded-md p-1.5 '+(idx===selectedIndex?'bg-white/20':'bg-white/5')}><ArrowRight size={14} aria-hidden="true" /></span>
        <span className="font-medium">{item.title}</span>
       </span>
       {idx===selectedIndex&&<CornerDownLeft size={14} className="opacity-70" aria-hidden="true" />}
      </a>
     ))}
    </nav>
    <div role="status" aria-live="polite" className="sr-only">{filteredItems.length} tools found</div>
    <div className="bg-white/5 px-4 py-2 text-[10px] text-neutral-300 flex justify-between border-t border-white/10">
     <div className="flex gap-3"><span><strong>↑↓</strong> to navigate</span><span><strong>↵</strong> to select</span></div>
     <div className="flex items-center gap-1"><Command size={10} aria-hidden="true" /> / Ctrl + K</div>
    </div>
   </div>
  </div>
 );
};
export default CommandPalette;
