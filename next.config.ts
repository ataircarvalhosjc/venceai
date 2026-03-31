import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverMinification: true,
  },
  swcMinify: true,
};

export default nextConfig;
