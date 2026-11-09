# Dead Pixel Test — Astro Static Display Tools

## Current live deployment (2026-11-09)

- Public production domain: **https://deadpixeltest.cc**. The 9 English and 6 pt-BR V1.2 landing pages are live, do not emit `noindex`, and declare self-canonical URLs. The published sitemap lists **50** canonical URLs and robots.txt advertises it. Google indexing/rankings still require Search Console evidence.
- Cloudflare Pages **main** builds now use this verified domain automatically through `scripts/build-site.mjs`, even when `PUBLIC_SITE_URL` is not set in the Pages dashboard. Branch previews are always `noindex` with empty sitemaps; domainless local builds remain `noindex`.
- All core V1.2 features F01–F08 are implemented in code. Automated tests do not replace real iPhone, Android, physical-panel, NVDA/VoiceOver or Lighthouse acceptance.
- The 400-row Semrush research produced **134** KD≤29 region-qualified keyword groups, of which **87** are target *candidates*. Their individual SERP top-ten and editorial ranking-opportunity reviews are not complete. No claim that 87 queries already rank.
- See [the current acceptance addendum](docs/V1.2-ACCEPTANCE-20261109.md) and the latest [GitHub Actions checks](https://github.com/zqfqe/Dead-Pixel-Test/actions). Production-domain-specific GitHub smoke currently skips when its independent `PUBLIC_SITE_URL` Actions variable is unset.

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

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 22.12+
- Custom production domain: `https://deadpixeltest.cc`
- On a Cloudflare Pages **main** build, `scripts/build-site.mjs` selects this domain and generates canonical, hreflang, robots.txt and a populated sitemap even if no dashboard override is set.
- On non-main Cloudflare preview branches, indexing is disabled and no production canonical URLs leak into the preview.
- On local builds without `PUBLIC_SITE_URL`, the result remains `noindex,nofollow` and the sitemap is empty; use an explicit HTTPS test origin only for build audits.
- Any `PUBLIC_SITE_URL` override on production must match `https://deadpixeltest.cc`, or the build intentionally fails instead of publishing the wrong canonical host.


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

GitHub Actions validates TypeScript, Astro static builds, domainless/preview isolation, indexable production canonical routes, the 50-URL sitemap, Chromium interaction smoke, Firefox/WebKit responsiveness, legacy routes and mobile viewports. Browser checks can still fail; read the **latest run**, not a historical count. Production domain smoke is an independent workflow currently skipped when its GitHub Actions variable is unset. Passing CI alone cannot establish Google's actual indexing, physical-device performance or accessibility certification.


## Privacy and safety

- No analytics, advertising tags or third-party tracking pixels are included in the current application bundle.
- The browser smoke suite flags third-party HTTP(S) requests, non-GET/HEAD requests and third-party scripts/frames on the tested routes.
- Camera and microphone access is user-initiated; the webcam snapshot is generated as a local download.
- Color-vision image previews use local object URLs. Screen markers and test reports are not uploaded by the application.
- Existing preferences and report entries may be stored in browser localStorage; users can clear site data to remove them.
- The privacy policy describes hosting-provider request metadata separately from browser-side test data.
- A verified private support/privacy contact address remains a pre-launch requirement.
- Do not enable analytics or advertising until the privacy notice and any required consent controls are reviewed and updated.

## Historical engineering change log (earlier stage; see current status above)

### V1.2 P1 follow-up: accessibility, performance and established SEO routes (2026-11-09)

- Added first-focus skip links and actual `#main-content` targets for Astro pages and legacy React tool pages; the keyboard link is visible on focus.
- Desktop navigation dropdowns now open on keyboard focus as well as hover. The mobile menu has `aria-expanded`, `aria-controls`, an accessibility-hidden closed state and Escape support. Closed off-screen links are no longer focusable.
- Added visible `:focus-visible` outlines and a `prefers-reduced-motion` CSS override. The legacy header only samples browser FPS while the desktop viewport is visible and reduced-motion is not requested, cutting background/mobile animation work.
- Removed an unverified `.cc` support mailto address and domain claim in the legacy footer; the primary dead-pixel link points to the canonical homepage.
- Established GSC test paths (refresh rate, local dimming, color gradients, audio sync, test patterns) now contain unique, crawlable Astro-rendered practical instructions and limitations even before the React tool hydrates; static-route build assertions protect these blocks against regression.
- Refresh-rate tool now guards against zero slots on narrow viewports, resets sampling on start, and clearly distinguishes browser FPS from physical panel Hz. Long-exposure photos are not described as conclusive evidence by themselves.
- Automated browser suite now covers 22 scenarios, including skip navigation, mobile closed-menu focus behavior and reduced-motion treatment. These are Chromium checks, not NVDA, VoiceOver or real Safari tests.
- The production-domain smoke workflow still skips without a configured GitHub Actions `PUBLIC_SITE_URL`. This does not independently establish the Cloudflare deployment or indexing status.

### Follow-up: inspection gestures and page-specific guidance (2026-11-09)

Implementation:
- Mobile inspection now supports horizontal swipes between patterns. Swipes are disabled in mark mode and in static patch mode, preventing accidental navigation while marking or positioning a patch.
- Added a keyboard-accessible pattern picker: eight core colors, eight retention patterns or ten line-inspection patterns, with Brazilian Portuguese names on PT-BR pages.
- Corrected selected-spot state after undo, guarded stale selection and displayed the 50-marker limit.
- Downloaded HTML reports no longer auto-trigger the print dialog; the report offers an explicit Print button. User-entered notes are escaped.
- EN/PT-BR dead-pixel explanation pages now compare four observable symptoms: dark spot, colored spot, continuous line and ghost outline, with practical next checks.
- Fixer pages explain the movable static color patch without claiming a repair.
- Resolution checker adds Copy browser metrics, with a fallback message if clipboard access is unavailable.
- Locale counterpart links use the known EN/PT-BR mapping, and BR breadcrumbs return to /pt-br.

Verification:
- Astro GitHub Actions on commit 1c863c1d5cd598b53f718a94288df4d7a8bcfcef: success (run 42536714761). TypeScript, domainless noindex build, configured-origin test build, SEO audit, and 29/29 Chromium checks all passed.
- Seven new Chromium scenarios exercise synthetic mobile swipes, direct pattern selection, PT-BR labels, localized pixel-definition guides, screen metric copy, static patch controls and safe offline report output.
- This is browser-emulated verification, not physical iOS/Android, screen-reader, Cloudflare custom-domain or Google-indexing verification. Fourteen candidate landing pages remain noindex until their individual SERP/content quality gates are passed.
