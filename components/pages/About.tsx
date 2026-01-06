import React, { useEffect } from 'react';
import { CheckCircle2, Monitor, Users, ShieldCheck } from 'lucide-react';

const About: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About DeadPixelTest.cc</h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
          We are dedicated to helping you achieve the perfect visual experience through professional-grade, browser-based display diagnostics.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="bg-neutral-900/50 p-8 rounded-2xl border border-white/10">
          <Monitor className="text-blue-500 mb-4" size={32} />
          <h2 className="text-xl font-bold text-white mb-3">Our Mission</h2>
          <p className="text-neutral-400 leading-relaxed">
            The "Panel Lottery" is real. Buying a monitor today can be a gamble between backlight bleeding, dead pixels, and poor uniformity. Our mission is to provide free, accessible, and accurate tools to help consumers verify their hardware quality within the return window.
          </p>
        </div>
        <div className="bg-neutral-900/50 p-8 rounded-2xl border border-white/10">
          <Users className="text-green-500 mb-4" size={32} />
          <h2 className="text-xl font-bold text-white mb-3">Who We Are</h2>
          <p className="text-neutral-400 leading-relaxed">
            We are a small team of color scientists, software engineers, and display enthusiasts. Frustrated by the lack of cohesive testing suites online, we built DeadPixelTest.cc to be the ultimate "Swiss Army Knife" for screens.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        <h2 className="text-3xl font-bold text-white text-center">Why Trust Our Tools?</h2>
        
        <div className="grid gap-6">
           <div className="flex gap-4 items-start">
              <CheckCircle2 className="text-blue-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white">Browser-Based Precision</h3>
                <p className="text-neutral-400">Our tests use HTML5 Canvas and WebGL technology to render pixel-perfect patterns without compression artifacts, ensuring what you see is exactly what your screen is displaying.</p>
              </div>
           </div>
           
           <div className="flex gap-4 items-start">
              <CheckCircle2 className="text-blue-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white">Adhering to ISO Standards</h3>
                <p className="text-neutral-400">Our information regarding dead pixels and warranties references the ISO 9241-307 standard, helping you make informed arguments when dealing with manufacturer support.</p>
              </div>
           </div>

           <div className="flex gap-4 items-start">
              <CheckCircle2 className="text-blue-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white">Privacy First</h3>
                <p className="text-neutral-400">Our tests run locally in your browser. We do not record your screen, upload your images, or track your personal usage data.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default About;