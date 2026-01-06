import React, { useEffect } from 'react';
import { SEO } from '../common/SEO';

const Privacy: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <SEO 
        title="Privacy Policy - DeadPixelTest.cc" 
        description="We respect your privacy. Learn how DeadPixelTest.cc handles your data (we don't collect personal data from our tests)."
        canonical="/privacy-policy"
      />
      <div className="max-w-3xl mx-auto py-12 animate-fade-in px-6">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-neutral-500 mb-8">Last Updated: January 6, 2026</p>

        <div className="prose prose-invert prose-neutral max-w-none text-neutral-300">
          <p>
            At <strong>DeadPixelTest.cc</strong> ("we", "us", "our"), we respect your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website. By using our website, you agree to the terms of this policy.
          </p>

          <h3>1. Information We Collect</h3>
          <p>
            <strong>Usage Data:</strong> We may collect non-personal information about how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and unique device identifiers.
          </p>
          <p>
            <strong>No Personal Data for Tests:</strong> Our display testing tools (Dead Pixel Test, Uniformity Test, etc.) run entirely <strong>client-side</strong> within your browser. We do not capture, record, or upload screenshots of your display. The patterns generated are rendered locally on your device.
          </p>

          <h3>2. Cookies and Tracking Technologies</h3>
          <p>
            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
          </p>
          <ul>
            <li><strong>Essential Cookies:</strong> We may use cookies to remember your preferences (such as your last used brightness setting in a test).</li>
            <li><strong>Analytics Cookies:</strong> We may use third-party analytics services (such as Google Analytics 4) to monitor and analyze the use of our Service.</li>
            <li><strong>Advertising Cookies:</strong> We may use third-party advertising companies to serve ads when you visit our website. These companies may use information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</li>
          </ul>

          <h3>3. Third-Party Services</h3>
          <p>
            We may employ third-party companies and individuals due to the following reasons:
          </p>
          <ul>
            <li>To facilitate our Service;</li>
            <li>To provide the Service on our behalf;</li>
            <li>To perform Service-related services; or</li>
            <li>To assist us in analyzing how our Service is used.</li>
          </ul>

          <h3>4. Data Security</h3>
          <p>
            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>

          <h3>5. Changes to This Privacy Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h3>6. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us by email at: <a href="mailto:info@deadpixeltest.cc" className="text-blue-400 hover:underline">info@deadpixeltest.cc</a>.
          </p>
        </div>
      </div>
    </>
  );
};

export default Privacy;