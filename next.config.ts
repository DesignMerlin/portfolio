import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shots became Projects; keep old links working
  async redirects() {
    return [{ source: "/shots", destination: "/projects", permanent: true }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
