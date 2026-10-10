import { notFound } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CollectionClient from "./CollectionClient";
import SiteSetting from "@/models/SiteSetting";
import { getCachedCategoryBySlug } from "@/lib/cachedProducts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug) return { title: "Collection Not Found" };
  const decodedSlug = decodeURIComponent(slug);

  let siteName = "MSH BloomCraft";
  try {
    await dbConnect();
    const settings = await SiteSetting.getSettings();
    if (settings?.general?.siteName) siteName = settings.general.siteName;
  } catch (err) {}

  const category = await getCachedCategoryBySlug(decodedSlug);
  if (!category) return { title: "Collection Not Found" };

  const name =
    category?.name ||
    decodedSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const title = `${name} | ${siteName}`;
  const description =
    category?.description ||
    `Explore our curated selection of ${name} with doorstep delivery in Bangladesh.`;
  const imageUrl = category?.image || category?.imageUrl || "";

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
      url: `https://my-nursery-flame.vercel.app/collections/${slug}`,
      siteName,
      images: imageUrl
        ? [{ url: imageUrl, width: 800, height: 800, alt: name }]
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

export default async function SingleCollectionPage({ params }) {
  const { slug } = await params;
  if (!slug) notFound();

  const decodedSlug = decodeURIComponent(slug);

  // Find category by slug or name via Next.js unstable_cache
  const categoryDoc = await getCachedCategoryBySlug(decodedSlug);

  // STRICT 404 CHECK: If category does NOT exist in MongoDB, immediately trigger notFound()
  if (!categoryDoc) {
    notFound();
  }

  const categorySlug = categoryDoc.slug || decodedSlug;
  const categoryName = categoryDoc.name || decodedSlug;

  // Find all products associated with this category
  const query = {
    $or: [
      { categories: categoryDoc._id },
      { category: categorySlug },
      { category: categoryName },
      { category: { $regex: new RegExp(`^${categorySlug}$`, "i") } },
      { category: { $regex: new RegExp(`^${categoryName}$`, "i") } },
      { category: { $regex: new RegExp(`^${decodedSlug.replace(/-/g, " ")}$`, "i") } },
      { categoryId: categoryDoc._id },
      { category: categoryDoc._id },
    ],
  };

  const productDocs = await Product.find(query).sort({ createdAt: -1 }).lean();

  // Clean serialization for client component
  const category = categoryDoc
    ? {
        ...categoryDoc,
        _id: categoryDoc._id.toString(),
      }
    : null;

  const products = productDocs.map((p) => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
  }));

  return (
    <CollectionClient
      category={category}
      initialProducts={products}
      slug={decodedSlug}
    />
  );
}
