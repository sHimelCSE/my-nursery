import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import BlogDetailClient from "./BlogDetailClient";
import SiteSetting from "@/models/SiteSetting";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug) return { title: "Guide Not Found" };

  await dbConnect();
  const blog = await Blog.findOne({ slug }).lean();
  if (!blog) return { title: "Guide Not Found" };

  let siteName = "MSH BloomCraft";
  try {
    const settings = await SiteSetting.getSettings();
    if (settings?.general?.siteName) siteName = settings.general.siteName;
  } catch {}

  const title = `${blog.title} | ${siteName}`;
  const description =
    blog.excerpt ||
    blog.content?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    "Read comprehensive plant care and gardening guides.";
  const imageUrl = blog.coverImage || blog.image || "";

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
      url: `https://my-nursery-flame.vercel.app/blog/${slug}`,
      siteName,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: blog.title }]
        : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  if (!slug) notFound();

  await dbConnect();
  const blogDoc = await Blog.findOne({ slug })
    .populate("relatedProducts")
    .lean();

  if (!blogDoc) notFound();

  const relatedDocs = await Blog.find({
    slug: { $ne: slug },
    category: blogDoc.category,
    status: { $ne: "draft" },
  })
    .limit(3)
    .lean();

  const blog = JSON.parse(JSON.stringify(blogDoc));
  const relatedBlogs = JSON.parse(JSON.stringify(relatedDocs));

  return (
    <BlogDetailClient
      initialBlog={blog}
      initialRelatedBlogs={relatedBlogs}
      slug={slug}
    />
  );
}
