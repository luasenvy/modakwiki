import type { NextConfig } from "next";

export default {
  output: "standalone",
  allowedDevOrigins: ["https://www.modak.wiki"],
} satisfies NextConfig;
