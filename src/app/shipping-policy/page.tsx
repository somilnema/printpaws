import React from 'react';
import { PolicyLayout } from '@/components/PolicyLayout';
import { Truck, Clock, MapPin } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping Policy">
      <div className="prose prose-slate max-w-none space-y-12 text-gray-700 leading-relaxed font-poppins">
        <section className="space-y-4">
          <p className="text-xl italic font-bold text-primary">Free Tracking All Over India. We're on a mission to get your pet portraits to you as quickly and safely as possible!</p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">01</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase italic tracking-tight">Processing Times</h2>
          </div>
          <p>Our artists usually complete your custom digital proof within **2-3 business days**. Once you approve it, we print and ship within another **2 business days**.</p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">02</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase italic tracking-tight">Standard Delivery</h2>
          </div>
          <p>Standard delivery usually takes **5-7 business days** after shipping. You will receive a tracking number as soon as your order ships.</p>
          <div className="bg-[#fcf8f5] p-6 rounded-2xl border-l-[6px] border-primary flex items-start gap-4">
             <Truck size={24} className="text-primary mt-1" />
             <p className="font-bold text-sm italic">Tip: All shipments are tracked for your peace of mind!</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">03</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase italic tracking-tight">Shipping Costs</h2>
          </div>
          <p>Currently, we offer **Free Shipping** on all across India!</p>
        </section>

        <section className="pt-10 border-t border-gray-100 flex items-center justify-center gap-8">
           <MapPin size={24} className="text-primary opacity-20" />
           <Truck size={24} className="text-primary opacity-20" />
           <Clock size={24} className="text-primary opacity-20" />
        </section>
      </div>
    </PolicyLayout>
  );
}
