import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CommandPalette from './components/common/CommandPalette';
import { Loader2 } from 'lucide-react';

// Lazy Load Pages - Phase 1
const DeadPixelTest = lazy(() => import('./components/tests/DeadPixelTest'));
const UniformityTest = lazy(() => import('./components/tests/UniformityTest'));
const TextClarityTest = lazy(() => import('./components/tests/TextClarityTest'));
const ColorGradientTest = lazy(() => import('./components/tests/ColorGradientTest'));
const ColorDistanceTest = lazy(() => import('./components/tests/ColorDistanceTest'));
const GhostingTest = lazy(() => import('./components/tests/GhostingTest'));
const MatrixTest = lazy(() => import('./components/tests/MatrixTest'));
const GammaTest = lazy(() => import('./components/tests/GammaTest'));
const TestPatterns = lazy(() => import('./components/tests/TestPatterns'));
const ViewingAngleTest = lazy(() => import('./components/tests/ViewingAngleTest'));
const BrightnessTest = lazy(() => import('./components/tests/BrightnessTest'));
const ContrastTest = lazy(() => import('./components/tests/ContrastTest'));
const KeyboardTest = lazy(() => import('./components/tools/KeyboardTest'));
const ControllerTest = lazy(() => import('./components/tools/ControllerTest'));

// Lazy Load Pages - Phase 2 (New)
const LocalDimmingTest = lazy(() => import('./components/tests/LocalDimmingTest'));
const AudioSyncTest = lazy(() => import('./components/tests/AudioSyncTest'));
const ReactionTimeTest = lazy(() => import('./components/tools/ReactionTimeTest'));
const PPICalculator = lazy(() => import('./components/tools/PPICalculator'));

// Lazy Load Pages - Phase 3 (Input Expansion)
const MousePollingTest = lazy(() => import('./components/tools/MousePollingTest'));
const TouchTest = lazy(() => import('./components/tools/TouchTest'));

const ProductPage = lazy(() => import('./components/resources/ProductPage'));
const BlogIndex = lazy(() => import('./components/blog/BlogIndex'));
const BlogPost = lazy(() => import('./components/blog/BlogPost'));
const About = lazy(() => import('./components/pages/About'));
const Contact = lazy(() => import('./components/pages/Contact'));
const Privacy = lazy(() => import('./components/pages/Privacy'));
const Terms = lazy(() => import('./components/pages/Terms'));

const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-3 text-neutral-500">
      <Loader2 className="animate-spin" size={20} />
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen font-sans bg-black text-white flex flex-col">
        <Header />
        <CommandPalette />
        
        {/* Main Content Area */}
        <main className="w-full flex-1 pt-24 transition-all duration-300">
          <div className="max-w-7xl mx-auto p-6 lg:p-12">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Phase 1 Tests */}
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
                
                {/* Phase 2 Tests */}
                <Route path="/tests/local-dimming" element={<LocalDimmingTest />} />
                <Route path="/tests/audio-sync" element={<AudioSyncTest />} />
                
                {/* Tools */}
                <Route path="/tools/keyboard" element={<KeyboardTest />} />
                <Route path="/tools/controller" element={<ControllerTest />} />
                <Route path="/tools/reaction-time" element={<ReactionTimeTest />} />
                <Route path="/tools/ppi-calculator" element={<PPICalculator />} />
                <Route path="/tools/mouse-polling" element={<MousePollingTest />} />
                <Route path="/tools/touch" element={<TouchTest />} />

                {/* Blog & Resources */}
                <Route path="/blog" element={<BlogIndex />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/resources/:category/:slug" element={<ProductPage />} />

                {/* Info Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<Privacy />} />
                <Route path="/terms-of-service" element={<Terms />} />
              </Routes>
            </Suspense>
          </div>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;