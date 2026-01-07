import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CommandPalette from './components/common/CommandPalette';

// Static Imports for SSG/Pre-rendering
import DeadPixelTest from './components/tests/DeadPixelTest';
import UniformityTest from './components/tests/UniformityTest';
import TextClarityTest from './components/tests/TextClarityTest';
import ColorGradientTest from './components/tests/ColorGradientTest';
import ColorDistanceTest from './components/tests/ColorDistanceTest';
import GhostingTest from './components/tests/GhostingTest';
import MatrixTest from './components/tests/MatrixTest';
import GammaTest from './components/tests/GammaTest';
import TestPatterns from './components/tests/TestPatterns';
import ViewingAngleTest from './components/tests/ViewingAngleTest';
import BrightnessTest from './components/tests/BrightnessTest';
import ContrastTest from './components/tests/ContrastTest';
import KeyboardTest from './components/tools/KeyboardTest';
import ControllerTest from './components/tools/ControllerTest';
import LocalDimmingTest from './components/tests/LocalDimmingTest';
import AudioSyncTest from './components/tests/AudioSyncTest';
import ReactionTimeTest from './components/tools/ReactionTimeTest';
import PPICalculator from './components/tools/PPICalculator';
import MousePollingTest from './components/tools/MousePollingTest';
import TouchTest from './components/tools/TouchTest';
import SpeakerTest from './components/tools/SpeakerTest';
import PhysicalRuler from './components/tools/PhysicalRuler';
import WebcamTest from './components/tools/WebcamTest';
import RefreshRateTest from './components/tests/RefreshRateTest';
import ProductPage from './components/resources/ProductPage';
import BlogIndex from './components/blog/BlogIndex';
import BlogPost from './components/blog/BlogPost';
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import Privacy from './components/pages/Privacy';
import Terms from './components/pages/Terms';
import NotFound from './components/pages/NotFound';

const App: React.FC = () => {
  return (
    <div className="min-h-screen font-sans bg-black text-white flex flex-col">
      <Header />
      <CommandPalette />
      
      {/* Main Content Area */}
      <main className="w-full flex-1 pt-24 transition-all duration-300">
        <div className="max-w-7xl mx-auto p-6 lg:p-12">
            <Routes>
              {/* Core Tests */}
              <Route path="/" element={<DeadPixelTest />} />
              <Route path="/tests/dead-pixel" element={<DeadPixelTest />} />
              <Route path="/tests/uniformity" element={<UniformityTest />} />
              <Route path="/tests/text-clarity" element={<TextClarityTest />} />
              <Route path="/tests/color-gradient" element={<ColorGradientTest />} />
              <Route path="/tests/color-distance" element={<ColorDistanceTest />} />
              <Route path="/tests/response-time" element={<GhostingTest />} />
              <Route path="/tests/gamma" element={<GammaTest />} />
              <Route path="/tests/test-patterns" element={<TestPatterns />} />
              <Route path="/tests/viewing-angle" element={<ViewingAngleTest />} />
              <Route path="/tests/brightness" element={<BrightnessTest />} />
              <Route path="/tests/contrast" element={<ContrastTest />} />
              <Route path="/tests/matrix" element={<MatrixTest />} />
              
              {/* Secondary Tests */}
              <Route path="/tests/local-dimming" element={<LocalDimmingTest />} />
              <Route path="/tests/audio-sync" element={<AudioSyncTest />} />
              <Route path="/tests/refresh-rate" element={<RefreshRateTest />} />
              
              {/* Tools */}
              <Route path="/tools/keyboard" element={<KeyboardTest />} />
              <Route path="/tools/controller" element={<ControllerTest />} />
              <Route path="/tools/reaction-time" element={<ReactionTimeTest />} />
              <Route path="/tools/ppi-calculator" element={<PPICalculator />} />
              <Route path="/tools/mouse-polling" element={<MousePollingTest />} />
              <Route path="/tools/touch" element={<TouchTest />} />
              <Route path="/tools/speaker-test" element={<SpeakerTest />} />
              <Route path="/tools/ruler" element={<PhysicalRuler />} />
              <Route path="/tools/webcam" element={<WebcamTest />} />

              {/* Blog & Resources */}
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/resources/:category/:slug" element={<ProductPage />} />

              {/* Info Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<Privacy />} />
              <Route path="/terms-of-service" element={<Terms />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;