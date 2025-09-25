import type { NextConfig } from "next";

export default {
  output: "standalone",
  allowedDevOrigins: ["modak.wiki"],
  experimental: { authInterrupts: true },
  serverExternalPackages: ["knex"],
} satisfies NextConfig;
