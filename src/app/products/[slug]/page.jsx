import { notFound } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import SiteSetting from "@/models/SiteSetting";
import {
  getCachedProductBySlug,
  getCachedCategoryBySlug,
} from "@/lib/cachedProducts";
import ProductDetailClient from "./ProductDetailClient";
import { getProductSchema } from "@/lib/jsonLd";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug) return { title: "Product Not Found" };

  await dbConnect();
  const product =
    (await getCachedProductBySlug(slug)) ||
    (await Product.findOne({ slug }).lean());

  if (!product) return { title: "Product Not Found" };

  let siteName = "MSH BloomCraft";
  try {
    const settings = await SiteSetting.getSettings();
    if (settings?.general?.siteName) siteName = settings.general.siteName;
  } catch {}

  const title = `${product.title} | ${siteName}`;
  const description =
    product.shortDescription ||
    product.description?.slice(0, 160) ||
    "Buy premium healthy plants online.";
  const imageUrl = product.images?.[0] || product.image || "";

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
      url: `https://my-nursery-flame.vercel.app/products/${slug}`,
      siteName,
      images: imageUrl
        ? [{ url: imageUrl, width: 800, height: 800, alt: product.title }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  if (!slug) return notFound();

  // 1. Strictly query by slug ONLY via Next.js unstable_cache
  const product = await getCachedProductBySlug(slug);

  // 2. If not found, trigger 404 immediately
  if (!product) {
    return notFound();
  }

  // Fetch category for breadcrumb via Next.js unstable_cache
  let category = null;
  if (product.category) {
    category = await getCachedCategoryBySlug(product.category);
  }

  const categoryName =
    category?.name ||
    (product.category
      ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
      : "Collections");
  const categoryUrl = category?.slug
    ? `/collections/${category.slug}`
    : "/collections";

  let productJsonLd = null;
  try {
    productJsonLd = getProductSchema(product);
  } catch {
    // Safe fallback
  }

  const serializedProduct = {
    ...product,
    _id: product._id ? product._id.toString() : "",
    createdAt: product.createdAt
      ? new Date(product.createdAt).toISOString()
      : null,
    updatedAt: product.updatedAt
      ? new Date(product.updatedAt).toISOString()
      : null,
  };

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ProductDetailClient
        id={serializedProduct._id}
        slug={product.slug}
        initialProduct={serializedProduct}
        categoryName={categoryName}
        categoryUrl={categoryUrl}
      />
    </>
  );
}
