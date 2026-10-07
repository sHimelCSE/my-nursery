"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { App, Modal, Switch } from "antd";
import imageCompression from "browser-image-compression";
import {
  BookOpen,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Search,
  UploadCloud,
  Image as ImageIcon,
  Check,
  X,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Loader2,
  Tag,
  Layers,
  ShoppingBag,
  Eye,
  User,
  Sliders,
} from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/editor/RichTextEditor";

const DEFAULT_CATEGORIES = [
  "Plant Care",
  "Indoor Gardening",
  "Soil & Nutrition",
  "Botanical Lifestyle",
  "Balcony Gardening",
  "Pest Control & Health",
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export default function BlogsManagerTab({ onBlogsCountChange }) {
  const { message: antdMessage } = App.useApp();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Related products search in modal
  const [productSearch, setProductSearch] = useState("");

  // Form State
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "Plant Care",
    customCategory: "",
    authorName: "GreenLeaf Botanist",
    authorRole: "Horticulture Specialist",
    authorAvatar: "",
    readTime: "5 min read",
    relatedProducts: [],
    status: "published",
  });

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
        if (onBlogsCountChange) {
          onBlogsCountChange(data.blogs.length);
        }
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
      antdMessage.error("Failed to load blog articles");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for tagging
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load products for blog tagging:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchProducts();
  }, []);

  // Cloudinary direct unsigned upload
  const handleCoverUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      antdMessage.error("Cloudinary credentials are not configured.");
      return;
    }

    try {
      setUploadingCover(true);
      const options = {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1400,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (data.secure_url) {
        setForm((prev) => ({ ...prev, coverImage: data.secure_url }));
        antdMessage.success("Cover image uploaded successfully!");
      } else {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      antdMessage.error(err.message || "Failed to upload image");
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = "";
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingBlog(null);
    setProductSearch("");
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      category: "Plant Care",
      customCategory: "",
      authorName: "GreenLeaf Botanist",
      authorRole: "Horticulture Specialist",
      authorAvatar: "",
      readTime: "5 min read",
      relatedProducts: [],
      status: "published",
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setProductSearch("");
    const isCustomCat = !DEFAULT_CATEGORIES.includes(blog.category);
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      coverImage: blog.coverImage || "",
      category: isCustomCat ? "custom" : blog.category || "Plant Care",
      customCategory: isCustomCat ? blog.category : "",
      authorName: blog.author?.name || "GreenLeaf Botanist",
      authorRole: blog.author?.role || "Horticulture Specialist",
      authorAvatar: blog.author?.avatar || "",
      readTime: blog.readTime || "5 min read",
      relatedProducts: Array.isArray(blog.relatedProducts)
        ? blog.relatedProducts.map((p) => (typeof p === "object" ? p._id : p))
        : [],
      status: blog.status || "published",
    });
    setIsModalOpen(true);
  };

  // Title change with auto-slug generator
  const handleTitleChange = (val) => {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: editingBlog ? prev.slug : slugify(val),
    }));
  };

  // Toggle related product tag
  const handleToggleProductTag = (productId) => {
    setForm((prev) => {
      const exists = prev.relatedProducts.includes(productId);
      const updated = exists
        ? prev.relatedProducts.filter((id) => id !== productId)
        : [...prev.relatedProducts, productId];
      return { ...prev, relatedProducts: updated };
    });
  };

  // Save blog
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      antdMessage.error("Article title is required.");
      return;
    }
    if (!form.content.trim()) {
      antdMessage.error("Article content is required.");
      return;
    }
    if (!form.coverImage.trim()) {
      antdMessage.error("Cover image is required.");
      return;
    }

    const finalCategory =
      form.category === "custom"
        ? form.customCategory.trim() || "Plant Care"
        : form.category;

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim() || form.title.trim(),
      content: form.content,
      coverImage: form.coverImage.trim(),
      category: finalCategory,
      author: {
        name: form.authorName.trim() || "GreenLeaf Botanist",
        role: form.authorRole.trim() || "Horticulture Specialist",
        avatar: form.authorAvatar.trim(),
      },
      readTime: form.readTime.trim() || "5 min read",
      relatedProducts: form.relatedProducts,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editingBlog) {
        const res = await fetch(`/api/admin/blogs/${editingBlog._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        antdMessage.success("Article updated successfully!");
      } else {
        const res = await fetch("/api/admin/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        antdMessage.success("Article created and saved!");
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err) {
      antdMessage.error(err.message || "Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  // Delete blog
  const handleDeleteBlog = (blog) => {
    Modal.confirm({
      title: "Delete Article?",
      content: `Are you sure you want to permanently delete "${blog.title}"?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/blogs/${blog._id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message);
          antdMessage.success("Article deleted");
          fetchBlogs();
        } catch (err) {
          antdMessage.error(err.message || "Failed to delete article");
        }
      },
    });
  };

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch =
        !searchTerm.trim() ||
        b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        categoryFilter === "All" ||
        b.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [blogs, searchTerm, categoryFilter]);

  // Filtered products for modal tagging
  const modalProductsFiltered = useMemo(() => {
    if (!productSearch.trim()) return products;
    return products.filter((p) =>
      p.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  const uniqueCategories = [
    "All",
    ...new Set(blogs.map((b) => b.category).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">
      {/* ── Top Header Card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-emerald-100/70 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 stroke-[2]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#1A2E22] tracking-tight">
                  Botanical Blog & Care Guides Engine
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF0E6] text-[#2D5A27]">
                  {blogs.length} Articles
                </span>
              </div>
              <p className="text-xs text-[#5A6B5C] mt-0.5">
                Author and publish botanical care articles with rich text formatting and tagged product sliders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/blog"
              target="_blank"
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-[#F7F8F4] text-xs font-bold text-gray-700 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              <span>View Public Blog</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F20] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Write Article</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles by title, excerpt or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F7F8F4] border border-gray-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#2D5A27] focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={fetchBlogs}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-[#F7F8F4] text-gray-600 transition-colors cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-[#2D5A27] text-white shadow-xs"
                    : "bg-[#F7F8F4] text-gray-600 hover:bg-[#EBF0E6] hover:text-[#2D5A27]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Articles Table / Cards View ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-emerald-100/70 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-14 text-center text-gray-400">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-[#2D5A27] animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-600">Loading Botanical Articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-14 text-center space-y-3">
            <span className="w-12 h-12 rounded-2xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6 stroke-[1.8]" />
            </span>
            <h3 className="font-bold text-base text-[#1A2E22]">No Articles Found</h3>
            <p className="text-xs text-[#5A6B5C] max-w-sm mx-auto">
              {searchTerm || categoryFilter !== "All"
                ? "No articles matched your active search or category filter."
                : "Get started by composing your first botanical plant care guide."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Compose First Article</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-[#FAFBF9] text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-5">Article & Cover</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Read Time</th>
                  <th className="py-3.5 px-4">Tagged Products</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-[#FAFBF9] transition-colors">
                    {/* Article & Cover */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5 min-w-[280px]">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/80">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="font-extrabold text-sm text-[#1A2E22] hover:text-[#2D5A27] line-clamp-1 transition-colors"
                          >
                            {blog.title}
                          </Link>
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {blog.excerpt}
                          </p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            /blog/{blog.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBF0E6] text-[#2D5A27]">
                        <Tag className="w-3 h-3" />
                        <span>{blog.category}</span>
                      </span>
                    </td>

                    {/* Read Time */}
                    <td className="py-4 px-4 whitespace-nowrap text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>{blog.readTime || "5 min read"}</span>
                      </div>
                    </td>

                    {/* Tagged Products */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-700">
                        <ShoppingBag className="w-3 h-3 text-[#2D5A27]" />
                        <span>{blog.relatedProducts?.length || 0} products</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          blog.status === "published"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${blog.status === "published" ? "bg-emerald-600" : "bg-amber-600"}`} />
                        <span>{blog.status}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>
                          {blog.createdAt
                            ? new Date(blog.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          className="p-2 rounded-xl text-gray-500 hover:text-[#2D5A27] hover:bg-[#EBF0E6] transition-colors"
                          title="Preview public article"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(blog)}
                          className="p-2 rounded-xl text-gray-600 hover:text-[#2D5A27] hover:bg-[#EBF0E6] transition-colors cursor-pointer"
                          title="Edit article"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(blog)}
                          className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: WRITE / EDIT ARTICLE WITH RICH TEXT EDITOR
      ═══════════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-base font-extrabold text-[#1A2E22] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2D5A27]" />
            <span>{editingBlog ? "Edit Botanical Article" : "Compose New Botanical Article"}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={860}
      >
        <form onSubmit={handleSaveBlog} className="space-y-5 pt-3 max-h-[80vh] overflow-y-auto pr-1">
          {/* Title & Slug */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Essential Monstera Deliciosa Care Guide"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-white border border-gray-200 text-sm font-bold text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#2D5A27]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  URL Slug (Auto-generated or custom)
                </label>
                <div className="flex items-center gap-1.5 bg-[#F7F8F4] border border-gray-200 rounded-xl px-3 py-2 text-xs">
                  <span className="text-gray-400 font-mono">/blog/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    placeholder="article-slug"
                    className="flex-1 bg-transparent font-mono text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-white border border-gray-200 text-xs text-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2D5A27]"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="custom">+ Custom Category</option>
                </select>
                {form.category === "custom" && (
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    value={form.customCategory}
                    onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                    className="w-full mt-2 bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Cover Image Uploader */}
          <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-emerald-100/70 space-y-3">
            <label className="block text-xs font-bold text-[#1A2E22]">
              Article Cover Image (Cloudinary Auto-Compressed CDN) <span className="text-red-500">*</span>
            </label>

            {form.coverImage ? (
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 relative shrink-0 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <p className="text-xs font-mono text-gray-500 truncate">
                    {form.coverImage}
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold hover:bg-white transition-colors cursor-pointer inline-flex items-center gap-1.5 bg-white">
                      <UploadCloud className="w-3.5 h-3.5 text-gray-600" />
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, coverImage: "" })}
                      className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 hover:border-[#2D5A27] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-700">
                  {uploadingCover ? "Compressing & Uploading to Cloudinary..." : "Click to Upload Article Cover Image"}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  Recommended size: 1200 x 630px · JPG, WebP, PNG
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingCover}
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Short Preview Excerpt <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="A concise 2-sentence summary shown on cards and Google search previews..."
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full bg-white border border-gray-200 text-xs text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#2D5A27]"
            />
          </div>

          {/* Rich Text WYSIWYG Editor with Cloudinary Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-800">
                Article Body Content (Rich Text WYSIWYG) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-[#2D5A27] font-semibold flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-[#2D5A27]" />
                Cloudinary Image Insertion Enabled
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
              <RichTextEditor
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Compose your botanical care guide here. Click the image button on the toolbar to insert photos directly via Cloudinary CDN..."
                minHeight="280px"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-gray-500 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#2D5A27]" />
              Tip: Click the image icon in the editor toolbar to insert compressed Cloudinary photos directly at your cursor position.
            </p>
          </div>

          {/* Tag Related Products Slider Checklist */}
          <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-emerald-100/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-xs text-[#1A2E22] flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#2D5A27]" />
                  <span>Tag Related Products Slider (এই আর্টিকেলে উল্লেখিত পণ্যসমূহ)</span>
                </h4>
                <p className="text-[11px] text-gray-500">
                  Tag plants, fertilizers, or tools to render an interactive product carousel beneath this article.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF0E6] text-[#2D5A27]">
                {form.relatedProducts.length} Tagged
              </span>
            </div>

            {/* Product search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products to tag..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#2D5A27]"
              />
            </div>

            {/* Products selection pills grid */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {loadingProducts ? (
                <div className="py-4 text-center text-xs text-gray-400">Loading catalog...</div>
              ) : modalProductsFiltered.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400">No matching products found.</div>
              ) : (
                modalProductsFiltered.map((prod) => {
                  const isChecked = form.relatedProducts.includes(prod._id);
                  const thumb = prod.images?.[0] || "";

                  return (
                    <div
                      key={prod._id}
                      onClick={() => handleToggleProductTag(prod._id)}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#EBF0E6] border-[#2D5A27] text-[#1E3F20]"
                          : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                              Plant
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{prod.title}</p>
                          <p className="text-[10px] text-gray-500">৳{prod.price} · {prod.category}</p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isChecked ? "bg-[#2D5A27] border-[#2D5A27] text-white" : "border-gray-300 bg-white"
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Author info & Read time & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Author Name
              </label>
              <input
                type="text"
                placeholder="e.g. Tariqul Islam"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Estimated Read Time
              </label>
              <input
                type="text"
                placeholder="e.g. 5 min read"
                value={form.readTime}
                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Publication Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#2D5A27]"
              >
                <option value="published">Published (Live Online)</option>
                <option value="draft">Save as Draft (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1E3F20] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? "Saving Article..." : editingBlog ? "Update Article" : "Publish Article"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
