"use client";

import { Check, X } from "lucide-react";

const COMPARISON_DATA = [
  { feature: "Preview Before Printing", printsByPaws: true, others: false },
  { feature: "Unlimited Revisions", printsByPaws: true, others: false },
  { feature: "Feels Like Them", printsByPaws: true, others: false },
  { feature: "Made to Last", printsByPaws: true, others: false },
  { feature: "Free Shipping Across India", printsByPaws: true, others: false },
];

export function Comparison() {
  return (
    <section className="py-12 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Header */}
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1a1a1b] font-playfair leading-tight tracking-tight uppercase">
              Why Pet Parents Choose Peternity
            </h2>
          </div>

          {/* Table */}
          <div className="w-full lg:w-2/3">
            <div className="relative overflow-x-auto lg:overflow-visible -mx-6 px-6 lg:mx-0 lg:px-0">
              <table className="w-full text-left border-separate border-spacing-y-0">
                <thead>
                  <tr className="text-[9px] md:text-xs font-black uppercase tracking-widest text-[#1a1a1b]">
                    <th className="py-3 md:py-4 px-2 md:px-4 w-[40%]"></th>
                    <th className="py-3 md:py-4 px-3 md:px-6 text-center bg-primary text-white rounded-t-2xl shadow-[0_-5px_15px_rgba(168,123,98,0.1)] w-[30%]">
                      Peternity
                    </th>
                    <th className="py-3 md:py-4 px-3 md:px-6 text-center text-gray-400 w-[30%]">Others</th>
                  </tr>
                </thead>
                <tbody className="bg-white/50">
                  {COMPARISON_DATA.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className="group border-b border-gray-100 last:border-0"
                    >
                      <td className="py-2.5 md:py-3 px-2 md:px-4 font-bold text-[#1a1a1b] text-[10px] md:text-sm border-b border-gray-50 uppercase leading-tight">
                        {row.feature}
                      </td>
                      <td className="py-2.5 md:py-3 px-3 md:px-6 text-center bg-primary/90 text-white shadow-[5px_0_15px_rgba(168,123,98,0.05),-5px_0_15px_rgba(168,123,98,0.05)] border-b border-white/10">
                        <div className="flex justify-center scale-75 md:scale-90">
                          {row.printsByPaws ? (
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <Check className="text-white" size={18} strokeWidth={3} />
                            </div>
                          ) : (
                            <X className="text-white/40" size={20} strokeWidth={3} />
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 md:py-3 px-3 md:px-6 text-center border-b border-gray-50">
                        <div className="flex justify-center scale-75 md:scale-90">
                          {row.others ? (
                            <Check className="text-primary/60" size={18} strokeWidth={3} />
                          ) : (
                            <X className="text-gray-300" size={18} strokeWidth={3} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Bottom rounded cap for the highlighted column */}
                  <tr>
                    <td></td>
                    <td className="h-4 bg-primary/90 rounded-b-2xl shadow-[0_5px_15px_rgba(168,123,98,0.1)]"></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
