import React, { useEffect } from 'react';
import { Mail, MessageSquare, Clock } from 'lucide-react';

const Contact: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contact Support</h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
          Found a bug? Have a suggestion for a new test? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Email Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-900/20 to-neutral-900 border border-blue-500/20 p-8 rounded-2xl flex flex-col justify-center items-center text-center">
           <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-900/20">
             <Mail size={32} />
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">Email Us</h2>
           <p className="text-neutral-400 mb-6">For general inquiries, partnership opportunities, and bug reports.</p>
           <a 
             href="mailto:info@deadpixeltest.cc" 
             className="text-2xl md:text-3xl font-bold text-blue-400 hover:text-blue-300 transition-colors break-all"
           >
             info@deadpixeltest.cc
           </a>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
           <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/10 h-full">
              <div className="flex items-center gap-3 mb-4 text-white font-bold">
                <Clock className="text-neutral-400" />
                Response Time
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                We are a small team, but we aim to respond to all legitimate inquiries within <strong>24-48 hours</strong> during business days.
              </p>
           </div>
        </div>
      </div>

      <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare size={18} className="text-neutral-400" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-6">
           <div>
             <h4 className="text-white font-medium mb-2">Can you fix my physically broken screen?</h4>
             <p className="text-sm text-neutral-500">No. If your screen has cracked glass or black ink-like spots that grow, it is physical damage. Our tools can only help with "stuck" pixels (software/transistor errors).</p>
           </div>
           <div>
             <h4 className="text-white font-medium mb-2">Is this safe for OLED screens?</h4>
             <p className="text-sm text-neutral-500">Yes. However, do not leave static high-contrast patterns (like the grid test) on an OLED screen for hours at a time to avoid burn-in.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;