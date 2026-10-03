"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint } from "lucide-react";
import { SAVE_WHEEL, saveOfferRestingRotation, type SaveSlice } from "@/lib/save-offer";

const SLICE_FILL = ["#A87B62", "#F6EBE3", "#2A332C", "#E7C4A8", "#8C6A58", "#F4D7CE"];
const SLICE_INK = ["#FFFFFF", "#3C2A22", "#FFFFFF", "#3C2A22", "#FFFFFF", "#3C2A22"];

function slicePath(index: number, count: number, radius = 46) {
  const start = (index / count) * Math.PI * 2 - Math.PI / 2;
  const end = ((index + 1) / count) * Math.PI * 2 - Math.PI / 2;
  const x0 = 50 + radius * Math.cos(start);
  const y0 = 50 + radius * Math.sin(start);
  const x1 = 50 + radius * Math.cos(end);
  const y1 = 50 + radius * Math.sin(end);
  return `M 50 50 L ${x0} ${y0} A ${radius} ${radius} 0 0 1 ${x1} ${y1} Z`;
}

function PrizeWheel({
  rotation,
  spinning,
  onSettled,
}: {
  rotation: number;
  spinning: boolean;
  onSettled: () => void;
}) {
  const count = SAVE_WHEEL.length;
  return (
    <div className="relative mx-auto h-[232px] w-[232px]">
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
        <div
          className="h-0 w-0 border-x-[9px] border-x-transparent border-t-[14px] border-t-[#1a1a1b]"
          style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))" }}
        />
      </div>
      <motion.div
        className="h-full w-full"
        animate={{ rotate: rotation }}
        initial={false}
        transition={
          spinning
            ? { duration: 4.2, ease: [0.12, 0.72, 0.08, 1] }
            : { duration: 0 }
        }
        onAnimationComplete={() => {
          if (spinning) onSettled();
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md">
          <circle cx="50" cy="50" r="49" fill="#fff" />
          {SAVE_WHEEL.map((slice, index) => {
            const mid = ((index + 0.5) / count) * Math.PI * 2 - Math.PI / 2;
            const tx = 50 + 31 * Math.cos(mid);
            const ty = 50 + 31 * Math.sin(mid);
            return (
              <g key={`${slice.code}-${index}`}>
                <path d={slicePath(index, count)} fill={SLICE_FILL[index]} stroke="#fff" strokeWidth="0.7" />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={SLICE_INK[index]}
                  fontSize="6.2"
                  fontWeight="700"
                  fontFamily="Inter, ui-sans-serif, sans-serif"
                  transform={`rotate(${(index + 0.5) * (360 / count)} ${tx} ${ty})`}
                >
                  {slice.short}
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-white">
          <PawPrint size={22} className="text-[#A87B62]" />
        </div>
      </div>
    </div>
  );
}

export function SaveOfferModal({
  petName,
  slice,
  sliceIndex,
  alreadyRevealed,
  savingsLabel,
  payNowLabel,
  previousPayLabel,
  keepCurrent,
  currentCode,
  currentSavingsLabel,
  claiming,
  error,
  onRevealed,
  onClaim,
  onLeave,
}: {
  petName: string;
  slice: SaveSlice;
  sliceIndex: number;
  alreadyRevealed: boolean;
  savingsLabel: string;
  payNowLabel: string;
  previousPayLabel: string;
  keepCurrent: boolean;
  currentCode: string | null;
  currentSavingsLabel: string;
  claiming: boolean;
  error: string | null;
  onRevealed: () => void;
  onClaim: () => void;
  onLeave: () => void;
}) {
  const [revealed, setRevealed] = useState(alreadyRevealed);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(alreadyRevealed ? saveOfferRestingRotation(sliceIndex) : 0);
  const settled = useRef(alreadyRevealed);
  const name = petName.trim();

  const settle = () => {
    if (settled.current) return;
    settled.current = true;
    setSpinning(false);
    setRevealed(true);
    onRevealed();
  };

  const spin = () => {
    if (spinning || revealed) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const turns = reduceMotion ? 0 : 6;
    setSpinning(true);
    setRotation(saveOfferRestingRotation(sliceIndex) + 360 * turns);
    if (reduceMotion) settle();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-offer-title"
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#A87B62]" />
        <div className="flex flex-col items-center text-center">
          <h3 id="save-offer-title" className="text-lg font-black text-[#1a1a1b] uppercase tracking-tight font-playfair">
            Before you go
          </h3>
          <p className="mt-2 text-sm font-medium text-gray-500 leading-relaxed">
            {name ? `${name}'s portrait is still saved.` : "Your portrait is still saved."} You have not been charged.
            Spin once and the discount goes on this order.
          </p>

          <div className="my-5">
            <PrizeWheel rotation={rotation} spinning={spinning} onSettled={settle} />
          </div>

          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full space-y-3"
              >
                <div className="rounded-2xl bg-[#faf8f5] px-4 py-3">
                  {keepCurrent ? (
                    <>
                      <p className="text-sm font-black text-[#1a1a1b]">You already have a better offer</p>
                      <p className="mt-1 text-xs font-medium text-gray-500 leading-relaxed">
                        {currentCode} saves {currentSavingsLabel}. The wheel landed on {slice.label}, so we kept your current discount.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#A87B62]">{slice.label}</p>
                      <p className="mt-1 text-sm font-black text-[#1a1a1b]">You save {savingsLabel}</p>
                      <p className="mt-1 text-xs font-medium text-gray-500">
                        Pay now {payNowLabel}
                        {previousPayLabel !== payNowLabel ? (
                          <span className="ml-1.5 line-through text-gray-400">{previousPayLabel}</span>
                        ) : null}
                      </p>
                    </>
                  )}
                </div>
                {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}
                <button
                  type="button"
                  onClick={onClaim}
                  disabled={claiming}
                  className="w-full py-3 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#2F2F2F] transition-colors shadow-md active:scale-[0.98] disabled:opacity-60"
                >
                  {claiming ? "Applying..." : keepCurrent ? "Try payment again" : "Apply discount & try again"}
                </button>
                <button
                  type="button"
                  onClick={onLeave}
                  disabled={claiming}
                  className="w-full py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#1a1a1b] disabled:opacity-60"
                >
                  No thanks, go back
                </button>
              </motion.div>
            ) : (
              <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-2">
                <button
                  type="button"
                  onClick={spin}
                  disabled={spinning}
                  className="w-full py-3 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#2F2F2F] transition-colors shadow-md active:scale-[0.98] disabled:opacity-60"
                >
                  {spinning ? "Spinning..." : "Spin for a discount"}
                </button>
                <button
                  type="button"
                  onClick={onLeave}
                  disabled={spinning}
                  className="w-full py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#1a1a1b] disabled:opacity-60"
                >
                  No thanks, go back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
