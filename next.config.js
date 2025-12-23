/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize for Vercel Edge Network
  poweredByHeader: false,

  // Enable experimental features as needed
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@prisma/client'],
  },
};

module.exports = nextConfig;
