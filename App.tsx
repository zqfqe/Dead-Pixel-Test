import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TestReportProvider } from './contexts/TestReportContext';
import Header from './components/layout/Header';
import { SEO_LANDING_PAGES } from './data/seoLandingPages';
import { MENU_ITEMS } from './data/menu';
import { BLOG_POSTS } from './data/blog';
import Footer from './components/layout/Footer';
import CommandPalette from './components/common/CommandPalette';
import { EmbeddedToolContext } from './components/common/TestIntro';
import { Loader2 } from 'lucide-react';

// The Astro homepage has its own React island. Avoid eagerly loading this legacy test on every tool route.
const DeadPixelTest = lazy(() => import('./components/tests/DeadPixelTest'));

// Lazy Load Pages - Phase 1
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
const DoubleClickTest = lazy(() => import('./components/tools/DoubleClickTest'));
const TouchTest = lazy(() => import('./components/tools/TouchTest'));

// Lazy Load Pages - Phase 4 (Audio & Utils)
const SpeakerTest = lazy(() => import('./components/tools/SpeakerTest'));
const PhysicalRuler = lazy(() => import('./components/tools/PhysicalRuler'));
const WebcamTest = lazy(() => import('./components/tools/WebcamTest'));
const RefreshRateTest = lazy(() => import('./components/tests/RefreshRateTest'));

// Lazy Load Pages - Phase 5 (Advanced Tools)
const BurnInWiper = lazy(() => import('./components/tools/BurnInWiper'));
const ColorBlindnessTest = lazy(() => import('./components/tools/ColorBlindnessTest'));
const InputLagTest = lazy(() => import('./components/tools/InputLagTest'));

const ProductPage = lazy(() => import('./components/resources/ProductPage'));
const BlogIndex = lazy(() => import('./components/blog/BlogIndex'));
const BlogPost = lazy(() => import('./components/blog/BlogPost'));
const About = lazy(() => import('./components/pages/About'));
const Contact = lazy(() => import('./components/pages/Contact'));
const Privacy = lazy(() => import('./components/pages/Privacy'));
const Terms = lazy(() => import('./components/pages/Terms'));
const NotFound = lazy(() => import('./components/pages/NotFound'));
const SeoLandingPage = lazy(() => import('./components/pages/SeoLandingPage'));


const documentTools = {
  '/tests/uniformity': UniformityTest,
  '/tests/text-clarity': TextClarityTest,
  '/tests/color-gradient': ColorGradientTest,
  '/tests/color-distance': ColorDistanceTest,
  '/tests/response-time': GhostingTest,
  '/tests/gamma': GammaTest,
  '/tests/test-patterns': TestPatterns,
  '/tests/viewing-angle': ViewingAngleTest,
  '/tests/brightness': BrightnessTest,
  '/tests/contrast': ContrastTest,
  '/tests/matrix': MatrixTest,
  '/tests/audio-sync': AudioSyncTest,
  '/tools/keyboard': KeyboardTest,
  '/tools/controller': ControllerTest,
  '/tools/reaction-time': ReactionTimeTest,
  '/tools/ppi-calculator': PPICalculator,
  '/tools/mouse-polling': MousePollingTest,
  '/tools/double-click-test': DoubleClickTest,
  '/tools/touch': TouchTest,
  '/tools/speaker-test': SpeakerTest,
  '/tools/ruler': PhysicalRuler,
  '/tools/webcam': WebcamTest,
  '/tools/burn-in-wiper': BurnInWiper,
  '/tools/color-blindness': ColorBlindnessTest,
  '/tools/input-lag': InputLagTest,
};

const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-3 text-neutral-500">
      <Loader2 className="animate-spin" size={20} />
    </div>
  </div>
);

// Astro owns the actual HTML document, canonical and indexability for each static route.
// Client-side React Router transitions must never leave a legacy route's metadata on screen.
const normalizeDocumentPath=(path:string)=>path==='/'?'/':path.replace(/\/+$/,'');
const staticDocumentPaths=new Set([
 ...MENU_ITEMS.filter(item=>!item.isHeader&&item.path.startsWith('/')).map(item=>normalizeDocumentPath(item.path)),
 ...SEO_LANDING_PAGES.map(page=>normalizeDocumentPath(page.path)),
 ...BLOG_POSTS.map(post=>'/blog/'+post.slug),
 '/tests/dead-pixel','/about','/contact','/privacy-policy','/terms-of-service'
]);
const AstroDocumentNavigation:React.FC=()=>{
 const route=useLocation();
 const mountedPath=React.useRef(normalizeDocumentPath(window.location.pathname));
 // Route changes initiated by the command palette or other imperative navigate calls
 // must also return control to Astro's static HTML response.
 React.useEffect(()=>{
  if(document.documentElement.hasAttribute('data-astro-site') &&
     normalizeDocumentPath(route.pathname)!==mountedPath.current &&
     staticDocumentPaths.has(normalizeDocumentPath(route.pathname))){
   window.location.reload();
  }
 },[route.pathname]);
 React.useEffect(()=>{
  if(!document.documentElement.hasAttribute('data-astro-site'))return;
  const onClick=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const target=event.target;
   if(!(target instanceof Element))return;
   const anchor=target.closest<HTMLAnchorElement>('a[href]');
   if(!anchor || anchor.hasAttribute('download') || (anchor.target&&anchor.target!=='_self'))return;
   let destination:URL;
   try{destination=new URL(anchor.href);}catch{return;}
   if(destination.origin!==window.location.origin ||
      (destination.pathname===window.location.pathname&&destination.search===window.location.search) ||
      !staticDocumentPaths.has(normalizeDocumentPath(destination.pathname)))return;
   event.preventDefault();
   event.stopImmediatePropagation();
   // Avoid reliance on Cloudflare-only slash redirects in Astro preview and SPA links.
   destination.pathname=normalizeDocumentPath(destination.pathname);
   window.location.assign(destination.href);
  };
  document.addEventListener('click',onClick,true);
  return()=>document.removeEventListener('click',onClick,true);
 },[]);
 return null;
};

export const ToolWorkspace: React.FC<{path: string}> = ({path}) => {
  const Tool = documentTools[path as keyof typeof documentTools];
  if (!Tool) return null;
  return (
    <TestReportProvider>
      <Router>
        <AstroDocumentNavigation />
        <CommandPalette showTrigger />
        <EmbeddedToolContext.Provider value={true}>
          <div data-tool-workspace={path}>
            <Suspense fallback={<p role="status" className="text-sm text-neutral-200">Loading test controls…</p>}>
              <Tool />
            </Suspense>
          </div>
        </EmbeddedToolContext.Provider>
      </Router>
    </TestReportProvider>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <TestReportProvider>
        <Router>
          <AstroDocumentNavigation />
          <div className="min-h-screen font-sans bg-black text-white flex flex-col">
            <Header />
            <CommandPalette />
            
            {/* Main Content Area */}
            <main id="main-content" tabIndex={-1} className="w-full flex-1 pt-24 transition-all duration-300">
              <div className="max-w-7xl mx-auto p-6 lg:p-12">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Standalone router fallback. Published tool pages mount ToolWorkspace. */}
                    {SEO_LANDING_PAGES.filter(page => page.path !== '/' && page.mode !== 'refresh-rate' && page.mode !== 'local-dimming').map(page => (
                      <Route key={page.path} path={page.path} element={<SeoLandingPage />} />
                    ))}
                    {Object.entries(documentTools).map(([path, Tool]) => <Route key={path} path={path} element={<Tool />} />)}
                    {/* Pixel test fallback for the retired URL. */}
                    <Route path="/" element={<DeadPixelTest />} />
                    <Route path="/tests/dead-pixel" element={<DeadPixelTest />} />
                    
                    <Route path="/tests/local-dimming" element={<LocalDimmingTest />} />
                    <Route path="/tests/refresh-rate" element={<RefreshRateTest />} />
                    
                    

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