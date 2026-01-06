import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost, ArrowLeft, Home } from 'lucide-react';
import { SEO } from '../common/SEO';

const NotFound: React.FC = () => {
  return (
    <>
      <SEO 
        title="Page Not Found (404)" 
        description="The page you are looking for does not exist."
        keywords={[]}
      />
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 animate-fade-in">
        <div className="bg-neutral-900/50 p-8 rounded-full mb-8 border border-white/5">
           <Ghost size={64} className="text-neutral-600" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-neutral-400 mb-8 max-w-md">
          Oops! It seems you've ventured into the void. The page you are looking for might have been moved or deleted.
        </p>
        
        <div className="flex gap-4">
           <Link 
             to="/" 
             className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors"
           >
             <Home size={18} /> Return Home
           </Link>
           <Link 
             to="/tests/dead-pixel" 
             className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full font-bold border border-neutral-700 hover:border-white transition-colors"
           >
             <ArrowLeft size={18} /> Test Screen
           </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;