import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shots was renamed Playground; keep old links working
  async redirects() {
    return [{ source: "/shots", destination: "/playground", permanent: true }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
