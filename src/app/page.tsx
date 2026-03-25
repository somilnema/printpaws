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
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8 md:pt-12">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start pb-20">
            <ProductGallery />
            <ProductInfo />
          </div>

          <UnboxingCarousel />
          
          {/* Social Proof / Process */}
          <HowItWorks />
          <FeatureSections />
          <Comparison />
          <FAQ />
          <Reviews />
        </div>
      </main>

      <Footer />
    </div>
  );
}
