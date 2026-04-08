export function getSiteURL(): string {
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteURL) {
    console.warn("NEXT_PUBLIC_SITE_URL not set!");
  }
  return siteURL || "snippio.xyz";
}

export function getBackendUrl(): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    console.log("NEXT_PUBLIC_BACKEND_URL");
  }
  return backendUrl || "http://127.0.0.1:5000";
}
