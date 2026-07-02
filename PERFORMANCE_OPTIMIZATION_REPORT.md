# Performance Optimization Report

Date: 2026-07-02

## Summary

- Home mobile measured initial payload after UI restoration: 778.1 KB.
- Initial MP4 requests: 0.
- Initial JS payload after UI restoration: 46.4 KB.
- Hero image now loads AVIF/WebP with preload and responsive sources.
- Static assets on Vercel are configured with one-year immutable caching.

## Measured Reductions

1. First screen payload: 778.1 KB measured after restoring original CSS/script timing.
2. Image optimization retained through WebP responsive `srcset` and generated AVIF/WebP variants.
3. Initial JavaScript is restored to the original synchronous execution order to preserve UI and interactions.
4. Video first-load payload reduced by 29.67 MB on the home preview video set; all 490.68 MB of MP4 assets are now protected from initial page load until user click.
5. Lighthouse score: not run locally because the Lighthouse package is not installed in this workspace.

## Verification

- Playwright mobile home check after UI restoration: 0 MP4 requests.
- Playwright project video check: 0 MP4 requests before click, 1 MP4 request after click.
- Hero image request: `media/hero/lillian-hero-768w.webp`.
