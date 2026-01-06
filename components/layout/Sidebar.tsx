import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { MENU_ITEMS } from '../../data/menu';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header (Minimal) */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md z-[60] px-6 py-4 flex items-center justify-between border-b border-white/5">
        <span className="font-bold text-lg tracking-tight">DeadPixelTest</span>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 z-50
        bg-black
        transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
        overflow-y-auto custom-scrollbar
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:pt-0 pt-20
        border-r border-white/5
      `}>
        {/* Logo Area */}
        <div className="p-8 lg:p-10 mb-2">
           <h1 className="font-bold text-xl tracking-tight text-white">
             DeadPixelTest
           </h1>
           <p className="text-xs text-neutral-500 mt-2 font-medium tracking-wide">
             Display Calibration Suite
           </p>
        </div>

        <nav className="px-6 pb-20">
          {MENU_ITEMS.map((item, index) => {
            if (item.isHeader) {
              return (
                <div key={index} className="mt-8 mb-4 px-4 text-[11px] font-medium text-neutral-600 uppercase tracking-widest">
                  {item.title}
                </div>
              );
            }
            return (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  block px-4 py-2.5 text-sm transition-all duration-200 rounded-lg
                  ${isActive 
                    ? 'text-white bg-white/10 font-medium' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'}
                `}
              >
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;