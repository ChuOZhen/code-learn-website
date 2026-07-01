import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/cpp-learn-website',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
