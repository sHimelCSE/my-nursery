"use client";

import { useState, useEffect, useMemo } from "react";
import { App, Modal } from "antd";
import {
  Mail,
  Copy,
  Download,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  Globe,
  Radio,
} from "lucide-react";

function formatSubscriberDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = d.getDate().toString().padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month}, ${year} - ${hours}:${minutes}`;
  } catch {
    return "N/A";
  }
}

export default function SubscribersTab({ onCountChange }) {
  const { message: antdMessage } = App.useApp();

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subscribers");
      const data = await res.json();
      if (data.success && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers);
        if (onCountChange) {
          onCountChange(data.subscribers.length);
        }
      } else {
        throw new Error(data.message || "Failed to load subscribers");
      }
    } catch (err) {
      console.error("Failed to load subscribers:", err);
      antdMessage.error("Failed to load subscribers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    if (!searchTerm.trim()) return subscribers;
    const q = searchTerm.toLowerCase().trim();
    return subscribers.filter(
      (sub) =>
        (sub.email && sub.email.toLowerCase().includes(q)) ||
        (sub.source && sub.source.toLowerCase().includes(q))
    );
  }, [subscribers, searchTerm]);

  // Quick Action: Copy All Emails
  const handleCopyAllEmails = async () => {
    if (!subscribers.length) {
      antdMessage.warning("No subscriber emails available to copy.");
      return;
    }

    const emails = subscribers
      .map((s) => s.email)
      .filter(Boolean)
      .join(", ");

    try {
      await navigator.clipboard.writeText(emails);
      antdMessage.success("All emails copied to clipboard!");
    } catch (err) {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = emails;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      antdMessage.success("All emails copied to clipboard!");
    }
  };

  // Quick Action: Export CSV
  const handleExportCSV = () => {
    if (!subscribers.length) {
      antdMessage.warning("No subscriber data to export.");
      return;
    }

    const headers = ["Index", "Email Address", "Date Subscribed", "Source", "Status"];
    const rows = subscribers.map((sub, idx) => [
      idx + 1,
      `"${sub.email}"`,
      `"${formatSubscriberDate(sub.subscribedAt || sub.createdAt)}"`,
      `"${sub.source || "homepage"}"`,
      `"${sub.isActive !== false ? "Active" : "Inactive"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `greenleaf-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    antdMessage.success("Subscribers list exported as CSV!");
  };

  // Delete Subscriber
  const handleDeleteSubscriber = (sub) => {
    Modal.confirm({
      title: "Delete Subscriber?",
      content: `Are you sure you want to remove "${sub.email}" from the newsletter subscribers list?`,
      okText: "Yes, Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setDeletingId(sub._id);
          const res = await fetch(`/api/admin/subscribers/${sub._id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to delete subscriber");
          }
          antdMessage.success("Subscriber removed successfully");
          fetchSubscribers();
        } catch (err) {
          console.error("Delete subscriber error:", err);
          antdMessage.error(err.message || "Failed to remove subscriber");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  // Metrics
  const activeSubscribersCount = subscribers.filter((s) => s.isActive !== false).length;
  const homepageSubscribersCount = subscribers.filter((s) => (s.source || "homepage").toLowerCase().includes("home")).length;
  const otherSubscribersCount = subscribers.length - homepageSubscribersCount;

  return (
    <div className="space-y-6">
      {/* ─── Top Metrics Bar ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat Card 1: Total Active Subscribers */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Subscribers
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-[#1A2E22]">
                {activeSubscribersCount}
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-[#EBF0E6] px-2 py-0.5 rounded-full">
                Active Audience
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EBF0E6] text-[#2D5A27] flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Stat Card 2: Homepage Opt-Ins */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Storefront Signups
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-[#1A2E22]">
                {homepageSubscribersCount}
              </h3>
              <span className="text-[11px] font-semibold text-gray-500">
                Via Homepage Card
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Stat Card 3: Secondary Channels */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Articles &amp; Other
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-[#1A2E22]">
                {otherSubscribersCount}
              </h3>
              <span className="text-[11px] font-semibold text-gray-500">
                Via Blog &amp; Digest
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* ─── Action & Search Toolbar ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subscriber email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFBF9] border border-gray-200 text-xs text-gray-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={fetchSubscribers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleCopyAllEmails}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#2D6A4F]/30 bg-[#EBF0E6] hover:bg-[#DCE6D5] text-[#2D5A27] text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Copy className="w-4 h-4" />
            <span>Copy All Emails</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D37] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─── Subscribers Table ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFBF9] border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5 w-14">#</th>
                <th className="py-3.5 px-5">Email Address</th>
                <th className="py-3.5 px-5">Date Subscribed</th>
                <th className="py-3.5 px-5">Source</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading && subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2D6A4F] mx-auto mb-2" />
                    <span>Loading subscriber records...</span>
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-gray-400">
                    <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-600 text-sm">
                      No subscribers found
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {searchTerm
                        ? `No subscriber matches "${searchTerm}"`
                        : "Subscribers will appear here once visitors sign up via the newsletter card."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub, idx) => {
                  const sourceLabel = sub.source
                    ? sub.source.charAt(0).toUpperCase() + sub.source.slice(1)
                    : "Homepage";
                  const formattedDate = formatSubscriberDate(
                    sub.subscribedAt || sub.createdAt
                  );
                  const isDeleting = deletingId === sub._id;

                  return (
                    <tr
                      key={sub._id || idx}
                      className="hover:bg-[#FAFBF9]/80 transition-colors"
                    >
                      {/* Index */}
                      <td className="py-4 px-5 font-mono text-gray-400 font-medium">
                        {idx + 1}
                      </td>

                      {/* Email Address */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                          <Mail className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                          <span className="font-mono text-xs">{sub.email}</span>
                        </div>
                      </td>

                      {/* Date Subscribed */}
                      <td className="py-4 px-5 text-gray-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Source Badge */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBF0E6] text-[#2D5A27] border border-[#D5E2CC]">
                          {sourceLabel}
                        </span>
                      </td>

                      {/* Action: Delete */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub)}
                          disabled={isDeleting}
                          className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete subscriber"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary bar */}
        {filteredSubscribers.length > 0 && (
          <div className="p-4 bg-[#FAFBF9] border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filteredSubscribers.length} of {subscribers.length}{" "}
              subscribers
            </span>
            <span className="text-[11px] text-gray-400">
              Synchronized with MongoDB Subscriber collection
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
