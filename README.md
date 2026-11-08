# DeadPixelTest — Browser-based screen diagnostics

A free collection of monitor, laptop, phone, input and audio-visual inspection tools. This repository powers [deadpixeltest.cc](https://deadpixeltest.cc).

## Build locally

Requires Node.js 20+ (CI uses 22).

```sh
npm install
npm run build
npm run preview
```

Build output: `dist/`. A build generates the multilingual XML sitemap and static HTML for the new 2026-11 V1.2 SEO intent pages. No Gemini or paid API key is required.

## Existing site and V1.2 expansion

The original Vite/React routes are retained because they already receive search traffic. V1.2 adds English and Brazilian Portuguese pages without replacing the site's high-traffic routes:

- Core testing: `/` and the legacy `/tests/*` tools
- English: laptop, static stuck-pixel check, phone, line faults, image retention, resolution, contrast and pixel explanations
- Brazilian Portuguese: `/pt-br/`, notebook, iPhone, static stuck-pixel, definition and color comparison

See [V1.2 implementation and verification notes](docs/V1.2-IMPLEMENTATION.md).

## Important measurement limits

- A webpage renders patterns; it **cannot automatically detect a defect in the physical display panel**.
- The report is a **user-observed self-check**, not a certified hardware-health or warranty report.
- `requestAnimationFrame` measures browser animation cadence. Its FPS reading is not necessarily the physical panel refresh rate.
- `screen.width` and DPR are browser-exposed CSS/scaling values and do not prove the monitor's physical native resolution.
- No automatic high-frequency strobe is provided in the dead-pixel inspection tool.
- Pixel pressure, heat and dangerous flashing are not recommended.

## Deployment

Configured for Cloudflare Pages with Vite output directory `dist`. The canonical public origin currently configured in metadata and sitemap is `https://deadpixeltest.cc`. Do not promote a preview URL to production unless both canonical configuration and indexability have been verified.

## Contribution / QA

A GitHub Actions job builds the site and checks that legacy GSC-performing tool URLs remain represented in the sitemap, while the new Brazilian and English landing pages render actual HTML.

Do not merge sitewide URL, redirect, or canonical migrations without reviewing Google Search Console baseline and preserving existing ranking URLs.
