import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, CornerDownLeft, Command } from 'lucide-react';
import { MENU_ITEMS } from '../../data/menu';

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Filter items (flattened, ignoring headers)
  const filteredItems = MENU_ITEMS.filter(item => 
    !item.isHeader && item.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
        setQuery('');
    }
  }, [isOpen]);

  // Navigation Logic
  useEffect(() => {
    const handleNav = (e: KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                navigate(filteredItems[selectedIndex].path);
                setIsOpen(false);
            }
        }
    };
    window.addEventListener('keydown', handleNav);
    return () => window.removeEventListener('keydown', handleNav);
  }, [isOpen, filteredItems, selectedIndex, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-white/5 gap-3">
            <Search className="text-neutral-500" size={20} />
            <input 
                ref={inputRef}
                type="text" 
                aria-label="Search tools"
                placeholder="Search tools..." 
                className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none text-sm font-medium h-6"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            />
            <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono border border-white/10 px-1.5 py-0.5 rounded">
                <span className="text-xs">ESC</span>
            </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
            {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                    No results found.
                </div>
            ) : (
                filteredItems.map((item, idx) => (
                    <div 
                        key={item.path}
                        onClick={() => { navigate(item.path); setIsOpen(false); }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`
                            px-4 py-3 mx-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors
                            ${idx === selectedIndex ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:bg-white/5'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`p-1.5 rounded-md ${idx === selectedIndex ? 'bg-white/20' : 'bg-white/5'}`}>
                                <ArrowRight size={14} />
                            </span>
                            <span className="text-sm font-medium">{item.title}</span>
                        </div>
                        {idx === selectedIndex && (
                            <CornerDownLeft size={14} className="opacity-50" />
                        )}
                    </div>
                ))
            )}
        </div>

        {/* Footer */}
        <div className="bg-white/5 px-4 py-2 text-[10px] text-neutral-500 flex justify-between border-t border-white/5">
            <div className="flex gap-3">
                <span><strong className="text-neutral-300">↑↓</strong> to navigate</span>
                <span><strong className="text-neutral-300">↵</strong> to select</span>
            </div>
            <div className="flex items-center gap-1">
                <Command size={10} /> + K
            </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;