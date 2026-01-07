import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../../data/blog';
import { BookOpen, ArrowRight } from 'lucide-react';

interface RelatedArticlesProps {
  currentPath: string;
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ currentPath }) => {
  // 1. Find posts explicitly linked to this test
  const directMatches = BLOG_POSTS.filter(p => p.relatedTestPath === currentPath);
  
  // 2. If no direct match, show latest posts (fallback to keep internal linking active)
  const displayPosts = directMatches.length > 0 
    ? directMatches 
    : BLOG_POSTS.slice(0, 2);

  if (displayPosts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-white/10 pt-12">
       <div className="flex items-center gap-2 mb-6">
         <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
            <BookOpen size={20} />
         </div>
         <h3 className="text-xl font-bold text-white">Related Guides & Fixes</h3>
       </div>
       
       <div className="grid md:grid-cols-2 gap-6">
         {displayPosts.map(post => (
           <Link 
             key={post.id} 
             to={`/blog/${post.slug}`} 
             className="group relative flex flex-col bg-neutral-900/40 border border-white/5 p-6 rounded-xl hover:bg-neutral-900/60 hover:border-white/10 transition-all overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                 <BookOpen size={64} />
              </div>
              
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                {post.category}
              </span>
              
              <h4 className="font-bold text-lg text-white mb-3 group-hover:text-blue-300 transition-colors leading-snug">
                {post.title}
              </h4>
              
              <p className="text-sm text-neutral-400 line-clamp-2 mb-6 leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="mt-auto flex items-center text-xs font-bold text-white uppercase tracking-wider gap-2">
                Read Article <ArrowRight size={12} className="text-blue-500 group-hover:translate-x-1 transition-transform"/>
              </div>
           </Link>
         ))}
       </div>
    </section>
  );
};