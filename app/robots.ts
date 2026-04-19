import { MetadataRoute } from "next";
import { getSiteURL } from "@/utils/config";

export default function robots(): MetadataRoute.Robots {
  const siteURL = getSiteURL();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/login",
          "/signup",
          "/forgotpassword",
          "/resetpassword",
          "/verifyemail",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
    ],
    sitemap: `${siteURL}/sitemap.xml`,
  };
}
