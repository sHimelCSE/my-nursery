import mongoose, { Schema } from "mongoose";
import { DEFAULT_SITE_SETTINGS } from "@/constants/defaultSiteSettings";

export { DEFAULT_SITE_SETTINGS };


const SiteSettingSchema = new Schema(
  {
    general: {
      siteName: { type: String, default: "" },
      tagline: { type: String, default: "" },
      logoType: {
        type: String,
        enum: ["logo_only", "logo_with_text", "text_only"],
        default: "logo_only",
      },
      logoUrl: { type: String, default: "" },
      contactEmail: { type: String, default: DEFAULT_SITE_SETTINGS.general.contactEmail },
      hotlinePhone: { type: String, default: DEFAULT_SITE_SETTINGS.general.hotlinePhone },
      storeAddress: { type: String, default: DEFAULT_SITE_SETTINGS.general.storeAddress },
      businessHours: { type: String, default: DEFAULT_SITE_SETTINGS.general.businessHours },
    },
    topbar: {
      announcementText: { type: String, default: DEFAULT_SITE_SETTINGS.topbar.announcementText },
      announcementLink: { type: String, default: DEFAULT_SITE_SETTINGS.topbar.announcementLink },
      isEnabled: { type: Boolean, default: DEFAULT_SITE_SETTINGS.topbar.isEnabled },
    },
    whatsapp: {
      whatsappNumber: { type: String, default: DEFAULT_SITE_SETTINGS.whatsapp.whatsappNumber },
      defaultMessage: { type: String, default: DEFAULT_SITE_SETTINGS.whatsapp.defaultMessage },
      isEnabled: { type: Boolean, default: DEFAULT_SITE_SETTINGS.whatsapp.isEnabled },
    },
    socialLinks: {
      facebook: { type: String, default: DEFAULT_SITE_SETTINGS.socialLinks.facebook },
      instagram: { type: String, default: DEFAULT_SITE_SETTINGS.socialLinks.instagram },
      youtube: { type: String, default: DEFAULT_SITE_SETTINGS.socialLinks.youtube },
      twitter: { type: String, default: DEFAULT_SITE_SETTINGS.socialLinks.twitter },
    },
    footer: {
      bioText: { type: String, default: DEFAULT_SITE_SETTINGS.footer.bioText },
      copyrightText: { type: String, default: DEFAULT_SITE_SETTINGS.footer.copyrightText },
      copyrightLinks: [
        {
          label: { type: String, default: "Privacy Policy" },
          url: { type: String, default: "/privacy" },
        },
      ],
    },
    pagesContent: {
      aboutUs: {
        title: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.aboutUs.title },
        subtitle: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.aboutUs.subtitle },
        contentHtml: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.aboutUs.contentHtml },
        storyText: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.aboutUs.storyText },
        missionText: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.aboutUs.missionText },
      },
      privacyPolicy: {
        title: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.privacyPolicy.title },
        lastUpdated: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.privacyPolicy.lastUpdated },
        contentHtml: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.privacyPolicy.contentHtml },
        contentText: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.privacyPolicy.contentText },
      },
      termsOfService: {
        title: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.termsOfService.title },
        lastUpdated: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.termsOfService.lastUpdated },
        contentHtml: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.termsOfService.contentHtml },
        contentText: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.termsOfService.contentText },
      },
      refundPolicy: {
        title: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.refundPolicy.title },
        lastUpdated: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.refundPolicy.lastUpdated },
        contentHtml: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.refundPolicy.contentHtml },
        contentText: { type: String, default: DEFAULT_SITE_SETTINGS.pagesContent.refundPolicy.contentText },
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Singleton Helper: Get or initialize global site settings
 */
SiteSettingSchema.statics.getSettings = async function () {
  let settings = await this.findOne({});
  if (!settings) {
    settings = await this.create(DEFAULT_SITE_SETTINGS);
  }
  return settings;
};

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.SiteSetting;
}

const SiteSetting =
  mongoose.models.SiteSetting ||
  mongoose.model("SiteSetting", SiteSettingSchema);

export default SiteSetting;
