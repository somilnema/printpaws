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

const SIZES = ["8x10 (20 x 25 cm)", "12x16 (30 x 40 cm)"];
const FRAMES = [
  { id: "no-frame", name: "No Frame", color: "transparent" },
  { id: "black-frame", name: "Black Frame", color: "#000000" },
  { id: "white-frame", name: "White Frame", color: "#FFFFFF" },
  { id: "oak-frame", name: "Oak Frame", color: "#D2B48C" },
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
];

const BACKGROUNDS = [
  { name: "Off White", value: "#F5F5F5" },
  { name: "Soft Pink", value: "#F4C2C2" },
  { name: "Sky Blue", value: "#AED9E0" },
  { name: "Sage Green", value: "#C8D5B9" },
  { name: "Charcoal", value: "#363636" },
];

export function ProductInfo() {
  const [selectedSize, setSelectedSize] = useState("12x16 (30 x 40 cm)");
  const [selectedFrame, setSelectedFrame] = useState("no-frame");
  const [selectedPets, setSelectedPets] = useState("one");
  const [selectedBg, setSelectedBg] = useState("Off White");
  const [selectedFont, setSelectedFont] = useState("classic");
  const [giftWrap, setGiftWrap] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="hidden lg:flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="fill-[#FFB800] text-[#FFB800]" />
          ))}
          <span className="text-sm font-medium text-gray-400 ml-2">542 Reviews</span>
        </div>
        <h1 className="hidden lg:block text-4xl font-extrabold text-[#1a1a1b] leading-tight tracking-tight uppercase italic">
          Custom Pet Portrait
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-primary italic">Rs. 699.00</span>
          <span className="text-xl text-gray-300 line-through">Rs. 999.00</span>
          <span className="bg-[#FFF1F1] text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/10">
            SALE
          </span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Selectors */}
      <div className="space-y-8">
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
                className={`px-6 py-3 rounded-xl border-2 font-bold transition-all text-sm ${
                  selectedSize === size
                    ? "border-accent-blue bg-accent-blue/5 text-accent-blue shadow-sm"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#1a1a1b] uppercase tracking-wider">
            Frame
          </label>
          <div className="flex flex-wrap gap-4">
            {FRAMES.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                className={`group relative w-12 h-12 rounded-lg border-2 transition-all p-1 ${
                  selectedFrame === frame.id
                    ? "border-accent-blue scale-110 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                title={frame.name}
              >
                <div 
                  className="w-full h-full rounded-md border border-gray-100 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: frame.color }}
                >
                  {frame.id === "no-frame" && <Check className="text-gray-300" size={16} />}
                </div>
                {selectedFrame === frame.id && (
                  <div className="absolute -top-1 -right-1 bg-accent-blue text-white rounded-full p-0.5 border-2 border-white">
                    <Check size={8} strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pets Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-[#1a1a1b] uppercase tracking-wider">
            Number of Pets: <span className="text-primary font-black ml-1">{PET_OPTIONS.find(p => p.id === selectedPets)?.label}</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PET_OPTIONS.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPets(pet.id)}
                className={`group relative aspect-[4/3] rounded-2xl border-[3px] transition-all overflow-hidden ${
                  selectedPets === pet.id
                    ? "border-primary shadow-xl scale-[1.02] z-10"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                aria-label={`Select ${pet.label} pet`}
              >
                <Image 
                  src={pet.image} 
                  alt={`${pet.label} pet portrait selection`}
                  fill 
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={`object-cover transition-transform duration-500 ${
                    selectedPets === pet.id ? "scale-105" : "group-hover:scale-105"
                  }`}
                />
                
                {/* Selection Check Circle */}
                {selectedPets === pet.id && (
                  <div className="absolute inset-0 bg-primary/5 pointer-events-none">
                    <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1 shadow-lg border-2 border-white animate-in zoom-in-50 duration-300">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                )}
                
                {/* Visual Overlay for Non-Selected */}
                {selectedPets !== pet.id && (
                   <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Background Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#1a1a1b] uppercase tracking-wider">
            Background Colour
          </label>
          <div className="flex flex-wrap gap-4">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.name}
                onClick={() => setSelectedBg(bg.name)}
                className={`relative w-12 h-12 rounded-full border-2 transition-all p-0.5 ${
                  selectedBg === bg.name
                    ? "border-accent-blue scale-110 shadow-md"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                title={bg.name}
              >
                <div 
                  className="w-full h-full rounded-full border border-gray-100 shadow-inner"
                  style={{ backgroundColor: bg.value }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Font Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#1a1a1b] uppercase tracking-wider">
            Font
          </label>
          <div className="flex flex-wrap gap-3">
            {FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => setSelectedFont(font.id)}
                className={`px-8 py-3 rounded-xl border-2 transition-all min-w-[120px] ${
                  selectedFont === font.id
                    ? "border-accent-blue bg-accent-blue/5 text-accent-blue shadow-sm"
                    : "border-gray-100 text-gray-500 hover:border-gray-300"
                } ${font.className}`}
              >
                {font.name}
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
            className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-poppins text-lg"
          />
        </div>

        {/* Upload Photo */}
        <div>
          <label className="block text-sm font-bold text-[#1a1a1b] uppercase tracking-wider mb-3">
            Upload Pet's Photo <span className="text-primary">*</span>
          </label>
          <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-6 bg-gray-50/30">
            <button className="w-full sm:w-auto mx-auto flex items-center justify-center gap-3 px-10 py-4 bg-white hover:bg-gray-50 text-[#1a1a1b] border-2 border-gray-100 rounded-xl font-bold transition-all shadow-sm">
              <Upload size={20} />
              CHOOSE IMAGE
            </button>
          </div>
        </div>

        {/* Gift Wrap */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#1a1a1b] uppercase tracking-wider">
            Add Gift Wrap
          </label>
          <div className="flex items-start gap-4 p-1">
            <button 
              onClick={() => setGiftWrap(!giftWrap)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${giftWrap ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${giftWrap ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <div>
              <p className="text-sm font-bold text-[#1a1a1b]">
                Yes <span className="text-gray-500 font-medium">(+Rs. 99.00)</span>
              </p>
              <p className="text-xs text-gray-500 font-medium italic">Your portrait, wrapped and ready</p>
            </div>
          </div>
        </div>

        <button className="w-full py-6 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xl tracking-[0.2em] uppercase transition-all shadow-2xl hover:-translate-y-1 active:scale-95">
          ADD TO CART
        </button>
      </div>

      {/* Trust & Features Icons */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <Undo2 size={32} className="text-[#1a1a1b]" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-black uppercase text-[#1a1a1b] leading-tight">
            Free Preview<br/>and Edits
          </span>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <Truck size={36} className="text-[#1a1a1b]" strokeWidth={1.2} />
          </div>
          <span className="text-[10px] font-black uppercase text-[#1a1a1b] leading-tight">
            Free Shipping<br/>Across India
          </span>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <Star size={32} className="text-[#1a1a1b]" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-black uppercase text-[#1a1a1b] leading-tight">
            Satisfaction<br/>Guaranteed
          </span>
        </div>
      </div>

      {/* Testimonial Card */}
      <div className="bg-[#F9F9F9] rounded-3xl p-8 space-y-6">
        <div className="flex gap-6 items-start">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
            <Image 
              src="/thumb1.png" 
              alt="Tania Chawla" 
              fill 
              sizes="100px"
              className="object-cover"
              onError={(e: any) => { e.target.src = "https://ui-avatars.com/api/?name=Tania+Chawla&background=random"; }}
            />
          </div>
          <p className="text-sm font-medium text-gray-600 leading-relaxed font-poppins italic pt-2">
            "I can't tell you how much I love my pet portrait! It makes me so happy when I see it on my wall everyday. My dog was my baby and looking at his precious little face everyday makes me smile!"
          </p>
        </div>
        <p className="text-sm font-black text-[#1a1a1b] italic text-right pr-4">
          — Tania Chawla
        </p>
      </div>

      {/* Social Proof Banner */}
      <div className="border-2 border-dashed border-[#8B5E3C]/30 rounded-2xl p-4 flex items-center justify-center gap-3">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200">
              <Image 
                src={`https://i.pravatar.cc/100?u=${i + 20}`} 
                alt="user" 
                width={32} 
                height={32} 
              />
            </div>
          ))}
        </div>
        <p className="text-sm font-bold text-[#1a1a1b]">
          Ishita <Check size={14} className="inline-block text-blue-500 fill-blue-500" /> and 3,000+ purchased
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
