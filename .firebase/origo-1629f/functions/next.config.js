// next.config.js
var nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      }
    ]
  }
};
module.exports = nextConfig;
