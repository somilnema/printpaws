"use client";

import { useState } from "react";
import { Upload, Star, ChevronDown, Check } from "lucide-react";

const SIZES = ["8\"x10\"", "12\"x16\"", "18\"x24\""];
const TYPES = ["Poster", "Black Frame", "White Frame"];
const PETS = ["1 Pet", "2 Pets", "3 Pets"];
const COLORS = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Dusty Pink", hex: "#E9B7B7" },
  { name: "Sage Green", hex: "#B8C4B4" },
  { name: "Sky Blue", hex: "#B8D8E9" },
];

export function ProductInfo() {
  const [selectedSize, setSelectedSize] = useState("12\"x16\"");
  const [selectedType, setSelectedType] = useState("Poster");
  const [selectedPets, setSelectedPets] = useState("1 Pet");
  const [selectedColor, setSelectedColor] = useState("White");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-500 ml-2">542 Reviews</span>
        </div>
        <h1 className="text-3xl font-black text-secondary leading-tight uppercase italic mb-2">
          Custom Pet Portrait
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-primary italic">Rs. 699.00</span>
          <span className="text-lg text-gray-400 line-through">Rs. 999.00</span>
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">SALE</span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Selectors */}
      <div className="space-y-6">
        <Selector label="Poster Size" options={SIZES} selected={selectedSize} onChange={setSelectedSize} />
        <Selector label="Display Type" options={TYPES} selected={selectedType} onChange={setSelectedType} />
        <Selector label="No. of Pets" options={PETS} selected={selectedPets} onChange={setSelectedPets} />
        
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-3">
            Portrait Style: <span className="text-primary">{selectedColor}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                  selectedColor === color.name ? "border-primary scale-110 shadow-lg" : "border-gray-200 hover:border-gray-300"
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {selectedColor === color.name && (
                  <Check size={16} className={color.name === "White" ? "text-primary" : "text-white"} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2">Pet Name</label>
          <input
            type="text"
            placeholder="Enter your pet's name"
            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary outline-none transition-colors font-poppins"
          />
        </div>

        <button className="w-full flex items-center justify-center gap-3 py-4 bg-accent-blue hover:bg-accent-blue/90 text-white rounded-xl font-bold transition-all shadow-xl hover:shadow-accent-blue/20">
          <Upload size={20} />
          CHOOSE IMAGE
        </button>

        <button className="w-full py-5 bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-lg tracking-widest uppercase transition-all shadow-2xl hover:-translate-y-1">
          ADD TO CART
        </button>
      </div>

      <div className="space-y-4">
        <Accordion label="Description" isOpenDefault>
          <p className="text-sm text-gray-600 leading-relaxed font-poppins">
            Transform your pet's photo into a stunning masterpiece! Our professional artists design every portrait with love and care to capture your pet's unique personality.
          </p>
        </Accordion>
        <Accordion label="Shipping Information">
          <p className="text-sm text-gray-600 leading-relaxed font-poppins">
            Free shipping across India. Your custom portrait will be ready for review within 2-3 business days.
          </p>
        </Accordion>
      </div>
    </div>
  );
}

function Selector({ label, options, selected, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-bold uppercase tracking-wider mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition-all ${
              selected === opt ? "bg-secondary text-white border-secondary" : "bg-white text-secondary border-gray-100 hover:border-gray-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Accordion({ label, children, isOpenDefault = false }: any) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  return (
    <div className="border-b border-gray-100 last:border-0 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <span className="font-bold text-secondary uppercase tracking-tight">{label}</span>
        <ChevronDown size={18} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="pt-2">{children}</div>}
    </div>
  );
}
