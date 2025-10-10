import type { MetadataRoute } from "next";
import { site } from "@/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch(new URL("/api/feed/sitemap", site.baseurl), { cache: "no-store" });

  if (!res.ok) new Response(await res.text(), { status: 500 });

  return await res.json();
}
