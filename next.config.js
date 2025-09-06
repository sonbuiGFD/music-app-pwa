/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === "production" ? "/music-app-pwa" : "",
  basePath: process.env.NODE_ENV === "production" ? "/music-app-pwa" : "",
};

module.exports = nextConfig;
