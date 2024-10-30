import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://beaudy-ink.com";
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/profile",
        "/reservation",
        "/reservation/onglerie",
        "/reservation/onglerie/calendar",
        "/reservation/tatouage",
        "/reservation/tattoo",
        "/tatouage",
        "/tattoo", 
        "/onglerie",
        "/admin",
      ],
      disallow: "/private/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
