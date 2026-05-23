import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  allowedDevOrigins: ['192.168.4.6', 'localhost'],
};

export default nextConfig;