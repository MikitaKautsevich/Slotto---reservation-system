import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    domains: ['cdn-icons-png.flaticon.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
    ],
  },
};


export default nextConfig;