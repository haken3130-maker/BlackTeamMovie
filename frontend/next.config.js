/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ophim1.com', 'img.ophim1.com', 'phimimg.com', 'img.ophim.live'],
    unoptimized: true,
  },
};

module.exports = nextConfig;
