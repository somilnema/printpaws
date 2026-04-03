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
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8 md:pt-12">
          {/* Mobile Only Hero Title */}
          <div className="lg:hidden mb-6 space-y-3 text-center">
             <div className="flex items-center justify-center gap-1">
               {[...Array(5)].map((_, i) => (
                 <Star key={i} size={14} className="fill-[#FFB800] text-[#FFB800]" />
               ))}
               <span className="text-sm font-medium text-gray-400 ml-2">542 Reviews</span>
             </div>
             <h1 className="text-3xl font-extrabold text-[#1a1a1b] leading-tight tracking-tight uppercase italic">
               Custom Pet Portrait
             </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 pb-20 relative">
            <div className="relative h-full">
              <div className="lg:sticky lg:top-24 z-10 w-full self-start">
                <ProductGallery />
              </div>
            </div>
            <ProductInfo />
          </div>

          <UnboxingCarousel />
          
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
  );
}
