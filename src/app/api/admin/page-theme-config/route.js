import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import dbConnect from "@/lib/dbConnect";
import PageThemeConfig from "@/models/PageThemeConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/page-theme-config
export async function GET(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const config = await PageThemeConfig.getConfig();

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("GET /api/admin/page-theme-config error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch page theme config", error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/page-theme-config
export async function PUT(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();

    let config = await PageThemeConfig.getConfig();

    if (body.aboutPage) {
      config.aboutPage = {
        ...config.aboutPage?.toObject?.() || {},
        ...body.aboutPage,
        hero: {
          ...(config.aboutPage?.hero?.toObject?.() || {}),
          ...(body.aboutPage.hero || {}),
          stats: Array.isArray(body.aboutPage?.hero?.stats)
            ? body.aboutPage.hero.stats
            : config.aboutPage?.hero?.stats || [],
        },
        philosophy: {
          ...(config.aboutPage?.philosophy?.toObject?.() || {}),
          ...(body.aboutPage.philosophy || {}),
        },
        ecosystem: {
          ...(config.aboutPage?.ecosystem?.toObject?.() || {}),
          ...(body.aboutPage.ecosystem || {}),
          cards: Array.isArray(body.aboutPage?.ecosystem?.cards)
            ? body.aboutPage.ecosystem.cards
            : config.aboutPage?.ecosystem?.cards || [],
        },
        standards: {
          ...(config.aboutPage?.standards?.toObject?.() || {}),
          ...(body.aboutPage.standards || {}),
          cards: Array.isArray(body.aboutPage?.standards?.cards)
            ? body.aboutPage.standards.cards
            : config.aboutPage?.standards?.cards || [],
        },
        ctaBanner: {
          ...(config.aboutPage?.ctaBanner?.toObject?.() || {}),
          ...(body.aboutPage.ctaBanner || {}),
        },
      };
    }

    if (body.contactPage) {
      config.contactPage = {
        ...(config.contactPage?.toObject?.() || {}),
        ...body.contactPage,
        doctorCard: {
          ...(config.contactPage?.doctorCard?.toObject?.() || {}),
          ...(body.contactPage.doctorCard || {}),
        },
      };
    }

    if (body.policyPages) {
      config.policyPages = {
        ...(config.policyPages?.toObject?.() || {}),
        ...body.policyPages,
        privacy: {
          ...(config.policyPages?.privacy?.toObject?.() || {}),
          ...(body.policyPages.privacy || {}),
        },
        terms: {
          ...(config.policyPages?.terms?.toObject?.() || {}),
          ...(body.policyPages.terms || {}),
        },
        refund: {
          ...(config.policyPages?.refund?.toObject?.() || {}),
          ...(body.policyPages.refund || {}),
          steps: Array.isArray(body.policyPages?.refund?.steps)
            ? body.policyPages.refund.steps
            : config.policyPages?.refund?.steps || [],
        },
      };
    }

    if (body.productPage) {
      config.productPage = {
        ...(config.productPage?.toObject?.() || {}),
        ...body.productPage,
        featureCards: {
          ...(config.productPage?.featureCards?.toObject?.() || {}),
          ...(body.productPage.featureCards || {}),
          card1: {
            ...(config.productPage?.featureCards?.card1?.toObject?.() || {}),
            ...(body.productPage.featureCards?.card1 || {}),
          },
          card2: {
            ...(config.productPage?.featureCards?.card2?.toObject?.() || {}),
            ...(body.productPage.featureCards?.card2 || {}),
          },
        },
        trustBadges: {
          ...(config.productPage?.trustBadges?.toObject?.() || {}),
          ...(body.productPage.trustBadges || {}),
          badge1: {
            ...(config.productPage?.trustBadges?.badge1?.toObject?.() || {}),
            ...(body.productPage.trustBadges?.badge1 || {}),
          },
          badge2: {
            ...(config.productPage?.trustBadges?.badge2?.toObject?.() || {}),
            ...(body.productPage.trustBadges?.badge2 || {}),
          },
          badge3: {
            ...(config.productPage?.trustBadges?.badge3?.toObject?.() || {}),
            ...(body.productPage.trustBadges?.badge3 || {}),
          },
        },
        paymentBadges: {
          ...(config.productPage?.paymentBadges?.toObject?.() || {}),
          ...(body.productPage.paymentBadges || {}),
          methods: Array.isArray(body.productPage.paymentBadges?.methods)
            ? body.productPage.paymentBadges.methods
            : config.productPage?.paymentBadges?.methods || [],
        },
        relatedSection: {
          ...(config.productPage?.relatedSection?.toObject?.() || {}),
          ...(body.productPage.relatedSection || {}),
        },
      };
    }

    await config.save();

    return NextResponse.json({
      success: true,
      message: "Page theme configuration updated successfully!",
      data: config,
    });
  } catch (error) {
    console.error("PUT /api/admin/page-theme-config error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update page theme config", error: error.message },
      { status: 500 }
    );
  }
}
