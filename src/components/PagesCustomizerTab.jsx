"use client";

import { useState, useEffect } from "react";
import { App, Switch } from "antd";
import {
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  RotateCcw,
  Sprout,
  Phone,
  HelpCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  PackageCheck,
  MapPin,
  Stethoscope,
  Info,
  Package,
  CreditCard,
  Truck,
  Headphones,
} from "lucide-react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { DEFAULT_PAGE_THEME_CONFIG } from "@/constants/defaultPageThemeConfig";

export default function PagesCustomizerTab({ activePage = "about", onPageChange }) {
  const { message: antdMessage } = App.useApp();

  const [config, setConfig] = useState(DEFAULT_PAGE_THEME_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Accordion state for About Us sections
  const [aboutSectionsOpen, setAboutSectionsOpen] = useState({
    hero: true,
    philosophy: false,
    ecosystem: false,
    standards: false,
    ctaBanner: false,
  });

  const toggleAboutSection = (key) => {
    setAboutSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/page-theme-config");
      const json = await res.json();
      if (json.success && json.data) {
        setConfig((prev) => ({
          ...prev,
          ...json.data,
          aboutPage: {
            ...prev.aboutPage,
            ...(json.data.aboutPage || {}),
            hero: {
              ...prev.aboutPage.hero,
              ...(json.data.aboutPage?.hero || {}),
              stats:
                json.data.aboutPage?.hero?.stats?.length > 0
                  ? json.data.aboutPage.hero.stats
                  : prev.aboutPage.hero.stats,
            },
            philosophy: {
              ...prev.aboutPage.philosophy,
              ...(json.data.aboutPage?.philosophy || {}),
            },
            ecosystem: {
              ...prev.aboutPage.ecosystem,
              ...(json.data.aboutPage?.ecosystem || {}),
              cards:
                json.data.aboutPage?.ecosystem?.cards?.length > 0
                  ? json.data.aboutPage.ecosystem.cards
                  : prev.aboutPage.ecosystem.cards,
            },
            standards: {
              ...prev.aboutPage.standards,
              ...(json.data.aboutPage?.standards || {}),
              cards:
                json.data.aboutPage?.standards?.cards?.length > 0
                  ? json.data.aboutPage.standards.cards
                  : prev.aboutPage.standards.cards,
            },
            ctaBanner: {
              ...prev.aboutPage.ctaBanner,
              ...(json.data.aboutPage?.ctaBanner || {}),
            },
          },
          contactPage: {
            ...prev.contactPage,
            ...(json.data.contactPage || {}),
            doctorCard: {
              ...prev.contactPage.doctorCard,
              ...(json.data.contactPage?.doctorCard || {}),
            },
          },
          policyPages: {
            ...prev.policyPages,
            ...(json.data.policyPages || {}),
            privacy: {
              ...prev.policyPages.privacy,
              ...(json.data.policyPages?.privacy || {}),
            },
            terms: {
              ...prev.policyPages.terms,
              ...(json.data.policyPages?.terms || {}),
            },
            refund: {
              ...prev.policyPages.refund,
              ...(json.data.policyPages?.refund || {}),
              steps:
                json.data.policyPages?.refund?.steps?.length > 0
                  ? json.data.policyPages.refund.steps
                  : prev.policyPages.refund.steps,
            },
          },
          productPage: {
            ...prev.productPage,
            ...(json.data.productPage || {}),
            featureCards: {
              ...prev.productPage.featureCards,
              ...(json.data.productPage?.featureCards || {}),
              card1: {
                ...prev.productPage.featureCards.card1,
                ...(json.data.productPage?.featureCards?.card1 || {}),
              },
              card2: {
                ...prev.productPage.featureCards.card2,
                ...(json.data.productPage?.featureCards?.card2 || {}),
              },
            },
            trustBadges: {
              ...prev.productPage.trustBadges,
              ...(json.data.productPage?.trustBadges || {}),
              badge1: {
                ...prev.productPage.trustBadges.badge1,
                ...(json.data.productPage?.trustBadges?.badge1 || {}),
              },
              badge2: {
                ...prev.productPage.trustBadges.badge2,
                ...(json.data.productPage?.trustBadges?.badge2 || {}),
              },
              badge3: {
                ...prev.productPage.trustBadges.badge3,
                ...(json.data.productPage?.trustBadges?.badge3 || {}),
              },
            },
            paymentBadges: {
              ...prev.productPage.paymentBadges,
              ...(json.data.productPage?.paymentBadges || {}),
              methods:
                Array.isArray(json.data.productPage?.paymentBadges?.methods) &&
                json.data.productPage.paymentBadges.methods.length > 0
                  ? json.data.productPage.paymentBadges.methods
                  : prev.productPage.paymentBadges.methods,
            },
            relatedSection: {
              ...prev.productPage.relatedSection,
              ...(json.data.productPage?.relatedSection || {}),
            },
          },
        }));
      }
    } catch (err) {
      console.error("Failed to load page theme config:", err);
      antdMessage.error("Could not load page theme config. Showing defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/page-theme-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        antdMessage.success("Page content settings updated successfully!");
        window.dispatchEvent(new Event("pageThemeConfigUpdated"));
      } else {
        antdMessage.error(data.message || "Failed to update page settings.");
      }
    } catch (err) {
      console.error("Save error:", err);
      antdMessage.error("Network error while saving page settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading Page Customizer Data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-emerald-100/60 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
            <span>Storefront Page Customizer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure section copy, rich text descriptions, banners, and guarantees across storefront pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchConfig}
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving…" : "Save Page Settings"}</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE: PRODUCT DETAILS PAGE CUSTOMIZER (4 SECTIONS)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activePage === "product" && (
        <div className="space-y-5">
          {/* Section 1: Description Tab & 2 Feature Cards Customizer */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-2xs overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Description Tab &amp; Feature Cards Customizer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Default tab heading and dual trust feature cards under product description
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Feature Cards:</span>
                <Switch
                  checked={config.productPage?.featureCards?.isEnabled}
                  onChange={(checked) =>
                    setConfig({
                      ...config,
                      productPage: {
                        ...config.productPage,
                        featureCards: {
                          ...config.productPage?.featureCards,
                          isEnabled: checked,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Description Tab Heading
              </label>
              <input
                type="text"
                value={config.productPage?.defaultTabTitle || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    productPage: {
                      ...config.productPage,
                      defaultTabTitle: e.target.value,
                    },
                  })
                }
                placeholder="Botanical Background & Characteristics"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Feature Card 1 */}
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-emerald-100/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider flex items-center gap-1.5">
                    <Sprout className="w-4 h-4" /> Feature Card #1
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={config.productPage?.featureCards?.card1?.title || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        productPage: {
                          ...config.productPage,
                          featureCards: {
                            ...config.productPage?.featureCards,
                            card1: {
                              ...config.productPage?.featureCards?.card1,
                              title: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={config.productPage?.featureCards?.card1?.description || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        productPage: {
                          ...config.productPage,
                          featureCards: {
                            ...config.productPage?.featureCards,
                            card1: {
                              ...config.productPage?.featureCards?.card1,
                              description: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-emerald-100/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" /> Feature Card #2
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={config.productPage?.featureCards?.card2?.title || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        productPage: {
                          ...config.productPage,
                          featureCards: {
                            ...config.productPage?.featureCards,
                            card2: {
                              ...config.productPage?.featureCards?.card2,
                              title: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={config.productPage?.featureCards?.card2?.description || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        productPage: {
                          ...config.productPage,
                          featureCards: {
                            ...config.productPage?.featureCards,
                            card2: {
                              ...config.productPage?.featureCards?.card2,
                              description: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Trust Badges Strip */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-2xs overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Trust Badges Strip (Below Add to Cart)
                  </h3>
                  <p className="text-xs text-slate-500">
                    3 trust assurance pillars displayed in the right product column
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Enable Strip:</span>
                <Switch
                  checked={config.productPage?.trustBadges?.isEnabled}
                  onChange={(checked) =>
                    setConfig({
                      ...config,
                      productPage: {
                        ...config.productPage,
                        trustBadges: {
                          ...config.productPage?.trustBadges,
                          isEnabled: checked,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Badge 1 */}
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-emerald-100/60 space-y-2.5">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#2D6A4F]" /> Badge #1 (Shipping)
                </span>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Title</label>
                  <input
                    type="text"
                    value={config.productPage?.trustBadges?.badge1?.title || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        productPage: {
                          ...config.productPage,
                          trustBadges: {
                            ...config.productPage?.trustBadges,
                            badge1: {
                              ...config.productPage?.trustBadges?.badge1,
                              title: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Subtext</label>
                  <input
                    type="text"
                    value={config.productPage?.trustBadges?.badge1?.subtext || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        productPage: {
                          ...config.productPage,
                          trustBadges: {
                            ...config.productPage?.trustBadges,
                            badge1: {
                              ...config.productPage?.trustBadges?.badge1,
                              subtext: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Badge 2 */}
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-emerald-100/60 space-y-2.5">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-sky-600" /> Badge #2 (Support)
                </span>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Title</label>
                  <input
                    type="text"
                    value={config.productPage?.trustBadges?.badge2?.title || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        productPage: {
                          ...config.productPage,
                          trustBadges: {
                            ...config.productPage?.trustBadges,
                            badge2: {
                              ...config.productPage?.trustBadges?.badge2,
                              title: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Subtext</label>
                  <input
                    type="text"
                    value={config.productPage?.trustBadges?.badge2?.subtext || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        productPage: {
                          ...config.productPage,
                          trustBadges: {
                            ...config.productPage?.trustBadges,
                            badge2: {
                              ...config.productPage?.trustBadges?.badge2,
                              subtext: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Badge 3 */}
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-emerald-100/60 space-y-2.5">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" /> Badge #3 (Payment)
                </span>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Title</label>
                  <input
                    type="text"
                    value={config.productPage?.trustBadges?.badge3?.title || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        productPage: {
                          ...config.productPage,
                          trustBadges: {
                            ...config.productPage?.trustBadges,
                            badge3: {
                              ...config.productPage?.trustBadges?.badge3,
                              title: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Subtext</label>
                  <input
                    type="text"
                    value={config.productPage?.trustBadges?.badge3?.subtext || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        productPage: {
                          ...config.productPage,
                          trustBadges: {
                            ...config.productPage?.trustBadges,
                            badge3: {
                              ...config.productPage?.trustBadges?.badge3,
                              subtext: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Guaranteed Safe Checkout Methods */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-2xs overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Guaranteed Safe Checkout Payment Pills
                  </h3>
                  <p className="text-xs text-slate-500">
                    Toggle and manage payment gateway badges (bKash, Nagad, VISA, Mastercard, COD)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Enable Payment Badges:</span>
                <Switch
                  checked={config.productPage?.paymentBadges?.isEnabled}
                  onChange={(checked) =>
                    setConfig({
                      ...config,
                      productPage: {
                        ...config.productPage,
                        paymentBadges: {
                          ...config.productPage?.paymentBadges,
                          isEnabled: checked,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Accepted Payment Methods (Click pill to remove or use input below to add)
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {(config.productPage?.paymentBadges?.methods || []).map((method, idx) => (
                  <span
                    key={`pm-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-[#2D6A4F] border border-emerald-200/70 text-xs font-bold"
                  >
                    <span>{method}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextMethods = (config.productPage?.paymentBadges?.methods || []).filter(
                          (_, i) => i !== idx
                        );
                        setConfig({
                          ...config,
                          productPage: {
                            ...config.productPage,
                            paymentBadges: {
                              ...config.productPage?.paymentBadges,
                              methods: nextMethods,
                            },
                          },
                        });
                      }}
                      className="w-4 h-4 rounded-full hover:bg-emerald-200 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Method input */}
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  id="new-payment-method-input"
                  placeholder="e.g. Upay, Rocket, AMEX"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val) {
                        const current = config.productPage?.paymentBadges?.methods || [];
                        if (!current.includes(val)) {
                          setConfig({
                            ...config,
                            productPage: {
                              ...config.productPage,
                              paymentBadges: {
                                ...config.productPage?.paymentBadges,
                                methods: [...current, val],
                              },
                            },
                          });
                        }
                        e.target.value = "";
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("new-payment-method-input");
                    const val = el?.value?.trim();
                    if (val) {
                      const current = config.productPage?.paymentBadges?.methods || [];
                      if (!current.includes(val)) {
                        setConfig({
                          ...config,
                          productPage: {
                            ...config.productPage,
                            paymentBadges: {
                              ...config.productPage?.paymentBadges,
                              methods: [...current, val],
                            },
                          },
                        });
                      }
                      el.value = "";
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#1B4332] cursor-pointer"
                >
                  + Add Method
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Related Products Section Customizer */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-2xs overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Related Products Section
                  </h3>
                  <p className="text-xs text-slate-500">
                    Curated companion items row at the bottom of the product page
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Enable Section:</span>
                <Switch
                  checked={config.productPage?.relatedSection?.isEnabled}
                  onChange={(checked) =>
                    setConfig({
                      ...config,
                      productPage: {
                        ...config.productPage,
                        relatedSection: {
                          ...config.productPage?.relatedSection,
                          isEnabled: checked,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Badge</label>
                <input
                  type="text"
                  value={config.productPage?.relatedSection?.badge || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      productPage: {
                        ...config.productPage,
                        relatedSection: {
                          ...config.productPage?.relatedSection,
                          badge: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Heading Title</label>
                <input
                  type="text"
                  value={config.productPage?.relatedSection?.title || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      productPage: {
                        ...config.productPage,
                        relatedSection: {
                          ...config.productPage?.relatedSection,
                          title: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">View All Link URL</label>
                <input
                  type="text"
                  value={config.productPage?.relatedSection?.viewAllUrl || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      productPage: {
                        ...config.productPage,
                        relatedSection: {
                          ...config.productPage?.relatedSection,
                          viewAllUrl: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 1: ABOUT US PAGE (5 SECTIONS)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activePage === "about" && (
        <div className="space-y-5">
          {/* Section 1: Hero & Stats */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleAboutSection("hero")}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-emerald-50/30 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hero Section &amp; Key Stats</h3>
                  <p className="text-xs text-slate-500">Page header title, subtitle, and 4 statistical counters</p>
                </div>
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-semibold text-slate-500">Enable Section:</span>
                <Switch
                  checked={config.aboutPage?.hero?.isEnabled}
                  onChange={(checked) =>
                    setConfig({
                      ...config,
                      aboutPage: {
                        ...config.aboutPage,
                        hero: { ...config.aboutPage.hero, isEnabled: checked },
                      },
                    })
                  }
                />
                {aboutSectionsOpen.hero ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                )}
              </div>
            </div>

            {aboutSectionsOpen.hero && (
              <div className="p-6 border-t border-gray-100 space-y-5 bg-[#FAFBF9]/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Sub-heading Badge</label>
                    <input
                      type="text"
                      value={config.aboutPage?.hero?.badge || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            hero: { ...config.aboutPage.hero, badge: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Main Headline Title</label>
                    <input
                      type="text"
                      value={config.aboutPage?.hero?.title || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            hero: { ...config.aboutPage.hero, title: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Introduction Subtitle</label>
                  <textarea
                    rows={3}
                    value={config.aboutPage?.hero?.subtitle || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        aboutPage: {
                          ...config.aboutPage,
                          hero: { ...config.aboutPage.hero, subtitle: e.target.value },
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                {/* 4 Stats Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    4 Highlight Statistics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(config.aboutPage?.hero?.stats || []).map((st, sIdx) => (
                      <div key={sIdx} className="p-3.5 rounded-2xl bg-white border border-gray-200 space-y-2">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Stat #{sIdx + 1}
                        </span>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Value (e.g. 500+)</label>
                          <input
                            type="text"
                            value={st.value || ""}
                            onChange={(e) => {
                              const newStats = [...config.aboutPage.hero.stats];
                              newStats[sIdx] = { ...newStats[sIdx], value: e.target.value };
                              setConfig({
                                ...config,
                                aboutPage: {
                                  ...config.aboutPage,
                                  hero: { ...config.aboutPage.hero, stats: newStats },
                                },
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#2D6A4F]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Label</label>
                          <input
                            type="text"
                            value={st.label || ""}
                            onChange={(e) => {
                              const newStats = [...config.aboutPage.hero.stats];
                              newStats[sIdx] = { ...newStats[sIdx], label: e.target.value };
                              setConfig({
                                ...config,
                                aboutPage: {
                                  ...config.aboutPage,
                                  hero: { ...config.aboutPage.hero, stats: newStats },
                                },
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Sublabel</label>
                          <input
                            type="text"
                            value={st.sublabel || ""}
                            onChange={(e) => {
                              const newStats = [...config.aboutPage.hero.stats];
                              newStats[sIdx] = { ...newStats[sIdx], sublabel: e.target.value };
                              setConfig({
                                ...config,
                                aboutPage: {
                                  ...config.aboutPage,
                                  hero: { ...config.aboutPage.hero, stats: newStats },
                                },
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-slate-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Philosophy & Core Promise */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleAboutSection("philosophy")}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-emerald-50/30 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Philosophy &amp; Core Promise</h3>
                  <p className="text-xs text-slate-500">Rich text story, greenhouse commitment, and quote sidebar</p>
                </div>
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-semibold text-slate-500">Enable Section:</span>
                <Switch
                  checked={config.aboutPage?.philosophy?.isEnabled}
                  onChange={(checked) =>
                    setConfig({
                      ...config,
                      aboutPage: {
                        ...config.aboutPage,
                        philosophy: { ...config.aboutPage.philosophy, isEnabled: checked },
                      },
                    })
                  }
                />
                {aboutSectionsOpen.philosophy ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                )}
              </div>
            </div>

            {aboutSectionsOpen.philosophy && (
              <div className="p-6 border-t border-gray-100 space-y-5 bg-[#FAFBF9]/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Section Badge</label>
                    <input
                      type="text"
                      value={config.aboutPage?.philosophy?.badge || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            philosophy: { ...config.aboutPage.philosophy, badge: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Section Title</label>
                    <input
                      type="text"
                      value={config.aboutPage?.philosophy?.title || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            philosophy: { ...config.aboutPage.philosophy, title: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Philosophy &amp; Story Rich Body</span>
                    <span className="text-[11px] text-slate-400">Upload photos directly to Cloudinary</span>
                  </label>
                  <RichTextEditor
                    value={config.aboutPage?.philosophy?.contentHtml || ""}
                    onChange={(html) =>
                      setConfig({
                        ...config,
                        aboutPage: {
                          ...config.aboutPage,
                          philosophy: { ...config.aboutPage.philosophy, contentHtml: html },
                        },
                      })
                    }
                    placeholder="Compose your nursery story, botanical journey, and greenhouse commitments..."
                    minHeight="260px"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-emerald-100/60 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Right Sidebar: Core Promise Card</span>
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Promise Quote</label>
                    <textarea
                      rows={2}
                      value={config.aboutPage?.philosophy?.promiseQuote || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            philosophy: { ...config.aboutPage.philosophy, promiseQuote: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Author Name</label>
                      <input
                        type="text"
                        value={config.aboutPage?.philosophy?.promiseAuthor || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            aboutPage: {
                              ...config.aboutPage,
                              philosophy: { ...config.aboutPage.philosophy, promiseAuthor: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Location Tag</label>
                      <input
                        type="text"
                        value={config.aboutPage?.philosophy?.promiseLocation || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            aboutPage: {
                              ...config.aboutPage,
                              philosophy: { ...config.aboutPage.philosophy, promiseLocation: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Ecosystem Grid */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleAboutSection("ecosystem")}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-emerald-50/30 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Nursery Ecosystem Grid</h3>
                  <p className="text-xs text-slate-500">Section title and 4 offering cards (Air-purifying, florals, organic compost, planters)</p>
                </div>
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-semibold text-slate-500">Enable Section:</span>
                <Switch
                  checked={config.aboutPage?.ecosystem?.isEnabled}
                  onChange={(checked) =>
                    setConfig({
                      ...config,
                      aboutPage: {
                        ...config.aboutPage,
                        ecosystem: { ...config.aboutPage.ecosystem, isEnabled: checked },
                      },
                    })
                  }
                />
                {aboutSectionsOpen.ecosystem ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                )}
              </div>
            </div>

            {aboutSectionsOpen.ecosystem && (
              <div className="p-6 border-t border-gray-100 space-y-5 bg-[#FAFBF9]/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Section Badge</label>
                    <input
                      type="text"
                      value={config.aboutPage?.ecosystem?.badge || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            ecosystem: { ...config.aboutPage.ecosystem, badge: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Section Title</label>
                    <input
                      type="text"
                      value={config.aboutPage?.ecosystem?.title || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            ecosystem: { ...config.aboutPage.ecosystem, title: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Section Subtitle</label>
                  <input
                    type="text"
                    value={config.aboutPage?.ecosystem?.subtitle || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        aboutPage: {
                          ...config.aboutPage,
                          ecosystem: { ...config.aboutPage.ecosystem, subtitle: e.target.value },
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(config.aboutPage?.ecosystem?.cards || []).map((card, cIdx) => (
                    <div key={cIdx} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Card #{cIdx + 1}
                      </span>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">Card Title</label>
                        <input
                          type="text"
                          value={card.title || ""}
                          onChange={(e) => {
                            const newCards = [...config.aboutPage.ecosystem.cards];
                            newCards[cIdx] = { ...newCards[cIdx], title: e.target.value };
                            setConfig({
                              ...config,
                              aboutPage: {
                                ...config.aboutPage,
                                ecosystem: { ...config.aboutPage.ecosystem, cards: newCards },
                              },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">Description</label>
                        <textarea
                          rows={2}
                          value={card.description || ""}
                          onChange={(e) => {
                            const newCards = [...config.aboutPage.ecosystem.cards];
                            newCards[cIdx] = { ...newCards[cIdx], description: e.target.value };
                            setConfig({
                              ...config,
                              aboutPage: {
                                ...config.aboutPage,
                                ecosystem: { ...config.aboutPage.ecosystem, cards: newCards },
                              },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Standards Grid */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleAboutSection("standards")}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-emerald-50/30 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Standards &amp; Values Grid</h3>
                  <p className="text-xs text-slate-500">Non-negotiable quality and packaging values</p>
                </div>
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-semibold text-slate-500">Enable Section:</span>
                <Switch
                  checked={config.aboutPage?.standards?.isEnabled}
                  onChange={(checked) =>
                    setConfig({
                      ...config,
                      aboutPage: {
                        ...config.aboutPage,
                        standards: { ...config.aboutPage.standards, isEnabled: checked },
                      },
                    })
                  }
                />
                {aboutSectionsOpen.standards ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                )}
              </div>
            </div>

            {aboutSectionsOpen.standards && (
              <div className="p-6 border-t border-gray-100 space-y-5 bg-[#FAFBF9]/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Section Badge</label>
                    <input
                      type="text"
                      value={config.aboutPage?.standards?.badge || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            standards: { ...config.aboutPage.standards, badge: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Section Title</label>
                    <input
                      type="text"
                      value={config.aboutPage?.standards?.title || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            standards: { ...config.aboutPage.standards, title: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(config.aboutPage?.standards?.cards || []).map((card, cIdx) => (
                    <div key={cIdx} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Standard #{cIdx + 1}
                      </span>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">Value Title</label>
                        <input
                          type="text"
                          value={card.title || ""}
                          onChange={(e) => {
                            const newCards = [...config.aboutPage.standards.cards];
                            newCards[cIdx] = { ...newCards[cIdx], title: e.target.value };
                            setConfig({
                              ...config,
                              aboutPage: {
                                ...config.aboutPage,
                                standards: { ...config.aboutPage.standards, cards: newCards },
                              },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">Description</label>
                        <textarea
                          rows={2}
                          value={card.description || ""}
                          onChange={(e) => {
                            const newCards = [...config.aboutPage.standards.cards];
                            newCards[cIdx] = { ...newCards[cIdx], description: e.target.value };
                            setConfig({
                              ...config,
                              aboutPage: {
                                ...config.aboutPage,
                                standards: { ...config.aboutPage.standards, cards: newCards },
                              },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Bottom CTA Banner */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleAboutSection("ctaBanner")}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-emerald-50/30 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center text-xs font-bold">
                  5
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Bottom Call-to-Action Banner</h3>
                  <p className="text-xs text-slate-500">Banner title, subtitle, and primary/secondary button links</p>
                </div>
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-semibold text-slate-500">Enable Section:</span>
                <Switch
                  checked={config.aboutPage?.ctaBanner?.isEnabled}
                  onChange={(checked) =>
                    setConfig({
                      ...config,
                      aboutPage: {
                        ...config.aboutPage,
                        ctaBanner: { ...config.aboutPage.ctaBanner, isEnabled: checked },
                      },
                    })
                  }
                />
                {aboutSectionsOpen.ctaBanner ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                )}
              </div>
            </div>

            {aboutSectionsOpen.ctaBanner && (
              <div className="p-6 border-t border-gray-100 space-y-4 bg-[#FAFBF9]/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Banner Title</label>
                    <input
                      type="text"
                      value={config.aboutPage?.ctaBanner?.title || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            ctaBanner: { ...config.aboutPage.ctaBanner, title: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Banner Subtitle</label>
                    <input
                      type="text"
                      value={config.aboutPage?.ctaBanner?.subtitle || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutPage: {
                            ...config.aboutPage,
                            ctaBanner: { ...config.aboutPage.ctaBanner, subtitle: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                      Primary Button
                    </span>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Button Text</label>
                      <input
                        type="text"
                        value={config.aboutPage?.ctaBanner?.buttonText || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            aboutPage: {
                              ...config.aboutPage,
                              ctaBanner: { ...config.aboutPage.ctaBanner, buttonText: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Destination URL</label>
                      <input
                        type="text"
                        value={config.aboutPage?.ctaBanner?.buttonUrl || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            aboutPage: {
                              ...config.aboutPage,
                              ctaBanner: { ...config.aboutPage.ctaBanner, buttonUrl: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                      Secondary Button
                    </span>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Button Text</label>
                      <input
                        type="text"
                        value={config.aboutPage?.ctaBanner?.secondaryButtonText || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            aboutPage: {
                              ...config.aboutPage,
                              ctaBanner: { ...config.aboutPage.ctaBanner, secondaryButtonText: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Destination URL</label>
                      <input
                        type="text"
                        value={config.aboutPage?.ctaBanner?.secondaryButtonUrl || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            aboutPage: {
                              ...config.aboutPage,
                              ctaBanner: { ...config.aboutPage.ctaBanner, secondaryButtonUrl: e.target.value },
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 2: CONTACT US PAGE
      ═══════════════════════════════════════════════════════════════════════ */}
      {activePage === "contact" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-emerald-100/60 p-6 sm:p-8 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2D6A4F]" />
              <span>Contact Page Header &amp; Copy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Sub-heading Badge</label>
                <input
                  type="text"
                  value={config.contactPage?.badge || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contactPage: { ...config.contactPage, badge: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Header Headline Title</label>
                <input
                  type="text"
                  value={config.contactPage?.title || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contactPage: { ...config.contactPage, title: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Header Subtitle</label>
              <textarea
                rows={3}
                value={config.contactPage?.subtitle || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    contactPage: { ...config.contactPage, subtitle: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>
          </div>

          {/* Plant Doctor Consultation Card Controls */}
          <div className="bg-white rounded-3xl border border-emerald-100/60 p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#2D6A4F]" />
                <span>Plant Doctor Consultation Card</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Show Doctor Card:</span>
                <Switch
                  checked={config.contactPage?.doctorCard?.isEnabled}
                  onChange={(checked) =>
                    setConfig({
                      ...config,
                      contactPage: {
                        ...config.contactPage,
                        doctorCard: { ...config.contactPage.doctorCard, isEnabled: checked },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Card Title</label>
                <input
                  type="text"
                  value={config.contactPage?.doctorCard?.title || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contactPage: {
                        ...config.contactPage,
                        doctorCard: { ...config.contactPage.doctorCard, title: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Guarantee Badge Text</label>
                <input
                  type="text"
                  value={config.contactPage?.doctorCard?.buttonText || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contactPage: {
                        ...config.contactPage,
                        doctorCard: { ...config.contactPage.doctorCard, buttonText: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Card Advisory Description</label>
              <textarea
                rows={2}
                value={config.contactPage?.doctorCard?.description || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    contactPage: {
                      ...config.contactPage,
                      doctorCard: { ...config.contactPage.doctorCard, description: e.target.value },
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Note: The support hotline, direct email, store physical address, and WhatsApp instant reply numbers are synchronized dynamically from <strong>Site Settings</strong>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 3: PRIVACY POLICY PAGE
      ═══════════════════════════════════════════════════════════════════════ */}
      {activePage === "privacy" && (
        <div className="bg-white rounded-3xl border border-emerald-100/60 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
              <span>Privacy &amp; Customer Data Protection Policy</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Define customer privacy, data retention, and courier coordination practices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Sub-heading Badge</label>
              <input
                type="text"
                value={config.policyPages?.privacy?.badge || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      privacy: { ...config.policyPages.privacy, badge: e.target.value },
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Policy Title</label>
              <input
                type="text"
                value={config.policyPages?.privacy?.title || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      privacy: { ...config.policyPages.privacy, title: e.target.value },
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Last Updated Date</label>
              <input
                type="text"
                value={config.policyPages?.privacy?.lastUpdated || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      privacy: { ...config.policyPages.privacy, lastUpdated: e.target.value },
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Full Policy Text (WYSIWYG Rich Editor)</span>
              <span className="text-[11px] text-slate-400">Supports headings, lists, blockquotes, and Cloudinary graphics</span>
            </label>
            <RichTextEditor
              value={config.policyPages?.privacy?.contentHtml || ""}
              onChange={(html) =>
                setConfig({
                  ...config,
                  policyPages: {
                    ...config.policyPages,
                    privacy: { ...config.policyPages.privacy, contentHtml: html },
                  },
                })
              }
              placeholder="Write your customer data protection policies..."
              minHeight="320px"
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 4: TERMS OF SERVICE PAGE
      ═══════════════════════════════════════════════════════════════════════ */}
      {activePage === "terms" && (
        <div className="bg-white rounded-3xl border border-emerald-100/60 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2D6A4F]" />
              <span>Terms &amp; Conditions of Service</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Define ordering, pricing, regional shipping commitments, and natural plant variation rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Agreement Badge</label>
              <input
                type="text"
                value={config.policyPages?.terms?.badge || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      terms: { ...config.policyPages.terms, badge: e.target.value },
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Agreement Title</label>
              <input
                type="text"
                value={config.policyPages?.terms?.title || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      terms: { ...config.policyPages.terms, title: e.target.value },
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Effective Date</label>
              <input
                type="text"
                value={config.policyPages?.terms?.lastUpdated || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      terms: { ...config.policyPages.terms, lastUpdated: e.target.value },
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>
          </div>

          {/* Delivery Timelines Special Boxes */}
          <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Standard Shipping Timelines Card (Rendered on Terms Page)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500">Inside Dhaka Timeline</label>
                <input
                  type="text"
                  value={config.policyPages?.terms?.dhakaTimeline || "24 to 48 Hours"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      policyPages: {
                        ...config.policyPages,
                        terms: { ...config.policyPages.terms, dhakaTimeline: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white text-[#2D6A4F]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">Outside Dhaka Timeline</label>
                <input
                  type="text"
                  value={config.policyPages?.terms?.outsideTimeline || "48 to 72 Hours"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      policyPages: {
                        ...config.policyPages,
                        terms: { ...config.policyPages.terms, outsideTimeline: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white text-[#2D6A4F]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Full Agreement Text (WYSIWYG Rich Editor)</span>
              <span className="text-[11px] text-slate-400">Define purchasing, payment, and transit rules</span>
            </label>
            <RichTextEditor
              value={config.policyPages?.terms?.contentHtml || ""}
              onChange={(html) =>
                setConfig({
                  ...config,
                  policyPages: {
                    ...config.policyPages,
                    terms: { ...config.policyPages.terms, contentHtml: html },
                  },
                })
              }
              placeholder="Write your store terms and conditions..."
              minHeight="320px"
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 5: RETURN & REFUND POLICY PAGE
      ═══════════════════════════════════════════════════════════════════════ */}
      {activePage === "refund" && (
        <div className="bg-white rounded-3xl border border-emerald-100/60 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#2D6A4F]" />
              <span>48-Hour Live Plant Replacement &amp; Refund Guarantee</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Clarify return conditions, live transit damage claims, and the 3-step claim protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Guarantee Badge</label>
              <input
                type="text"
                value={config.policyPages?.refund?.badge || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      refund: { ...config.policyPages.refund, badge: e.target.value },
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Policy Title</label>
              <input
                type="text"
                value={config.policyPages?.refund?.title || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      refund: { ...config.policyPages.refund, title: e.target.value },
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Revision Date</label>
              <input
                type="text"
                value={config.policyPages?.refund?.lastUpdated || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      refund: { ...config.policyPages.refund, lastUpdated: e.target.value },
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-800 bg-[#FAFBF9]"
              />
            </div>
          </div>

          {/* Highlight Guarantee Card Settings */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Top Highlight Guarantee Card
            </h4>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Guarantee Card Title</label>
              <input
                type="text"
                value={config.policyPages?.refund?.guaranteeTitle || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      refund: { ...config.policyPages.refund, guaranteeTitle: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Guarantee Description</label>
              <textarea
                rows={2}
                value={config.policyPages?.refund?.guaranteeText || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    policyPages: {
                      ...config.policyPages,
                      refund: { ...config.policyPages.refund, guaranteeText: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white text-slate-700"
              />
            </div>
          </div>

          {/* 3-Step Claim Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              3-Step Fast Claim Guide
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(config.policyPages?.refund?.steps || []).map((st, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-gray-200 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {st.step || `Step ${idx + 1}`}
                  </span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Step Title</label>
                    <input
                      type="text"
                      value={st.title || ""}
                      onChange={(e) => {
                        const newSteps = [...config.policyPages.refund.steps];
                        newSteps[idx] = { ...newSteps[idx], title: e.target.value };
                        setConfig({
                          ...config,
                          policyPages: {
                            ...config.policyPages,
                            refund: { ...config.policyPages.refund, steps: newSteps },
                          },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Step Instructions</label>
                    <textarea
                      rows={2}
                      value={st.desc || ""}
                      onChange={(e) => {
                        const newSteps = [...config.policyPages.refund.steps];
                        newSteps[idx] = { ...newSteps[idx], desc: e.target.value };
                        setConfig({
                          ...config,
                          policyPages: {
                            ...config.policyPages,
                            refund: { ...config.policyPages.refund, steps: newSteps },
                          },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white text-slate-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Full Replacement &amp; Refund Policy Rules (WYSIWYG Rich Editor)</span>
              <span className="text-[11px] text-slate-400">Define transit damage, turnaround time, and policy clauses</span>
            </label>
            <RichTextEditor
              value={config.policyPages?.refund?.contentHtml || ""}
              onChange={(html) =>
                setConfig({
                  ...config,
                  policyPages: {
                    ...config.policyPages,
                    refund: { ...config.policyPages.refund, contentHtml: html },
                  },
                })
              }
              placeholder="Write your replacement and refund conditions..."
              minHeight="320px"
            />
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          All modifications saved here take effect immediately across public storefront pages.
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving…" : "Save Page Settings"}</span>
        </button>
      </div>
    </div>
  );
}
