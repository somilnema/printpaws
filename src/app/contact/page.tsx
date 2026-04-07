import React from 'react';
import { Mail, MessageCircle, Clock, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Themed Header Section */}
      <div className="bg-[#fcf8f5] border-b border-[#f0e4db] pt-12 md:pt-24 pb-12 md:pb-20 px-6 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
           <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#A87B62 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>
        
        <div className="container mx-auto space-y-4">
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">Get in touch with the pack</span>
          <h1 className="text-4xl md:text-7xl font-black text-[#1a1a1b] uppercase italic tracking-tighter leading-none">
            Contact Us
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
             <Star size={14} className="fill-primary text-primary opacity-20" />
             <div className="w-12 h-[1.5px] bg-primary opacity-20"></div>
             <Star size={14} className="fill-primary text-primary opacity-20" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1b] uppercase italic tracking-tight leading-tight">
                Have a question about your pet's portrait? We're here to help!
              </h2>
              <p className="text-gray-500 leading-relaxed font-poppins text-sm md:text-base">
                 Whether it's about a current order or if you're just looking for some advice, get in touch with our friendly team!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 bg-[#fcf8f5] rounded-3xl border border-[#f0e4db] space-y-4 group hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 mb-1">Email Us</p>
                  <p className="text-[#1a1a1b] font-bold">hello@printsbypaws.com</p>
                </div>
              </div>

              <div className="p-8 bg-[#fcf8f5] rounded-3xl border border-[#f0e4db] space-y-4 group hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#25D366] shadow-sm group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 mb-1">WhatsApp</p>
                  <p className="text-[#1a1a1b] font-bold">+91 999 999 999 0</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 py-8 border-y border-gray-100">
               <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-gray-400" />
               </div>
               <div>
                  <p className="text-xs font-bold uppercase text-[#1a1a1b] italic">Response Time</p>
                  <p className="text-gray-400 text-sm">We usually respond within 24 hours.</p>
               </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-[#1a1a1b] rounded-3xl p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(168,123,98,0.1)]">
            <h3 className="text-xl font-black text-[#1a1a1b] uppercase italic tracking-tight mb-8">Send us a message</h3>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Name</label>
                <input type="text" placeholder="Your Name" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-primary/20 transition-all text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email</label>
                <input type="email" placeholder="Your Email" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-primary/20 transition-all text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Message</label>
                <textarea placeholder="How can we help?" rows={4} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-primary/20 transition-all text-sm font-medium resize-none"></textarea>
              </div>
              <button className="w-full py-5 bg-[#1a1a1b] text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-lg active:scale-95">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
