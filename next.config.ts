import type { NextConfig } from 'next';

// next.config.js
const nextConfig = {
  allowedDevOrigins: [
    '192.168.137.1',
    '192.168.1.*',    // subnet WiFi lain
    '10.0.0.*',       // subnet lain yang mungkin
    '*.local',        // mDNS
  ],
};

export default nextConfig;