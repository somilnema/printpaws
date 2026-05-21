import React from 'react';
import { PolicyLayout } from '@/components/PolicyLayout';
import { Shield, Eye, Lock, RefreshCw } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <div className="space-y-12 text-gray-700 leading-relaxed font-inter">
        {/* Top Summary Banner */}
        <div className="bg-[#fcf8f5] border border-[#f0e4db] rounded-[1.5rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
             <Shield size={28} />
          </div>
          <div className="space-y-2">
             <h3 className="text-[#1a1a1b] font-black uppercase text-base tracking-wider font-playfair">Your Privacy is Our Priority</h3>
             <p className="text-gray-600 text-sm font-inter">
                We only collect, store, and process your personal details and pet photos to fulfill your direct order. We never sell your personal information or pet data.
             </p>
          </div>
        </div>

        {/* Visual Pillars */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-[#1a1a1b] uppercase tracking-tight font-playfair border-b border-gray-100 pb-2">
            Our Data Safety Pillars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#A87B62]/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <Eye size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">Transparent Use</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                We only ask for details like pet photos or delivery addresses when absolutely necessary to deliver your custom artwork.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#A87B62]/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <Lock size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">Secure Storage</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                We safeguard your personal data using standard high-grade encryption methods to prevent unauthorized access or disclosure.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#A87B62]/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <RefreshCw size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">Zero Public Sharing</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                We never share your personal information or pet images with third parties, except with shipping carriers to deliver your order.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">01</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase tracking-tight">Information We Collect</h2>
          </div>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             We gather details you actively provide when registering, customizing, or checking out: your name, phone number, email address, physical delivery address, and pet photos. We request this to give you a personalized shopping and art customizer experience.
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">02</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase tracking-tight">Use of Information</h2>
          </div>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             We use your pet photographs and style configurations exclusively to produce the stylized portrait customizer previews. We retain transactional details for as long as legal tax filings and warranty support windows are open.
          </p>
        </section>

        <section className="space-y-6 bg-[#fcf8f5] p-8 rounded-3xl border border-[#f0e4db]">
          <h2 className="text-xl font-black text-[#1a1a1b] uppercase tracking-tight">Third-Party Sharing Policy</h2>
          <p className="text-sm text-gray-600 leading-relaxed font-inter">
             We do not share, sell, or rent your identifying details or your pet portraits to any advertising networks. Information is only passed to vetted shipping gateways (to deliver frames) and secure payment processors (to complete transactions).
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
