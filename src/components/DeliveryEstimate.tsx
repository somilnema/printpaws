"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, MapPin, Truck } from "lucide-react";

const PIN_PATTERN = /^[1-9][0-9]{5}$/;
const CHECK_DELAY_MS = 1500;
const MIN_DAYS = 8;
const MAX_DAYS = 12;

type Status = "idle" | "checking" | "done" | "invalid";

function formatDay(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function DeliveryEstimate() {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (pin.length < 6) {
      setStatus("idle");
      return;
    }
    if (!PIN_PATTERN.test(pin)) {
      setStatus("invalid");
      return;
    }
    setStatus("checking");
    const timer = setTimeout(() => setStatus("done"), CHECK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pin]);

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl border-[1.5px] border-[#A87B62]/40 bg-gradient-to-br from-[#fdf6f0] via-[#fcf8f5] to-[#f6ebe2] p-4 shadow-[0_6px_20px_-8px_rgba(168,123,98,0.45)]">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#A87B62]/10" />

      <div className="relative flex items-center gap-3">
        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#A87B62] text-white shadow-md">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#A87B62]/30" />
          <Truck size={18} strokeWidth={2} className="relative" />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-black text-[#1a1a1b] leading-tight">When will I receive my order?</p>
          <p className="text-[11px] font-medium text-gray-500 mt-0.5">Enter your PIN code to check delivery time</p>
        </div>
      </div>

      <div className="relative mt-3">
        <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A87B62]" />
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit PIN code"
          aria-label="PIN code"
          className={`w-full rounded-xl border-[1.5px] bg-white py-3 pl-10 pr-11 text-sm font-bold tracking-[0.2em] text-[#1a1a1b] outline-none transition-all placeholder:font-medium placeholder:tracking-normal placeholder:text-gray-400 ${
            status === "invalid"
              ? "border-red-400"
              : status === "done"
                ? "border-green-500"
                : "border-[#e8d8cc] focus:border-[#A87B62]"
          }`}
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {status === "checking" && <Loader2 size={18} className="animate-spin text-[#A87B62]" />}
          {status === "done" && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="block">
              <CheckCircle2 size={20} className="text-green-600" strokeWidth={2.5} />
            </motion.span>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === "invalid" && (
          <motion.p
            key="invalid"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative mt-2 text-[11px] font-bold text-red-500"
          >
            Please enter a valid 6-digit PIN code.
          </motion.p>
        )}
        {status === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative mt-3 flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-3.5 py-3"
          >
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-green-600" strokeWidth={2.5} />
            <div>
              <p className="text-[13px] font-black text-green-800">
                Estimated delivery: {MIN_DAYS}–{MAX_DAYS} days
              </p>
              <p className="text-[11px] font-medium text-green-700 mt-0.5">
                Expected between {formatDay(MIN_DAYS)} – {formatDay(MAX_DAYS)} to PIN {pin}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
