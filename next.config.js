/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/canva-slide-download',
  assetPrefix: '/canva-slide-download',
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Static export configuration - no server-side features
};

module.exports = nextConfig;