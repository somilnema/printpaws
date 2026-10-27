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
import { listPublicLandingProducts, productIsPurchasable } from "@/lib/landing-products";
import { PORTRAITS, portraitBySlug, startingPrice } from "@/lib/portraits";
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
  const [media, { catalog }, announcements, landingProducts] = await Promise.all([
    loadSiteMedia(),
    loadPriceCatalog(),
    liveAnnouncements(),
    listPublicLandingProducts(),
  ]);
  const resolve = (key: string) => resolveMediaUrl(key, media);

  const source = landingProducts ?? PORTRAITS.map((portrait) => ({
    slug: portrait.slug,
    name: portrait.name,
    description: portrait.description,
    imageUrl: "",
    active: true,
    kind: "portrait" as const,
    pets: portrait.pets,
    price: null,
    forSale: Boolean(portrait.pets),
    id: portrait.slug,
    sortOrder: 0,
  }));

  const cards: PortraitCard[] = source.map((product) => {
    const known = portraitBySlug(product.slug);
    const image =
      product.imageUrl ||
      (known ? media[known.imageSlot] : "") ||
      (known?.fallbackImage ? resolve(known.fallbackImage) : "");
    const sellable = productIsPurchasable(product);
    const price = !sellable
      ? null
      : product.kind === "fixed" && product.price
        ? formatRupee(product.price)
        : product.pets
          ? formatRupee(startingPrice(catalog, product.pets))
          : null;
    return { slug: product.slug, name: product.name, description: product.description, image, price };
  });
  const clips = VIDEO_SECTION.clips.map(({ video, caption }) => ({ src: resolve(video), caption }));

  return (
    <SiteMediaProvider overrides={media}>
      <div className="flex min-h-screen flex-col bg-cream text-cocoa">
        <AnnouncementBar messages={announcements} colorClass="bg-terracotta" />
        <Navbar homeHref="/landing" />
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
