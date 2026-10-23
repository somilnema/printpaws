import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Footer } from "@/components/Footer";
import { SiteMediaProvider } from "@/components/SiteMedia";
import { CartBridge } from "@/components/landing/CartBridge";
import { LandingHero } from "@/components/landing/LandingHero";
import { PortraitGrid, type PortraitCard } from "@/components/landing/PortraitGrid";
import { VideoCarousel } from "@/components/landing/VideoCarousel";
import { ReviewCarousel } from "@/components/landing/ReviewCarousel";
import { FinalCta } from "@/components/landing/FinalCta";
import { ANNOUNCEMENTS, FINAL_CTA, VIDEO_SECTION } from "@/lib/landing-content";
import { PORTRAITS, startingPrice } from "@/lib/portraits";
import { formatRupee } from "@/lib/pricing";
import { loadSiteMedia } from "@/lib/site-media";
import { resolveMediaUrl } from "@/lib/site-media-catalog";
import { loadPriceCatalog, resolveCoupon } from "@/lib/store-config";

// Prices and coupons come from the admin, so refresh at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Custom Pet Portraits | Peternity",
  description: "Turn your favourite pet photo into a personalized portrait made just for you.",
  // Preview for approval. Moves to the home page at launch.
  robots: { index: false, follow: false },
};

/** Drops any message whose coupon is not live right now. */
async function liveAnnouncements() {
  const checked = await Promise.all(
    ANNOUNCEMENTS.map(async ({ text, couponCode }) => {
      if (!couponCode) return text;
      const coupon = await resolveCoupon(couponCode, { orderAmount: Number.MAX_SAFE_INTEGER }).catch(() => null);
      return coupon?.ok && coupon.rule ? text : "";
    })
  );
  return checked.filter(Boolean);
}

export default async function LandingPage() {
  const [media, { catalog }, announcements] = await Promise.all([loadSiteMedia(), loadPriceCatalog(), liveAnnouncements()]);
  const resolve = (key: string) => resolveMediaUrl(key, media);

  const cards: PortraitCard[] = PORTRAITS.map((portrait) => ({
    slug: portrait.slug,
    name: portrait.name,
    description: portrait.description,
    image: media[portrait.imageSlot] || (portrait.fallbackImage ? resolve(portrait.fallbackImage) : ""),
    price: portrait.pets ? formatRupee(startingPrice(catalog, portrait.pets)) : null,
  }));
  const clips = VIDEO_SECTION.clips.map(({ video, caption }) => ({ src: resolve(video), caption }));

  return (
    <SiteMediaProvider overrides={media}>
      <div className="flex min-h-screen flex-col bg-cream text-cocoa">
        <AnnouncementBar messages={announcements} colorClass="bg-terracotta" />
        <Navbar />
        <CartBridge />

        <main className="flex-1">
          <LandingHero
            photo={media["landing-hero"] || ""}
            video={media["landing-hero-video"] || ""}
            fallbackPhoto={resolve("/Not just a image its them.png")}
          />
          <PortraitGrid cards={cards} />
          <VideoCarousel clips={clips} />
          <ReviewCarousel />
          <FinalCta image={media["landing-final"] || resolve(FINAL_CTA.fallbackImage)} />
        </main>

        <WhatsAppButton />
        <Footer />
      </div>
    </SiteMediaProvider>
  );
}
