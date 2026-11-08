import React, { useEffect } from 'react';
import { SEO } from '../common/SEO';

const Privacy: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <SEO
        title="Privacy Policy"
        description="How DeadPixelTest handles browser-side test data, local storage, camera permissions and hosting request metadata."
        canonical="/privacy-policy"
      />
      <main className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-neutral-500 mb-8">Last updated: November 8, 2026</p>
        <div className="prose prose-invert prose-neutral max-w-none text-neutral-300">
          <p>
            This policy describes the current preview version of DeadPixelTest and the data practices visible in its application code. It may change before public launch as hosting, analytics, advertising or support services are configured.
          </p>

          <h2>1. Display tests and information processed in your browser</h2>
          <p>
            The screen patterns and visual inspection controls run in your browser. The dead-pixel, screen-line and image-retention checks ask you to inspect the display yourself; they do not automatically scan the physical panel. The current application code does not send your marked screen locations, test observations or screenshots to an application server.
          </p>
          <p>
            Some existing tools save settings and test-report entries in your browser's local storage. These values remain in that browser profile and are not uploaded by the site's application code. You can remove them by clearing this site's stored data in your browser. Exported JSON, HTML reports and snapshots are created as downloads only when you choose to export them.
          </p>

          <h2>2. Camera, microphone and selected images</h2>
          <p>
            The webcam and color-vision simulation tools request camera or microphone access only after you choose to start those features and grant the browser permission. Their live media is processed in the browser. The webcam snapshot feature creates a local download; it does not upload the image to this site's application server. The color-vision simulator can also display an image you select from your device; the selected file is loaded locally for the preview.
          </p>
          <p>
            Stop the camera tool when finished. You can also revoke camera and microphone permissions in your browser or operating-system settings. Browser permission prompts and device access are controlled by your browser and operating system.
          </p>

          <h2>3. Hosting and basic request information</h2>
          <p>
            The site is built as a static website for Cloudflare Pages. When your browser requests a page or asset, the hosting and network infrastructure may process technical request information such as your IP address, requested URL, timestamp, user-agent and security-related metadata to deliver and protect the service. The handling and retention of infrastructure logs are governed by the hosting provider's applicable policies; the site application does not control those systems.
          </p>

          <h2>4. Cookies, analytics and advertising</h2>
          <p>
            As of the date above, the current application code does not include Google Analytics, advertising tags or third-party tracking pixels, and the site code does not intentionally set first-party cookies. Browser local storage, described above, is separate from cookies. If analytics, advertising or other third-party services are added later, this policy and any required consent controls must be updated before they are enabled.
          </p>

          <h2>5. Third-party websites</h2>
          <p>
            Links to external websites are provided for convenience. Those websites operate under their own privacy and data-handling policies. Review their policies before sharing information with them.
          </p>

          <h2>6. Your choices and deletion</h2>
          <ul>
            <li>Clear this site's local storage and other site data in your browser to remove locally saved test settings and report entries.</li>
            <li>Revoke camera and microphone permissions in your browser or operating system.</li>
            <li>Do not export or share a test report if it contains notes you consider private.</li>
          </ul>
          <p>
            The site application does not maintain an account system or a server-side database for the test records described above. Hosting-provider request logs, if retained, are subject to the provider's policies.
          </p>

          <h2>7. Policy updates and contact</h2>
          <p>
            This policy will be revised if the site's data practices change. A verified privacy contact email has not yet been configured for this preview project and must be added before public launch. Do not send sensitive personal information through public issue trackers.
          </p>
        </div>
      </main>
    </>
  );
};

export default Privacy;
