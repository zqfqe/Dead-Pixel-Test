import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Monitor, Maximize2, Scan, Activity, Command, ClipboardCheck } from 'lucide-react';
import { MENU_ITEMS } from '../../data/menu';
import { MenuItem } from '../../types';
import { useTestReport } from '../../contexts/TestReportContext';
import { ReportDashboard } from '../common/ReportDashboard';

const useGroupedMenu = () => {
  const grouped: { title: string; items: MenuItem[] }[] = [];
  let currentGroup: { title: string; items: MenuItem[] } | null = null;

  MENU_ITEMS.forEach((item) => {
    if (item.isHeader) {
      if (currentGroup) grouped.push(currentGroup);
      currentGroup = { title: item.title, items: [] };
    } else if (currentGroup) {
      currentGroup.items.push(item);
    }
  });
  if (currentGroup) grouped.push(currentGroup);
  
  return grouped.map(g => {
    // Cleaner labels for the top navigation
    let cleanTitle = g.title
      .replace('CALIBRATION ', '')
      .replace('DISPLAY ', '')
      .replace('INPUT ', '');
      
    return {
      ...g,
      title: cleanTitle
    };
  });
};

const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false); // Report Modal State
  const menuGroups = useGroupedMenu();
  const location = useLocation();
  const { results } = useTestReport();

  // Telemetry State
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [pixelRatio, setPixelRatio] = useState(window.devicePixelRatio);
  const [fps, setFps] = useState(0);
  
  // FPS Logic
  const requestRef = useRef<number>();
  const prevTimeRef = useRef<number>();
  const frameCountRef = useRef(0);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleResize = () => {
        setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        setPixelRatio(window.devicePixelRatio);
    };
    
    // FPS Loop
    const animate = (time: number) => {
        if (prevTimeRef.current !== undefined) {
            frameCountRef.current++;
            const delta = time - prevTimeRef.current;
            if (delta >= 1000) {
                setFps(Math.round((frameCountRef.current * 1000) / delta));
                frameCountRef.current = 0;
                prevTimeRef.current = time;
            }
        } else {
            prevTimeRef.current = time;
        }
        requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, []);

  return (
    <>
      <header 
        className={`
          fixed top-0 left-0 w-full z-40 transition-all duration-500 border-b
          ${scrolled 
            ? 'bg-black/80 backdrop-blur-xl border-white/5 h-14' 
            : 'bg-transparent border-transparent h-20'}
        `}
      >
        <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between relative">
          
          {/* 1. Left: Logo */}
          <div className="flex items-center justify-start z-20">
            <NavLink to="/" className="flex items-center gap-2 group opacity-90 hover:opacity-100 transition-opacity">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                <Scan size={14} strokeWidth={3} />
              </div>
              <span className="font-bold text-white tracking-tight text-sm hidden sm:inline-block">DeadPixelTest</span>
            </NavLink>
          </div>

          {/* 2. Center: Desktop Nav (Absolutely Positioned for Perfect Centering) */}
          <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 z-10">
            {menuGroups.map((group, idx) => (
              <div key={idx} className="relative group/dropdown px-3 py-4">
                <button className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 group-hover/dropdown:text-white transition-colors uppercase tracking-widest">
                  {group.title}
                  <ChevronDown size={10} className="opacity-50 group-hover/dropdown:rotate-180 transition-transform duration-300" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:translate-y-0 group-hover/dropdown:pointer-events-auto transition-all duration-200 ease-out">
                  <div className="bg-[#050505] border border-white/10 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden p-1.5 backdrop-blur-3xl">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                          block px-3 py-2 text-[13px] rounded-md transition-all
                          ${isActive 
                            ? 'bg-white/10 text-white font-medium' 
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'}
                        `}
                      >
                        {item.title}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* 3. Right: Report, Telemetry & Mobile Toggle */}
          <div className="flex items-center justify-end gap-3 z-20">
            
            {/* Report Button (Visible if results exist) */}
            {results.length > 0 && (
                <button 
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg shadow-blue-900/20 animate-in fade-in zoom-in"
                >
                   <ClipboardCheck size={14} />
                   <span className="hidden sm:inline">Report</span>
                   <span className="bg-white/20 px-1.5 rounded text-[10px]">{results.length}</span>
                </button>
            )}

            {/* Quick Command Hint */}
            <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-neutral-600 border border-white/5 px-2 py-1 rounded bg-white/5 mr-2">
                <Command size={10} /> + K
            </div>

            {/* Telemetry (Desktop Only) */}
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
               <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-default" title="Viewport Size">
                  <Monitor size={10} />
                  <span>{windowSize.w}x{windowSize.h}</span>
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-default" title="Pixel Ratio">
                  <Maximize2 size={10} />
                  <span>DPI:{pixelRatio.toFixed(1)}</span>
               </div>
               <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border bg-white/5 transition-colors cursor-default ${fps < 30 ? 'text-red-500 border-red-900/30' : fps > 100 ? 'text-green-500 border-green-900/30' : 'text-blue-500 border-blue-900/30'}`} title="Real-time Refresh Rate">
                  <Activity size={10} />
                  <span>{fps} Hz</span>
               </div>
            </div>

            {/* Mobile Toggle */}
            <button 
              className="lg:hidden text-white p-2 opacity-70 hover:opacity-100"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Global Report Dashboard Modal */}
      <ReportDashboard isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

      {/* Mobile Menu Overlay */}
      <div 
        className={`
          fixed inset-0 z-30 bg-black pt-24 px-6 overflow-y-auto transition-transform duration-300 lg:hidden
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="space-y-8 pb-12">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest border-b border-white/10 pb-2 mb-3">
                {group.title}
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      block py-3 px-4 rounded-lg text-sm
                      ${isActive 
                        ? 'bg-white text-black font-bold' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    {item.title}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Header;