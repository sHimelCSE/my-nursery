import { notFound } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CollectionClient from "./CollectionClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  await dbConnect();

  const category = await Category.findOne({
    $or: [
      { slug: { $regex: new RegExp(`^${decodedSlug}$`, "i") } },
      { name: { $regex: new RegExp(`^${decodedSlug}$`, "i") } },
    ],
  }).lean();

  const title =
    category?.name ||
    decodedSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    title: `${title} | Botanical Collections | GreenLeaf Nursery`,
    description:
      category?.description ||
      `Explore our curated selection of ${title} with doorstep delivery in Bangladesh.`,
  };
}

export default async function SingleCollectionPage({ params }) {
  const { slug } = await params;
  if (!slug) notFound();

  const decodedSlug = decodeURIComponent(slug);
  await dbConnect();

  // Find category by slug or name
  const categoryDoc = await Category.findOne({
    $or: [
      { slug: { $regex: new RegExp(`^${decodedSlug}$`, "i") } },
      { name: { $regex: new RegExp(`^${decodedSlug}$`, "i") } },
    ],
  }).lean();

  const categorySlug = categoryDoc?.slug || decodedSlug;
  const categoryName = categoryDoc?.name || decodedSlug;

  // Find all products associated with this category
  const query = {
    $or: [
      { category: { $regex: new RegExp(`^${categorySlug}$`, "i") } },
      { category: { $regex: new RegExp(`^${categoryName}$`, "i") } },
      { category: { $regex: new RegExp(`^${decodedSlug.replace(/-/g, " ")}$`, "i") } },
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
