import React from 'react';
import { PolicyLayout } from '@/components/PolicyLayout';
import { Mail, CheckCircle2 } from "lucide-react";

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Refund Policy">
      <div className="prose prose-slate max-w-none space-y-12 text-gray-700 leading-relaxed font-poppins">
        <section className="space-y-4">
          <p className="text-xl italic font-bold text-primary">At PrintsByPaws, your satisfaction is our mission. If you're not perfectly happy with your custom pet art, we're here to help.</p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">01</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase italic tracking-tight">Returns & Revisions</h2>
          </div>
          <p>Because every portrait is **custom-made** and uniquely yours, we cannot offer regular commercial returns or exchanges. However, we offer **Unlimited Revisions** before printing to ensure you love it!</p>
          <div className="bg-[#fcf8f5] p-6 rounded-2xl border-l-[6px] border-primary flex items-start gap-4">
             <CheckCircle2 size={24} className="text-primary mt-1" />
             <p className="font-bold text-sm italic">Tip: Please review your art proof carefully when you receive it. We won't print until you're obsessed with the result!</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">02</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase italic tracking-tight">Damaged Items</h2>
          </div>
          <p>If your item arrives damaged or defective, please contact us within 48 hours of delivery with photos of the damage. We will happily arrange a replacement free of charge.</p>
        </section>

        <section className="pt-10 flex flex-col items-center justify-center p-8 border-t border-gray-100">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Need help with an order?</p>
          <button className="flex items-center gap-3 px-8 py-3 bg-[#1a1a1b] text-white rounded-full font-bold hover:bg-primary transition-all">
             <Mail size={18} />
             Contact Support
          </button>
        </section>
      </div>
    </PolicyLayout>
  );
}
