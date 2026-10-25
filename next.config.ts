import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

// In development, Turbopack and Webpack HMR require 'ws:' and 'wss:' for Fast Refresh.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://images.unsplash.com;
  font-src 'self' data: https://fonts.gstatic.com;
  frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;
  connect-src 'self' ws: wss: http://localhost:* https://localhost:* https://api.razorpay.com https://lumberjack.razorpay.com;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self' https://api.razorpay.com;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const headersList = [
      {
        key: 'Content-Security-Policy',
        value: cspHeader,
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.razorpay.com")',
      },
    ];

    // Only enforce Strict-Transport-Security in production, never on localhost HTTP
    if (!isDev) {
      headersList.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/:path*',
        headers: headersList,
      },
    ];
  },
};

export default nextConfig;
