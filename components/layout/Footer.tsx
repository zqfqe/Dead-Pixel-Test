import React from 'react';
import { Link } from 'react-router-dom';
import { Scan, Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black pt-16 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-black">
                <Scan size={14} strokeWidth={3} />
              </div>
              DeadPixelTest.cc
            </div>
            <p className="text-neutral-300 leading-relaxed">
              The industry standard for display diagnostics. We help gamers, designers, and professionals achieve pixel perfection through advanced browser-based calibration tools.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" aria-label="Follow us on Twitter" className="text-neutral-400 hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" aria-label="View GitHub Repository" className="text-neutral-400 hover:text-white transition-colors"><Github size={18} /></a>
              <a href="mailto:info@deadpixeltest.cc" aria-label="Contact Support via Email" className="text-neutral-400 hover:text-white transition-colors"><Mail size={18} /></a>
            </div>
          </div>

          {/* Tests Column */}
          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Core Tests</h3>
            <ul className="space-y-3 text-neutral-300">
              <li><Link to="/tests/dead-pixel" className="hover:text-blue-400 transition-colors">Dead Pixel Test</Link></li>
              <li><Link to="/tests/uniformity" className="hover:text-blue-400 transition-colors">Uniformity Test</Link></li>
              <li><Link to="/tests/response-time" className="hover:text-blue-400 transition-colors">Ghosting / UFO Test</Link></li>
              <li><Link to="/tests/gamma" className="hover:text-blue-400 transition-colors">Gamma Calibration</Link></li>
              <li><Link to="/tests/color-gradient" className="hover:text-blue-400 transition-colors">Color Gradient</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Resources</h3>
            <ul className="space-y-3 text-neutral-300">
              <li><Link to="/blog" className="hover:text-blue-400 transition-colors">Knowledge Base</Link></li>
              <li><Link to="/tools/keyboard" className="hover:text-blue-400 transition-colors">Keyboard Ghosting</Link></li>
              <li><Link to="/tools/controller" className="hover:text-blue-400 transition-colors">Gamepad Tester</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Legal</h3>
            <ul className="space-y-3 text-neutral-300">
              <li><Link to="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Report a Bug</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
          <p>&copy; {currentYear} DeadPixelTest.cc. All rights reserved.</p>
          <p>Designed for display enthusiasts.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;