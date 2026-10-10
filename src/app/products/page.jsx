import dbConnect from "@/lib/dbConnect";
import { ensureProductSlugs } from "@/models/Product";
import SiteSetting from "@/models/SiteSetting";
import ProductsCatalogClient from "./ProductsCatalogClient";
import {
  getCachedAllProducts,
  getCachedAllCategories,
} from "@/lib/cachedProducts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  await dbConnect();
  let siteName = "MSH BloomCraft";
  try {
    const settings = await SiteSetting.getSettings();
    if (settings?.general?.siteName) siteName = settings.general.siteName;
  } catch {}

  return {
    title: `All Botanical Products & Plant Care | ${siteName}`,
    description:
      "Browse our complete living inventory of indoor plants, organic fertilizers, and handcrafted planters.",
    openGraph: {
      title: `All Botanical Products & Plant Care | ${siteName}`,
      description:
        "Browse our complete living inventory of indoor plants, organic fertilizers, and handcrafted planters.",
      type: "website",
    },
  };
}

export default async function ProductsCatalogPage() {
  // Run quick slug check for any newly added products
  try {
    await ensureProductSlugs();
  } catch {}

  // Fetch all products & categories via Next.js unstable_cache
  const [productDocs, categoryDocs] = await Promise.all([
    getCachedAllProducts(),
    getCachedAllCategories(),
  ]);

  // Clean serialization
  const products = (productDocs || []).map((p) => ({
    ...p,
    _id: p._id ? p._id.toString() : "",
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
  }));

  const categories = (categoryDocs || []).map((c) => ({
    ...c,
    _id: c._id ? c._id.toString() : "",
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : null,
  }));

  return (
    <ProductsCatalogClient
      initialProducts={products}
      categories={categories}
    />
  );
}
