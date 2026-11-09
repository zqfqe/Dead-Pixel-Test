import React, {useEffect,useRef,useState} from 'react';
import {Search,ArrowRight,CornerDownLeft,Command} from 'lucide-react';
import {MENU_ITEMS} from '../../data/menu';

const matchingTools=(query:string)=>MENU_ITEMS.filter(item=>
  !item.isHeader&&item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())
);

const CommandPalette:React.FC=()=>{
 const [isOpen,setIsOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [selectedIndex,setSelectedIndex]=useState(0);
 const selectedRef=useRef(0);
 const inputRef=useRef<HTMLInputElement>(null);
 const filteredItems=matchingTools(query);

 useEffect(()=>{
  const toggle=(event:KeyboardEvent)=>{
   if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
    event.preventDefault();
    setIsOpen(open=>!open);
   }else if(event.key==='Escape'){
    setIsOpen(false);
   }
  };
  window.addEventListener('keydown',toggle);
  return()=>window.removeEventListener('keydown',toggle);
 },[]);

 useEffect(()=>{
  if(!isOpen){setQuery('');return;}
  selectedRef.current=0;
  setSelectedIndex(0);
  const handle=setTimeout(()=>inputRef.current?.focus(),50);
  return()=>clearTimeout(handle);
 },[isOpen]);

 useEffect(()=>{
  if(!isOpen)return;
  const handleNav=(event:KeyboardEvent)=>{
   // The live input value is authoritative. An Enter immediately after typing
   // must not use a stale React effect closure from the previous search.
   const matches=matchingTools(inputRef.current?.value??'');
   if(event.key==='ArrowDown'||event.key==='ArrowUp'){
    event.preventDefault();
    if(!matches.length)return;
    const delta=event.key==='ArrowDown'?1:-1;
    const next=(selectedRef.current+delta+matches.length)%matches.length;
    selectedRef.current=next;
    setSelectedIndex(next);
   }else if(event.key==='Enter'){
    const chosen=matches[selectedRef.current];
    if(!chosen)return;
    event.preventDefault();
    // Each tool URL is an Astro static document. Do not keep stale SPA
    // canonical/robots metadata by performing a React Router soft transition.
    window.location.assign(chosen.path);
   }
  };
  window.addEventListener('keydown',handleNav);
  return()=>window.removeEventListener('keydown',handleNav);
 },[isOpen]);

 if(!isOpen)return null;
 return (
  <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4" role="dialog" aria-modal="true" aria-label="Search tools">
   <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={()=>setIsOpen(false)} />
   <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    <div className="flex items-center px-4 py-3 border-b border-white/5 gap-3">
     <Search className="text-neutral-500" size={20} aria-hidden="true" />
     <input ref={inputRef} type="text" aria-label="Search tools" placeholder="Search tools..."
      className="flex-1 min-w-0 bg-transparent text-white placeholder-neutral-500 outline-none text-sm font-medium h-9 focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
      value={query} onChange={event=>{setQuery(event.target.value);selectedRef.current=0;setSelectedIndex(0);}} />
     <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono border border-white/10 px-1.5 py-0.5 rounded"><span className="text-xs">ESC</span></div>
    </div>
    <nav aria-label="Search results" className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
     {filteredItems.length===0 ? (
      <p role="status" className="px-4 py-8 text-center text-neutral-400 text-sm">No results found.</p>
     ) : filteredItems.map((item,idx)=>(
      <a key={item.path} href={item.path} onMouseEnter={()=>{selectedRef.current=idx;setSelectedIndex(idx);}}
       className={'mx-2 flex items-center justify-between rounded-lg px-4 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 '+
        (idx===selectedIndex?'bg-blue-600 text-white':'text-neutral-300 hover:text-white hover:bg-white/10')}>
       <span className="flex items-center gap-3">
        <span className={'rounded-md p-1.5 '+(idx===selectedIndex?'bg-white/20':'bg-white/5')}><ArrowRight size={14} aria-hidden="true" /></span>
        <span className="font-medium">{item.title}</span>
       </span>
       {idx===selectedIndex&&<CornerDownLeft size={14} className="opacity-70" aria-hidden="true" />}
      </a>
     ))}
    </nav>
    <div className="bg-white/5 px-4 py-2 text-[10px] text-neutral-400 flex justify-between border-t border-white/10">
     <div className="flex gap-3"><span><strong className="text-neutral-200">↑↓</strong> to navigate</span><span><strong className="text-neutral-200">↵</strong> to select</span></div>
     <div className="flex items-center gap-1"><Command size={10} aria-hidden="true" /> / Ctrl + K</div>
    </div>
   </div>
  </div>
 );
};

export default CommandPalette;
