import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL)
  : null;

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Keep Turbopack inside this application.  The workspace sits below a
  // OneDrive path and an unrelated lockfile above it otherwise makes Next
  // attempt to scan the whole user profile during a production build.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: apiUrl
      ? [
          {
            protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
            hostname: apiUrl.hostname,
            port: apiUrl.port,
            pathname: "/uploads/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
