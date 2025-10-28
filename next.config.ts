import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    esmExternals: 'loose',
  },

  transpilePackages: ['@react-pdf/renderer'],
};

export default nextConfig;