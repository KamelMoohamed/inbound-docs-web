import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Document/image uploads flow through a Server Action, which defaults to a
    // 1 MB body limit — too small for a full-resolution scan or photo. Match the
    // backend's 50 MB per-file cap so the limit is enforced in one place.
    serverActions: { bodySizeLimit: "50mb" },
  },
};

export default nextConfig;
