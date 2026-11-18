import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import { HowItWorks } from "@/components/HowItWorks";
import { FeatureSections } from "@/components/FeatureSections";
import { Reviews } from "@/components/Reviews";
import { UnboxingCarousel } from "@/components/UnboxingCarousel";
import { Comparison } from "@/components/Comparison";
import { FAQ } from "@/components/FAQ";
import { IllustratedCarousel } from "@/components/IllustratedCarousel";
import { InstagramFeed } from "@/components/InstagramFeed";
import { TrustFeatures } from "@/components/TrustFeatures";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollingTicker } from "@/components/ScrollingTicker";
import { Footer } from "@/components/Footer";
import { SiteMediaProvider } from "@/components/SiteMedia";
import { ViewContentPixel } from "@/components/ViewContentPixel";
import { OfferCheckout } from "@/components/landing/OfferCheckout";
import { configuratorLaunched, getLandingProduct, launchProductForSlug, productIsPurchasable } from "@/lib/landing-products";
import { calculateQuote, formatRupee } from "@/lib/pricing";
import { SELLABLE_PORTRAITS, portraitBySlug } from "@/lib/portraits";
import { loadSiteMedia } from "@/lib/site-media";
import { loadLandingContent, loadProductContent } from "@/lib/site-content";
import { CONFIGURATOR_MEDIA, configuratorForSlug } from "@/lib/everyday-content";
import { loadPriceCatalog, loadShopCatalog } from "@/lib/store-config";
import { getAdminSession } from "@/lib/admin-auth";

type PortraitPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  // Desk Portrait / Gift Bundle stay "Coming soon" until launched in Admin → Landing & home → Products: rendered on request.
  return SELLABLE_PORTRAITS.filter(({ slug }) => !launchProductForSlug(slug)).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PortraitPageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const stored = await getLandingProduct(slug);
  const portrait = stored || portraitBySlug(slug);
  if (!portrait) return {};
  return { title: `${portrait.name} | Peternity`, description: portrait.description };
}

/** The shop's existing product page, opened on one portrait's pet choice. */
export default async function PortraitPage({ params }: PortraitPageProps) {
  const slug = (await params).slug;
  const stored = await getLandingProduct(slug);
  // Desk Portrait / Signature Gift Bundle open their configurator only once the admin launches the stored row (a row
  // seeded as 'fixed' counts once marked for sale). Never sold as a fixed-price offer; no row or not launched → 404.
  const launch = launchProductForSlug(slug);
  // A signed-in admin can preview an unlaunched Desk Portrait / Gift Bundle page; customers still get 404.
  const unlaunched = Boolean(launch && (!stored || !configuratorLaunched(stored)));
  const adminPreview = unlaunched ? Boolean(await getAdminSession()) : false;
  if (unlaunched && !adminPreview) notFound();
  if (stored?.kind === "fixed" && !launch) {
    if (!productIsPurchasable(stored) || stored.price == null) notFound();
    const [{ catalog }, landing] = await Promise.all([loadPriceCatalog(), loadLandingContent()]);
    const base = {
      productType: "landing_offer" as const,
      offerId: stored.id,
      offerAmount: stored.price,
      productLabel: stored.name,
    };
    const prepaid = calculateQuote({ ...base, paymentMethod: "prepaid" }, catalog);
    const cod = calculateQuote({ ...base, paymentMethod: "cod" }, catalog);
    return (
      <div className="flex min-h-screen flex-col bg-cream text-cocoa">
        <AnnouncementBar rotation={landing.homeAnnouncements} />
        <Navbar homeHref="/landing" />
        <main className="flex-1">
          <OfferCheckout
            id={stored.id}
            name={stored.name}
            description={stored.description}
            image={stored.imageUrl}
            priceLabel={formatRupee(stored.price)}
            prepaidLabel={formatRupee(prepaid.payableNow)}
            codNowLabel={formatRupee(cod.payableNow)}
            codLaterLabel={formatRupee(cod.remainingAmount)}
          />
        </main>
        <WhatsAppButton />
        <Footer />
        <ViewContentPixel id={stored.slug} name={stored.name} />
      </div>
    );
  }

  const portrait = launch
    ? { slug, name: stored?.name || portraitBySlug(slug)?.name || slug, pets: "one" as const }
    : stored?.kind === "portrait" && stored.pets
      ? stored
      : portraitBySlug(slug);
  if (!portrait?.pets || (stored && !adminPreview && !productIsPurchasable(stored))) notFound();
  // Everyday, Multi-Pet and You & Your Pet share the three-step configurator, each with its own admin content.
  const configurator = configuratorForSlug(portrait.slug);
  const [media, everydayContent, catalog, landing] = await Promise.all([
    loadSiteMedia(),
    configurator ? loadProductContent(configurator) : Promise.resolve(undefined),
    loadShopCatalog(),
    loadLandingContent(),
  ]);
  const subtitle = everydayContent ? everydayContent.header.pageSubtitle : "Free shipping across India";
  const mediaPrefix = configurator ? CONFIGURATOR_MEDIA[configurator].prefix : undefined;
  // Admin → Configurator → Page sections: which shared sections this product page shows (all of them elsewhere).
  const below = everydayContent?.below;
  const show = (on: boolean | undefined) => on !== false;

  return (
    <SiteMediaProvider overrides={media}>
    <div
      className="min-h-screen flex flex-col bg-white"
      style={everydayContent ? { backgroundColor: everydayContent.header.pageBackground } : undefined}
    >
      {/* The shop-wide rotation (Admin → Landing & home → Home page), as on the home page. */}
      <AnnouncementBar rotation={landing.homeAnnouncements} />
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8 md:pt-12">
          <div className="hidden lg:flex items-center gap-2 text-[13px] text-gray-500 font-inter mb-8">
            <Link href="/" className="hover:text-gray-700">{everydayContent ? everydayContent.header.homeLabel : "Home"}</Link>
            <span className="text-gray-400 font-bold text-[10px]">&gt;</span>
            <span>{portrait.name}</span>
          </div>

          <div className="lg:hidden mb-4 text-center">
            <h1 className="text-3xl font-normal text-[#1a1a1b] leading-tight font-playfair tracking-tight px-4">
              {portrait.name}
            </h1>
            {subtitle ? (
              <p className="text-[13px] text-gray-500 px-2 leading-relaxed font-inter mt-1">{subtitle}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-20 pb-8 lg:pb-20 relative">
            <div className="relative h-full">
              <div className="lg:sticky lg:top-24 z-10 w-full self-start">
                {everydayContent ? (
                  <ProductGallery
                    mediaPrefix={mediaPrefix}
                    photoCount={everydayContent.gallery.photoCount}
                    showVideo={everydayContent.gallery.showVideo}
                  />
                ) : (
                  <ProductGallery />
                )}
              </div>
            </div>
            <ProductInfo
              title={portrait.name}
              presetPets={portrait.pets}
              flow={configurator ?? "standard"}
              everydayContent={everydayContent}
              initialCatalog={catalog}
            />
          </div>

          {show(below?.showUnboxing) ? <UnboxingCarousel /> : null}
          {show(below?.showTicker) ? <ScrollingTicker /> : null}
          {show(below?.showHowItWorks) ? <HowItWorks /> : null}
          {show(below?.showFeatures) ? <FeatureSections /> : null}
          {show(below?.showCarousel) ? <IllustratedCarousel /> : null}
          {show(below?.showComparison) ? <Comparison /> : null}
          {show(below?.showFaq) ? <FAQ /> : null}
          {show(below?.showReviews) ? (
            everydayContent ? <Reviews copy={everydayContent.reviews} mediaPrefix={mediaPrefix} /> : <Reviews />
          ) : null}
          {show(below?.showInstagram) ? <InstagramFeed /> : null}
          {show(below?.showTrustFeatures) ? <TrustFeatures /> : null}
        </div>
      </main>

      <WhatsAppButton />
      <Footer />
      <ViewContentPixel id={portrait.slug} name={portrait.name} />
    </div>
    </SiteMediaProvider>
  );
}
