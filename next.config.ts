import type { NextConfig } from "next";

export default {
  output: "standalone",
  allowedDevOrigins: ["modak.wiki"],
  experimental: { authInterrupts: true },
} satisfies NextConfig;
