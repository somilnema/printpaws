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

const SIZES = ["8\"x10\"", "12\"x16\"", "18\"x24\""];
const TYPES = ["Poster", "Black Frame", "White Frame"];
const PETS = ["1 Pet", "2 Pets", "3 Pets"];

const BACKGROUNDS = [
  { name: "White", type: "color", value: "#FFFFFF" },
  { name: "Black", type: "color", value: "#000000" },
  { name: "Dusty Pink", type: "color", value: "#E9B7B7" },
  { name: "Heart", type: "pattern", value: "/thumb1.png", price: 199 },
  { name: "Wiggles", type: "pattern", value: "/thumb2.png", price: 199 },
  { name: "Bloom", type: "pattern", value: "/dog_portrait_closeup_1773940826280.png", price: 199 },
];

export function ProductInfo() {
  const [selectedSize, setSelectedSize] = useState("12\"x16\"");
  const [selectedType, setSelectedType] = useState("Poster");
  const [selectedPets, setSelectedPets] = useState("1 Pet");
  const [selectedBg, setSelectedBg] = useState("White");
  const [giftWrap, setGiftWrap] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="fill-[#FFB800] text-[#FFB800]" />
          ))}
          <span className="text-sm font-medium text-gray-400 ml-2">542 Reviews</span>
        </div>
        <h1 className="text-4xl font-extrabold text-[#1a1a1b] leading-tight tracking-tight uppercase italic">
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
        {/* Size & Type & Pets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DropdownSelector label="Poster Size" options={SIZES} selected={selectedSize} onChange={setSelectedSize} />
          <DropdownSelector label="Display Type" options={TYPES} selected={selectedType} onChange={setSelectedType} />
          <DropdownSelector label="No. of Pets" options={PETS} selected={selectedPets} onChange={setSelectedPets} />
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
              CHOOSE IMAGE
            </button>
          </div>
        </div>
        
        {/* Background Selection */}
        <div>
          <label className="block text-sm font-bold text-[#1a1a1b] uppercase tracking-wider mb-4">
            Background <span className="text-primary">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.name}
                onClick={() => setSelectedBg(bg.name)}
                className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all ${
                  selectedBg === bg.name 
                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="relative w-[3.5rem] h-[3.5rem] rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                  {bg.type === "color" ? (
                    <div className="w-full h-full" style={{ backgroundColor: bg.value }} />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Image 
                        src={bg.value} 
                        alt={bg.name} 
                        fill 
                        sizes="60px"
                        className="object-cover" 
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{bg.name[0]}</span>
                    </div>
                  )}
                  {selectedBg === bg.name && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check size={20} className="text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-[#1a1a1b]">{bg.name}</span>
                  {bg.price && (
                    <span className="text-[11px] text-gray-500 font-medium">
                      (Rs. {bg.price}.00)
                    </span>
                  )}
                </div>
              </button>
            ))}
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

function DropdownSelector({ label, options, selected, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
      <div className="relative group">
        <select 
          value={selected} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1a1a1b] cursor-pointer outline-none focus:border-primary/20 transition-all"
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors pointer-events-none" />
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
