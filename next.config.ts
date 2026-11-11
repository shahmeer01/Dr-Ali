import type { NextConfig } from "next";
import path from "node:path";

// Supabase Storage host for product images (remotePatterns needs a concrete
// hostname; derived from the public project URL at build/server start).
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";
const isLocalSupabase =
  supabaseHostname === "127.0.0.1" || supabaseHostname === "localhost";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Local Supabase resolves to a private IP — allow it only for local
    // builds (production hosts stay on the public Supabase domain).
    ...(isLocalSupabase ? { dangerouslyAllowLocalIP: true } : {}),
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
      // Local Supabase serves storage over plain http on the LAN stack.
      ...(isLocalSupabase
        ? [
            {
              protocol: "http" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  experimental: {
    // Product image uploads run through server actions (multipart form):
    // up to 10 gallery images × 5 MB plus text fields.
    serverActions: {
      bodySizeLimit: 55 * 1024 * 1024,
    },
  },
  turbopack: {
    root: path.join(import.meta.dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
