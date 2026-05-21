import React from 'react';
import { PolicyLayout } from '@/components/PolicyLayout';
import { Truck, Clock, MapPin, Sparkles } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping Policy">
      <div className="space-y-12 text-gray-700 leading-relaxed font-inter">
        {/* Top Summary Banner */}
        <div className="bg-[#fcf8f5] border border-[#f0e4db] rounded-[1.5rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
             <Truck size={28} />
          </div>
          <div className="space-y-2">
             <h3 className="text-[#1a1a1b] font-black uppercase text-base tracking-wider font-playfair">100% Free Shipping Across India</h3>
             <p className="text-gray-600 text-sm font-inter">
                We're on a mission to get your customized pet portraits to you as quickly, safely, and beautifully as possible. Tracking is provided free of charge!
             </p>
          </div>
        </div>

        {/* Stages of Delivery grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-[#1a1a1b] uppercase tracking-tight font-playfair border-b border-gray-100 pb-2">
            Shipping Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#A87B62]/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <Clock size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">1. Artist Drawing</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                Our team designs your pet portrait. Digital preview is sent to you within <strong>2 to 3 business days</strong>.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#A87B62]/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">2. Quality Printing</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                Upon your final approval, we print, package, and dispatch your frames within <strong>2 business days</strong>.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#A87B62]/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <Truck size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">3. Doorstep Delivery</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                Standard tracked delivery across India takes <strong>5 to 7 business days</strong> to reach your doorstep.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">01</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase tracking-tight">Processing Times</h2>
          </div>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             Our dedicated artists custom style your photo. A stylized proof is generated and sent via email within <strong>2-3 business days</strong>. Once approved, the printing process is finished within another <strong>2 business days</strong>.
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">02</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase tracking-tight">Standard tracked Delivery</h2>
          </div>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             Delivery normally takes <strong>5-7 business days</strong> to deliver. You will be sent an active SMS and email tracking number as soon as the package leaves our warehouse.
          </p>
          <div className="bg-[#fcf8f5] p-6 rounded-2xl border-l-[6px] border-primary flex items-start gap-4">
             <Truck size={24} className="text-primary mt-1 flex-shrink-0" />
             <p className="font-bold text-xs md:text-sm italic font-inter text-gray-700">Tip: Every single print order includes comprehensive premium package insurance so any transit damage is covered free!</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">03</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase tracking-tight">Shipping Costs</h2>
          </div>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             We offer absolutely <strong>Free Tracking and Shipping</strong> all across India with no minimum cart value!
          </p>
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
