"use client";

import { useEffect, useState } from "react";

export function WhatsAppButton() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onOverlay = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setHidden(!!detail);
    };
    window.addEventListener("overlayOpen", onOverlay);
    return () => window.removeEventListener("overlayOpen", onOverlay);
  }, []);

  if (hidden) return null;

  return (
    <a
      href="https://wa.me/917999519434?text=Hi!%20I'm%20customizing%20a%20pet%20portrait%20and%20had%20a%20question!"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.35)] hover:scale-105 active:scale-95 transition-transform duration-200 group"
      aria-label="Chat with us on WhatsApp"
    >
      <svg className="relative w-6 h-6 md:w-7 md:h-7 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.794-4.382 9.797-9.786.001-2.617-1.01-5.078-2.85-6.918C16.37 2.062 13.916.97 11.306.97c-5.41.003-9.802 4.39-9.805 9.795-.001 1.77.462 3.5 1.34 5.025l-.95 3.473 3.56-.933zm11.238-6.84c-.31-.156-1.83-.903-2.112-1.004-.282-.102-.489-.153-.69.155-.203.307-.785.99-.963 1.196-.178.205-.355.23-.665.074-.31-.156-1.31-.483-2.493-1.54-1.183-1.055-1.183-1.055-2.096-1.536-.913-.48-.913-.48-.155-1.312.28-.307.31-.462.464-.77.154-.307.077-.577-.038-.782-.115-.205-.963-2.317-1.316-3.17-.344-.833-.694-.72-1.005-.722h-.854c-.282 0-.742.106-1.13.53-.388.423-1.48 1.446-1.48 3.528 0 2.082 1.516 4.09 1.727 4.38.21.291 2.984 4.557 7.228 6.388 1.01.436 1.8.697 2.413.89 1.014.322 1.937.276 2.666.168.812-.12 1.832-.748 2.086-1.434.254-.686.254-1.274.178-1.4-.076-.127-.282-.205-.592-.361z" fill="currentColor"/>
      </svg>
      <span className="hidden md:block absolute right-full mr-3 bg-white text-[#1a1a1b] px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us
      </span>
    </a>
  );
}
