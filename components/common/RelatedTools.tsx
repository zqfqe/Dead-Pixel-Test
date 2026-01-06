import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Zap, Activity, Grid } from 'lucide-react';

interface RelatedTool {
  path: string;
  name: string;
  desc: string;
  icon: React.ElementType;
}

const TOOLS: RelatedTool[] = [
  { path: '/tests/uniformity', name: 'Uniformity Test', desc: 'Check for backlight bleed & IPS glow', icon: Monitor },
  { path: '/tests/response-time', name: 'Ghosting Test', desc: 'Check response time & motion blur', icon: Zap },
  { path: '/tests/local-dimming', name: 'Local Dimming', desc: 'Test HDR blooming & zones', icon: Grid },
  { path: '/tests/refresh-rate', name: 'Refresh Rate', desc: 'Check Hz & frame skipping', icon: Activity },
];

export const RelatedTools: React.FC<{ currentPath: string }> = ({ currentPath }) => {
  const related = TOOLS.filter(t => t.path !== currentPath).slice(0, 3);

  return (
    <section className="mt-24 border-t border-white/10 pt-12 pb-8">
      <h3 className="text-xl font-bold text-white mb-8 text-center">Next Recommended Tests</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((tool) => (
          <Link 
            key={tool.path} 
            to={tool.path}
            className="group flex flex-col p-6 bg-neutral-900/50 border border-white/5 rounded-xl hover:bg-neutral-900 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-900/20 text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <tool.icon size={20} />
              </div>
              <span className="font-bold text-neutral-200 group-hover:text-white">{tool.name}</span>
            </div>
            <p className="text-sm text-neutral-500 group-hover:text-neutral-400 leading-relaxed">
              {tool.desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};