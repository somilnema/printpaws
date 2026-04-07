"use client";

import { useState } from "react";
import {
  Upload,
  Star,
  ChevronDown,
  Check,
  Undo2,
  Truck,
  ShieldCheck,
  PawPrint,
  Heart as HeartIcon
} from "lucide-react";
import Image from "next/image";

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

const FONTS = [
  { id: "classic", name: "CLASSIC", className: "font-montserrat font-black" },
  { id: "simple", name: "SIMPLE", className: "font-poppins font-light tracking-[0.2em]" },
  { id: "elegant", name: "Elegant", className: "font-elegant text-xl leading-none" },
   { id: "custom", name: "custom", className: "font-elegant text-xl leading-none" },
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
 
];

const ADD_ONS = [
  { id: "crown", label: "Royal Crown", image: "/addon_crown.png" },
  { id: "floral", label: "Floral Wreath", image: "/addon_floral.png" },
  { id: "bowtie", label: "Bow Tie", image: "/addon_bowtie.png" },
  { id: "digital", label: "Digital File", image: "/addon_digital.png" },
];

export function ProductInfo() {
  const [selectedSize, setSelectedSize] = useState('12"x16"');
  const [selectedFrame, setSelectedFrame] = useState("metal");
  const [selectedPets, setSelectedPets] = useState("one");
  const [selectedBg, setSelectedBg] = useState("Pearl");
  const [selectedFont, setSelectedFont] = useState("classic");
  const [selectedAddOn, setSelectedAddOn] = useState("crown");
  const [giftWrap, setGiftWrap] = useState(false);

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
        <h1 className="hidden lg:block text-4xl font-extrabold text-[#1a1a1b] leading-tight tracking-tight uppercase italic">
           Your Pet's Moment to shine
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-primary italic">Rs. 699.00</span>
          <span className="text-xl text-gray-300 line-through">Rs. 999.00</span>
          <span className="bg-[#FFF1F1] text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/10">
            SALE
          </span>
        </div>
      </div>

      <hr className="border-gray-100 my-2" />

      {/* Selectors */}
      <div className="space-y-7">
        {/* Size Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#1a1a1b] uppercase tracking-wider">
            Size
          </label>
          <div className="flex flex-wrap gap-3">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-8 py-2.5 rounded-full border-[1.5px] font-medium transition-all text-base ${selectedSize === size
                    ? "border-[#3a4443] bg-[#f7f7f7] text-[#3a4443] shadow-sm"
                    : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider">
            Frame Style: <span className="text-[#1a1a1b] ml-1">{FRAMES.find(f => f.id === selectedFrame)?.label}</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FRAMES.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                className={`group relative aspect-[4/3] rounded-2xl border-[3px] transition-all overflow-hidden ${
                  selectedFrame === frame.id
                    ? "border-[#1a1a1b] shadow-xl scale-[1.02] z-10"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                aria-label={`Select ${frame.label} frame`}
              >
                <Image 
                  src={frame.image} 
                  alt={`${frame.label} frame selection`}
                  fill 
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={`object-cover transition-transform duration-500 ${
                    selectedFrame === frame.id ? "scale-105" : "group-hover:scale-105"
                  }`}
                />
                
                {/* Visual Overlay for Non-Selected */}
                {selectedFrame !== frame.id && (
                   <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pets Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider uppercase">
            Number of Pets: <span className="text-[#1a1a1b] font-black ml-1">{PET_OPTIONS.find(p => p.id === selectedPets)?.label}</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PET_OPTIONS.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPets(pet.id)}
                className={`group relative aspect-[4/3] rounded-2xl border-[3px] transition-all overflow-hidden ${selectedPets === pet.id
                    ? "border-[#1a1a1b] shadow-xl scale-[1.02] z-10"
                    : "border-gray-100 hover:border-gray-200"
                  }`}
                aria-label={`Select ${pet.label} pet`}
              >
                <Image
                  src={pet.image}
                  alt={`${pet.label} pet portrait selection`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={`object-cover transition-transform duration-500 ${selectedPets === pet.id ? "scale-105" : "group-hover:scale-105"
                    }`}
                />
                
                {/* Visual Overlay for Non-Selected */}
                {selectedPets !== pet.id && (
                   <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Background Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider uppercase">
            Background Color: <span className="text-[#1a1a1b] font-black ml-1">{selectedBg}</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.name}
                onClick={() => setSelectedBg(bg.name)}
                className={`group relative aspect-[4/3] rounded-2xl border-[2px] transition-all overflow-hidden flex items-center justify-center shadow-sm ${
                  selectedBg === bg.name
                    ? "border-[#1a1a1b] scale-[1.02] z-10 shadow-md"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                style={{ backgroundColor: bg.value }}
                title={bg.name}
              >
                <span 
                  className="text-2xl font-serif opacity-90 select-none tracking-tight"
                  style={{ color: bg.textColor }}
                >
                  {bg.name}
                </span>
                
                {/* Visual Overlay for Non-Selected */}
                {selectedBg !== bg.name && (
                   <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider uppercase">
            Font: <span className="text-[#1a1a1b] ml-1">{FONTS.find(f => f.id === selectedFont)?.name}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => setSelectedFont(font.id)}
                className={`px-8 py-2.5 rounded-full border-[1.5px] font-medium transition-all text-base ${selectedFont === font.id
                    ? "border-[#1a1a1b] bg-[#f7f7f7] text-[#1a1a1b] shadow-sm"
                    : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
                  } ${font.className}`}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Add-Ons Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-[#1a1a1b] tracking-wider uppercase">
            Add-Ons: <span className="text-[#1a1a1b] font-black ml-1">{ADD_ONS.find(a => a.id === selectedAddOn)?.label}</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ADD_ONS.map((addon) => (
              <button
                key={addon.id}
                onClick={() => setSelectedAddOn(addon.id)}
                className={`group relative aspect-[4/3] rounded-2xl border-[3px] transition-all overflow-hidden ${selectedAddOn === addon.id
                    ? "border-[#1a1a1b] shadow-xl scale-[1.02] z-10"
                    : "border-gray-100 hover:border-gray-200"
                  }`}
                aria-label={`Select ${addon.label} add-on`}
              >
                <Image
                  src={addon.image}
                  alt={`${addon.label} add-on selection`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={`object-cover transition-transform duration-500 ${selectedAddOn === addon.id ? "scale-105" : "group-hover:scale-105"
                    }`}
                />
                
                {/* Visual Overlay for Non-Selected */}
                {selectedAddOn !== addon.id && (
                   <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pet Name */}
        <div>
          <label className="block text-sm font-bold text-[#1a1a1b] uppercase tracking-wider mb-3">
            What's your pet's name?
          </label>
          <input
            type="text"
            placeholder="Enter your pet name..."
            className="w-full px-5 py-4 border-[1.5px] border-gray-200 rounded-xl focus:border-[#1a1a1b] outline-none transition-all font-poppins text-[16px] placeholder:text-gray-400"
          />
        </div>

        {/* Upload Photo */}
        <div>
          <label className="block text-sm font-bold text-[#1a1a1b] uppercase tracking-wider mb-3">
            Upload Pet's Photo <span className="text-[#A87B62]">*</span>
          </label>
          <div className="border-[1.5px] border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/50">
            <button className="w-full flex items-center justify-center gap-3 px-10 py-4 bg-white hover:bg-gray-50 text-[#1a1a1b] border-[1.5px] border-gray-200 rounded-xl font-bold transition-all shadow-sm group">
              <Upload size={20} className="group-hover:scale-110 transition-transform" />
              CHOOSE IMAGE
            </button>
          </div>
        </div>

        {/* Gift Wrap */}
        <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <ShieldCheck size={20} className="text-[#A87B62]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a1a1b] uppercase tracking-tight">
                  Add Gift Wrap <span className="text-gray-400 font-medium ml-1">(+Rs. 99)</span>
                </p>
                <p className="text-xs text-gray-500 italic">Portrait wrapped and ready to give</p>
              </div>
            </div>
            <button
              onClick={() => setGiftWrap(!giftWrap)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${giftWrap ? 'bg-[#1a1a1b]' : 'bg-gray-300'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${giftWrap ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <button className="w-full py-5 bg-[#1a1a1b] hover:bg-[#2F2F2F] text-white rounded-xl font-bold text-lg tracking-widest uppercase transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
          ADD TO CART
        </button>
      </div>

      {/* Trust & Features Icons */}
      <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-100">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
            <Undo2 size={24} className="text-[#1a1a1b]" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-bold uppercase text-[#1a1a1b] leading-tight tracking-tighter">
            Unlimited<br />Revisions
          </span>
        </div>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
            <Truck size={24} className="text-[#1a1a1b]" strokeWidth={1.2} />
          </div>
          <span className="text-[10px] font-bold uppercase text-[#1a1a1b] leading-tight tracking-tighter">
            Free Tracked<br />Shipping
          </span>
        </div>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
            <Star size={24} className="text-[#1a1a1b]" strokeWidth={1.5} />
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
