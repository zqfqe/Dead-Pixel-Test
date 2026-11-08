import React, { useEffect } from 'react';
import { Github, MessageSquare, ShieldAlert } from 'lucide-react';
import { SEO } from '../common/SEO';

const Contact: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <SEO
        title="Contact and Feedback"
        description="How to report a bug or suggest an improvement for the DeadPixelTest preview project."
        canonical="/contact"
      />
      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">Contact & Feedback</h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            DeadPixelTest is still in preview. A verified public support email has not yet been configured.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-neutral-900/50 border border-white/10 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-4 text-white font-bold">
            <Github className="text-neutral-300" size={24} />
            <h2 className="text-2xl">Bug reports and feature requests</h2>
          </div>
          <p className="text-neutral-300 leading-7 mb-6">
            For public technical issues and suggestions, use the project's GitHub issue tracker. Do not post passwords, private contact details, device serial numbers, screenshots containing personal information or other sensitive data in a public issue.
          </p>
          <a
            href="https://github.com/zqfqe/Dead-Pixel-Test/issues"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
          >
            <MessageSquare size={18} /> Open GitHub Issues
          </a>
        </div>

        <div className="max-w-2xl mx-auto mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-100">
          <div className="flex items-center gap-2 font-semibold mb-2"><ShieldAlert size={18} /> Privacy requests</div>
          <p>
            Please do not submit sensitive privacy requests through a public issue. A verified private contact channel will be added before the production launch.
          </p>
        </div>

        <section className="max-w-2xl mx-auto mt-10 bg-neutral-900/30 border border-white/5 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-5">
            <div>
              <h3 className="text-white font-medium mb-2">Can this website repair a physically damaged screen?</h3>
              <p className="text-sm text-neutral-400">No. The tools display visual patterns and help you document what you observe. They cannot repair a damaged panel or confirm which component has failed.</p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Are camera images or screen observations uploaded?</h3>
              <p className="text-sm text-neutral-400">The current application processes camera previews, selected images and screen-test observations in your browser. Webcam snapshots are downloaded locally when you choose that action; the application does not upload them to its server.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Contact;
