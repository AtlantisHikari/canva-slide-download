/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/canva-slide-download',
  assetPrefix: '/canva-slide-download',
  output: 'export',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Configure for Puppeteer in serverless environments
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        puppeteer: 'commonjs puppeteer',
      });
    }
    return config;
  },
  // Serverless function configuration
  serverRuntimeConfig: {
    maxDuration: 300, // 5 minutes for long-running downloads
  },
  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/download',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;