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

GitHub Actions checks domainless and configured builds, static routes, metadata and Chromium interactions. A successful Cloudflare deployment does not by itself prove that a custom domain is configured or that pages are indexed.
