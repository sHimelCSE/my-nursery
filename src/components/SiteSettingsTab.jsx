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
  Shield,
  Save,
  RefreshCw,
  Check,
  Building2,
  Globe,
  Sliders,
  Sparkles,
  Upload,
  Trash2,
  Eye,
  Layers,
  Image as ImageIcon,
  Plus,
  Link as LinkIcon,
} from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";
import BrandLogo from "@/components/BrandLogo";
import RichTextEditor from "@/components/editor/RichTextEditor";

export default function SiteSettingsTab() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState("about");

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
        // Notify other windows/components
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
        message.success("Brand logo compressed and uploaded successfully!");
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
            logoType: settings.general.logoType,
            logoUrl: settings.general.logoUrl,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Branding settings saved successfully!");
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
      {/* Top Banner & Save Action */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Storewide CMS Manager</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 font-serif">
            Global Site Settings & Policy Content
          </h2>
          <p className="text-xs text-gray-500">
            Control contact hotlines, floating WhatsApp, topbar announcements, and legal page copies in real time.
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
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div>

      {/* ─── SECTION: Branding & Logo (লোগো ও ব্র্যান্ডিং) ───────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Branding &amp; Logo (লোগো ও ব্র্যান্ডিং)
              </h3>
              <p className="text-xs text-gray-500">
                Customize your store logo image, brand name, tagline, and navbar display mode.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveBranding}
            disabled={savingBranding || uploadingLogo}
            className="px-5 py-2.5 rounded-full bg-[#1E3F20] hover:bg-[#152D17] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:bg-gray-300 self-start sm:self-auto"
          >
            {savingBranding ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savingBranding ? "Saving..." : "Save Branding Settings"}</span>
          </button>
        </div>

        {/* Display Mode Selector (Radio pills) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 block">
            Display Mode (ডিসপ্লে মোড)
          </label>
          <div className="flex flex-wrap items-center gap-2.5">
            {[
              {
                id: "logo_with_text",
                label: "Logo with Text (লোগো + নাম)",
              },
              {
                id: "logo_only",
                label: "Logo Only (শুধুমাত্র লোগো ছবি)",
              },
              {
                id: "text_only",
                label: "Text Only (শুধুমাত্র নাম ও ট্যাগলাইন)",
              },
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
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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
        </div>

        {/* Inputs & Logo Image Uploader Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Left Column: Brand Name & Tagline */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Brand Name (দোকানের নাম)
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
                placeholder="e.g. GreenLeaf"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Tagline / Subtitle (ট্যাগলাইন বা সাবটাইটেল)
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
                placeholder="e.g. BOTANICAL STUDIO"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
              />
            </div>
          </div>

          {/* Right Column: Logo Image Uploader */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              Logo Image (লোগো ছবি)
            </label>

            {settings.general.logoUrl ? (
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-200 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 rounded-xl bg-white border border-gray-200 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                    <Image
                      src={settings.general.logoUrl}
                      alt={settings.general.siteName || "Logo"}
                      width={80}
                      height={48}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {settings.general.siteName || "Logo"} Uploaded
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {settings.general.logoUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
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

            {/* Optional manual URL input fallback */}
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
              className="w-full mt-2 px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 placeholder-gray-400 bg-white focus:outline-none focus:border-[#2D6A4F]"
            />
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-5 rounded-2xl bg-[#F7F8F4] border border-[#EBF0E6] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#2D6A4F]" />
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Navbar Live Preview (রিয়েল-টাইম প্রিভিউ)
              </span>
            </div>
            <span className="text-[11px] text-gray-500 hidden sm:inline">
              Mode: {settings.general.logoType || "logo_with_text"}
            </span>
          </div>

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

      {/* ─── SECTION 1: Contact & WhatsApp Setup ───────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              1. Contact & WhatsApp Setup (যোগাযোগ ও হোয়াটসঅ্যাপ)
            </h3>
            <p className="text-xs text-gray-500">
              Customer support lines, physical nursery address, and floating WhatsApp widget configuration.
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
              value={settings.general.hotlinePhone}
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
              value={settings.general.contactEmail}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, contactEmail: e.target.value },
                })
              }
              placeholder="support@greenleafnursery.com"
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
              value={settings.general.storeAddress}
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
              <span>Business & Care Hours</span>
            </label>
            <input
              type="text"
              value={settings.general.businessHours}
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

        {/* Floating WhatsApp Configuration Sub-card */}
        <div className="p-5 rounded-2xl bg-[#E8F5E9]/50 border border-[#2D6A4F]/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-[#2D6A4F]" />
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Floating WhatsApp Button Widget
                </h4>
                <p className="text-[11px] text-gray-500">
                  Allow store visitors to chat directly with horticulturists from any page.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-emerald-900/10">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-700">
                WhatsApp Phone Number (with Country Code)
              </label>
              <input
                type="text"
                value={settings.whatsapp.whatsappNumber}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, whatsappNumber: e.target.value },
                  })
                }
                placeholder="8801712345678"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-[#2D6A4F]"
              />
              <span className="text-[10px] text-gray-400">Example: 8801712345678 (no + or spaces)</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-700">
                Pre-filled Chat Message
              </label>
              <input
                type="text"
                value={settings.whatsapp.defaultMessage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, defaultMessage: e.target.value },
                  })
                }
                placeholder="Hello, I have a question about your nursery plants."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: Social Media Links ────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              2. Social Media Links (সোশ্যাল মিডিয়া প্রোফাইল)
            </h3>
            <p className="text-xs text-gray-500">
              Displayed in the top navigation bar and footer social vector icons.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Facebook Page URL</label>
            <input
              type="text"
              value={settings.socialLinks.facebook}
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
            <label className="text-xs font-bold text-gray-700">Instagram Profile URL</label>
            <input
              type="text"
              value={settings.socialLinks.instagram}
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
              type="text"
              value={settings.socialLinks.youtube}
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
            <label className="text-xs font-bold text-gray-700">Twitter / X Profile URL</label>
            <input
              type="text"
              value={settings.socialLinks.twitter}
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

      {/* ─── SECTION 3: Topbar Announcement ───────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                3. Topbar Announcement (টপবার নোটিস)
              </h3>
              <p className="text-xs text-gray-500">
                Display promo announcements or shipping offers in the green mini-bar above the header.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Announcement Text</label>
            <input
              type="text"
              value={settings.topbar.announcementText}
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
            <label className="text-xs font-bold text-gray-700">Target Link (Optional)</label>
            <input
              type="text"
              value={settings.topbar.announcementLink}
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

      {/* ─── SECTION 4: Footer & Legal Customizer ─────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              4. Footer & Legal Customizer (ফুটার ব্র্যান্ডিং)
            </h3>
            <p className="text-xs text-gray-500">
              Custom brand description snippet and copyright text in the store footer.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Footer Brand Bio / Mission Snippet</label>
            <textarea
              rows={3}
              value={settings.footer.bioText}
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
              value={settings.footer.copyrightText}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  footer: { ...settings.footer, copyrightText: e.target.value },
                })
              }
              placeholder="GreenLeaf Botanical Nursery BD. All rights reserved."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2D6A4F] bg-[#FAFBF9]"
            />
          </div>

          {/* ── Dynamic Bottom Copyright Links Manager ── */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Bottom Copyright Links (কপিরাইট বার লিংকস)</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  Navigation links displayed alongside the copyright notice at the bottom of every page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const currentLinks = Array.isArray(settings.footer?.copyrightLinks)
                    ? [...settings.footer.copyrightLinks]
                    : [];
                  currentLinks.push({ label: "Policy Link", url: "/privacy" });
                  setSettings({
                    ...settings,
                    footer: { ...settings.footer, copyrightLinks: currentLinks },
                  });
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2D5A27] text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            {/* List of links */}
            <div className="space-y-2">
              {(!settings.footer?.copyrightLinks || settings.footer.copyrightLinks.length === 0) ? (
                <div className="p-3 text-center rounded-xl bg-[#FAFBF9] border border-dashed border-gray-200 text-xs text-gray-400">
                  No bottom links configured. Add one using the button above.
                </div>
              ) : (
                settings.footer.copyrightLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-[#FAFBF9] p-2.5 rounded-xl border border-gray-200/80"
                  >
                    <div className="w-1/2">
                      <input
                        type="text"
                        value={link.label || ""}
                        onChange={(e) => {
                          const updated = [...settings.footer.copyrightLinks];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setSettings({
                            ...settings,
                            footer: { ...settings.footer, copyrightLinks: updated },
                          });
                        }}
                        placeholder="Link Label (e.g. Privacy Policy)"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-[#2D5A27]"
                      />
                    </div>
                    <div className="w-1/2">
                      <input
                        type="text"
                        value={link.url || ""}
                        onChange={(e) => {
                          const updated = [...settings.footer.copyrightLinks];
                          updated[idx] = { ...updated[idx], url: e.target.value };
                          setSettings({
                            ...settings,
                            footer: { ...settings.footer, copyrightLinks: updated },
                          });
                        }}
                        placeholder="URL (e.g. /privacy)"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-[#2D5A27]"
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
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Remove link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 5: Policy & About Us Content Editor ──────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              5. Policy & About Us Content Editor (পেজ কনটেন্ট এডিটর)
            </h3>
            <p className="text-xs text-gray-500">
              Edit the live copy of About Us, Privacy Policy, Terms & Conditions, and Return & Refund Policy.
            </p>
          </div>
        </div>

        {/* Tab Buttons for 4 Pages */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
          {[
            { key: "about", label: "About Us (আমাদের সম্পর্কে)" },
            { key: "privacy", label: "Privacy Policy (গোপনীয়তা নীতি)" },
            { key: "terms", label: "Terms of Service (শর্তাবলী)" },
            { key: "refund", label: "Return & Refund (রিটার্ন ও রিফান্ড)" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActivePolicyTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePolicyTab === tab.key
                  ? "bg-[#2D6A4F] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── About Us Editor ── */}
        {activePolicyTab === "about" && (
          <div className="space-y-5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Page Headline Title</label>
                <input
                  type="text"
                  value={settings.pagesContent.aboutUs.title || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pagesContent: {
                        ...settings.pagesContent,
                        aboutUs: { ...settings.pagesContent.aboutUs, title: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#FAFBF9] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Sub-heading Badge</label>
                <input
                  type="text"
                  value={settings.pagesContent.aboutUs.subtitle || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pagesContent: {
                        ...settings.pagesContent,
                        aboutUs: { ...settings.pagesContent.aboutUs, subtitle: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#FAFBF9] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>About Us Page Body (Rich Text &amp; Cloudinary Images)</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Click the image icon to upload photos directly to Cloudinary
                </span>
              </label>
              <RichTextEditor
                value={settings.pagesContent.aboutUs.contentHtml || settings.pagesContent.aboutUs.storyText || ""}
                onChange={(html) =>
                  setSettings({
                    ...settings,
                    pagesContent: {
                      ...settings.pagesContent,
                      aboutUs: { ...settings.pagesContent.aboutUs, contentHtml: html },
                    },
                  })
                }
                placeholder="Compose your botanical story, mission, and greenhouse journey..."
                minHeight="280px"
              />
            </div>
          </div>
        )}

        {/* ── Privacy Policy Editor ── */}
        {activePolicyTab === "privacy" && (
          <div className="space-y-5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Policy Title</label>
                <input
                  type="text"
                  value={settings.pagesContent.privacyPolicy.title || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pagesContent: {
                        ...settings.pagesContent,
                        privacyPolicy: { ...settings.pagesContent.privacyPolicy, title: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#FAFBF9] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Last Updated Date</label>
                <input
                  type="text"
                  value={settings.pagesContent.privacyPolicy.lastUpdated || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pagesContent: {
                        ...settings.pagesContent,
                        privacyPolicy: { ...settings.pagesContent.privacyPolicy, lastUpdated: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#FAFBF9] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Privacy Policy Content (Rich Text &amp; Cloudinary Images)</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Full formatting with headings, bullet points, blockquotes and graphics
                </span>
              </label>
              <RichTextEditor
                value={settings.pagesContent.privacyPolicy.contentHtml || settings.pagesContent.privacyPolicy.contentText || ""}
                onChange={(html) =>
                  setSettings({
                    ...settings,
                    pagesContent: {
                      ...settings.pagesContent,
                      privacyPolicy: { ...settings.pagesContent.privacyPolicy, contentHtml: html },
                    },
                  })
                }
                placeholder="Write your customer data protection and privacy policy terms..."
                minHeight="280px"
              />
            </div>
          </div>
        )}

        {/* ── Terms of Service Editor ── */}
        {activePolicyTab === "terms" && (
          <div className="space-y-5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Agreement Title</label>
                <input
                  type="text"
                  value={settings.pagesContent.termsOfService.title || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pagesContent: {
                        ...settings.pagesContent,
                        termsOfService: { ...settings.pagesContent.termsOfService, title: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#FAFBF9] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Effective Date</label>
                <input
                  type="text"
                  value={settings.pagesContent.termsOfService.lastUpdated || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pagesContent: {
                        ...settings.pagesContent,
                        termsOfService: { ...settings.pagesContent.termsOfService, lastUpdated: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#FAFBF9] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Terms of Service Content (Rich Text &amp; Cloudinary Images)</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Define purchasing, ordering, and delivery conditions
                </span>
              </label>
              <RichTextEditor
                value={settings.pagesContent.termsOfService.contentHtml || settings.pagesContent.termsOfService.contentText || ""}
                onChange={(html) =>
                  setSettings({
                    ...settings,
                    pagesContent: {
                      ...settings.pagesContent,
                      termsOfService: { ...settings.pagesContent.termsOfService, contentHtml: html },
                    },
                  })
                }
                placeholder="Write your store terms and conditions of service..."
                minHeight="280px"
              />
            </div>
          </div>
        )}

        {/* ── Return & Refund Editor ── */}
        {activePolicyTab === "refund" && (
          <div className="space-y-5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Guarantee Title</label>
                <input
                  type="text"
                  value={settings.pagesContent.refundPolicy.title || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pagesContent: {
                        ...settings.pagesContent,
                        refundPolicy: { ...settings.pagesContent.refundPolicy, title: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#FAFBF9] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Policy Revision Date</label>
                <input
                  type="text"
                  value={settings.pagesContent.refundPolicy.lastUpdated || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pagesContent: {
                        ...settings.pagesContent,
                        refundPolicy: { ...settings.pagesContent.refundPolicy, lastUpdated: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#FAFBF9] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Replacement &amp; Refund Policy Rules (Rich Text &amp; Cloudinary Images)</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Clarify return guidelines, transit damage, and live plant guarantee
                </span>
              </label>
              <RichTextEditor
                value={settings.pagesContent.refundPolicy.contentHtml || settings.pagesContent.refundPolicy.contentText || ""}
                onChange={(html) =>
                  setSettings({
                    ...settings,
                    pagesContent: {
                      ...settings.pagesContent,
                      refundPolicy: { ...settings.pagesContent.refundPolicy, contentHtml: html },
                    },
                  })
                }
                placeholder="Write your live plant replacement, inspection, and refund conditions..."
                minHeight="280px"
              />
            </div>
          </div>
        )}

        {/* Quick Save Page Content Action Bar */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Changes to page content will reflect immediately across public storefront routes.
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F20] text-white text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Page Content (কনটেন্ট সংরক্ষণ করুন)</span>
          </button>
        </div>
      </div>

      {/* Bottom Save Button Bar */}
      <div className="sticky bottom-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Sparkles className="w-4 h-4 text-[#7BAE37]" />
          <span>Remember to save your settings to propagate updates storewide.</span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:bg-gray-300"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>
    </div>
  );
}
