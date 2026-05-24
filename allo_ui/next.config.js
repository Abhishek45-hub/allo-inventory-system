/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next-local',
  experimental: {
    typedRoutes: true
  }
};

module.exports = nextConfig;
