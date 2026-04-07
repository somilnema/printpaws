import React from 'react';
import { PolicyLayout } from '@/components/PolicyLayout';

export default function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service">
      <div className="prose prose-slate max-w-none space-y-12 text-gray-700 leading-relaxed font-poppins">
        <section className="space-y-4">
          <p className="text-xl italic font-bold text-primary">By using the PrintsByPaws website, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">01</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase italic tracking-tight font-montserrat">Artwork Ownership</h2>
          </div>
          <p>We provide custom art services based on your photos. PrintsByPaws and its artists retain intellectual property rights to the final stylized designs. Your unique portrait is for personal use only and cannot be resold or used commercially without express written permission.</p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">02</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase italic tracking-tight font-montserrat">Photo Submissions</h2>
          </div>
          <p>You confirm that you have the right to use and submit any photos you provide to us for customization. PrintsByPaws is not responsible for any copyright infringement resulting from user submissions.</p>
        </section>

        <section className="space-y-6 bg-gray-50 p-8 rounded-3xl border border-gray-100">
           <h2 className="text-xl font-black text-[#1a1a1b] uppercase italic tracking-tight font-montserrat mb-4">3. Limitation of Liability</h2>
           <p className="text-sm font-poppins">PrintsByPaws will not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of our services.</p>
        </section>

        <div className="pt-10 flex flex-col items-center justify-center p-8 border-t border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1a1a1b] opacity-30 mt-4">Last Updated: April 2026</p>
        </div>
      </div>
    </PolicyLayout>
  );
}
