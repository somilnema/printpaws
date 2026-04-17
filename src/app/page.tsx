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
import { Star } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8 md:pt-12">
          {/* Mobile Only Hero Title */}
          <div className="lg:hidden mb-4 space-y-4 text-center pt-2">
             <h1 className="text-[24px] md:text-3xl font-extrabold text-[#3a4443] leading-snug tracking-tight">
               Your Pet's Moment to Shine
             </h1>
             <p className="text-[12px] md:text-lg text-[#6b7b7a] px-2 leading-relaxed">
               Free Shipping Across Australia & New<br/>Zealand
             </p>
             <div className="flex items-center justify-center gap-2 mt-1">
               {/* Trustpilot stars */}
               <div className="flex items-center gap-[2px]">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className="bg-[#b3a394] w-[22px] h-[22px] flex items-center justify-center">
                     <Star size={13} className="fill-white text-white" />
                   </div>
                 ))}
                 <div className="bg-[#b3a394] w-[22px] h-[22px] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#e0d8d2]"></div>
                   <Star size={13} className="fill-white text-white relative z-10" />
                 </div>
               </div>
               <div className="flex items-center gap-1 ml-1">
                 <Star size={18} className="fill-[#b3a394] text-[#b3a394]" />
                 <span className="font-bold text-[#1a1a1b] text-[15px] tracking-tight">Trustpilot</span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 pb-8 lg:pb-20 relative">
            <div className="relative h-full">
              <div className="lg:sticky lg:top-24 z-10 w-full self-start">
                <ProductGallery />
              </div>
            </div>
            <ProductInfo />
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
  );
}
