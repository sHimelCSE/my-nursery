import mongoose from "mongoose";
import { DEFAULT_PAGE_THEME_CONFIG } from "@/constants/defaultPageThemeConfig";
import SiteSetting from "@/models/SiteSetting";

const StatItemSchema = new mongoose.Schema(
  {
    value: { type: String, default: "" },
    label: { type: String, default: "" },
    sublabel: { type: String, default: "" },
  },
  { _id: false }
);

const CardItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const StepItemSchema = new mongoose.Schema(
  {
    step: { type: String, default: "" },
    title: { type: String, default: "" },
    desc: { type: String, default: "" },
  },
  { _id: false }
);

const PageThemeConfigSchema = new mongoose.Schema(
  {
    aboutPage: {
      hero: {
        isEnabled: { type: Boolean, default: true },
        badge: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.hero.badge },
        title: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.hero.title },
        subtitle: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.hero.subtitle },
        stats: { type: [StatItemSchema], default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.hero.stats },
      },
      philosophy: {
        isEnabled: { type: Boolean, default: true },
        badge: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.philosophy.badge },
        title: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.philosophy.title },
        contentHtml: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.philosophy.contentHtml },
        promiseQuote: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.philosophy.promiseQuote },
        promiseAuthor: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.philosophy.promiseAuthor },
        promiseLocation: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.philosophy.promiseLocation },
      },
      ecosystem: {
        isEnabled: { type: Boolean, default: true },
        badge: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.ecosystem.badge },
        title: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.ecosystem.title },
        subtitle: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.ecosystem.subtitle },
        cards: { type: [CardItemSchema], default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.ecosystem.cards },
      },
      standards: {
        isEnabled: { type: Boolean, default: true },
        badge: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.standards.badge },
        title: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.standards.title },
        cards: { type: [CardItemSchema], default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.standards.cards },
      },
      ctaBanner: {
        isEnabled: { type: Boolean, default: true },
        title: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.ctaBanner.title },
        subtitle: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.ctaBanner.subtitle },
        buttonText: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.ctaBanner.buttonText },
        buttonUrl: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.ctaBanner.buttonUrl },
        secondaryButtonText: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.ctaBanner.secondaryButtonText },
        secondaryButtonUrl: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.aboutPage.ctaBanner.secondaryButtonUrl },
      },
    },
    contactPage: {
      badge: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.contactPage.badge },
      title: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.contactPage.title },
      subtitle: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.contactPage.subtitle },
      doctorCard: {
        isEnabled: { type: Boolean, default: true },
        title: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.contactPage.doctorCard.title },
        description: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.contactPage.doctorCard.description },
        buttonText: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.contactPage.doctorCard.buttonText },
      },
    },
    policyPages: {
      privacy: {
        badge: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.privacy.badge },
        title: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.privacy.title },
        lastUpdated: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.privacy.lastUpdated },
        contentHtml: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.privacy.contentHtml },
      },
      terms: {
        badge: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.terms.badge },
        title: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.terms.title },
        lastUpdated: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.terms.lastUpdated },
        contentHtml: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.terms.contentHtml },
        dhakaTimeline: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.terms.dhakaTimeline },
        outsideTimeline: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.terms.outsideTimeline },
      },
      refund: {
        badge: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.refund.badge },
        title: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.refund.title },
        lastUpdated: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.refund.lastUpdated },
        guaranteeTitle: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.refund.guaranteeTitle },
        guaranteeText: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.refund.guaranteeText },
        contentHtml: { type: String, default: DEFAULT_PAGE_THEME_CONFIG.policyPages.refund.contentHtml },
        steps: { type: [StepItemSchema], default: DEFAULT_PAGE_THEME_CONFIG.policyPages.refund.steps },
      },
    },
  },
  { timestamps: true }
);

PageThemeConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    // Attempt migration from existing SiteSetting if present
    let initialConfig = JSON.parse(JSON.stringify(DEFAULT_PAGE_THEME_CONFIG));
    try {
      const siteSetting = await SiteSetting.findOne();
      if (siteSetting && siteSetting.pagesContent) {
        const pc = siteSetting.pagesContent;
        if (pc.aboutUs) {
          if (pc.aboutUs.title) initialConfig.aboutPage.hero.title = pc.aboutUs.title;
          if (pc.aboutUs.subtitle) initialConfig.aboutPage.hero.subtitle = pc.aboutUs.subtitle;
          if (pc.aboutUs.badge) {
            initialConfig.aboutPage.hero.badge = pc.aboutUs.badge;
            initialConfig.aboutPage.philosophy.badge = pc.aboutUs.badge;
          }
          if (pc.aboutUs.contentHtml) initialConfig.aboutPage.philosophy.contentHtml = pc.aboutUs.contentHtml;
          if (pc.aboutUs.missionText) initialConfig.aboutPage.philosophy.promiseQuote = pc.aboutUs.missionText;
        }
        if (pc.contactPage) {
          if (pc.contactPage.title) initialConfig.contactPage.title = pc.contactPage.title;
          if (pc.contactPage.subtitle) initialConfig.contactPage.subtitle = pc.contactPage.subtitle;
        }
        if (pc.privacyPolicy) {
          if (pc.privacyPolicy.title) initialConfig.policyPages.privacy.title = pc.privacyPolicy.title;
          if (pc.privacyPolicy.badge) initialConfig.policyPages.privacy.badge = pc.privacyPolicy.badge;
          if (pc.privacyPolicy.lastUpdated) initialConfig.policyPages.privacy.lastUpdated = pc.privacyPolicy.lastUpdated;
          if (pc.privacyPolicy.contentHtml) initialConfig.policyPages.privacy.contentHtml = pc.privacyPolicy.contentHtml;
        }
        if (pc.termsOfService) {
          if (pc.termsOfService.title) initialConfig.policyPages.terms.title = pc.termsOfService.title;
          if (pc.termsOfService.badge) initialConfig.policyPages.terms.badge = pc.termsOfService.badge;
          if (pc.termsOfService.lastUpdated) initialConfig.policyPages.terms.lastUpdated = pc.termsOfService.lastUpdated;
          if (pc.termsOfService.contentHtml) initialConfig.policyPages.terms.contentHtml = pc.termsOfService.contentHtml;
        }
        if (pc.refundPolicy) {
          if (pc.refundPolicy.title) initialConfig.policyPages.refund.title = pc.refundPolicy.title;
          if (pc.refundPolicy.badge) initialConfig.policyPages.refund.badge = pc.refundPolicy.badge;
          if (pc.refundPolicy.lastUpdated) initialConfig.policyPages.refund.lastUpdated = pc.refundPolicy.lastUpdated;
          if (pc.refundPolicy.contentHtml) initialConfig.policyPages.refund.contentHtml = pc.refundPolicy.contentHtml;
        }
      }
    } catch (migErr) {
      console.warn("Migration from siteSetting to pageThemeConfig skipped:", migErr.message);
    }

    config = await this.create(initialConfig);
  }
  return config;
};

const PageThemeConfig =
  mongoose.models.PageThemeConfig ||
  mongoose.model("PageThemeConfig", PageThemeConfigSchema);

export default PageThemeConfig;
export { DEFAULT_PAGE_THEME_CONFIG };
