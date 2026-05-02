import React from 'react';
import { PolicyLayout } from '@/components/PolicyLayout';

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <div className="prose prose-slate max-w-none space-y-12 text-gray-700 leading-relaxed font-inter">
        <section className="space-y-4">
          <p className="text-lg italic font-medium text-primary">Your privacy is important to us. It is PrintsByPaws' policy to respect your privacy regarding any information we may collect from you across our website.</p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">01</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase italic tracking-tight">Information We Collect</h2>
          </div>
          <p>We only ask for personal information when we truly need it to provide a service to you (like your pet's photo and shipping address). We collect it by fair and lawful means, with your knowledge and consent.</p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">02</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase italic tracking-tight">Use of Information</h2>
          </div>
          <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well unauthorized access, disclosure, copying, use or modification.</p>
        </section>

        <section className="space-y-6 bg-[#fcf8f5] p-8 rounded-3xl border border-[#f0e4db]">
          <h2 className="text-xl font-black text-[#1a1a1b] uppercase italic tracking-tight">Third-Party Sharing</h2>
          <p className="text-sm">We don’t share any personally identifying information publicly or with third-parties, except when required to by law or to complete your order (e.g., shipping partners).</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
