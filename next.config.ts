import type { NextConfig } from "next";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseHost = supabaseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Expose the existing Vercel SUPABASE_URL to the client at build time.
  // The project URL is not a secret; the anon/service keys stay server-side.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
