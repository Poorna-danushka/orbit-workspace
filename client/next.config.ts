import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';
const configuredBackendUrl = process.env.NEXT_PUBLIC_SERVER_URL?.trim();

let productionCsp: string | undefined;
if (isProduction) {
  if (!configuredBackendUrl) {
    throw new Error('NEXT_PUBLIC_SERVER_URL is required for production builds');
  }

  let backend: URL;
  try {
    backend = new URL(configuredBackendUrl);
  } catch {
    throw new Error('NEXT_PUBLIC_SERVER_URL must be a valid HTTPS backend origin');
  }

  if (backend.protocol !== 'https:' || backend.origin !== configuredBackendUrl?.replace(/\/+$/, '')) {
    throw new Error('NEXT_PUBLIC_SERVER_URL must be an HTTPS origin without a path');
  }

  const socketOrigin = `wss://${backend.host}`;
  // Static Next.js rendering needs inline bootstrap scripts; nonce CSP would make routes dynamic.
  productionCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
    `connect-src 'self' ${backend.origin} ${socketOrigin}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

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
          ...(productionCsp
            ? [{ key: 'Content-Security-Policy', value: productionCsp }]
            : []),
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
