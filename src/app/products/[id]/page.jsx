import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import mongoose from "mongoose";
import ProductDetailClient from "./ProductDetailClient";
import { getProductSchema } from "@/lib/jsonLd";

export async function generateMetadata({ params }) {
  const { id } = await params;

  if (!id || !mongoose.isValidObjectId(id)) {
    return {
      title: "Botanical Item Not Found",
      description:
        "This plant or gardening essential could not be located in our current inventory.",
    };
  }

  try {
    await dbConnect();
    const product = await Product.findById(id).lean();

    if (!product) {
      return {
        title: "Product Not Found",
        description: "Botanical specimen not found in GreenLeaf inventory.",
      };
    }

    const rawDesc =
      product.description ||
      "Premium nursery cultivated specimen acclimated for healthy root development.";
    const description =
      rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc;

    const imageUrl =
      (Array.isArray(product.images) && product.images[0]) ||
      product.image ||
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80";

    return {
      title: product.title,
      description,
      openGraph: {
        title: `${product.title} | GreenLeaf Botanical Studio`,
        description,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.title} | GreenLeaf Botanical Studio`,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating product metadata:", error);
    return {
      title: "Botanical Specimen Details",
      description:
        "Explore premium indoor plants, fertilizers, and planters at GreenLeaf.",
    };
  }
}

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  let productJsonLd = null;

  if (id && mongoose.isValidObjectId(id)) {
    try {
      await dbConnect();
      const product = await Product.findById(id).lean();
      if (product) {
        productJsonLd = getProductSchema(product);
      }
    } catch {
      // Safe fallback
    }
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ProductDetailClient id={id} />
    </>
  );
}
