/**
 * Production-ready JSON-LD Structured Data Schema Generators
 * Target Domain: https://my-nursery-flame.vercel.app
 * Light botanical nursery theme - NO EMOJIS
 */

export const BASE_URL = "https://my-nursery-flame.vercel.app";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "MSH BloomCraft",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=500&q=80",
    },
    description:
      "Premium botanical sanctuary providing healthy acclimatized house plants, organic potting mediums, and modern planters across Bangladesh.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sector 7, Uttara",
      addressLocality: "Dhaka",
      postalCode: "1230",
      addressCountry: "BD",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+8801712345678",
        contactType: "customer service",
        areaServed: "BD",
        availableLanguage: ["en", "bn"],
      },
    ],
    sameAs: [
      "https://facebook.com",
      "https://instagram.com",
      "https://youtube.com",
    ],
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "MSH BloomCraft",
    description: "Premium Online Plant Nursery in Bangladesh",
    publisher: {
      "@id": `${BASE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/collections?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };
}

export function getStoreSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${BASE_URL}/#store`,
    name: "MSH BloomCraft",
    url: BASE_URL,
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=1200&q=80",
    description:
      "Specialty nursery providing indoor plants, bonsai specimens, organic fertilizers, and garden accessories across Bangladesh.",
    priceRange: "৳150 - ৳5000",
    currenciesAccepted: "BDT",
    paymentAccepted: "Cash on Delivery, bKash, Nagad, Credit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sector 7, Uttara",
      addressLocality: "Dhaka",
      postalCode: "1230",
      addressCountry: "BD",
    },
    telephone: "+8801712345678",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "21:00",
      },
    ],
  };
}

export function getProductSchema(product) {
  if (!product) return null;
  const id = product._id?.toString() || product.id?.toString() || "";
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
    ? [product.image]
    : ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80"];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images,
    description: product.description || "Premium nursery specimen from MSH BloomCraft.",
    sku: id,
    category: product.category || "Plants",
    brand: {
      "@type": "Brand",
      name: "MSH BloomCraft",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${id}`,
      priceCurrency: "BDT",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability:
        (product.stock_quantity ?? 1) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "MSH BloomCraft",
      },
    },
  };

  if (product.averageRating && product.averageRating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount || 1,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function getBlogSchema(blog) {
  if (!blog) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.coverImage ? [blog.coverImage] : undefined,
    datePublished: blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString(),
    dateModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : new Date().toISOString(),
    author: {
      "@type": "Person",
      name: blog.author?.name || "BloomCraft Botanist",
    },
    publisher: {
      "@type": "Organization",
      name: "MSH BloomCraft",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${blog.slug}`,
    },
  };
}
