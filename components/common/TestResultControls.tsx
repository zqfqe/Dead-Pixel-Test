import React from 'react';
import { CheckCircle2, AlertTriangle, ClipboardList } from 'lucide-react';
import { useTestReport } from '../../contexts/TestReportContext';

interface TestResultControlsProps {
  testId: string;
  testName: string;
  className?: string;
}

export const TestResultControls: React.FC<TestResultControlsProps> = ({ testId, testName, className = '' }) => {
  const { results, addResult } = useTestReport();
  
  const currentResult = results.find(r => r.testId === testId);
  const status = currentResult?.status;

  const handleMark = (newStatus: 'pass' | 'fail') => {
    addResult({
      testId,
      testName,
      status: newStatus,
      timestamp: Date.now()
    });
    // Optional: Trigger haptic
    if (navigator.vibrate) navigator.vibrate(20);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
        <ClipboardList size={14} />
        <span>Test Result</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleMark('pass')}
          className={`
            flex items-center justify-center gap-2 py-3 rounded-lg border transition-all duration-200
            ${status === 'pass' 
              ? 'bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
              : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:border-green-900 hover:text-green-400'}
          `}
        >
          <CheckCircle2 size={16} />
          <span className="text-xs font-bold">Pass</span>
        </button>

        <button
          onClick={() => handleMark('fail')}
          className={`
            flex items-center justify-center gap-2 py-3 rounded-lg border transition-all duration-200
            ${status === 'fail' 
              ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
              : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:border-red-900 hover:text-red-400'}
          `}
        >
          <AlertTriangle size={16} />
          <span className="text-xs font-bold">Defect</span>
        </button>
      </div>
      
      {status && (
        <div className="text-[10px] text-center text-neutral-500 font-mono">
          recorded: {new Date(currentResult.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};