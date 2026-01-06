import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import { ShoppingCart, AlertCircle, Check, ChevronLeft, Star } from 'lucide-react';
import { SEO } from '../common/SEO';

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string; category: string }>();
  const product = PRODUCTS.find(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!product) {
    return (
      <div className="py-32 text-center flex flex-col items-center">
        <AlertCircle size={48} className="text-neutral-600 mb-4" />
        <h1 className="text-2xl font-bold text-neutral-300 mb-4">Product not found</h1>
        <Link to="/" className="text-blue-400 hover:text-white transition-colors">Return Home</Link>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${product.name} Review - Display & Input Test`}
        description={product.description}
        canonical={`/resources/${product.category}/${product.slug}`}
        type="article" // Or 'product' if supported, but usually article for reviews
        keywords={[product.name, 'monitor review', 'input lag test', 'display specs', product.category]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "brand": {
            "@type": "Brand",
            "name": product.name.split(' ')[0] // Simple guess, ideally from data
          },
          "review": {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "4.5",
              "bestRating": "5"
            },
            "author": {
              "@type": "Organization",
              "name": "DeadPixelTest.cc Lab"
            }
          }
        }}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources' }, // Conceptual path
          { name: product.name, path: `/resources/${product.category}/${product.slug}` }
        ]}
      />
      
      <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-neutral-500">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="capitalize text-white">{product.category}</span>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Col: Visuals */}
          <div className="space-y-6">
             <div className="w-full aspect-[4/3] bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative group">
                {/* Using a placeholder service that generates tech-looking abstract images or specific colored boxes if image fails */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black z-0"></div>
                <img 
                  src={`https://images.unsplash.com/photo-1550003018-7253a5b81093?auto=format&fit=crop&q=80&w=800`} 
                  alt={product.name}
                  width="800"
                  height="600"
                  className="relative z-10 w-full h-full object-cover opacity-80 mix-blend-overlay"
                />
                <div className="absolute z-20 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                   <span className="text-sm font-bold text-white tracking-widest uppercase">{product.category}</span>
                </div>
             </div>
          </div>

          {/* Right Col: Info */}
          <div>
             <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
               {product.name}
             </h1>
             
             <div className="flex items-center gap-4 mb-6">
               <div className="flex text-yellow-500">
                 <Star size={16} fill="currentColor" />
                 <Star size={16} fill="currentColor" />
                 <Star size={16} fill="currentColor" />
                 <Star size={16} fill="currentColor" />
                 <Star size={16} fill="currentColor" />
               </div>
               <span className="text-sm text-neutral-500">Editor's Choice</span>
             </div>

             <p className="text-lg text-neutral-300 leading-relaxed mb-8">
               {product.description}
             </p>

             {/* Features Grid */}
             <div className="bg-neutral-900/50 rounded-xl border border-white/10 p-6 mb-8">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Key Features</h3>
                <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check size={16} className="text-blue-500 mt-1 shrink-0" />
                      <span className="text-sm text-neutral-300">{feature}</span>
                    </div>
                  ))}
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={product.amazonLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#ffad33] text-black font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 transform hover:-translate-y-1"
                >
                  <ShoppingCart size={20} />
                  <span>Check Price on Amazon</span>
                </a>
             </div>
             <p className="mt-4 text-xs text-neutral-600 text-center sm:text-left">
               *As an Amazon Associate we earn from qualifying purchases.
             </p>
          </div>
        </div>

        {/* Deep Dive Content */}
        <div className="mt-20 border-t border-white/10 pt-12">
           <h2 className="text-2xl font-bold text-white mb-8">Detailed Review</h2>
           <div 
             className="prose prose-invert prose-lg max-w-none text-neutral-300"
             dangerouslySetInnerHTML={{ __html: product.longDescription }}
           />
        </div>
      </div>
    </>
  );
};

export default ProductPage;