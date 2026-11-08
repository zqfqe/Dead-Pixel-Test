import React, { useEffect } from 'react';
import { CheckCircle2, Monitor, ShieldCheck, Eye } from 'lucide-react';
import { SEO } from '../common/SEO';

const About: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <SEO
        title="About DeadPixelTest"
        description="Learn what DeadPixelTest browser-based display checks do, how observations work and where their limits are."
        canonical="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "mainEntity": {
            "@type": "Organization",
            "name": "DeadPixelTest",
            "description": "A browser-based collection of visual display inspection tools."
          }
        }}
      />
      <main className="max-w-4xl mx-auto py-12 px-6">
        <header className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About DeadPixelTest</h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            DeadPixelTest is a browser-based collection of visual checks for monitors, laptop screens and mobile displays. It provides test patterns and lets visitors record what they observe.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <section className="bg-neutral-900/50 p-8 rounded-2xl border border-white/10">
            <Monitor className="text-blue-500 mb-4" size={32} />
            <h2 className="text-xl font-bold text-white mb-3">What the tools do</h2>
            <p className="text-neutral-400 leading-relaxed">
              The browser draws solid colors, grayscale ramps, line patterns and motion examples. You inspect the physical display yourself and can record approximate observations for later comparison.
            </p>
          </section>
          <section className="bg-neutral-900/50 p-8 rounded-2xl border border-white/10">
            <Eye className="text-green-500 mb-4" size={32} />
            <h2 className="text-xl font-bold text-white mb-3">What they cannot do</h2>
            <p className="text-neutral-400 leading-relaxed">
              A website cannot read a panel's internal hardware status, automatically confirm a dead pixel, measure calibrated brightness or contrast, identify the failed component, or repair physical panel damage.
            </p>
          </section>
        </div>

        <section className="space-y-7">
          <h2 className="text-3xl font-bold text-white text-center">How we approach reliability</h2>
          <div className="flex gap-4 items-start">
            <CheckCircle2 className="text-blue-500 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white">Clear test limitations</h3>
              <p className="text-neutral-400">Each test is intended for visual comparison, not as a certified hardware inspection or warranty decision. Browser scaling, color profiles, HDR and viewing conditions can affect what you see.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <ShieldCheck className="text-blue-500 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white">Local-first processing</h3>
              <p className="text-neutral-400">Display patterns are rendered in the browser. Camera and image features require your action and browser permission; the current application processes their content locally rather than uploading it to the site's application server.</p>
            </div>
          </div>
          <p className="text-sm text-neutral-500">This is an independent preview project. The site does not claim laboratory certification or affiliation with display manufacturers.</p>
        </section>
      </main>
    </>
  );
};

export default About;
