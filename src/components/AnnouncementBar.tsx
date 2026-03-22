"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-white py-2 px-4 flex items-center justify-between text-xs sm:text-sm font-medium">
      <button className="p-1 hover:opacity-80 transition-opacity">
        <ChevronLeft size={16} />
      </button>
      <div className="flex-1 text-center">
        100% Satisfaction Guarantee
      </div>
      <button className="p-1 hover:opacity-80 transition-opacity">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
