import type { NextConfig } from "next";

export default {
  output: "standalone",
  poweredByHeader: false,
  allowedDevOrigins: ["modak.wiki"],
  experimental: { authInterrupts: true },
  serverExternalPackages: ["knex"],
} satisfies NextConfig;
