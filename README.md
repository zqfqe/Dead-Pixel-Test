# Dead Pixel Test — Astro Static Display Tools

Astro 6 static site with React islands for browser-based screen diagnostics.

## Build

Node.js 22.12+.

\`\`\`sh
npm install
npm run check:types
npm run build
npm run preview
\`\`\`

## Cloudflare Pages

- Build command: \`npm run build\`
- Output directory: \`dist\`
- Node.js: 22.12+
- The V1.2 project brief did not specify a purchased production domain.
- Do not use the competitor's \`.org\` domain or guess a \`pages.dev\` hostname as canonical.
- Once the real domain is purchased and connected, set \`PUBLIC_SITE_URL\` in Cloudflare Pages production and preview build environments to the HTTPS origin only (for example, \`https://your-domain.com\`).

Without \`PUBLIC_SITE_URL\`, builds deliberately:
- add \`noindex,nofollow\` to every page;
- omit canonical and hreflang tags;
- emit an empty sitemap;
- omit a guessed Sitemap URL from robots.txt.

## Architecture

- Astro owns static HTML, routing and SEO metadata.
- React islands provide the interactive visual tests.
- The primary dead-pixel workflow is exactly eight static colors in this order: black, white, red, green, blue, cyan, magenta, yellow.
- Separate grayscale, near-black, near-white, line and checkerboard patterns support additional inspection modes.
- Markers are user-entered viewport ratios, with categories, notes and cross-color rechecks.
- JSON and printable HTML exports are user-observed records, not a diagnosis or certification.

## SEO continuity

Existing GSC routes such as \`/tests/refresh-rate\`, \`/tests/local-dimming\`, \`/tests/color-gradient\`, \`/tests/audio-sync\` and \`/tests/test-patterns\` are preserved. Planned EN/pt-BR pages are not automatically proven indexable; follow the V1.2 SERP and content-quality gates.

## Verification

GitHub Actions checks domainless and configured builds, static routes, metadata and 22 Chromium browser scenarios (including mobile emulation, keyboard access, visual-test reports, camera/media cleanup and same-origin request audit). Failure screenshots are retained for debugging. Production smoke is explicitly skipped when the PUBLIC_SITE_URL GitHub Actions variable is not configured; a deployment or build success does not establish custom-domain availability or Google indexing.


## Privacy and safety

- No analytics, advertising tags or third-party tracking pixels are included in the current application bundle.
- The browser smoke suite flags third-party HTTP(S) requests, non-GET/HEAD requests and third-party scripts/frames on the tested routes.
- Camera and microphone access is user-initiated; the webcam snapshot is generated as a local download.
- Color-vision image previews use local object URLs. Screen markers and test reports are not uploaded by the application.
- Existing preferences and report entries may be stored in browser localStorage; users can clear site data to remove them.
- The privacy policy describes hosting-provider request metadata separately from browser-side test data.
- A verified private support/privacy contact address remains a pre-launch requirement.
- Do not enable analytics or advertising until the privacy notice and any required consent controls are reviewed and updated.

## V1.2 P1 follow-up: accessibility, performance and established SEO routes (2026-11-09)

- Added first-focus skip links and actual `#main-content` targets for Astro pages and legacy React tool pages; the keyboard link is visible on focus.
- Desktop navigation dropdowns now open on keyboard focus as well as hover. The mobile menu has `aria-expanded`, `aria-controls`, an accessibility-hidden closed state and Escape support. Closed off-screen links are no longer focusable.
- Added visible `:focus-visible` outlines and a `prefers-reduced-motion` CSS override. The legacy header only samples browser FPS while the desktop viewport is visible and reduced-motion is not requested, cutting background/mobile animation work.
- Removed an unverified `.cc` support mailto address and domain claim in the legacy footer; the primary dead-pixel link points to the canonical homepage.
- Established GSC test paths (refresh rate, local dimming, color gradients, audio sync, test patterns) now contain unique, crawlable Astro-rendered practical instructions and limitations even before the React tool hydrates; static-route build assertions protect these blocks against regression.
- Refresh-rate tool now guards against zero slots on narrow viewports, resets sampling on start, and clearly distinguishes browser FPS from physical panel Hz. Long-exposure photos are not described as conclusive evidence by themselves.
- Automated browser suite now covers 22 scenarios, including skip navigation, mobile closed-menu focus behavior and reduced-motion treatment. These are Chromium checks, not NVDA, VoiceOver or real Safari tests.
- The production-domain smoke workflow still skips without a configured GitHub Actions `PUBLIC_SITE_URL`. This does not independently establish the Cloudflare deployment or indexing status.
