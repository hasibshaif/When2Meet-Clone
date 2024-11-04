import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/create-event',
        permanent: true,
      },
    ];
  },
  /* other config options here */
};

export default nextConfig;
