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
import { SELLABLE_PORTRAITS, portraitBySlug } from "@/lib/portraits";
import { loadSiteMedia } from "@/lib/site-media";

type PortraitPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SELLABLE_PORTRAITS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PortraitPageProps): Promise<Metadata> {
  const portrait = portraitBySlug((await params).slug);
  if (!portrait) return {};
  return { title: `${portrait.name} | Peternity`, description: portrait.description };
}

/** The shop's existing product page, opened on one portrait's pet choice. */
export default async function PortraitPage({ params }: PortraitPageProps) {
  const portrait = portraitBySlug((await params).slug);
  if (!portrait?.pets) notFound();
  const media = await loadSiteMedia();

  return (
    <SiteMediaProvider overrides={media}>
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8 md:pt-12">
          <div className="hidden lg:flex items-center gap-2 text-[13px] text-gray-500 font-inter mb-8">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span className="text-gray-400 font-bold text-[10px]">&gt;</span>
            <span>{portrait.name}</span>
          </div>

          <div className="lg:hidden mb-4 text-center">
            <h1 className="text-3xl font-normal text-[#1a1a1b] leading-tight font-playfair tracking-tight px-4">
              {portrait.name}
            </h1>
            <p className="text-[13px] text-gray-500 px-2 leading-relaxed font-inter mt-1">
              Free shipping across India
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-20 pb-8 lg:pb-20 relative">
            <div className="relative h-full">
              <div className="lg:sticky lg:top-24 z-10 w-full self-start">
                <ProductGallery />
              </div>
            </div>
            <ProductInfo title={portrait.name} presetPets={portrait.pets} />
          </div>

          <UnboxingCarousel />
          <ScrollingTicker />
          <HowItWorks />
          <FeatureSections />
          <IllustratedCarousel />
          <Comparison />
          <FAQ />
          <Reviews />
          <InstagramFeed />
          <TrustFeatures />
        </div>
      </main>

      <WhatsAppButton />
      <Footer />
      <ViewContentPixel id={portrait.slug} name={portrait.name} />
    </div>
    </SiteMediaProvider>
  );
}
