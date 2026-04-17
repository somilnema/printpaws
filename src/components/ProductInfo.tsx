"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Upload,
  Star,
  ChevronDown,
  Check,
  Undo2,
  Truck,
  ShieldCheck,
  PawPrint,
  Heart as HeartIcon,
  ArrowRight,
  ArrowLeft,
  Package
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const SIZES = ['8"x10"', '12"x16"', '18"x24"', '24"x24"'];
const FRAMES = [
  { id: "black", label: "the Black", image: "/frame_black.png" },
  { id: "white", label: "pure White", image: "/frame_white.png" },
  { id: "wood", label: "premium Wood", image: "/frame_wood.png" },
  { id: "metal", label: "thin Métal", image: "/frame_metal.png" },
];
const PET_OPTIONS = [
  { id: "one", label: "One", image: "/pet_select_1.png" },
  { id: "two", label: "Two", image: "/pet_select_2.png" },
  { id: "three", label: "Three", image: "/pet_select_3.png" },
  { id: "four", label: "Four", image: "/pet_select_4.png" },
];


const BACKGROUNDS = [
  { name: "Pearl", value: "#f9f9f7", textColor: "#d1d1cf" },
  { name: "Almond", value: "#f3e4d4", textColor: "#c4a484" },
  { name: "Serenity", value: "#f0e9f9", textColor: "#c4b5d4" },
  { name: "Celadon", value: "#b8cfc1", textColor: "#ffffff" },
  { name: "Tea Rosé", value: "#f3ccc6", textColor: "#ffffff" },
  { name: "marooon", value: "#d9e4f5", textColor: "#a1b8d6" },
  { name: "babypink", value: "#f0e9f9", textColor: "#c4b5d4" },
  { name: "Celadonn", value: "#b8cfc1", textColor: "#ffffff" },
  { name: "Tea Rosée", value: "#f3ccc6", textColor: "#ffffff" },
  { name: "Tea Rose", value: "#f3ccc6", textColor: "#ffffff" }

];

const ADD_ONS = [
  { id: "crown", label: "Royal Crown", image: "/addon_crown.png" },
  { id: "floral", label: "Floral Wreath", image: "/addon_floral.png" },
  { id: "bowtie", label: "Bow Tie", image: "/addon_bowtie.png" },
  { id: "digital", label: "Digital File", image: "/addon_digital.png" },
];

export function ProductInfo() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState('12"x16"');
  const [selectedFrame, setSelectedFrame] = useState("metal");
  const [selectedPets, setSelectedPets] = useState("one");
  const [selectedBg, setSelectedBg] = useState("Pearl");
  const [selectedAddOn, setSelectedAddOn] = useState("crown");
  const [giftWrap, setGiftWrap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [petName, setPetName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculatePrice = () => {
    let price = 699;
    
    // Size Additions
    if (selectedSize === '12"x16"') price += 300;
    if (selectedSize === '18"x24"') price += 600;
    if (selectedSize === '24"x24"') price += 900;
    
    // Pets Additions
    if (selectedPets === 'two') price += 300;
    if (selectedPets === 'three') price += 600;
    if (selectedPets === 'four') price += 900;
    
    // Gift Wrap
    if (giftWrap) price += 99;
    
    return price;
  };

  const totalPrice = calculatePrice();

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setOrderStatus('idle');

    if (!customerEmail) {
      alert("Please enter your email to continue!");
      setCurrentStep(6);
      setIsSubmitting(false);
      return;
    }

    if (!petName) {
      alert("Please enter your pet's name!");
      setCurrentStep(6);
      setIsSubmitting(false);
      return;
    }

    if (!selectedFile) {
      alert("Please choose a pet photo to continue!");
      setCurrentStep(6);
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Upload File to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `orders/${Date.now()}-${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error("Supabase Upload Detailed Error:", uploadError);
        throw new Error(`Upload Failed: ${uploadError.message}. Ensure the 'pet-photos' bucket exists and has 'Public' upload policies.`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(filePath);

      // 2. Submit Order to API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: selectedSize,
          frameStyle: selectedFrame,
          numPets: selectedPets,
          background: selectedBg,
          addon: selectedAddOn,
          petName: petName || "My Pet",
          giftWrap: giftWrap,
          customerEmail: customerEmail,
          totalPrice: totalPrice,
          photoUrl: publicUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOrderStatus('success');
        // Redirect to success page
        router.push(`/checkout/success?orderId=${result.orderId}`);
      } else {
        setOrderStatus('error');
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      setOrderStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="hidden lg:flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="fill-[#FFB800] text-[#FFB800]" />
          ))}
          <span className="text-sm font-medium text-gray-400 ml-2">542 Reviews</span>
        </div>
        <h1 className="hidden lg:block text-2xl font-extrabold text-[#1a1a1b] leading-tight tracking-tight uppercase italic">
          Your Pet's Moment to shine
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-primary italic">Rs. {totalPrice}.00</span>
          <span className="text-lg text-gray-300 line-through">Rs. {totalPrice + 300}.00</span>
          <span className="bg-[#FFF1F1] text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/10">
            SALE
          </span>
        </div>
      </div>

      <hr className="hidden lg:block border-gray-100 my-2" />

      {/* Mobile-Only Trust Section */}
      <div className="lg:hidden space-y-4 mb-6 mt-2">
        {/* Review Card */}
        <div className="bg-[#1a1a1b] text-white p-4 rounded-3xl flex items-center gap-4 shadow-lg mx-1">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
            <Image 
              src="/feature-detail.png" 
              alt="Review attachment" 
              fill 
              className="object-cover" 
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-sm font-bold tracking-tight">Mehran M.</span>
              <div className="flex gap-[2px]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-[#FFB800] text-[#FFB800]" />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 italic">"I love it"</p>
          </div>
        </div>

        {/* Font Info Text */}
        <div className="flex items-start gap-3 px-2">
          <Package size={18} className="text-[#A87B62] opacity-70 mt-0.5" />
          <p className="text-[12px] text-gray-500 font-medium leading-tight">
            Choose from <span className="text-[#A87B62] font-bold">20+ unique font options</span>, selected once your artwork is approved.
          </p>
        </div>
      </div>

      {/* Step Navigator */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Step {currentStep} of 6
          </span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            {Math.round((currentStep / 6) * 100)}% Complete
          </span>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 6) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
      </div>

      {/* Selectors with Transitions */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider uppercase">
                    Step 1: Number of Pets
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PET_OPTIONS.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => {
                        setSelectedPets(pet.id);
                        nextStep();
                      }}
                      className={`group relative aspect-square rounded-xl border-[2.5px] transition-all overflow-hidden ${selectedPets === pet.id
                        ? "border-[#1a1a1b] shadow-xl scale-[1.02] z-10"
                        : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      <Image
                        src={pet.image}
                        alt={pet.label}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${selectedPets === pet.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <span className="text-white font-bold uppercase tracking-widest text-[10px]">{pet.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider uppercase">
                    Step 2: Frame Style
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FRAMES.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => {
                        setSelectedFrame(frame.id);
                        nextStep();
                      }}
                      className={`group relative aspect-square rounded-xl border-[2.5px] transition-all overflow-hidden ${selectedFrame === frame.id
                        ? "border-[#1a1a1b] shadow-xl scale-[1.02] z-10"
                        : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      <Image
                        src={frame.image}
                        alt={frame.label}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${selectedFrame === frame.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <span className="text-white font-bold uppercase tracking-widest text-[10px]">{frame.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider uppercase">
                    Step 3: Background Colour
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => {
                        setSelectedBg(bg.name);
                        nextStep();
                      }}
                      className={`group relative aspect-square rounded-xl border-[1.5px] transition-all overflow-hidden flex items-center justify-center shadow-sm ${selectedBg === bg.name
                        ? "border-[#1a1a1b] scale-[1.02] z-10 shadow-md"
                        : "border-gray-100 hover:border-gray-200"
                        }`}
                      style={{ backgroundColor: bg.value }}
                    >
                      <span className="text-xs font-serif opacity-90 select-none tracking-tight" style={{ color: bg.textColor }}>
                        {bg.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider uppercase">
                    Step 4: Background Add-ons
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ADD_ONS.map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => {
                        setSelectedAddOn(addon.id);
                        nextStep();
                      }}
                      className={`group relative aspect-square rounded-xl border-[2.5px] transition-all overflow-hidden ${selectedAddOn === addon.id
                        ? "border-[#1a1a1b] shadow-xl scale-[1.02] z-10"
                        : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      <Image
                        src={addon.image}
                        alt={addon.label}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${selectedAddOn === addon.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <span className="text-white font-bold uppercase tracking-widest text-[10px]">{addon.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider uppercase">
                    Step 5: Frame Size
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        nextStep();
                      }}
                      className={`w-full py-2.5 rounded-lg border-[1.5px] font-bold transition-all text-[13px] flex justify-between px-4 items-center ${selectedSize === size
                        ? "border-[#1a1a1b] bg-[#f7f7f7] text-[#1a1a1b] shadow-sm scale-[1.01]"
                        : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
                        }`}
                    >
                      <span>{size}</span>
                      {selectedSize === size && <Check size={18} />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-5">
                <div className="flex justify-between items-center mb-2">
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider uppercase">
                    Step 6: Final Details
                  </label>
                </div>

                {/* Pet Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Pet's Name
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Enter pet name..."
                    className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg focus:border-[#1a1a1b] outline-none transition-all font-poppins text-xs"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="order@example.com"
                    className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg focus:border-[#1a1a1b] outline-none transition-all font-poppins text-xs"
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Upload Photo
                  </label>
                  <div className="border-[1.5px] border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                    <input 
                      type="file" 
                      id="pet-photo-upload"
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                    <label 
                      htmlFor="pet-photo-upload"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-50 text-[#1a1a1b] border-[1.5px] border-gray-200 rounded-lg font-bold transition-all shadow-sm group cursor-pointer text-xs"
                    >
                      <Upload size={16} className="group-hover:scale-110 transition-transform" />
                      {selectedFile ? selectedFile.name.substring(0, 15) + "..." : "CHOOSE IMAGE"}
                    </label>
                  </div>
                </div>

                {/* Gift Wrap */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-primary" />
                    <div>
                      <p className="text-xs font-bold text-[#1a1a1b] uppercase">Gift Wrap (+Rs. 99)</p>
                      <p className="text-[10px] text-gray-500">Ready to give portrait</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGiftWrap(!giftWrap)}
                    className={`relative inline-flex h-5 w-10 cursor-pointer rounded-full transition-colors ${giftWrap ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${giftWrap ? 'translate-x-5' : 'translate-x-1'} mt-0.5`} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-lg font-bold text-base tracking-widest uppercase transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : orderStatus === 'success' ? "bg-green-600" : "bg-[#1a1a1b] hover:bg-[#2F2F2F]"
                    } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      PROCESSING...
                    </>
                  ) : orderStatus === 'success' ? (
                    <>
                      <Check size={20} />
                      ORDER PLACED!
                    </>
                  ) : (
                    "ADD TO CART"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {orderStatus === 'error' && (
          <p className="text-red-500 text-xs text-center font-bold uppercase mt-2">
            Checkout failed. Please try again!
          </p>
        )}
      </div>

      {/* Trust & Features Icons */}
      <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-100">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
            <Undo2 size={18} className="text-[#1a1a1b]" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-bold uppercase text-[#1a1a1b] leading-tight tracking-tighter">
            Unlimited<br />Revisions
          </span>
        </div>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
            <Truck size={18} className="text-[#1a1a1b]" strokeWidth={1.2} />
          </div>
          <span className="text-[10px] font-bold uppercase text-[#1a1a1b] leading-tight tracking-tighter">
            Free Tracked<br />Shipping
          </span>
        </div>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
            <Star size={18} className="text-[#1a1a1b]" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-bold uppercase text-[#1a1a1b] leading-tight tracking-tighter">
            100% Love<br />Guarantee
          </span>
        </div>
      </div>

      {/* Testimonial Card */}
      <div className="bg-[#fcf8f5] rounded-2xl p-6 border border-[#f0e4db] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 text-[#f0e4db]">
          <PawPrint size={40} className="rotate-12 opacity-20" />
        </div>
        <div className="flex gap-4 items-start relative z-10">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
            <Image
              src="/thumb1.png"
              alt="Tania Chawla"
              fill
              sizes="64px"
              className="object-cover"
              onError={(e: any) => { e.target.src = "https://ui-avatars.com/api/?name=Tania+Chawla&background=A87B62&color=fff"; }}
            />
          </div>
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-gray-700 leading-relaxed italic">
              "I can't tell you how much I love my pet portrait! It makes me so happy when I see it on my wall everyday. My dog was my baby and looking at his precious little face everyday makes me smile!"
            </p>
            <p className="text-[12px] font-bold text-[#1a1a1b] uppercase tracking-wider">
              — Tania Chawla
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof Banner */}
      <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-3 bg-gray-50/30">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-sm relative">
              <Image
                src={`https://i.pravatar.cc/100?u=${i + 20}`}
                alt="user"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <p className="text-[13px] font-bold text-[#1a1a1b]">
          Ishita <Check size={12} className="inline-block text-blue-500 fill-blue-500" /> and 3,000+ happy parents
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-2 pt-4">
        <Accordion
          label="Description"
          icon={<PawPrint size={18} />}
          isOpenDefault
        >
          <p className="text-sm text-gray-600 leading-relaxed font-poppins">
            Transform your pet's photo into a stunning masterpiece! Our professional artists design every portrait with love and care to capture your pet's unique personality.
          </p>
        </Accordion>
        <Accordion
          label="Shipping"
          icon={<Truck size={18} />}
        >
          <p className="text-sm text-gray-600 leading-relaxed font-poppins">
            Free shipping across India. Your custom portrait will be ready for review within 2-3 business days.
          </p>
        </Accordion>
        <Accordion
          label="Satisfaction Guarantee"
          icon={<HeartIcon size={18} />}
        >
          <p className="text-sm text-gray-600 leading-relaxed font-poppins">
            We're not happy until you are. We offer unlimited revisions to ensure your portrait is perfect.
          </p>
        </Accordion>
      </div>
    </div>
  );
}


function Accordion({ label, icon, children, isOpenDefault = false }: any) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <div className="flex items-center gap-4">
          <span className="text-gray-400 group-hover:text-primary transition-colors">{icon}</span>
          <span className="font-bold text-[#1a1a1b] uppercase text-sm tracking-tight">{label}</span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="pb-6 animate-in fade-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
}
