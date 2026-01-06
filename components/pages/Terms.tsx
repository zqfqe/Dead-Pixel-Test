import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const Terms: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-3xl mx-auto py-12 animate-fade-in">
      <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
      <p className="text-neutral-500 mb-8">Last Updated: January 6, 2026</p>

      {/* Critical Health Warning */}
      <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl mb-12 flex gap-4">
         <AlertTriangle className="text-red-500 shrink-0" size={24} />
         <div>
            <h3 className="text-red-400 font-bold text-lg mb-2">Health Warning: Photosensitive Epilepsy</h3>
            <p className="text-neutral-300 text-sm leading-relaxed">
               Some of the tools on this website (specifically the "Strobe Fix" and "Response Time" tests) utilize rapidly flashing colors and high-contrast patterns. These may trigger seizures for people with photosensitive epilepsy. Viewer discretion is advised. By using these tools, you agree that DeadPixelTest.cc is not liable for any health issues that may arise.
            </p>
         </div>
      </div>

      <div className="prose prose-invert prose-neutral max-w-none text-neutral-300">
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing and using <strong>DeadPixelTest.cc</strong> (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
        </p>

        <h3>2. Description of Service</h3>
        <p>
          DeadPixelTest.cc provides online tools for testing display hardware, including but not limited to dead pixels, backlight bleeding, color accuracy, and response times. These tools are provided "as is" and for informational purposes only.
        </p>

        <h3>3. Disclaimer of Warranties</h3>
        <p>
          The site and its original content, features, and functionality are owned by DeadPixelTest.cc and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
        </p>
        <p>
          <strong>We do not guarantee that our tools will fix your monitor.</strong> The "Stuck Pixel Fixer" uses rapid color cycling which has historically helped unstick liquid crystals, but success is not guaranteed. We are not responsible for any damage that may occur to your hardware while using our tests (e.g., OLED burn-in from leaving a static image on for extended periods).
        </p>

        <h3>4. Limitation of Liability</h3>
        <p>
          In no event shall DeadPixelTest.cc, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory.
        </p>

        <h3>5. External Links</h3>
        <p>
          Our Service may contain links to third-party web sites or services that are not owned or controlled by DeadPixelTest.cc (e.g., Amazon, Rtings). We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
        </p>

        <h3>6. Changes to Terms</h3>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
        </p>

        <h3>7. Contact Us</h3>
        <p>
          If you have any questions about these Terms, please contact us at <a href="mailto:info@deadpixeltest.cc" className="text-blue-400 hover:underline">info@deadpixeltest.cc</a>.
        </p>
      </div>
    </div>
  );
};

export default Terms;