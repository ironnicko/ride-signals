import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Keep your current setting
  },
  reactStrictMode: true,
  // pwa: {
  //   dest: "public", // Service worker and manifest go here
  //   register: true, // Auto-register SW
  //   skipWaiting: true, // Activate new SW immediately
  //   disable: process.env.NODE_ENV === "development"
  // },
};

export default nextConfig;
