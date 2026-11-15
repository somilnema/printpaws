import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import { HowItWorks } from "@/components/HowItWorks";
import { FeatureSections } from "@/components/FeatureSections";
import { Reviews } from "@/components/Reviews";
import { UnboxingCarousel } from "../components/UnboxingCarousel";
import { Comparison } from "@/components/Comparison";
import { FAQ } from "@/components/FAQ";
import { IllustratedCarousel } from "@/components/IllustratedCarousel";
import { InstagramFeed } from "@/components/InstagramFeed";
import { TrustFeatures } from "@/components/TrustFeatures";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollingTicker } from "@/components/ScrollingTicker";
import { Footer } from "@/components/Footer";
import { RotatingHeadline } from "@/components/RotatingHeadline";
import { SiteMediaProvider } from "@/components/SiteMedia";
import { Star } from "lucide-react";
import { loadLandingContent } from "@/lib/site-content";
import { loadSiteMedia } from "@/lib/site-media";
import { loadShopCatalog } from "@/lib/store-config";

/** Trustpilot-style boxes: full, half (grey right half) and empty stars for a 0–5 rating in halves. */
function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = Math.max(0, 5 - full - (half ? 1 : 0));
  return (
    <div className="flex items-center gap-[2px]">
      {[...Array(full)].map((_, i) => (
        <div key={`full-${i}`} className="bg-[#00b67a] w-[22px] h-[22px] flex items-center justify-center">
          <Star size={13} className="fill-white text-white" />
        </div>
      ))}
      {half ? (
        <div className="bg-[#00b67a] w-[22px] h-[22px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#DCDCDC]"></div>
          <Star size={13} className="fill-white text-white relative z-10" />
        </div>
      ) : null}
      {[...Array(empty)].map((_, i) => (
        <div key={`empty-${i}`} className="bg-[#DCDCDC] w-[22px] h-[22px] flex items-center justify-center">
          <Star size={13} className="fill-white text-white" />
        </div>
      ))}
    </div>
  );
}

export default async function Page() {
  const [media, catalog, copy] = await Promise.all([loadSiteMedia(), loadShopCatalog(), loadLandingContent()]);
  // Admin → Landing & home → Page text → Home page.
  const home = copy.home;

  return (
    <SiteMediaProvider overrides={media}>
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar rotation={copy.homeAnnouncements} />
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8 md:pt-12">
          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-[13px] text-gray-500 font-inter mb-8">
            <span>{home.breadcrumbHome}</span>
            <span className="text-gray-400 font-bold text-[10px]">&gt;</span>
            <span>{home.breadcrumbProduct}</span>
          </div>
          
          {/* Mobile Only Hero Title - Dynamic Letter-by-Letter Transition */}
          <div className="lg:hidden mb-4 text-center pt-2">
            <RotatingHeadline />
             {home.subtitle ? (
               <p className="text-[13px] md:text-base text-gray-500 px-2 leading-relaxed font-inter">
                 {home.subtitle}
               </p>
             ) : null}
             {home.showRating ? (
               <div className="flex items-center justify-center gap-2 mt-1">
                 <RatingStars rating={home.rating} />
                 {home.ratingLabel ? (
                   <div className="flex items-center gap-1 ml-1">
                     <Star size={18} className="fill-[#00b67a] text-[#00b67a]" />
                     <span className="font-bold text-[#1a1a1b] text-[15px] tracking-tight">{home.ratingLabel}</span>
                   </div>
                 ) : null}
               </div>
             ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-20 pb-8 lg:pb-20 relative">
            <div className="relative h-full">
              <div className="lg:sticky lg:top-24 z-10 w-full self-start">
                <ProductGallery />
              </div>
            </div>
            <ProductInfo initialCatalog={catalog} />
          </div>

          <UnboxingCarousel />
          <ScrollingTicker />
          
          {/* Social Proof / Process */}
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
    </div>
    </SiteMediaProvider>
  );
}
