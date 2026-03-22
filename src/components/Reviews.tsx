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
            <span className="text-gray-400 font-poppins">(1,240+ Verified Reviews)</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-100 rounded-full font-bold hover:bg-gray-50 transition-colors uppercase text-sm">
          See all reviews
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border-2 border-gray-50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                JS
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm">Jane Smith</span>
                  <CheckCircle2 size={12} className="text-green-500 fill-green-500/10" />
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={10} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-poppins italic">
              "Absolutely loved the portrait of my pup! The quality is amazing and the design team was so patient with my requests. Definitely recommend PrintsByPaws!"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
