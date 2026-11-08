import React, {useRef} from 'react';
import {useTestReport} from '../../contexts/TestReportContext';
import {X, Download, Trash2, FileText} from 'lucide-react';
import {jsPDF} from 'jspdf';

interface Props {isOpen:boolean;onClose:()=>void}

export const ReportDashboard:React.FC<Props>=({isOpen,onClose})=>{
 const {results,clearResults}=useTestReport();
 const canvasRef=useRef<HTMLCanvasElement>(null);
 if(!isOpen)return null;
 const caption='User-reported visual observations only. Not a certified diagnostic, an objective screen health score, or a warranty determination.';
 const downloadImage=()=>{
  const canvas=canvasRef.current,ctx=canvas?.getContext('2d');
  if(!canvas||!ctx)return;
  canvas.width=1200;canvas.height=630;
  ctx.fillStyle='#10131b';ctx.fillRect(0,0,1200,630);
  ctx.fillStyle='#fff';ctx.font='bold 46px sans-serif';ctx.fillText('Screen Self-Check Notes',60,85);
  ctx.fillStyle='#a7adbc';ctx.font='22px sans-serif';
  ctx.fillText('Manually recorded observations — not certified',60,130);
  ctx.font='23px sans-serif';
  results.slice(0,8).forEach((r,i)=>{
   ctx.fillStyle=r.status==='pass'?'#5ee0b0':'#ffa1a1';
   ctx.fillText(r.status==='pass'?'No issue reported':'Issue reported',65,200+i*43);
   ctx.fillStyle='#fff';ctx.fillText(r.testName,315,200+i*43);
  });
  ctx.fillStyle='#a7adbc';ctx.font='19px sans-serif';
  ctx.fillText('Visual self-check; physical panel faults require independent verification.',60,590);
  const a=document.createElement('a');a.download='screen-self-check.jpg';a.href=canvas.toDataURL('image/jpeg',0.9);a.click();
 };
 const downloadPdf=()=>{
  const doc=new jsPDF();doc.setFontSize(19);doc.text('Screen Self-Check Notes',15,20);
  doc.setFontSize(10);doc.text('User-observed only; not a certified hardware diagnostic.',15,30);
  doc.text('Recorded: '+new Date().toLocaleString(),15,38);
  let y=52;
  for(const r of results){
   if(y>275){doc.addPage();y=20;}
   doc.setFontSize(10);
   doc.text(doc.splitTextToSize(r.testName+': '+(r.status==='pass'?'No issue reported':'Issue reported')+' ('+new Date(r.timestamp).toLocaleString()+')',175),15,y);
   y+=16;
  }
  doc.setFontSize(8);doc.text('Self-reported observations. Consult the device manufacturer for warranty decisions.',15,290);
  doc.save('screen-self-check.pdf');
 };
 return <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85" role="dialog" aria-modal="true" aria-labelledby="self-check-heading">
  <div className="bg-neutral-950 border border-white/15 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
   <header className="p-5 flex justify-between border-b border-white/10">
    <div><h2 id="self-check-heading" className="text-xl font-bold">Screen Self-Check Notes</h2><p className="text-sm text-neutral-400 mt-1">Your own observations; not automatically measured.</p></div>
    <button type="button" aria-label="Close report" onClick={onClose} className="p-2 hover:bg-white/10 rounded"><X/></button>
   </header>
   <div className="p-5 overflow-y-auto">
    <p className="rounded-lg bg-amber-950/40 border border-amber-600/30 p-4 text-sm text-amber-100">{caption}</p>
    <h3 className="font-semibold mt-5 mb-3">Test notes ({results.length})</h3>
    <div className="space-y-2">{results.length===0?<p className="text-neutral-400">No test observations recorded yet.</p>:results.map((r,i)=><div key={i} className="flex justify-between gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
      <div><div className="font-medium">{r.testName}</div><div className="text-xs text-neutral-500">{new Date(r.timestamp).toLocaleString()}</div></div>
      <span className={r.status==='pass'?'text-green-400 text-sm':'text-amber-300 text-sm'}>{r.status==='pass'?'No issue reported':'Issue reported'}</span>
    </div>)}</div>
   </div>
   <footer className="p-5 flex flex-wrap gap-3 justify-between border-t border-white/10">
    <button type="button" onClick={clearResults} className="text-sm text-neutral-400 hover:text-red-300 flex items-center gap-2"><Trash2 size={15}/> Clear history</button>
    <div className="flex gap-2">
     <button type="button" disabled={!results.length} onClick={downloadPdf} className="bg-blue-700 hover:bg-blue-600 rounded px-3 py-2 text-sm disabled:opacity-40 flex gap-2 items-center"><FileText size={16}/>PDF</button>
     <button type="button" disabled={!results.length} onClick={downloadImage} className="bg-white/10 hover:bg-white/20 rounded px-3 py-2 text-sm disabled:opacity-40 flex gap-2 items-center"><Download size={16}/>Image</button>
    </div>
   </footer>
   <canvas ref={canvasRef} style={{display:'none'}}/>
  </div>
 </div>;
};
