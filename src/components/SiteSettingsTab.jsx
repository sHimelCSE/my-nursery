"use client";

import { useState, useEffect } from "react";
import { App } from "antd";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Share2,
  Megaphone,
  FileText,
  Save,
  RefreshCw,
  Check,
  Building2,
  Globe,
  Sliders,
  Upload,
  Trash2,
  Eye,
  Layers,
  Image as ImageIcon,
  Plus,
  Link as LinkIcon,
  Tag,
  Coins,
  Sparkles,
} from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";
import BrandLogo from "@/components/BrandLogo";

export default function SiteSettingsTab() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/site-settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings({
          general: { ...DEFAULT_SITE_SETTINGS.general, ...(json.data.general || {}) },
          topbar: { ...DEFAULT_SITE_SETTINGS.topbar, ...(json.data.topbar || {}) },
          whatsapp: { ...DEFAULT_SITE_SETTINGS.whatsapp, ...(json.data.whatsapp || {}) },
          socialLinks: { ...DEFAULT_SITE_SETTINGS.socialLinks, ...(json.data.socialLinks || {}) },
          footer: {
            ...DEFAULT_SITE_SETTINGS.footer,
            ...(json.data.footer || {}),
            copyrightLinks:
              json.data.footer?.copyrightLinks ||
              DEFAULT_SITE_SETTINGS.footer.copyrightLinks ||
              [],
          },
          pagesContent: {
            aboutUs: {
              ...DEFAULT_SITE_SETTINGS.pagesContent.aboutUs,
              ...(json.data.pagesContent?.aboutUs || {}),
            },
            privacyPolicy: {
              ...DEFAULT_SITE_SETTINGS.pagesContent.privacyPolicy,
              ...(json.data.pagesContent?.privacyPolicy || {}),
            },
            termsOfService: {
              ...DEFAULT_SITE_SETTINGS.pagesContent.termsOfService,
              ...(json.data.pagesContent?.termsOfService || {}),
            },
            refundPolicy: {
              ...DEFAULT_SITE_SETTINGS.pagesContent.refundPolicy,
              ...(json.data.pagesContent?.refundPolicy || {}),
            },
            contactPage: {
              ...DEFAULT_SITE_SETTINGS.pagesContent.contactPage,
              ...(json.data.pagesContent?.contactPage || {}),
            },
          },
        });
      }
    } catch (err) {
      console.error("Failed to load site settings:", err);
      message.error("Could not load latest settings. Showing defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Site settings updated successfully!");
        try {
          localStorage.setItem("app_site_settings", JSON.stringify(data.data || settings));
        } catch {}
        window.dispatchEvent(new Event("siteSettingsUpdated"));
      } else {
        message.error(data.message || "Failed to update settings");
      }
    } catch (err) {
      console.error("Save settings error:", err);
      message.error("Network error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      message.error("Cloudinary credentials are not configured in environment variables.");
      return;
    }

    setUploadingLogo(true);
    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
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
        setSettings((prev) => ({
          ...prev,
          general: {
            ...prev.general,
            logoUrl: data.secure_url,
          },
        }));
        message.success("Brand logo uploaded successfully!");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Logo upload error:", err);
      message.error(err.message || "Failed to upload logo to Cloudinary");
    } finally {
      setUploadingLogo(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleUploadFavicon = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      message.error("Cloudinary credentials are not configured in environment variables.");
      return;
    }

    setUploadingFavicon(true);
    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 128,
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
        setSettings((prev) => ({
          ...prev,
          general: {
            ...prev.general,
            faviconUrl: data.secure_url,
          },
        }));
        message.success("Favicon uploaded successfully!");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Favicon upload error:", err);
      message.error(err.message || "Failed to upload favicon to Cloudinary");
    } finally {
      setUploadingFavicon(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSaveBranding = async () => {
    try {
      setSavingBranding(true);
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          general: {
            ...settings.general,
            siteName: settings.general.siteName,
            tagline: settings.general.tagline,
            currency: settings.general.currency,
            faviconUrl: settings.general.faviconUrl,
            logoType: settings.general.logoType,
            logoUrl: settings.general.logoUrl,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Brand Identity updated successfully!");
        try {
          localStorage.setItem("app_site_settings", JSON.stringify(data.data || settings));
        } catch {}
        window.dispatchEvent(new Event("siteSettingsUpdated"));
      } else {
        throw new Error(data.message || "Failed to save branding settings");
      }
    } catch (err) {
      console.error("Save branding error:", err);
      message.error(err.message || "Error saving branding settings");
    } finally {
      setSavingBranding(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
        <RefreshCw className="w-8 h-8 text-[#2D6A4F] animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-medium">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Global Save Action */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Storewide CMS Manager</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 font-serif">
            Global Site Settings &amp; Store Configuration
          </h2>
          <p className="text-xs text-gray-500">
            Control brand identity, store name, customer care hotlines, floating WhatsApp, topbar announcements, and footer copy in real time.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:bg-gray-300"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
        </button>
      </div>

      {/* ─── SECTION 1: Brand Identity & Store Name (ব্র্যান্ড ও স্টোরের নাম) ───────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-100/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1E3F20] text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                Primary Storefront Identity
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 font-serif">
                1. Brand Identity &amp; Store Name (ব্র্যান্ড ও স্টোরের নাম)
              </h3>
              <p className="text-xs text-gray-500">
                Configure your official store name, slogan tagline, currency symbol, logo presentation mode, and browser tab icon.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveBranding}
            disabled={savingBranding || uploadingLogo || uploadingFavicon}
            className="px-5 py-2.5 rounded-full bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:bg-gray-300 self-start sm:self-auto"
          >
            {savingBranding ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savingBranding ? "Saving..." : "Save Brand Identity"}</span>
          </button>
        </div>

        {/* Form Inputs Grid: Brand Name, Tagline, Currency & Logo Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Brand / Store Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Brand / Store Name (স্টোরের নাম)</span>
            </label>
            <input
              type="text"
              value={settings.general.siteName || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, siteName: e.target.value },
                })
              }
              placeholder="e.g. MSH BloomCraft"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
            <span className="text-[11px] text-gray-400">
              Displayed in the navbar, invoice headers, browser tab title, and footer copyright.
            </span>
          </div>

          {/* 2. Tagline / Slogan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Tagline / Slogan (ট্যাগলাইন বা স্লোগান)</span>
            </label>
            <input
              type="text"
              value={settings.general.tagline || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, tagline: e.target.value },
                })
              }
              placeholder="e.g. PLANT SHOP"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
            <span className="text-[11px] text-gray-400">
              Appears directly underneath your store brand name in uppercase tracking font.
            </span>
          </div>

          {/* 3. Currency Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Store Currency (মুদ্রা)</span>
            </label>
            <select
              value={settings.general.currency || "BDT (৳)"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, currency: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            >
              <option value="BDT (৳)">BDT (৳) - Bangladeshi Taka</option>
              <option value="USD ($)">USD ($) - United States Dollar</option>
            </select>
            <span className="text-[11px] text-gray-400">
              Displayed on the topbar and product pricing across your store.
            </span>
          </div>

          {/* 4. Logo Display Mode (Radio Pills) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Logo Display Mode (লোগো প্রদর্শন মোড)</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {[
                { id: "logo_with_text", label: "Logo with Text" },
                { id: "logo_only", label: "Logo Only" },
                { id: "text_only", label: "Text Only" },
              ].map((opt) => {
                const isSelected = (settings.general.logoType || "logo_with_text") === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, logoType: opt.id },
                      })
                    }
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1E3F20] text-white shadow-xs"
                        : "bg-[#F7F8F4] hover:bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-gray-400">
              Choose how the logo is rendered in the main header and footer.
            </span>
          </div>
        </div>

        {/* ── Logo Image & Favicon Uploaders Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
          {/* Left: Logo Image Uploader */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Primary Brand Logo Image</span>
              </label>
              {settings.general.logoUrl && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Uploaded
                </span>
              )}
            </div>

            {settings.general.logoUrl ? (
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-200 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 rounded-xl bg-white border border-gray-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <Image
                      src={settings.general.logoUrl}
                      alt={settings.general.siteName || "Store Logo"}
                      width={96}
                      height={48}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {settings.general.siteName || "Store"} Logo Active
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {settings.general.logoUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <label className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Change Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadLogo}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, logoUrl: "" },
                      })
                    }
                    className="px-3.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 hover:border-[#2D6A4F] rounded-2xl bg-[#FAFBF9] hover:bg-emerald-50/40 transition-colors cursor-pointer text-center">
                {uploadingLogo ? (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <RefreshCw className="w-6 h-6 text-[#2D6A4F] animate-spin" />
                    <span className="text-xs font-semibold text-gray-700">Compressing &amp; Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs font-semibold text-gray-700">
                      Upload Logo (PNG, JPG, SVG, WebP)
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      Auto-compressed and uploaded to Cloudinary CDN
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
            )}

            <input
              type="text"
              value={settings.general.logoUrl || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, logoUrl: e.target.value },
                })
              }
              placeholder="Or paste Cloudinary / direct image URL..."
              className="w-full mt-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 placeholder-gray-400 bg-white focus:outline-none focus:border-[#2D6A4F]"
            />
          </div>

          {/* Right: Favicon Uploader */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Browser Tab Favicon Icon</span>
              </label>
              {settings.general.faviconUrl && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Uploaded
                </span>
              )}
            </div>

            {settings.general.faviconUrl ? (
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-200 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <Image
                      src={settings.general.faviconUrl}
                      alt="Favicon"
                      width={36}
                      height={36}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      Browser Tab Favicon Active
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {settings.general.faviconUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <label className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Change Favicon</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFavicon}
                      disabled={uploadingFavicon}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, faviconUrl: "" },
                      })
                    }
                    className="px-3.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Favicon</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 hover:border-[#2D6A4F] rounded-2xl bg-[#FAFBF9] hover:bg-emerald-50/40 transition-colors cursor-pointer text-center">
                {uploadingFavicon ? (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <RefreshCw className="w-6 h-6 text-[#2D6A4F] animate-spin" />
                    <span className="text-xs font-semibold text-gray-700">Compressing &amp; Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs font-semibold text-gray-700">
                      Upload Favicon (ICO, PNG, SVG)
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      Square icon for browser tabs &amp; mobile bookmarks
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFavicon}
                  disabled={uploadingFavicon}
                  className="hidden"
                />
              </label>
            )}

            <input
              type="text"
              value={settings.general.faviconUrl || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, faviconUrl: e.target.value },
                })
              }
              placeholder="Or paste direct favicon image URL..."
              className="w-full mt-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 placeholder-gray-400 bg-white focus:outline-none focus:border-[#2D6A4F]"
            />
          </div>
        </div>

        {/* ── Live Preview Box ── */}
        <div className="p-5 rounded-2xl bg-[#F7F8F4] border border-[#EBF0E6] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#2D6A4F]" />
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Storefront Live Header Preview
              </span>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              Mode: {settings.general.logoType || "logo_with_text"} · Currency: {settings.general.currency || "BDT (৳)"}
            </span>
          </div>

          {/* Browser Tab Simulation */}
          <div className="max-w-xs bg-gray-200/80 rounded-t-xl px-3 py-1.5 flex items-center gap-2 text-[11px] text-gray-700 border border-b-0 border-gray-300">
            {settings.general.faviconUrl ? (
              <Image
                src={settings.general.faviconUrl}
                alt="Tab Icon"
                width={14}
                height={14}
                className="w-3.5 h-3.5 object-contain"
              />
            ) : (
              <Globe className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span className="truncate font-medium">
              {settings.general.siteName || "MSH BloomCraft"} · {settings.general.tagline || "PLANT SHOP"}
            </span>
          </div>

          {/* Navbar Header Simulation */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo
                logoType={settings.general.logoType}
                logoUrl={settings.general.logoUrl}
                siteName={settings.general.siteName}
                tagline={settings.general.tagline}
              />
            </div>
            <div className="hidden sm:flex items-center gap-5 text-xs font-medium text-gray-400">
              <span className="hover:text-gray-600">Home</span>
              <span className="hover:text-gray-600">Shop</span>
              <span className="hover:text-gray-600">Plant Care</span>
              <span className="hover:text-gray-600">Contact</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: Customer Care & Contact Information ───────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 font-serif">
              2. Customer Care &amp; Contact Information (যোগাযোগ ও কাস্টমার কেয়ার)
            </h3>
            <p className="text-xs text-gray-500">
              Support phone numbers, customer care email, physical nursery store address, and opening hours.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Customer Care Hotline</span>
            </label>
            <input
              type="text"
              value={settings.general.hotlinePhone || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, hotlinePhone: e.target.value },
                })
              }
              placeholder="+880 1712-345678"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Support Email Address</span>
            </label>
            <input
              type="email"
              value={settings.general.contactEmail || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, contactEmail: e.target.value },
                })
              }
              placeholder="support@bloomcraftnursery.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Physical Nursery Address</span>
            </label>
            <input
              type="text"
              value={settings.general.storeAddress || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, storeAddress: e.target.value },
                })
              }
              placeholder="Sector 7, Uttara, Dhaka-1230, Bangladesh"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Business &amp; Care Hours</span>
            </label>
            <input
              type="text"
              value={settings.general.businessHours || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, businessHours: e.target.value },
                })
              }
              placeholder="Sunday – Saturday, 9:00 AM – 9:00 PM"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION 3: Floating WhatsApp Support ───────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-serif">
                3. Floating WhatsApp Support (হোয়াটসঅ্যাপ সাপোর্ট)
              </h3>
              <p className="text-xs text-gray-500">
                Direct floating WhatsApp chat button connecting customers to your nursery team.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.whatsapp.isEnabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  whatsapp: { ...settings.whatsapp, isEnabled: e.target.checked },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D6A4F]" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-700">
              WhatsApp Phone Number (with Country Code)
            </label>
            <input
              type="text"
              value={settings.whatsapp.whatsappNumber || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  whatsapp: { ...settings.whatsapp, whatsappNumber: e.target.value },
                })
              }
              placeholder="8801712345678"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#FAFBF9] focus:outline-none focus:border-[#2D6A4F]"
            />
            <span className="text-[10px] text-gray-400">Example: 8801712345678 (no + or spaces)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-700">
              Pre-filled Chat Message
            </label>
            <input
              type="text"
              value={settings.whatsapp.defaultMessage || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  whatsapp: { ...settings.whatsapp, defaultMessage: e.target.value },
                })
              }
              placeholder="Hello, I have a question about your nursery plants."
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#FAFBF9] focus:outline-none focus:border-[#2D6A4F]"
            />
            <span className="text-[10px] text-gray-400">Initial text typed into the customer's chat screen.</span>
          </div>
        </div>
      </div>

      {/* ─── SECTION 4: Top Announcement Bar ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-serif">
                4. Top Announcement Bar (টপবার ঘোষণা)
              </h3>
              <p className="text-xs text-gray-500">
                Notice strip placed at the very top of your site for offers, discounts, and announcements.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.topbar.isEnabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  topbar: { ...settings.topbar, isEnabled: e.target.checked },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D6A4F]" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Announcement Text</label>
            <input
              type="text"
              value={settings.topbar.announcementText || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  topbar: { ...settings.topbar, announcementText: e.target.value },
                })
              }
              placeholder="Free Doorstep Delivery on orders over ৳1000"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Clickable Link URL</label>
            <input
              type="text"
              value={settings.topbar.announcementLink || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  topbar: { ...settings.topbar, announcementLink: e.target.value },
                })
              }
              placeholder="/#products"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION 5: Social Media Profiles ───────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 font-serif">
              5. Social Media Profiles (সোশ্যাল মিডিয়া লিংক)
            </h3>
            <p className="text-xs text-gray-500">
              Direct URLs to your botanical community pages on Facebook, Instagram, YouTube, and Twitter.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Facebook URL</label>
            <input
              type="url"
              value={settings.socialLinks.facebook || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                })
              }
              placeholder="https://facebook.com/your-nursery"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Instagram URL</label>
            <input
              type="url"
              value={settings.socialLinks.instagram || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                })
              }
              placeholder="https://instagram.com/your-nursery"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">YouTube Channel URL</label>
            <input
              type="url"
              value={settings.socialLinks.youtube || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, youtube: e.target.value },
                })
              }
              placeholder="https://youtube.com/@your-nursery"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Twitter / X URL</label>
            <input
              type="url"
              value={settings.socialLinks.twitter || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                })
              }
              placeholder="https://twitter.com/your-nursery"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION 6: Footer Bio & Copyright ───────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 font-serif">
              6. Footer Bio &amp; Copyright (ফুটার কপিরাইট)
            </h3>
            <p className="text-xs text-gray-500">
              Footer brand summary text, copyright declaration, and footer bottom legal links.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Footer Brand Bio</label>
            <textarea
              rows={3}
              value={settings.footer.bioText || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  footer: { ...settings.footer, bioText: e.target.value },
                })
              }
              placeholder="Premium botanical sanctuary providing healthy acclimatized house plants..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Copyright Line</label>
            <input
              type="text"
              value={settings.footer.copyrightText || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  footer: { ...settings.footer, copyrightText: e.target.value },
                })
              }
              placeholder="MSH BloomCraft. All rights reserved."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>

          {/* Dynamic Bottom Copyright Links */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Bottom Copyright Links</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  Navigation links displayed alongside the copyright notice at the bottom of every page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const current = Array.isArray(settings.footer.copyrightLinks)
                    ? [...settings.footer.copyrightLinks]
                    : [];
                  current.push({ label: "New Link", url: "/" });
                  setSettings({
                    ...settings,
                    footer: { ...settings.footer, copyrightLinks: current },
                  });
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2D6A4F] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-2">
              {(settings.footer.copyrightLinks || []).map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAFBF9] border border-gray-200"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...settings.footer.copyrightLinks];
                        updated[idx].label = e.target.value;
                        setSettings({
                          ...settings,
                          footer: { ...settings.footer, copyrightLinks: updated },
                        });
                      }}
                      placeholder="Link Label (e.g. Privacy Policy)"
                      className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F]"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...settings.footer.copyrightLinks];
                        updated[idx].url = e.target.value;
                        setSettings({
                          ...settings,
                          footer: { ...settings.footer, copyrightLinks: updated },
                        });
                      }}
                      placeholder="URL (e.g. /privacy)"
                      className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = settings.footer.copyrightLinks.filter((_, i) => i !== idx);
                      setSettings({
                        ...settings,
                        footer: { ...settings.footer, copyrightLinks: updated },
                      });
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Save Action Bar */}
      <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-gray-200 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
          <span className="text-xs font-bold text-gray-700">
            Unsaved changes will not be visible on the live storefront until saved.
          </span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:bg-gray-300"
        >
          {saving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
        </button>
      </div>
    </div>
  );
}
