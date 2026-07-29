import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/code-learn-website',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
