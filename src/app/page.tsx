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
import SplitText from "@/components/SplitText";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8 md:pt-12">
          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-[13px] text-gray-500 font-inter mb-8">
            <span>Home</span>
            <span className="text-gray-400 font-bold text-[10px]">&gt;</span>
            <span>Custom Pet Portrait</span>
          </div>
          
          {/* Mobile Only Hero Title */}
          <div className="lg:hidden mb-4 space-y-3 text-center pt-2">
             <SplitText
               text="Turn Your Pet Into a Memory That Lasts Forever"
               className="text-3xl md:text-4xl font-normal text-[#1a1a1b] leading-tight font-playfair tracking-tight"
               delay={30}
               duration={1.5}
               ease="power4.out"
               textAlign="center"
               tag="h1"
             />
             <p className="text-[13px] md:text-base text-gray-500 px-2 leading-relaxed font-inter">
               Free shipping across India
             </p>
             <div className="flex items-center justify-center gap-2 mt-1">
               {/* Trustpilot stars */}
               <div className="flex items-center gap-[2px]">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className="bg-[#00b67a] w-[22px] h-[22px] flex items-center justify-center">
                     <Star size={13} className="fill-white text-white" />
                   </div>
                 ))}
                 <div className="bg-[#00b67a] w-[22px] h-[22px] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#DCDCDC]"></div>
                   <Star size={13} className="fill-white text-white relative z-10" />
                 </div>
               </div>
               <div className="flex items-center gap-1 ml-1">
                 <Star size={18} className="fill-[#00b67a] text-[#00b67a]" />
                 <span className="font-bold text-[#1a1a1b] text-[15px] tracking-tight">Trustpilot</span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-20 pb-8 lg:pb-20 relative">
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
