"use client";

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Mail, ArrowRight, Heart, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'PBP-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-white font-poppins pt-20 pb-16 px-6 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#A87B62 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
      
      {/* Animated Floating Shapes */}
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-20 right-[10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, 20, 0], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-20 left-[10%] w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm border border-green-100"
        >
          <CheckCircle className="text-green-500 w-12 h-12" />
        </motion.div>

        {/* Headline */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="space-y-4"
        >
          <span className="text-primary font-bold uppercase tracking-[0.4em] text-xs">A Moment to Remember</span>
          <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1b] uppercase italic tracking-tighter leading-none mb-6">
            Thank You for<br />Testing the pack!
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto leading-relaxed italic">
            Your pet's masterpiece is now in the hands of our passionate artists. Get ready for something beautiful!
          </p>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-white border-2 border-[#1a1a1b] rounded-3xl p-8 md:p-12 text-left shadow-[12px_12px_0px_0px_rgba(168,123,98,0.1)] overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-6 text-primary/5">
             <Star size={120} className="rotate-12" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-8 mb-8 gap-4">
             <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Order Status</p>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold w-fit">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   CONFIRMED
                </div>
             </div>
             <div className="text-left md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Order ID</p>
                <p className="font-black text-[#1a1a1b] text-sm uppercase">#{orderId}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 bg-[#fcf8f5] rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <Mail size={18} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-[#1a1a1b] uppercase italic tracking-tight">Confirmation Sent</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">We've sent a detailed receipt and next steps to your email.</p>
                   </div>
                </div>
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 bg-[#fcf8f5] rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <Truck size={18} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-[#1a1a1b] uppercase italic tracking-tight">Track Your Art</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">You'll receive a tracking link as soon as your portrait ships.</p>
                   </div>
                </div>
             </div>

             <div className="bg-[#fcf8f5] rounded-2xl p-6 border border-[#f0e4db] flex flex-col justify-center items-center text-center space-y-3">
                <Heart className="text-primary fill-primary w-6 h-6" />
                <p className="text-xs font-bold leading-relaxed text-[#1a1a1b] uppercase italic">
                  Every order helps us support<br />animal shelters across India.
                </p>
             </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="mt-16 space-y-6 flex flex-col items-center"
        >
           <Link 
             href="/" 
             className="group flex items-center gap-3 px-10 py-5 bg-[#1a1a1b] text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-lg active:scale-95"
           >
              Back to Store
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </Link>
           <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">
             Follow us @printsbypaws
           </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
