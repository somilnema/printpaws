import React from 'react';
import { PolicyLayout } from '@/components/PolicyLayout';
import { Mail, CheckCircle2, ShieldCheck, AlertTriangle, Sparkles } from "lucide-react";

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Refund Policy">
      <div className="space-y-12 text-gray-700 leading-relaxed font-inter">
        {/* Core Guarantee banner */}
        <div className="bg-[#fcf8f5] border border-[#f0e4db] rounded-[1.5rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
             <ShieldCheck size={28} />
          </div>
          <div className="space-y-2">
             <h3 className="text-[#1a1a1b] font-black uppercase text-base tracking-wider font-playfair">Our Satisfaction Guarantee</h3>
             <p className="text-gray-600 text-sm font-inter">
                At Peternity, your satisfaction is our mission. We believe in our art, which is why we work side-by-side with you until your custom portrait feels exactly right.
             </p>
          </div>
        </div>

        {/* 3 Step Interactive Visual Flow Card */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-[#1a1a1b] uppercase tracking-tight font-playfair border-b border-gray-100 pb-2">
            The Approval Process & Refund Eligibility
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="absolute top-4 right-4 text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">STAGE 1</div>
              <div className="w-10 h-10 bg-[#A87B62]/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">Unlimited Revisions</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                Our artists hand-draw your pet. We offer <strong>Unlimited Revisions</strong> to the digital proof. We will refine it until you are obsessed with the result!
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="absolute top-4 right-4 text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded">STAGE 2</div>
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">Your Final Approval</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                We only send your portrait for physical printing and framing <strong>after you have explicitly reviewed and approved</strong> the digital preview.
              </p>
            </div>

            <div className="bg-[#fff8f8] border border-red-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="absolute top-4 right-4 text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded">STAGE 3</div>
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">No Refund After Print</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed font-inter">
                Once printed and framed, <strong>no refunds or returns</strong> are accepted since every item is a custom-made, unique design that cannot be resold.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">01</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase tracking-tight">Returns & Revisions Details</h2>
          </div>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             Because every portrait is custom-made and uniquely styled for your pet, we cannot offer regular commercial returns, refunds, or exchanges. To give you complete peace of mind, we provide a <strong>100% Risk-Free Digital Phase</strong>.
          </p>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             During this phase, you are entitled to request as many edits as needed. We only print once you give us the official green light!
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">02</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase tracking-tight">Damaged & Defective Shipments</h2>
          </div>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             In the rare event that your physical portrait frames arrive damaged, broken, or defective during delivery transit, we got your back!
          </p>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             Simply contact our support desk at <strong className="text-[#1a1a1b]">Peternity.memories@gmail.com</strong> within <strong className="text-[#1a1a1b]">48 hours of delivery</strong> with photos of the damaged frame/artwork, and we will immediately reprint and ship a replacement to you free of charge.
          </p>
        </section>

        {/* Call to Support */}
        <section className="pt-10 flex flex-col items-center justify-center p-8 border-t border-gray-100">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 font-playfair">Have any questions about refunds?</p>
          <a href="mailto:Peternity.memories@gmail.com" className="flex items-center gap-3 px-8 py-3 bg-[#1a1a1b] text-white rounded-full font-bold hover:bg-primary transition-all text-sm uppercase tracking-wider">
             <Mail size={18} />
             Contact Support
          </a>
        </section>
      </div>
    </PolicyLayout>
  );
}
