import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../../data/blog';
import { Calendar, User, ChevronLeft, ArrowRight, Activity } from 'lucide-react';
import { SEO } from '../common/SEO';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  // Simple Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
        <button onClick={() => navigate('/blog')} className="text-blue-400 hover:text-white transition-colors">
           Return to Knowledge Base
        </button>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={post.title} 
        description={post.excerpt}
        type="article"
        image={post.coverImage}
        canonical={`/blog/${post.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": post.coverImage,
          "author": {
            "@type": "Person",
            "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "DeadPixelTest.cc",
            "logo": {
              "@type": "ImageObject",
              "url": "https://deadpixeltest.cc/logo.png"
            }
          },
          "datePublished": post.date, // Note: Format should ideally be ISO8601
          "description": post.excerpt
        }}
      />
      
      <article className="max-w-5xl mx-auto py-12 px-0 md:px-6 animate-fade-in">
        {/* Custom Styles for Blog Content to ensure spacing even if Tailwind Typography fails */}
        <style>{`
          .blog-content {
            font-family: 'Inter', system-ui, sans-serif;
          }
          .blog-content p { 
            margin-bottom: 1.5rem; 
            line-height: 1.8; 
            color: #d4d4d4; 
            font-size: 1.05rem;
          }
          .blog-content h2 { 
            margin-top: 3rem; 
            margin-bottom: 1.25rem; 
            font-size: 1.75rem; 
            font-weight: 700; 
            color: white; 
            letter-spacing: -0.02em;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 0.5rem;
          }
          .blog-content h3 { 
            margin-top: 2.25rem; 
            margin-bottom: 1rem; 
            font-size: 1.4rem; 
            font-weight: 600; 
            color: #e5e5e5; 
          }
          .blog-content ul, .blog-content ol { 
            margin-bottom: 1.5rem; 
            padding-left: 1.5rem; 
            color: #d4d4d4; 
            line-height: 1.7;
          }
          .blog-content ul { list-style-type: disc; }
          .blog-content ol { list-style-type: decimal; }
          .blog-content li { 
            margin-bottom: 0.5rem; 
            padding-left: 0.5rem;
          }
          .blog-content li::marker {
            color: #60a5fa;
          }
          .blog-content a { 
            color: #60a5fa; 
            text-decoration: none; 
            border-bottom: 1px solid rgba(96, 165, 250, 0.3);
            transition: all 0.2s;
          }
          .blog-content a:hover { 
            color: #93c5fd; 
            border-bottom-color: #93c5fd;
          }
          .blog-content blockquote { 
            border-left: 4px solid #3b82f6; 
            padding: 1.5rem; 
            margin: 2rem 0; 
            font-style: italic; 
            color: #e5e5e5; 
            background: rgba(255,255,255,0.03); 
            border-radius: 0 0.5rem 0.5rem 0;
          }
          .blog-content strong { 
            color: white; 
            font-weight: 600; 
          }
          .blog-content hr {
            border-color: rgba(255,255,255,0.1);
            margin: 3rem 0;
          }
        `}</style>

        {/* Breadcrumb / Back */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Articles
        </Link>

        {/* Header */}
        <header className="mb-12 border-b border-white/10 pb-12">
          <div className="flex items-center gap-3 mb-6">
             <span className="px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-[10px] font-bold uppercase tracking-widest text-blue-400">
               {post.category}
             </span>
             <span className="h-px w-8 bg-white/10"></span>
             <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono">
                <span className="flex items-center gap-1.5"><Calendar size={12}/> {post.date}</span>
                <span className="flex items-center gap-1.5"><User size={12}/> {post.author}</span>
             </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div 
              className="blog-content prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Sidebar / CTA */}
          {post.relatedTestPath && (
            <aside className="w-full lg:w-80 shrink-0 space-y-8">
               <div className="sticky top-28 space-y-8">
                  {/* CTA Card */}
                  <div className="bg-neutral-900/80 backdrop-blur-md border border-blue-500/20 rounded-xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                      <div className="flex items-center gap-2 text-blue-400 mb-4">
                        <Activity size={20} />
                        <span className="text-xs font-bold uppercase tracking-widest">Recommended Tool</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2">
                        {post.relatedTestName}
                      </h3>
                      <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                        Don't just read about it. Test your screen right now with our professional grade tool.
                      </p>

                      <Link 
                        to={post.relatedTestPath}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5"
                      >
                        Launch Test <ArrowRight size={16} />
                      </Link>
                  </div>

                  {/* Table of Contents Placeholder (Optional Visual) */}
                  <div className="hidden lg:block p-6 border-l border-white/10">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">On this page</h4>
                     <ul className="space-y-3 text-sm text-neutral-400">
                       <li className="hover:text-white cursor-pointer transition-colors">The Anatomy of a Pixel</li>
                       <li className="hover:text-white cursor-pointer transition-colors">Stuck vs Dead Pixels</li>
                       <li className="hover:text-white cursor-pointer transition-colors">How to Fix It</li>
                       <li className="hover:text-white cursor-pointer transition-colors">Warranty Policy</li>
                     </ul>
                  </div>
               </div>
            </aside>
          )}
        </div>
      </article>
    </>
  );
};

export default BlogPost;