import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Monitor, Maximize2, Scan } from 'lucide-react';
import { MENU_ITEMS } from '../../data/menu';
import { MenuItem } from '../../types';

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
  const menuGroups = useGroupedMenu();
  const location = useLocation();

  // Telemetry State
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [pixelRatio, setPixelRatio] = useState(window.devicePixelRatio);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleResize = () => {
        setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        setPixelRatio(window.devicePixelRatio);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
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

          {/* 3. Right: Telemetry & Mobile Toggle */}
          <div className="flex items-center justify-end gap-4 z-20">
            {/* Telemetry (Desktop Only) */}
            <div className="hidden md:flex items-center gap-3 text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
               <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-default">
                  <Monitor size={10} />
                  <span>{windowSize.w} <span className="text-neutral-700">x</span> {windowSize.h}</span>
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-default">
                  <Maximize2 size={10} />
                  <span>DPI: {pixelRatio.toFixed(1)}</span>
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