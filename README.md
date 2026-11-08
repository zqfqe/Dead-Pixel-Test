# DeadPixelTest.cc — Astro Static Display Tools

Free display, monitor and device diagnostics. **Astro 6 is the primary site generator**; interactive legacy tests use React islands. Source: https://github.com/zqfqe/Dead-Pixel-Test.

## Local build

Node.js 22.12 or newer (see `.nvmrc`).

```sh
npm install
npm run check:types
npm run build
npm run preview
```

The build writes `dist/` and a validated sitemap. No paid API, Gemini key or required database.

## Cloudflare Pages

- Framework: Astro (static)
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 22.12+ (repository `.nvmrc`)
- Domain: `deadpixeltest.cc` is the configured canonical public origin.
- **Do not merge or change production until preview, mobile, direct URL, sitemap and canonical checks pass.**

## Architecture

- `astro.config.mjs`: Astro static output and React integration
- `src/layouts/BaseLayout.astro`: static SEO metadata, locale navigation, canonical, hreflang
- `src/pages/index.astro`: native static English homepage with interactive React inspection island
- `src/pages/[...slug].astro`: generates each existing tool, blog, policy and V1.2 language page as static HTML
- `components/tests/ScreenInspection.tsx`: shared visual test, static colors/lines, manual marks and JSON export
- `data/seoLandingPages.ts`: English + Brazilian search-intent landing content
- `scripts/generate-sitemap.ts`: includes established URLs and language pages
- `scripts/audit-astro-build.mjs`: checks generated SEO and priority paths

The original Vite index entrypoint and Vite build configuration were removed. React remains only as a component UI technology.

## SEO continuity

The old routes `/tests/refresh-rate`, `/tests/local-dimming`, `/tests/color-gradient`, `/tests/audio-sync`, `/tests/test-patterns`, and others are maintained. The original core test URL `/tests/dead-pixel` remains reachable with root canonical.

V1.2 adds 14 dedicated English/pt-BR pages with a native Astro homepage completing the 15-page plan. The 400-record Semrush source is **competitor research** and does not prove future rankings.

## Accuracy and safety

- Screen defects are identified **by the user**; the browser cannot automatically inspect physical pixels.
- The report is a **self-check**, not a professional diagnosis or manufacturer certification.
- Browser animation FPS is **not necessarily hardware Hz**. DPR is not physical DPI.
- Avoid physical pressure, heat and high-frequency flashing; damaged pixels cannot be repaired through software.

## Verification status

GitHub Actions checks static build and route/SEO output. Browser-based interaction, actual screen equipment, Cloudflare preview and live production remain separate tests. Details: `docs/V1.2-IMPLEMENTATION.md`.
