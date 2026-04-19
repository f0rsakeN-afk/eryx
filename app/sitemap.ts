import { MetadataRoute } from "next";
import { getSiteURL } from "@/utils/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteURL = getSiteURL();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteURL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteURL}/home`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    {
      url: `${siteURL}/apps`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteURL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteURL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteURL}/changelog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteURL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteURL}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteURL}/legal/policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticRoutes];
}
