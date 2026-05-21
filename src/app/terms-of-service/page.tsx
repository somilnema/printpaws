import React from 'react';
import { PolicyLayout } from '@/components/PolicyLayout';
import { FileText, Award, Camera, UserCheck } from "lucide-react";

export default function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service">
      <div className="space-y-12 text-gray-700 leading-relaxed font-inter">
        {/* Top Summary Banner */}
        <div className="bg-[#fcf8f5] border border-[#f0e4db] rounded-[1.5rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
             <FileText size={28} />
          </div>
          <div className="space-y-2">
             <h3 className="text-[#1a1a1b] font-black uppercase text-base tracking-wider font-playfair">Agreement to Terms</h3>
             <p className="text-gray-600 text-sm font-inter">
                By purchasing from Peternity, you agree to comply with our Terms of Service. We promise to deliver high-quality, hand-drawn digital artwork under clear and fair terms.
             </p>
          </div>
        </div>

        {/* Visual Pillars */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-[#1a1a1b] uppercase tracking-tight font-playfair border-b border-gray-100 pb-2">
            Terms Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#A87B62]/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <Award size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">Art Ownership</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                Your custom pet portrait is fully owned by you for personal use. Commercial resale or distribution of the design requires permission.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#A87B62]/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <Camera size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">Photo Submissions</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                You confirm that you own the rights to the pet photos submitted. We will not use copyrighted photos without authorization.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#A87B62]/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <UserCheck size={20} />
              </div>
              <h4 className="font-bold text-[#1a1a1b] mb-2 uppercase text-xs font-playfair tracking-wider">Personal Use Only</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                Custom designs are built exclusively to decorate your home or be gifted to other pet parents, and cannot be trademarked.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">01</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase tracking-tight">Artwork Rights & Licensing</h2>
          </div>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             We provide custom hand-drawn stylized artwork based directly on your photo. Peternity and its artists retain secondary intellectual rights to use stylized designs for catalog/advertising purposes (excluding identifying details).
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
            <span className="text-2xl font-black text-[#1a1a1b] opacity-20 italic">02</span>
            <h2 className="text-2xl font-black text-[#1a1a1b] uppercase tracking-tight">Acceptable Photo Submissions</h2>
          </div>
          <p className="font-inter text-sm md:text-base text-gray-600 leading-relaxed">
             To guarantee high print clarity, please provide high-resolution photos that are well-lit. We are not responsible for copyright violations arising from your submitted images.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
