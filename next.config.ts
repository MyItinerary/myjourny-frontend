import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Real experience cover images come from itin (guide-uploaded, no
    // fixed set of hosts — could be any CDN/S3/direct URL), so there's no
    // finite allowlist to write here the way there would be for a known
    // set of first-party asset hosts.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
