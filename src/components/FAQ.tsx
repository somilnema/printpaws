"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_DATA = [
  {
    question: "Can I see the pet portrait before printing?",
    answer: "Yes! We send you a preview within 2-3 days. You can request unlimited edits until you're 100% happy with it."
  },
  {
    question: "Is my pet photo good enough to use?",
    answer: "Our artists can work with almost any photo! If your photo is too low quality, we'll reach out and ask for a replacement to ensure the best result."
  },
  {
    question: "What if I don't like my pet portrait?",
    answer: "No problem! We offer a 100% satisfaction guarantee. We'll keep working on your portrait until it's perfect, or provide a full refund."
  },
  {
    question: "Do you just design dog portraits?",
    answer: "We design portraits for all animals! Cats, horses, birds, hamsters—if it's a pet, we can turn it into a masterpiece."
  }
];

export function FAQ() {
  return (
    <section className="py-12 md:py-20 bg-[#F9F9F9]">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-black text-[#1a1a1b] font-montserrat text-center mb-10 uppercase italic">
          Frequently Asked Questions
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
        <p className="text-gray-500 font-poppins text-base leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}
