import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', '172.20.10.11'],
  turbopack: {
    root: process.cwd(),
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Frame-Options', value: 'DENY' },
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
            : []),
        ],
      },
      // ── Auth pages: relax COOP so Firebase signInWithPopup can work ───────
      //
      // By default Vercel serves pages with Cross-Origin-Opener-Policy: same-origin.
      // This prevents a cross-origin popup (accounts.google.com via firebaseapp.com)
      // from reading window.closed / window.opener on the main tab, which breaks
      // Firebase's signInWithPopup mechanism entirely.
      //
      // same-origin-allow-popups keeps the page isolated from arbitrary cross-origin
      // windows but explicitly grants popups that were OPENED by this page (i.e. the
      // Google auth popup) the ability to communicate back. This is the minimum
      // relaxation required and is still considerably more secure than unsafe-none.
      //
      // Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy
      {
        source: '/(login|register|forgot-password|reset-password)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
