import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow these hosts to access dev resources (HMR) — fixes "Blocked cross-origin request"
  allowedDevOrigins: ["127.0.0.1", "localhost", "172.16.0.2"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
