import { BlogPost } from '../types';

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'dead-pixel-vs-stuck-pixel-ultimate-guide',
    title: 'Dead vs. Stuck Pixels: How to Check and What to Do',
    excerpt: 'Compare dead, stuck and bright pixel symptoms. Use a safe eight-color screen check, record visual evidence and understand manufacturer-specific warranty rules.',
    coverImage: 'https://images.unsplash.com/photo-1550003018-7253a5b81093?auto=format&fit=crop&q=80&w=1200',
    date: 'Jan 06, 2026',
    author: 'DeadPixelTest',
    category: 'Troubleshooting',
    relatedTestPath: '/',
    relatedTestName: 'Dead Pixel Test',
    content: `
<p>A small dark or colored dot on a monitor is not automatically proof of a defective panel. Dust, a screen protector, a stuck subpixel and a failed pixel can look similar. A website can show reference patterns, but cannot determine the panel's hardware status.</p>
      <h2>Dead pixel, stuck pixel and bright pixel: key differences</h2>
      <ul>
        <li><strong>Suspected dark/dead pixel:</strong> a fixed dark dot, often most noticeable on a white background.</li>
        <li><strong>Suspected stuck or bright subpixel:</strong> a persistent colored or bright point that stands out on black or another solid background.</li>
        <li><strong>Dust or surface mark:</strong> something on the glass or protector can resemble a pixel fault; cleaning may change its appearance.</li>
        <li><strong>Full-screen line or ghost outline:</strong> these are different symptoms; a full row/column or retained image is not necessarily an isolated dead pixel.</li>
      </ul>
      <p>Visual appearance varies with panel technology. See <a href="/what-is-a-dead-pixel">the dead-pixel explanation guide</a> for more context.</p>

      <h2>How to check using eight safe, static colors</h2>
      <ol>
        <li>Clean the screen gently with a suitable microfiber cloth and note any screen protector or reflections.</li>
        <li>Open the <a href="/">free dead pixel test</a> on the display you want to inspect. For laptops connected to an external monitor, move the browser onto the correct physical display.</li>
        <li>Start full-screen inspection and manually view black, white, red, green, blue, cyan, magenta and yellow, one color at a time.</li>
        <li>Look at the same location across multiple colors. A mark that appears on one background may behave differently on another.</li>
        <li>Use the marking tool to save approximate locations and color-by-color observations. Download a JSON or printable HTML self-check record if you need to discuss the issue with support.</li>
      </ol>
      <p>The marker represents a location within the browser viewport, not a measured physical pixel coordinate. A normal digital screenshot usually does not reveal faults that exist only in the display panel.</p>

      <h2>Can you fix a dead or stuck pixel online?</h2>
      <p><strong>Software cannot repair a physically failed pixel.</strong> Web advice to press the panel, apply heat or run rapid flashes for hours has no reliable repair guarantee and may cause further damage, discomfort or warranty problems. Do not attempt those methods.</p>
      <p>If you need to compare a suspected colored dot, try the <a href="/dead-pixel-fixer">static stuck-pixel observation tool</a>. Its movable color patch is manually controlled, does not rapidly flash, and is not advertised as a repair.</p>

      <h2>What if you see a line or image retention?</h2>
      <p>A continuous horizontal or vertical line needs broader troubleshooting: compare colors and, where feasible, another cable, input or external display using the <a href="/dead-pixel-line-test">screen line test</a>. A faint outline from earlier content may be image retention; compare it briefly with the <a href="/image-retention-test">image retention test</a>.</p>

      <h2>What do screen warranties cover?</h2>
      <p>Record the exact model, date of purchase, quantity and approximate positions of visible defects, and which backgrounds reveal them. Contact the seller or manufacturer while the return window or warranty is active. <strong>Defect thresholds depend on the brand, product, panel technology and warranty program</strong>; no single pixel-count formula guarantees replacement.</p>
      <p>For a model-specific example, <a href="https://www.dell.com/support/kbdoc/en-us/000126004/dell-display-pixel-guidelines" target="_blank" rel="noopener noreferrer">Dell's display pixel guidelines</a> describe bright/dark pixel criteria and caution against DIY pressure or repair-software attempts. Those rules should not be assumed to apply to another manufacturer.</p>

      <h2>Summary</h2>
      <p>Use multiple static colors, record only what you observe, and request manufacturer support when necessary. Browser inspection can clarify a symptom, but it cannot certify a defective panel or guarantee a repair.</p>
    `
  },
  {
    id: '2',
    slug: 'ips-glow-vs-backlight-bleed-guide',
    title: 'IPS Glow vs. Backlight Bleed: How to Compare Them',
    excerpt: 'Compare IPS glow and backlight bleed with a dark-screen check and viewing-angle changes. Understand camera, brightness and warranty limitations.',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
    date: 'Jan 05, 2026',
    author: 'DeadPixelTest',
    category: 'Panel Tech',
    relatedTestPath: '/tests/uniformity',
    relatedTestName: 'Uniformity Test',
    content: `
<p>Bright corners in a dark scene can be frustrating. IPS glow, backlight bleed, local dimming and camera exposure can all affect what you see. Neither a screenshot nor a dark-room phone photograph proves a display is defective.</p>
      <h2>IPS glow: an angle-dependent appearance</h2>
      <p>Some IPS LCD panels show a diffuse silver, blue or amber glow, often around the corners when displaying black. Change your seating position and notice whether the glow shifts or changes intensity. Some glow is a panel characteristic, but it can still be distracting in normal use.</p>
      <h2>Backlight bleed: local uneven brightness</h2>
      <p>Edge-lit LCD panels may show uneven illumination around the bezel. A localized bright patch that stays in roughly the same area across viewing angles can be consistent with bleed. It is not necessarily proof of a particular failed component. OLED panels have no conventional LCD backlight, so the same classification does not apply.</p>
      <h2>Run a consistent comparison</h2>
      <ol>
        <li>Use typical room lighting and normal brightness rather than an exaggerated dark-room, maximum-brightness setup.</li>
        <li>Open the <a href="/tests/uniformity">uniformity test</a> and examine a full black field at ordinary viewing distance.</li>
        <li>Shift your head slightly and note whether the glow changes. Do not press the screen or bezel.</li>
        <li>Repeat with real games, movies or documents to judge whether the unevenness affects normal use.</li>
        <li>Record HDR, local dimming, automatic brightness and other relevant settings before comparing results.</li>
      </ol>
      <p>A phone camera may overexpose dark content and make a patch look much brighter than it appears to your eyes. A browser cannot measure physical brightness in nits or issue a warranty diagnosis.</p>
      <h2>When to ask for help</h2>
      <p>If unevenness is clearly distracting at your ordinary settings, contact the seller or manufacturer and review the exact product's return conditions. For other dark-screen artifacts, compare the <a href="/tests/local-dimming">local dimming and blooming test</a> or <a href="/screen-contrast-test">grayscale and contrast test</a>.</p>
    `
  },
  {
    id: '3',
    slug: 'monitor-calibration-guide-no-hardware',
    title: 'Monitor Color Check Without a Colorimeter: Practical Limits',
    excerpt: 'Use grayscale, black-level and gradient test patterns to check visible monitor settings. Learn why browser checks cannot certify calibrated colors.',
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200',
    date: 'Jan 02, 2026',
    author: 'DeadPixelTest',
    category: 'Calibration',
    relatedTestPath: '/screen-contrast-test',
    relatedTestName: 'Contrast & Grayscale Test',
    content: `
<p>Free browser patterns can help reveal obvious dark-level crushing, white clipping, color banding and unevenness. They cannot measure a monitor's true light output or certify color accuracy. Use them as visual checks, not as substitutes for a colorimeter.</p>
      <h2>Why visual adjustment is not calibration</h2>
      <p>True display calibration requires measuring the panel's emitted color and brightness under repeatable conditions. A browser cannot directly report real nits, sRGB coverage, color-temperature accuracy or an objectively verified gamma curve. Browser scaling, HDR, color profiles and the operating system can alter what a test pattern looks like.</p>
      <h2>Step 1: Make your test conditions repeatable</h2>
      <ul><li>Use comfortable lighting and your usual viewing distance.</li><li>Record the current display picture mode before changing it.</li><li>Note whether HDR, Night Shift/Night Light and adaptive brightness are enabled.</li><li>Follow the manufacturer recommendations for warming up and selecting picture presets.</li></ul>
      <h2>Step 2: Check shadows and highlights</h2>
      <p>Open the <a href="/screen-contrast-test">contrast and grayscale test</a>. Look for near-black steps that become indistinguishable and for near-white steps that appear clipped. Adjust one setting at a time and record the original value. No universal on-screen brightness percentage corresponds to the same measured luminance across monitors.</p>
      <h2>Step 3: Check smooth gradients</h2>
      <p>View the <a href="/tests/color-gradient">color gradient test</a>. Distinct bands may come from dithering, source bit depth, GPU signal settings, HDR transforms or the panel itself. Repeat in a second application before drawing conclusions.</p>
      <h2>Step 4: Treat gamma patterns as approximations</h2>
      <p>Pixel-level stripe comparisons depend on browser zoom, device pixel ratio and viewing distance. The <a href="/tests/gamma">gamma visual test</a> can help show differences, but cannot establish a measured response curve or make a reliable ICC profile.</p>
      <h2>When does hardware measurement matter?</h2>
      <p>For professional photography, print proofing and color-critical design, use a colorimeter or spectrophotometer with suitable profiling software. There is no substantiated claim that manual browser adjustments achieve a fixed percentage of measured calibration accuracy.</p>
      <p>For a separate display specification check, the <a href="/screen-resolution-test">resolution and DPR checker</a> explains what browsers can and cannot know about physical pixels.</p>
    `
  }
];