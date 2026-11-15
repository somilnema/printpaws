"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMedia, useUploadedMedia } from "@/components/SiteMedia";
import { FRAMED_UNAVAILABLE, isOptionSelectable, type OptionMeta } from "@/lib/pricing";
import { uploadedKey } from "@/lib/site-media-catalog";

/** Pop-up wording. Configurator pages pass the admin's text; the rest use these defaults. */
export type StylePreviewCopy = {
  title: string;
  framedTitle: string;
  framedTagline: string;
  canvasTitle: string;
  canvasTagline: string;
  unavailable: string;
};

const DEFAULT_COPY: StylePreviewCopy = {
  title: "Framed vs Canvas",
  framedTitle: "Framed Portrait",
  framedTagline: "Ready to Hang • Classic Look",
  canvasTitle: "Canvas Portrait",
  canvasTagline: "Gallery Wrapped • Premium",
  unavailable: FRAMED_UNAVAILABLE,
};

const STYLE_IMAGES = { framed: "/framestyle/black-frame.png", canvas: "/framestyle/canvas-frame.png" } as const;

export function PortraitStyleInfographic({
  open,
  onClose,
  styleOptions,
  mediaPrefix,
  copy = DEFAULT_COPY,
}: {
  open: boolean;
  onClose: () => void;
  styleOptions?: { canvas?: OptionMeta; framed?: OptionMeta };
  /** Configurator product ("everyday", "multi-pet", "you-pet"): its own infographic and photos win. */
  mediaPrefix?: string;
  copy?: StylePreviewCopy;
}) {
  const media = useMedia();
  const own = (name: string) => (mediaPrefix ? media(uploadedKey(`${mediaPrefix}-${name}`)) : "");
  const sharedInfographic = useUploadedMedia("style-infographic");
  const infographic = own("style-infographic") || sharedInfographic;
  const framedAvailable = isOptionSelectable(styleOptions?.framed);
  const styles = [
    { id: "framed" as const, title: copy.framedTitle, image: own("preview-framed") || STYLE_IMAGES.framed, tagline: copy.framedTagline },
    { id: "canvas" as const, title: copy.canvasTitle, image: own("preview-canvas") || STYLE_IMAGES.canvas, tagline: copy.canvasTagline },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Framed vs canvas portrait"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#1a1a1b] shadow-md hover:bg-white"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
            {infographic ? (
              <div>
                <img src={infographic} alt="Framed portrait vs canvas portrait" className="block h-auto w-full" />
                {!framedAvailable && (
                  <p className="px-5 py-3 text-center text-xs font-medium text-gray-500">{copy.unavailable}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4 p-5 pt-12">
                <h3 className="text-center text-lg font-black text-[#1a1a1b]">{copy.title}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map((style) => {
                    const available = isOptionSelectable(styleOptions?.[style.id]);
                    return (
                      <div key={style.id} className="space-y-2 text-center">
                        <div className={`overflow-hidden rounded-2xl border border-gray-100 bg-[#f6f3ef] ${available ? "" : "opacity-50"}`}>
                          <img src={style.image} alt={style.title} className="aspect-square w-full object-cover" />
                        </div>
                        <p className="text-sm font-black text-[#1a1a1b]">{style.title}</p>
                        <p className="text-[11px] font-medium text-gray-500">
                          {available ? style.tagline : copy.unavailable.replace(/\.$/, "")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
