import React from 'react';
import { Info, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface TestGuideOverlayProps {
  title: string;
  instructions: string[];
  onStart: () => void;
}

export const TestGuideOverlay: React.FC<TestGuideOverlayProps> = ({ title, instructions, onStart }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10">
          <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400 mb-6">
            <Info size={24} />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-sm text-neutral-400 mb-6 uppercase tracking-wider font-bold">Preparation Guide</p>
          
          <ul className="space-y-4 mb-8">
            {instructions.map((inst, idx) => (
              <li key={idx} className="flex gap-3 text-neutral-300 text-sm leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono mt-0.5">{idx + 1}</span>
                {inst}
              </li>
            ))}
          </ul>

          <Button onClick={onStart} className="w-full py-4 text-base">
            I'm Ready, Start Test <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ReportDialogProps {
  testName: string;
  onResult: (status: 'pass' | 'fail') => void;
  onRetry: () => void;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({ testName, onResult, onRetry }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
        <h2 className="text-xl font-bold text-white mb-2">Test Complete</h2>
        <p className="text-neutral-400 text-sm mb-8">Did you find any defects during the {testName}?</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button 
            onClick={() => onResult('fail')}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-red-900/10 border border-red-500/20 hover:bg-red-900/20 hover:border-red-500/50 transition-all group"
          >
            <AlertTriangle size={32} className="text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-red-400 font-bold text-sm">Yes, Defects Found</span>
          </button>

          <button 
            onClick={() => onResult('pass')}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-green-900/10 border border-green-500/20 hover:bg-green-900/20 hover:border-green-500/50 transition-all group"
          >
            <CheckCircle2 size={32} className="text-green-500 group-hover:scale-110 transition-transform" />
            <span className="text-green-400 font-bold text-sm">No, Perfect Screen</span>
          </button>
        </div>

        <button onClick={onRetry} className="text-neutral-500 hover:text-white text-xs underline transition-colors">
          Return to test
        </button>
      </div>
    </div>
  );
};
