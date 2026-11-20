import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      // Explicitly allow Googlebot, Bingbot & AI Answer Engines (Perplexity, ChatGPT, Claude)
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
        ],
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: "https://vidhyarthisewa.org/sitemap.xml",
  };
}
