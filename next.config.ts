import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark Aptos packages as external to avoid bundling issues
  serverExternalPackages: ['@aptos-labs/ts-sdk', 'got', 'keyv', 'cacheable-request'],
};

export default nextConfig;
