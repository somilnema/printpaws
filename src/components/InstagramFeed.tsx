"use client";

import React, { useRef, useState } from "react";
import { Heart, Volume2, VolumeX, Sparkles } from "lucide-react";
import { getCloudinaryUrl } from "@/utils/cloudinary";

export function InstagramFeed() {
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  
  const [isMuted1, setIsMuted1] = useState(true);
  const [isMuted2, setIsMuted2] = useState(true);

  const toggleMute1 = () => {
    if (videoRef1.current) {
      const newMuted = !videoRef1.current.muted;
      videoRef1.current.muted = newMuted;
      setIsMuted1(newMuted);
      // Automatically mute the other video to avoid overlapping audio
      if (!newMuted && videoRef2.current) {
        videoRef2.current.muted = true;
        setIsMuted2(true);
      }
    }
  };

  const toggleMute2 = () => {
    if (videoRef2.current) {
      const newMuted = !videoRef2.current.muted;
      videoRef2.current.muted = newMuted;
      setIsMuted2(newMuted);
      // Automatically mute the other video to avoid overlapping audio
      if (!newMuted && videoRef1.current) {
        videoRef1.current.muted = true;
        setIsMuted1(true);
      }
    }
  };

  return (
    <section className="py-12 md:py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row rounded-[2.5rem] overflow-hidden border border-[#F0EBE0] shadow-sm">
          {/* Left Content - Mission Section */}
          <div className="lg:w-[40%] flex flex-col items-center lg:items-start justify-center p-8 md:p-16 lg:p-20 space-y-6 bg-[#FAF7F2] border-b lg:border-b-0 lg:border-r border-[#F0EBE0]">
            <div className="w-12 h-12 rounded-full bg-[#A87B62]/10 flex items-center justify-center text-[#A87B62] animate-bounce">
              <Heart size={22} className="fill-[#A87B62]" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-[#1a1a1b] font-playfair tracking-tight text-center lg:text-left leading-[1.15] uppercase">
              For Every <br className="hidden lg:block" />
              Portrait, A Pet <br className="hidden lg:block" />
              Gets Fed
            </h2>
            
            <p className="text-gray-500 font-inter text-sm md:text-base text-center lg:text-left max-w-sm leading-relaxed">
              Every time you turn your pet into a memory, we donate a portion of the proceeds to feed stray and shelter animals. Because love for animals shouldn’t stop at just one.
            </p>

            <div className="w-full flex flex-col items-center lg:items-start gap-1 pt-2">
              <span className="text-xs font-bold text-[#A87B62] tracking-wider uppercase">Active Mission</span>
              <span className="text-[10px] text-gray-400 font-medium font-inter">456+ Meals Donated</span>
            </div>
          </div>

          {/* Right Content - Split Reaction Videos */}
          <div className="lg:w-[60%] p-6 md:p-12 lg:p-16 flex flex-col sm:flex-row gap-6 bg-white items-center justify-center">
            {/* Video 1 Container */}
            <div 
              onClick={toggleMute1}
              className="relative w-full sm:w-1/2 aspect-[9/16] max-w-[280px] rounded-[2rem] overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-500 border-4 border-[#FAF7F2]"
            >
              <video
                ref={videoRef1}
                src={getCloudinaryUrl("socialproof/Social proof video -1.mp4")}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Top Tag */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 z-10">
                <Sparkles size={10} className="text-[#A87B62]" />
                Real Reaction
              </div>

              {/* Mute and Caption Overlays */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-all duration-300 flex flex-col justify-between p-4">
                <div className="flex justify-end">
                  <button className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-gray-800 shadow-md transform transition-transform group-hover:scale-110">
                    {isMuted1 ? <VolumeX size={14} /> : <Volume2 size={14} className="animate-pulse" />}
                  </button>
                </div>
                
                {/* Bottom Caption Pill */}
                <div className="bg-black/75 backdrop-blur-sm p-4 rounded-2xl border border-white/10 transform transition-all duration-300 text-white">
                  <p className="text-[9px] text-gray-300 font-inter font-medium leading-tight">"Every portrait ordered feeds a hungry shelter pup! 🐾"</p>
                </div>
              </div>
            </div>

            {/* Video 2 Container */}
            <div 
              onClick={toggleMute2}
              className="relative w-full sm:w-1/2 aspect-[9/16] max-w-[280px] rounded-[2rem] overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-500 border-4 border-[#FAF7F2] sm:-translate-y-4"
            >
              <video
                ref={videoRef2}
                src={getCloudinaryUrl("socialproof/Social proof video - 2.mp4")}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Top Tag */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 z-10">
                <Heart size={10} className="text-red-400 fill-red-400" />
                Pure Joy
              </div>

              {/* Mute and Caption Overlays */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-all duration-300 flex flex-col justify-between p-4">
                <div className="flex justify-end">
                  <button className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-gray-800 shadow-md transform transition-transform group-hover:scale-110">
                    {isMuted2 ? <VolumeX size={14} /> : <Volume2 size={14} className="animate-pulse" />}
                  </button>
                </div>

                {/* Bottom Caption Pill */}
                <div className="bg-black/75 backdrop-blur-sm p-4 rounded-2xl border border-white/10 transform transition-all duration-300 text-white">
                  <p className="text-[9px] text-gray-300 font-inter font-medium leading-tight">"Helping stray & shelter animals, one meal at a time! ❤️"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
