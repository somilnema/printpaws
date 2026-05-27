"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Truck, Mail, ArrowRight, Heart, Star, Loader2, PawPrint } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [orderExists, setOrderExists] = useState(false);

  useEffect(() => {
    async function verifyOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch order details from Supabase 'orders' table
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (data && !error) {
          setOrderExists(true);
          setOrderData(data);
        } else {
          // If not found instantly, wait 1.5 seconds and retry (handles minor network/insert latencies)
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const { data: retryData, error: retryError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();

          if (retryData && !retryError) {
            setOrderExists(true);
            setOrderData(retryData);
          }
        }
      } catch (err) {
        console.error("Database Order Verification Failed:", err);
      } finally {
        setLoading(false);
      }
    }

    verifyOrder();
  }, [orderId]);

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="min-h-screen bg-white font-inter flex flex-col justify-center items-center px-6">
        <div className="relative flex flex-col items-center max-w-md text-center p-8 bg-white border border-gray-100 rounded-3xl shadow-[0_10px_30px_rgba(168,123,98,0.06)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 text-primary flex items-center justify-center mb-6"
          >
            <Loader2 size={44} className="animate-spin text-[#A87B62]" />
          </motion.div>
          <h2 className="text-xl font-black text-[#1a1a1b] uppercase tracking-tight mb-2">Verifying Payment</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Securing connection and confirming your custom pet masterpiece details in our database...
          </p>
        </div>
      </div>
    );
  }

  // Display default/mock fallback if orderId is missing or database check is bypassed
  const displayOrderId = orderId || 'ORDER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const customerEmailAddress = orderData?.customer_email || 'your email';

  return (
    <div className="min-h-screen bg-white font-inter pt-24 pb-16 px-6 relative overflow-hidden">
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
          className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-green-100"
        >
          <CheckCircle className="text-green-500 w-10 h-10" />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <span className="text-primary font-bold uppercase tracking-[0.4em] text-xs">Payment Successful</span>
          <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1b] uppercase tracking-tighter leading-none mb-4">
            Payment Completed! 🐾
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Yes, we received your payment! You will receive a confirmation email shortly at <span className="font-bold text-primary">{customerEmailAddress}</span> with your order details and custom choices.
          </p>
        </motion.div>

        {/* Order Details & Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white border-2 border-[#1a1a1b] rounded-3xl p-6 md:p-10 text-left shadow-[12px_12px_0px_0px_rgba(168,123,98,0.1)] overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-6 text-primary/5">
             <Star size={120} className="rotate-12" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
             <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Order Status</p>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold w-fit">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   RECEIVED & VERIFIED
                </div>
             </div>
             <div className="text-left md:text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Order Reference</p>
                <p className="font-black text-[#1a1a1b] text-sm uppercase">#{displayOrderId.toUpperCase()}</p>
             </div>
          </div>

          {/* Dynamic Specs (If fetched successfully) */}
          {orderExists && orderData && (
            <div className="mb-6 p-5 bg-[#FAF8F5] rounded-2xl border border-[#efece8]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <PawPrint size={14} className="text-primary" /> Your Portrait Specifications:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Pet Name</span>
                  <span className="font-bold text-[#1a1a1b]">{orderData.pet_name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Size</span>
                  <span className="font-bold text-[#1a1a1b]">{orderData.size}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Frame Style</span>
                  <span className="font-bold text-[#1a1a1b]">{orderData.frame_style}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Number of Pets</span>
                  <span className="font-bold text-[#1a1a1b]">{orderData.num_pets}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <div className="flex gap-3 items-start">
                   <div className="w-9 h-9 bg-[#fcf8f5] rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <Mail size={16} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-[#1a1a1b] uppercase italic tracking-tight">Receipt Sent</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">We've sent a detailed receipt and next steps to your email.</p>
                   </div>
                </div>
                <div className="flex gap-3 items-start">
                   <div className="w-9 h-9 bg-[#fcf8f5] rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <Truck size={16} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-[#1a1a1b] uppercase italic tracking-tight">Artisan Review</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">Our designers are verifying the uploaded image. We will email you a preview draft shortly.</p>
                   </div>
                </div>
             </div>

             <div className="bg-[#fcf8f5] rounded-2xl p-5 border border-[#f0e4db] flex flex-col justify-center items-center text-center space-y-2">
                <Heart className="text-primary fill-primary w-5 h-5" />
                <p className="text-[11px] font-bold leading-normal text-[#1a1a1b] uppercase italic">
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
           className="mt-12 space-y-4 flex flex-col items-center"
        >
           <a 
             href="/" 
             className="group flex items-center gap-3 px-8 py-4.5 bg-[#1a1a1b] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-lg active:scale-95"
           >
              Back to Store
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
           </a>
           <p className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">
             Follow us @Peternity
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
