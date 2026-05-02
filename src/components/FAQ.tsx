"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_DATA = [
  {
    question: "Will I see my portrait before it’s printed?",
    answer: "Yes. You’ll receive a preview within 48 hours, and we only print once it feels exactly right to you."
  },
  {
    question: "What if it doesn’t feel right?",
    answer: "We refine every detail with you until it truly feels like your pet. Nothing gets printed without your approval."
  },
  {
    question: "How long will it take to receive my portrait?",
    answer: "Preview in 48 hours. Delivery in 4-7 working days after approval."
  },
  {
    question: "Can I request changes to the portrait?",
    answer: "Of course. We work with you until every detail feels just right."
  },
  {
    question: "What kind of photos work best?",
    answer: "Clear photos where your pet’s face is visible work best - we’ll guide you if needed."
  },
  {
    question: "Is this a good gift?",
    answer: "It’s deeply personal - something they’ll see every day and feel every time."
  }
];

export function FAQ() {
  return (
    <section className="py-12 md:py-20 bg-[#F9F9F9]">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-black text-[#1a1a1b] font-playfair text-center mb-10 uppercase italic">
          Questions Pet Parents Usually Have
        </h2>

        <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden px-6 md:px-10 py-2">
          {FAQ_DATA.map((item, idx) => (
            <FAQItem key={idx} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 md:py-6 text-left group"
      >
        <span className="text-base md:text-lg font-bold text-[#1a1a1b] group-hover:text-primary transition-colors pr-8">
          {question}
        </span>
        <ChevronDown 
          size={24} 
          className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[300px] opacity-100 pb-8" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-500 font-inter text-base leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}
