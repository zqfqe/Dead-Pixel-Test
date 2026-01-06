import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../../data/blog';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { SEO } from '../common/SEO';

const BlogIndex: React.FC = () => {
  return (
    <>
      <SEO 
        title="Display Technology Blog & Guides" 
        description="Expert guides on monitor calibration, dead pixel repair, and understanding panel technology (IPS vs OLED vs VA). Identify and fix screen defects."
        canonical="/blog"
        keywords={['monitor calibration guide', 'dead pixel fix', 'ips glow guide', 'display technology blog', 'screen repair guide']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "DeadPixelTest Display Knowledge Base",
          "description": "Expert guides on monitor calibration and screen technology.",
          "url": "https://deadpixeltest.cc/blog",
          "blogPost": BLOG_POSTS.map((post, index) => ({
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.coverImage,
            "datePublished": post.date,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "url": `https://deadpixeltest.cc/blog/${post.slug}`
          }))
        }}
      />
      <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
           <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-4">
             Display Technology
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
             Knowledge Base
           </h1>
           <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
             Expert guides on monitor calibration, dead pixel repair, and understanding panel technology.
           </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, index) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.slug}`}
              className="group flex flex-col bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-neutral-800">
                 {/* LCP Optimization: Priority load first image, lazy load others */}
                 <img 
                   src={post.coverImage} 
                   alt={post.title}
                   loading={index === 0 ? "eager" : "lazy"}
                   width="800"
                   height="450"
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                 />
                 <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                   {post.category}
                 </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col">
                 <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={12} />
                      <span>{post.author}</span>
                    </div>
                 </div>

                 <h2 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-blue-400 transition-colors">
                   {post.title}
                 </h2>
                 
                 <p className="text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-3">
                   {post.excerpt}
                 </p>

                 <div className="mt-auto pt-6 border-t border-white/5 flex items-center text-blue-400 text-sm font-bold group-hover:translate-x-1 transition-transform origin-left">
                    <span>Read Article</span>
                    <ArrowRight size={14} className="ml-2" />
                 </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State / More Coming Soon */}
        <div className="mt-20 p-8 border border-dashed border-white/10 rounded-2xl text-center text-neutral-500">
           <BookOpen className="mx-auto mb-4 opacity-50" size={32} />
           <p>More detailed guides and technical analysis coming soon.</p>
        </div>
      </div>
    </>
  );
};

export default BlogIndex;