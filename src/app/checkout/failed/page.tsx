"use client";

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function FailedContent() {
  const searchParams = useSearchParams();
  const rawReason = searchParams.get('reason') || '';

  // Beautify raw reasons returned from Razorpay
  let reason = "The payment session was dismissed or cancelled.";
  if (rawReason === "dismissed") {
    reason = "The Razorpay secure payment window was closed before completing the transaction.";
  } else if (rawReason) {
    reason = rawReason;
  }

  return (
    <div className="min-h-screen bg-white font-inter pt-24 pb-16 px-6 relative overflow-hidden">
      {/* Premium Background Grid */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#E11D48 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
      
      {/* Glow Shapes */}
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 right-[15%] w-64 h-64 bg-red-100 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, 20, 0], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-20 left-[15%] w-80 h-80 bg-red-50 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-2xl mx-auto relative z-10 text-center">
        {/* Animated Decline Icon */}
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-rose-100 animate-pulse"
        >
          <XCircle className="text-rose-500 w-10 h-10" />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <span className="text-rose-500 font-bold uppercase tracking-[0.3em] text-xs">Transaction Incomplete</span>
          <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1b] uppercase tracking-tighter leading-none mb-4">
            Payment Declined or Cancelled
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Your transaction was not completed successfully. Don't worry—your cart details and configurations are saved, and you have not been charged.
          </p>
        </motion.div>

        {/* Reason / Diagnostics Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 bg-white border-2 border-[#1a1a1b] rounded-3xl p-6 md:p-8 text-left shadow-[12px_12px_0px_0px_rgba(225,29,72,0.06)] relative"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
            <AlertTriangle className="text-rose-500 w-5 h-5 flex-shrink-0" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Diagnostic Details:</h3>
          </div>

          <p className="text-sm font-semibold text-rose-900 bg-rose-50/50 p-4 rounded-xl border border-rose-100 mb-6 leading-relaxed">
            {reason}
          </p>

          <h4 className="text-xs font-bold text-[#1a1a1b] uppercase tracking-wider mb-3">Things to check:</h4>
          <ul className="space-y-3.5 text-xs text-gray-500">
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>Did you dismiss or close the secure Razorpay overlay popup window before the secure verification completed?</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>Are international or e-commerce transactions enabled on your payment card or bank account?</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>If you are simulating test/sandbox payments, ensure you click "Simulate Success" inside the secure modal.</span>
            </li>
          </ul>
        </motion.div>

        {/* Action CTAs */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.4 }}
           className="mt-10 space-y-4 flex flex-col items-center"
        >
           <a 
             href="/" 
             className="group flex items-center gap-3 px-8 py-4.5 bg-[#1a1a1b] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#E11D48] transition-all shadow-lg active:scale-95"
           >
              Try Checking Out Again
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
           </a>
           <a 
             href="/contact" 
             className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider transition-colors flex items-center gap-1.5"
           >
             <HelpCircle size={14} /> Need Help? Contact Support
           </a>
        </motion.div>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={null}>
      <FailedContent />
    </Suspense>
  );
}
