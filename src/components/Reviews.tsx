"use client";

import { Star, CheckCircle2 } from "lucide-react";

export function Reviews() {
  return (
    <div className="py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black uppercase italic mb-2">Customer Stories</h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-bold">4.9 / 5.0</span>
            <span className="text-gray-400 font-inter">(1,240+ Verified Reviews)</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-100 rounded-full font-bold hover:bg-gray-50 transition-colors uppercase text-sm">
          See all reviews
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { name: "Verified Customer", initial: "VC", text: "I didn’t expect to feel this much. It’s not just a portrait - it genuinely feels like him. I pause every time I walk past it." },
          { name: "Verified Customer", initial: "VC", text: "The moment I saw it, I smiled… and then I teared up. You’ve captured something I can’t even explain." },
          { name: "Verified Customer", initial: "VC", text: "It’s crazy how accurate it is. Not just the face - the feeling. It’s like she’s still right here." },
          { name: "Verified Customer", initial: "VC", text: "I gifted this to my parents and they couldn’t stop looking at it. It’s one of those things that just hits you." },
          { name: "Verified Customer", initial: "VC", text: "I’ve taken hundreds of photos of my dog, but this… this is the one that actually feels like him." },
          { name: "Verified Customer", initial: "VC", text: "The eyes, the expression, everything - it’s so real it almost feels alive. I wasn’t expecting that." },
          { name: "Verified Customer", initial: "VC", text: "I thought it would be nice. I didn’t think it would mean this much. It’s now my favorite thing in the house." },
          { name: "Verified Customer", initial: "VC", text: "It’s the kind of thing you don’t just hang on a wall - you feel something every time you look at it." },
          { name: "Verified Customer", initial: "VC", text: "My dog passed away last year… and this brought back a part of him I thought I’d lost. I can’t thank you enough." },
          { name: "Verified Customer", initial: "VC", text: "I’ve never bought something online that felt this personal. It’s not just art - it’s a piece of my life." }
        ].map((review, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border-2 border-gray-50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                {review.initial}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm">{review.name}</span>
                  <CheckCircle2 size={12} className="text-green-500 fill-green-500/10" />
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={10} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-inter italic leading-relaxed">
              "{review.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
