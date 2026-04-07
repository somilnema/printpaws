"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PolicyLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function PolicyLayout({ title, children }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Themed Header Section */}
      <div className="bg-[#fcf8f5] border-b border-[#f0e4db] pt-20 pb-16 px-6 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
           <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#A87B62 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto space-y-4"
        >
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">Printsbypaws Legal</span>
          <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1b] uppercase italic tracking-tighter leading-none">
            {title}
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-6 opacity-30"></div>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
