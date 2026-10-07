export default function robots() {
  const baseUrl = "https://my-nursery-flame.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/Manage_Admin",
          "/Manage_Admin/*",
          "/api/*",
          "/dashboard/*",
          "/my-orders",
          "/checkout",
          "/order-success/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
