import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TestReportProvider } from './contexts/TestReportContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CommandPalette from './components/common/CommandPalette';
import { Loader2 } from 'lucide-react';

// Critical Path Optimization:
// Eagerly load the Home Page so it is included in the main bundle or started immediately.
// This removes one full round-trip of latency for the user's first view.
import DeadPixelTest from './components/tests/DeadPixelTest';

// Lazy Load Other Pages (Non-Critical)
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

// Phase 2
const LocalDimmingTest = lazy(() => import('./components/tests/LocalDimmingTest'));
const AudioSyncTest = lazy(() => import('./components/tests/AudioSyncTest'));
const ReactionTimeTest = lazy(() => import('./components/tools/ReactionTimeTest'));
const PPICalculator = lazy(() => import('./components/tools/PPICalculator'));

// Phase 3
const MousePollingTest = lazy(() => import('./components/tools/MousePollingTest'));
const TouchTest = lazy(() => import('./components/tools/TouchTest'));

// Phase 4
const SpeakerTest = lazy(() => import('./components/tools/SpeakerTest'));
const PhysicalRuler = lazy(() => import('./components/tools/PhysicalRuler'));
const WebcamTest = lazy(() => import('./components/tools/WebcamTest'));
const RefreshRateTest = lazy(() => import('./components/tests/RefreshRateTest'));

const ProductPage = lazy(() => import('./components/resources/ProductPage'));
const BlogIndex = lazy(() => import('./components/blog/BlogIndex'));
const BlogPost = lazy(() => import('./components/blog/BlogPost'));
const About = lazy(() => import('./components/pages/About'));
const Contact = lazy(() => import('./components/pages/Contact'));
const Privacy = lazy(() => import('./components/pages/Privacy'));
const Terms = lazy(() => import('./components/pages/Terms'));
const NotFound = lazy(() => import('./components/pages/NotFound'));

const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-3 text-neutral-500">
      <Loader2 className="animate-spin" size={20} />
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <TestReportProvider>
        <Router>
          <div className="min-h-screen font-sans bg-black text-white flex flex-col">
            <Header />
            <CommandPalette />
            
            {/* Main Content Area */}
            <main className="w-full flex-1 pt-24 transition-all duration-300">
              <div className="max-w-7xl mx-auto p-6 lg:p-12">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Eager Loaded Home */}
                    <Route path="/" element={<DeadPixelTest />} />
                    <Route path="/tests/dead-pixel" element={<DeadPixelTest />} />
                    
                    {/* Lazy Loaded Routes */}
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
                    
                    <Route path="/tests/local-dimming" element={<LocalDimmingTest />} />
                    <Route path="/tests/audio-sync" element={<AudioSyncTest />} />
                    <Route path="/tests/refresh-rate" element={<RefreshRateTest />} />
                    
                    <Route path="/tools/keyboard" element={<KeyboardTest />} />
                    <Route path="/tools/controller" element={<ControllerTest />} />
                    <Route path="/tools/reaction-time" element={<ReactionTimeTest />} />
                    <Route path="/tools/ppi-calculator" element={<PPICalculator />} />
                    <Route path="/tools/mouse-polling" element={<MousePollingTest />} />
                    <Route path="/tools/touch" element={<TouchTest />} />
                    <Route path="/tools/speaker-test" element={<SpeakerTest />} />
                    <Route path="/tools/ruler" element={<PhysicalRuler />} />
                    <Route path="/tools/webcam" element={<WebcamTest />} />

                    <Route path="/blog" element={<BlogIndex />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/resources/:category/:slug" element={<ProductPage />} />

                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy-policy" element={<Privacy />} />
                    <Route path="/terms-of-service" element={<Terms />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </main>

            <Footer />
          </div>
        </Router>
      </TestReportProvider>
    </HelmetProvider>
  );
};

export default App;