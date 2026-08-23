import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', '172.20.10.11'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
