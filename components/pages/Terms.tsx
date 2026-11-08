import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { SEO } from '../common/SEO';

const Terms: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <SEO
        title="Terms of Use"
        description="Terms and safety limitations for using DeadPixelTest browser-based visual display tools."
        canonical="/terms-of-service"
      />
      <main className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Use</h1>
        <p className="text-neutral-500 mb-8">Last updated: November 8, 2026</p>

        <div className="bg-amber-900/20 border border-amber-500/40 p-6 rounded-xl mb-10 flex gap-4">
          <AlertTriangle className="text-amber-400 shrink-0" size={24} />
          <div>
            <h2 className="text-amber-300 font-bold text-lg mb-2">Visual sensitivity and device-care warning</h2>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Some tools show moving or changing high-contrast patterns. If you have photosensitive epilepsy or are sensitive to flashing or motion, avoid those tools. Stop immediately if you feel discomfort. Keep brightness comfortable and do not leave static high-contrast patterns running for long periods.
            </p>
          </div>
        </div>

        <div className="prose prose-invert prose-neutral max-w-none text-neutral-300">
          <h2>1. Scope of the service</h2>
          <p>
            DeadPixelTest provides browser-based visual patterns and device-interaction tools. They are for informational self-checks only. The site does not automatically inspect the physical display panel, provide a certified diagnosis, determine warranty eligibility or replace professional service.
          </p>

          <h2>2. No repair or measurement guarantee</h2>
          <p>
            The tools cannot repair physically damaged pixels, reverse permanent OLED burn-in, guarantee that temporary image retention will disappear, or measure calibrated luminance, contrast ratio or native panel resolution. Browser, operating-system and display settings can affect results.
          </p>

          <h2>3. Safe use</h2>
          <ul>
            <li>Do not press, heat, strike or disassemble a display to try to change a test result.</li>
            <li>Do not leave static test patterns displayed for extended periods, especially on OLED panels.</li>
            <li>Use manufacturer-provided panel-care or pixel-refresh functions only as directed by the manufacturer.</li>
            <li>Stop any moving or changing pattern if it causes discomfort.</li>
          </ul>

          <h2>4. Availability and changes</h2>
          <p>
            The service is provided on an as-available basis and may change during preview development. We may update these terms when features or data practices change.
          </p>

          <h2>5. External services</h2>
          <p>
            Links to third-party websites are outside the site's control. Their terms and privacy practices apply when you visit them.
          </p>

          <h2>6. Contact</h2>
          <p>
            A verified private support and privacy contact channel has not yet been configured for this preview project. Public GitHub issues may be used for non-sensitive technical feedback only; do not post personal or confidential information there.
          </p>
        </div>
      </main>
    </>
  );
};

export default Terms;
