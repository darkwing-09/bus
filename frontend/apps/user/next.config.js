/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@busbook/shared'],
  images: {
    domains: ['images.unsplash.com', 'api.mapbox.com'],
  },
};

module.exports = nextConfig;
