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
import { configuratorForSlug, newProductLaunched, sizeHiddenForPets, type ConfiguratorProduct, type EverydayContent } from "@/lib/everyday-content";
import {
  DEFAULT_LANDING_CONTENT,
  FINAL_CTA_FALLBACK_IMAGE,
  HERO_FALLBACK_IMAGE,
  fillPrice,
  seoMetadata,
  slotUrl,
  type LandingAnnouncement,
} from "@/lib/landing-content";
import { launchProductForSlug, listPublicLandingProducts, productIsPurchasable } from "@/lib/landing-products";
import { PORTRAITS, cardPhoto, productStartingPrice, startingPrice, type PetPreset } from "@/lib/portraits";
import { formatRupee, type PortraitStyle } from "@/lib/pricing";
import { loadLandingContent, loadProductContent } from "@/lib/site-content";
import { loadSiteMedia } from "@/lib/site-media";
import { resolveMediaUrl } from "@/lib/site-media-catalog";
import { loadPriceCatalog, resolveCoupon } from "@/lib/store-config";

// Prices, coupons and copy come from the admin, so refresh at most once a minute.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await loadLandingContent();
  return {
    ...seoMetadata(seo, DEFAULT_LANDING_CONTENT.seo),
    // Preview for approval. Moves to the home page at launch.
    robots: { index: false, follow: false },
  };
}

/** Drops any message whose coupon is not live right now. */
async function liveAnnouncements(messages: LandingAnnouncement[]) {
  const checked = await Promise.all(
    messages.map(async ({ text, couponCode }) => {
      if (!couponCode) return text;
      const coupon = await resolveCoupon(couponCode, { orderAmount: Number.MAX_SAFE_INTEGER }).catch(() => null);
      return coupon?.ok && coupon.rule ? text : "";
    })
  );
  return checked.filter(Boolean);
}

export default async function LandingPage() {
  const content = loadLandingContent();
  const [media, { catalog }, copy, announcements, landingProducts, multiPet, youPet, miniDesk, giftBundle] = await Promise.all([
    loadSiteMedia(),
    loadPriceCatalog(),
    content,
    content.then((loaded) => liveAnnouncements(loaded.announcements)),
    listPublicLandingProducts(),
    loadProductContent("multi_pet"),
    loadProductContent("you_and_your_pet"),
    loadProductContent("mini_desk"),
    loadProductContent("gift_bundle"),
  ]);
  const resolve = (key: string) => resolveMediaUrl(key, media);

  // Multi-Pet keeps some sizes off sale per pet count, You & Your Pet per composition: "From" skips them.
  const sizeRules: Partial<Record<ConfiguratorProduct, EverydayContent>> = {
    multi_pet: multiPet,
    you_and_your_pet: youPet,
    mini_desk: miniDesk,
    gift_bundle: giftBundle,
  };
  const hiddenSizes = (slug: string, pets: PetPreset) => {
    const product = configuratorForSlug(slug);
    const rules = product && product !== "mini_desk" && product !== "gift_bundle" ? sizeRules[product] : undefined;
    if (!rules) return undefined;
    // The card opens Multi-Pet on its pet count and You & Your Pet on Me & My Pet.
    const rule = pets === "human" ? "solo" : pets;
    return (style: PortraitStyle, size: string) => sizeHiddenForPets(rules, rule, style, size);
  };

  // Desk Portrait / Gift Bundle sell once Launch is on in Admin → Configurator (or their Landing & home → Products row is launched).
  const launchedByContent = (slug: string) => {
    const product = launchProductForSlug(slug);
    return product ? newProductLaunched(sizeRules[product]) : false;
  };
  const source = landingProducts ?? PORTRAITS.map((portrait) => {
    const gated = Boolean(launchProductForSlug(portrait.slug)) && !launchedByContent(portrait.slug);
    return {
      slug: portrait.slug,
      name: portrait.name,
      description: portrait.description,
      imageUrl: "",
      active: true,
      kind: gated ? ("fixed" as const) : ("portrait" as const),
      pets: gated ? null : portrait.pets,
      price: null,
      forSale: gated ? false : Boolean(portrait.pets),
      id: portrait.slug,
      sortOrder: 0,
    };
  });

  /** Desk Portrait / Gift Bundle "From" price: their own Pricing panels (and admin hides), never the row's price. */
  const launchPrice = (slug: string) => {
    const product = launchProductForSlug(slug);
    if (!product) return null;
    const value = productStartingPrice(slug, catalog, sizeRules[product]);
    return value != null && value > 0 ? formatRupee(value) : null;
  };

  const cards: PortraitCard[] = source.map((product) => {
    const sellable = productIsPurchasable(product) || (product.active && launchedByContent(product.slug));
    const price = !sellable
      ? null
      : launchProductForSlug(product.slug)
        ? launchPrice(product.slug)
        : product.kind === "fixed" && product.price
        ? formatRupee(product.price)
        : product.pets
          ? formatRupee(startingPrice(catalog, product.pets, hiddenSizes(product.slug, product.pets)))
          : null;
    return {
      slug: product.slug,
      name: product.name,
      description: product.description,
      image: cardPhoto(product.slug, product.imageUrl, media).url,
      price: price && (fillPrice(copy.portraits.fromLabel, price) || price),
    };
  });
  const clips = copy.video.show
    ? copy.clips.map(({ slot, caption }) => ({ src: slotUrl(slot, media), caption })).filter((clip) => clip.src)
    : [];
  const reviews = copy.reviews.show
    ? copy.reviewItems.map(({ photo, ...review }) => ({ ...review, image: slotUrl(photo, media) }))
    : [];

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
            fallbackPhoto={resolve(HERO_FALLBACK_IMAGE)}
            copy={copy.hero}
            benefits={copy.benefits}
          />
          <PortraitGrid cards={cards} copy={copy.portraits} />
          <VideoCarousel clips={clips} copy={copy.video} />
          <ReviewCarousel reviews={reviews} copy={copy.reviews} />
          {copy.finalCta.show ? (
            <FinalCta image={media["landing-final"] || resolve(FINAL_CTA_FALLBACK_IMAGE)} copy={copy.finalCta} />
          ) : null}
        </main>

        <WhatsAppButton />
        <Footer />
      </div>
    </SiteMediaProvider>
  );
}
