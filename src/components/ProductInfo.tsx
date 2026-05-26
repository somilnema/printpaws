"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Upload,
  Star,
  ChevronDown,
  Check,
  Undo2,
  Truck,
  ShieldCheck,
  PawPrint,
  Heart as HeartIcon,
  ArrowRight,
  ArrowLeft,
  Package,
  ShoppingBag
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getCloudinaryUrl } from "@/utils/cloudinary";

const SIZES = ['8"x10"', '12"x16"', '18"x24"', '24"x24"'];
const FRAMES = [
  { id: "black", label: "the Black", image: "/framestyle/black-frame.png" },
  { id: "white", label: "pure White", image: "/framestyle/white-frame.png" },
  { id: "wood", label: "premium Wood", image: "/framestyle/wooden-frame.png" },
  { id: "canva", label: "Canvas", image: "/framestyle/canvas-frame.png" },
];
const PET_OPTIONS = [
  { id: "one", label: "One", image: "/no-of-pets/one-pet.png" },
  { id: "two", label: "Two", image: "/no-of-pets/two-pet.png" },
  { id: "three", label: "Three", image: "/no-of-pets/three-pet.png" },
  { id: "four", label: "Four", image: "/no-of-pets/four-pet.png" },
];


type BackgroundType = { name: string; value: string; textColor: string; isImage?: boolean };
const BACKGROUNDS: BackgroundType[] = [
  { name: "Pearl", value: "#f9f9f7", textColor: "#d1d1cf" },
  { name: "Almond", value: "#f3e4d4", textColor: "#c4a484" },
  { name: "Serenity", value: "#f0e9f9", textColor: "#c4b5d4" },
  { name: "Celadon", value: "#b8cfc1", textColor: "#ffffff" },
  { name: "Tea Rosé", value: "#f3ccc6", textColor: "#ffffff" },
  { name: "Black", value: "#000000", textColor: "#ffffff" },
  // { name: "bg7", value: "/bg7.png", textColor: "#ffffff", isImage: true },
  // { name: "bg8", value: "/bg8.png", textColor: "#ffffff", isImage: true },
  // { name: "bg9", value: "/bg9.png", textColor: "#ffffff", isImage: true }
];

const ADD_ONS = [
  // { id: "bowtie_bonus", label: "Bow Tie (Bonus)", image: "/bonus-image/bow-tie.png" },
  { id: "halo_effect", label: "Halo Effect", image: "/bonus-image/halo-effect.png" },
  // { id: "heart", label: "Heart", image: "/bonus-image/heart.png" },
];

export function ProductInfo() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState('8"x10"');
  const [selectedFrame, setSelectedFrame] = useState("black");
  const [selectedPets, setSelectedPets] = useState("one");
  const [selectedBg, setSelectedBg] = useState("Pearl");
  const [selectedAddOn, setSelectedAddOn] = useState("none");
  const [giftWrap, setGiftWrap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [petName, setPetName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartQty, setCartQty] = useState(1);
  const [addMagnet, setAddMagnet] = useState(false);
  const [addMug, setAddMug] = useState(false);
  const [addDigitalDownload, setAddDigitalDownload] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("/feature-detail.png");
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxOrderData, setSandboxOrderData] = useState<any>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPhotoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  // 1. Listen for global cart toggles (e.g. from the Navbar)
  useEffect(() => {
    const handleToggleCart = () => {
      setShowCart(prev => !prev);
    };
    window.addEventListener('toggleCart', handleToggleCart);
    return () => window.removeEventListener('toggleCart', handleToggleCart);
  }, []);

  // 2. Load customizer choices & cart details from persisted cache on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('peternity_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedSize) setSelectedSize(parsed.selectedSize);
        if (parsed.selectedFrame) setSelectedFrame(parsed.selectedFrame);
        if (parsed.selectedPets) setSelectedPets(parsed.selectedPets);
        if (parsed.selectedBg) setSelectedBg(parsed.selectedBg);
        if (parsed.selectedAddOn) setSelectedAddOn(parsed.selectedAddOn);
        if (parsed.giftWrap !== undefined) setGiftWrap(parsed.giftWrap);
        if (parsed.petName) setPetName(parsed.petName);
        if (parsed.cartQty) setCartQty(parsed.cartQty);
        if (parsed.addMagnet !== undefined) setAddMagnet(parsed.addMagnet);
        if (parsed.addMug !== undefined) setAddMug(parsed.addMug);
        if (parsed.addDigitalDownload !== undefined) setAddDigitalDownload(parsed.addDigitalDownload);
      }
    } catch (e) {
      console.warn("Failed to load persisted cart cache:", e);
    }
  }, []);

  // 3. Keep cache synchronized in localStorage when configurations change
  useEffect(() => {
    const cartState = {
      selectedSize,
      selectedFrame,
      selectedPets,
      selectedBg,
      selectedAddOn,
      giftWrap,
      petName,
      cartQty,
      addMagnet,
      addMug,
      addDigitalDownload,
      hasCustomizedItem: !!selectedFile || !!petName
    };
    try {
      localStorage.setItem('peternity_cart', JSON.stringify(cartState));
      
      // Dispatch cart count dynamically for the Navbar badge
      const count = (selectedFile || petName) ? (1 + (addMagnet ? 1 : 0) + (addMug ? 1 : 0)) : 0;
      window.dispatchEvent(new CustomEvent('cartBadgeUpdated', { detail: count }));
    } catch (e) {
      console.warn("Failed to sync cart to cache:", e);
    }
  }, [
    selectedSize,
    selectedFrame,
    selectedPets,
    selectedBg,
    selectedAddOn,
    giftWrap,
    petName,
    cartQty,
    addMagnet,
    addMug,
    addDigitalDownload,
    selectedFile
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      content: "Didn’t think I’d get emotional over a portrait honestly… but they captured him so perfectly. My family loved it instantly.",
      author: "Vaidehi",
      avatar: getCloudinaryUrl("review bar image 1.jpg.jpeg")
    }
  ];

  const testimonialIndex = 0;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  const calculatePrice = () => {
    // ── Step 5: Frame Size → this is the BASE (full price for 1 pet) ─────────
    const sizePrice: Record<string, number> = {
      '8"x10"':  1499,
      '12"x16"': 1999,
      '18"x24"': 2499,
      '24"x24"': 3000,
    };
    let price = sizePrice[selectedSize] ?? 1499;

    // ── Step 1: Pet count upgrade (added on top of size price) ───────────────
    // Each extra pet adds +500 to the size base price
    const petUpgrade: Record<string, number> = {
      one:   0,
      two:   500,   // +500
      three: 1000,  // +1000
      four:  1500,  // +1500
    };
    price += petUpgrade[selectedPets] ?? 0;

    // ── Step 2: Frame Style ───────────────────────────────────────────────────
    // Black / White / Wood → no extra charge
    // Canvas → own price table (18×24 base 3799, 24×24 base 4499) + pet upgrade
    if (selectedFrame === "canva") {
      const canvasSizePrice: Record<string, number> = {
        '18"x24"': 3799,
        '24"x24"': 4499,
      };
      const petIndex = ["one", "two", "three", "four"].indexOf(selectedPets);
      price = (canvasSizePrice[selectedSize] ?? 3799) + petIndex * 500;
    }

    // ── Step 3: Background ───────────────────────────────────────────────────
    // bg7 / bg8 / bg9 → fixed +199 regardless of pet count
    if (["bg7", "bg8", "bg9"].includes(selectedBg)) price += 199;

    // ── Step 4: Bonus Add-on ─────────────────────────────────────────────────
    // Halo → +200 fixed | Normal (bowtie, heart) → +100 fixed
    if (selectedAddOn === "halo_effect") price += 200;
    else if (selectedAddOn !== "none") price += 100;

    // ── Gift Wrap ────────────────────────────────────────────────────────────
    if (giftWrap) price += 99;

    return price;
  };

  // Selling price + cut price is always 30% higher
  const totalPrice = calculatePrice();
  const cutPrice = Math.round(totalPrice / 0.70);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => {
    setCurrentStep(prev => {
      const nextStepVal = Math.max(prev - 1, 1);
      
      // Reset the selection of the step we are leaving when going back
      if (prev === 2) {
        setSelectedFrame("black");
        window.dispatchEvent(new CustomEvent('frameSelectionChanged', { detail: "black" }));
      } else if (prev === 3) {
        setSelectedBg("Pearl");
        window.dispatchEvent(new CustomEvent('backgroundSelectionChanged', { detail: "Pearl" }));
      } else if (prev === 4) {
        setSelectedAddOn("none");
      } else if (prev === 5) {
        setSelectedSize('8"x10"');
      } else if (prev === 6) {
        setGiftWrap(false);
      }
      
      return nextStepVal;
    });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const submitFinalOrder = async (
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
    finalAmount: number
  ) => {
    setIsSubmitting(true);
    setOrderStatus('idle');

    try {
      // 1. Upload File to Supabase Storage
      let publicUrl = "";
      try {
        if (selectedFile) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `orders/${Date.now()}-${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('pet-photos')
            .upload(filePath, selectedFile);

          if (uploadError) {
            throw uploadError;
          }

          const { data: { publicUrl: url } } = supabase.storage
            .from('pet-photos')
            .getPublicUrl(filePath);
          publicUrl = url;
        }
      } catch (uploadError: any) {
        console.warn("Supabase Storage Upload Failed. Falling back to local object URL:", uploadError);
        if (selectedFile) {
          publicUrl = URL.createObjectURL(selectedFile);
        }
      }

      // 2. Submit Order to API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: selectedSize,
          frameStyle: selectedFrame,
          numPets: selectedPets,
          background: selectedBg,
          addon: selectedAddOn,
          petName: petName || "My Pet",
          giftWrap: giftWrap,
          customerEmail: customerEmail,
          totalPrice: finalAmount,
          photoUrl: publicUrl,
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOrderStatus('success');
        // Clear cart cached details
        localStorage.removeItem('peternity_cart');
        // Redirect to success page
        router.push(`/checkout/success?orderId=${result.orderId}`);
      } else {
        setOrderStatus('error');
        router.push(`/checkout/failed?reason=${encodeURIComponent(result.error || 'Server failed to record order specifications.')}`);
      }
    } catch (err: any) {
      console.error("Checkout Submit Order Error:", err);
      setOrderStatus('error');
      router.push(`/checkout/failed?reason=${encodeURIComponent(err.message || 'Failed to submit finalized order data.')}`);
    } finally {
      setIsSubmitting(false);
      setShowSandboxModal(false);
    }
  };

  const handleCheckout = async (customTotal?: number) => {
    setIsSubmitting(true);
    setOrderStatus('idle');

    if (!customerEmail) {
      alert("Please enter your email to continue!");
      setCurrentStep(6);
      setIsSubmitting(false);
      return;
    }

    if (!petName) {
      alert("Please enter your pet's name!");
      setCurrentStep(6);
      setIsSubmitting(false);
      return;
    }

    if (!selectedFile) {
      alert("Please choose a pet photo to continue!");
      setCurrentStep(6);
      setIsSubmitting(false);
      return;
    }

    const checkoutTotal = customTotal ?? totalPrice;

    try {
      // 1. Fetch Razorpay Order from server endpoint
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: checkoutTotal }),
      });

      if (!res.ok) {
        throw new Error("Failed to initialize Razorpay Order endpoint");
      }

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Order creation failure");
      }

      const isMock = orderData.isMock || orderData.keyId === "rzp_test_mockKey123";

      if (isMock) {
        // Trigger Developer Sandbox Modal for offline testing
        setSandboxOrderData({
          orderId: orderData.orderId,
          amount: checkoutTotal,
          keyId: orderData.keyId,
        });
        setShowSandboxModal(true);
        setIsSubmitting(false);
      } else {
        // Real checkout with Razorpay SDK
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Razorpay SDK failed to load. Please verify your connection.");
        }

        const options = {
          key: orderData.keyId,
          amount: Math.round(checkoutTotal * 100), // paise
          currency: "INR",
          name: "Peternity",
          description: "Custom Pet Portrait Masterpiece",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            await submitFinalOrder(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              checkoutTotal
            );
          },
          prefill: {
            email: customerEmail,
          },
          theme: {
            color: "#A87B62",
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              router.push("/checkout/failed?reason=dismissed");
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
      }
    } catch (err: any) {
      console.error("Razorpay Checkout Error:", err);
      setOrderStatus('error');
      setIsSubmitting(false);
      router.push(`/checkout/failed?reason=${encodeURIComponent(err.message || 'Failed to initiate secure payment portal.')}`);
    }
  };

  const handleAddToCartClick = () => {
    if (!customerEmail) {
      alert("Please enter your email to continue!");
      setCurrentStep(6);
      return;
    }

    if (!petName) {
      alert("Please enter your pet's name!");
      setCurrentStep(6);
      return;
    }

    if (!selectedFile) {
      alert("Please choose a pet photo to continue!");
      setCurrentStep(6);
      return;
    }

    setShowCart(true);
  };

  const hasCustomizedItem = !!selectedFile || !!petName;

  return (
    <div ref={containerRef} className="flex flex-col gap-0 scroll-mt-24">
      {/* Header Info */}
      <div className="lg:space-y-4 space-y-1">
        <div className="hidden lg:flex items-center gap-1.5">
          <div className="flex gap-0.5 items-center">
            {[...Array(4)].map((_, i) => (
              <Star key={i} size={14} className="fill-[#FFB800] text-[#FFB800]" />
            ))}
            <div className="relative w-3.5 h-3.5 flex-shrink-0">
              <Star size={14} className="text-[#FFB800] opacity-30" />
              <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                <Star size={14} className="fill-[#FFB800] text-[#FFB800]" />
              </div>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-400 ml-1">145 Reviews</span>
        </div>
        <h1 className="hidden lg:block text-5xl lg:text-[56px] font-normal text-[#1a1a1b] leading-tight font-playfair tracking-tight">
          Custom Pet Portrait
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-xl font-medium text-[#1a1a1b] font-inter">Rs. {totalPrice}.00</span>
          <span className="text-[20px] font-medium text-[#A87B62] line-through font-inter opacity-80">Rs. {cutPrice}.00</span>
          <span className="bg-[#FF9494] text-white text-[10px] font-bold px-2 py-1 rounded-full tracking-wider">
            30% OFF
          </span>
        </div>
      </div>

      <hr className="hidden lg:block border-gray-100 my-2" />

      {/* Mobile-Only Trust Section */}
      <div className="lg:hidden space-y-4 mb-6 mt-2">
        {/* Review Card */}
        <div className="bg-[#1a1a1b] text-white p-4 rounded-3xl flex items-center gap-4 shadow-lg mx-1 transform -translate-y-1.5">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
            <Image 
              src={getCloudinaryUrl("Nandini review image.jpg.jpeg")} 
              alt="Review attachment" 
              fill 
              className="object-cover" 
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-sm font-bold tracking-tight">Nandini</span>
              <div className="flex gap-[2px]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-[#FFB800] text-[#FFB800]" />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 italic">"My whole family loved it"</p>
          </div>
        </div>

        {/* Font Info Text */}
        <div className="flex items-start gap-3 px-2">
          <Package size={18} className="text-[#A87B62] opacity-70 mt-0.5" />
          <p className="text-[12px] text-gray-500 font-medium leading-tight">
            Choose from <span className="text-[#A87B62] font-bold">20+ unique font options</span>, selected once your artwork is approved.
          </p>
        </div>
      </div>

      {/* Step Navigator */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Step {currentStep} of 6
          </span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            {Math.round((currentStep / 6) * 100)}% Complete
          </span>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 6) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
      </div>

      {/* Selectors with Transitions */}
      <div className="relative min-h-[250px] md:min-h-[240px]">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="block text-base font-medium text-[#1a1a1b]">
                    Step 1: Number of Pets
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PET_OPTIONS.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => {
                        setSelectedPets(pet.id);
                        window.dispatchEvent(new CustomEvent('petSelectionChanged', { detail: pet.id }));
                      }}
                      className={`group relative aspect-square rounded-xl border-[2.5px] transition-all overflow-hidden ${selectedPets === pet.id
                        ? "border-[#1a1a1b] shadow-xl scale-[1.02] z-10"
                        : "border-gray-100 hover:border-gray-200"
                        }`}
                      style={{ backgroundImage: `url(${getCloudinaryUrl(pet.image)})`, backgroundSize: "92%", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}
                    >
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${selectedPets === pet.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <span className="text-white font-bold uppercase tracking-widest text-[10px]">{pet.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={nextStep}
                  className="w-full py-4 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-sm mt-4 hover:bg-[#2F2F2F] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <label className="block text-base font-medium text-[#1a1a1b]">
                    Step 2: Frame Style
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FRAMES.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => {
                        setSelectedFrame(frame.id);
                        // Canvas only supports 18×24 and 24×24 — reset size if needed
                        if (frame.id === "canva" && !['18"x24"', '24"x24"'].includes(selectedSize)) {
                          setSelectedSize('18"x24"');
                        }
                        window.dispatchEvent(new CustomEvent('frameSelectionChanged', { detail: frame.id }));
                      }}
                      className={`group relative aspect-square rounded-xl border-[2.5px] transition-all overflow-hidden ${selectedFrame === frame.id
                        ? "border-[#1a1a1b] shadow-xl scale-[1.02] z-10"
                        : "border-gray-100 hover:border-gray-200"
                        }`}
                      style={{ backgroundImage: `url(${getCloudinaryUrl(frame.image)})`, backgroundSize: "92%", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}
                    >
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${selectedFrame === frame.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <span className="text-white font-bold uppercase tracking-widest text-[10px]">{frame.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={nextStep}
                  className="w-full py-4 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-sm mt-4 hover:bg-[#2F2F2F] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <label className="block text-base font-medium text-[#1a1a1b]">
                    Step 3: Background Colour
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => {
                        setSelectedBg(bg.name);
                        window.dispatchEvent(new CustomEvent('backgroundSelectionChanged', { detail: bg.name }));
                      }}
                      className={`group relative aspect-square rounded-xl border-[1.5px] transition-all overflow-hidden flex items-center justify-center shadow-sm ${selectedBg === bg.name
                        ? "border-[#1a1a1b] scale-[1.02] z-10 shadow-md"
                        : "border-gray-100 hover:border-gray-200"
                        }`}
                      style={{ 
                        backgroundColor: bg.isImage ? undefined : bg.value,
                        backgroundImage: bg.isImage ? `url(${bg.value})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!bg.isImage ? (
                        <span 
                          className="text-xs font-serif opacity-90 select-none tracking-tight font-bold" 
                          style={{ 
                            color: bg.textColor,
                          }}
                        >
                          {bg.name}
                        </span>
                      ) : (
                        <>
                          {/* Price badge on the right side */}
                          <div className="absolute top-1.5 right-1.5 z-10">
                            <span className="text-[8px] font-black text-white bg-black/60 px-1 py-0.5 rounded font-inter tracking-wider">
                              +199
                            </span>
                          </div>
                          {/* Centered Limited Edition text at the bottom */}
                          <div className="absolute bottom-1.5 inset-x-0 flex justify-center z-10">
                            <span className="text-[7px] md:text-[8px] font-black text-white bg-[#A87B62] px-1.5 py-0.5 rounded font-inter tracking-wide uppercase shadow-sm">
                              Limited Edition
                            </span>
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={nextStep}
                  className="w-full py-4 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-sm mt-4 hover:bg-[#2F2F2F] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <label className="block text-base font-medium text-[#1a1a1b]">
                    Step 4: Bonus Icon Image
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {ADD_ONS.map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => setSelectedAddOn(addon.id)}
                      className={`group relative aspect-square rounded-xl border-[2.5px] transition-all overflow-hidden ${selectedAddOn === addon.id
                        ? "border-[#1a1a1b] shadow-xl scale-[1.02] z-10"
                        : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      {/* Price badge in the top-right corner of the button */}
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <span className="text-[8px] font-black text-white bg-black/60 px-1 py-0.5 rounded font-inter tracking-wider">
                          {addon.id === "halo_effect" ? "+199" : "+99"}
                        </span>
                      </div>
                      <Image
                        src={addon.image}
                        alt={addon.label}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${selectedAddOn === addon.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <span className="text-white font-bold uppercase tracking-widest text-[10px]">{addon.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => {
                      setSelectedAddOn("none");
                      nextStep();
                    }}
                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-sm hover:bg-gray-200 transition-all shadow-sm active:scale-[0.98]"
                  >
                    Skip
                  </button>
                  <button 
                    onClick={nextStep}
                    className="flex-[2] py-4 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-sm hover:bg-[#2F2F2F] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <label className="block text-base font-medium text-[#1a1a1b]">
                    Step 5: Frame Size
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(selectedFrame === "canva" ? ['18"x24"', '24"x24"'] : SIZES).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-full py-2.5 rounded-lg border-[1.5px] font-bold transition-all text-[13px] flex justify-between px-4 items-center ${selectedSize === size
                        ? "border-[#1a1a1b] bg-[#f7f7f7] text-[#1a1a1b] shadow-sm scale-[1.01]"
                        : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
                        }`}
                    >
                      <span>{size}</span>
                      {selectedSize === size && <Check size={18} />}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={nextStep}
                  className="w-full py-4 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-sm mt-4 hover:bg-[#2F2F2F] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-5">
                <div className="flex justify-between items-center mb-2">
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <label className="block text-base font-medium text-[#1a1a1b]">
                    Step 6: Final Details
                  </label>
                </div>

                {/* Pet Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Pet's Name
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Enter pet name..."
                    className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg focus:border-[#1a1a1b] outline-none transition-all font-inter text-xs"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="order@example.com"
                    className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg focus:border-[#1a1a1b] outline-none transition-all font-inter text-xs"
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Upload Photo
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPhotoGuide(true)}
                      className="text-[10px] font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-wider flex items-center gap-1 bg-[#A87B62]/10 px-2 py-0.5 rounded-full"
                    >
                      💡 Photo Guide
                    </button>
                  </div>
                  <div className="border-[1.5px] border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                    <input 
                      type="file" 
                      id="pet-photo-upload"
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                    <label 
                      htmlFor="pet-photo-upload"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-50 text-[#1a1a1b] border-[1.5px] border-gray-200 rounded-lg font-bold transition-all shadow-sm group cursor-pointer text-xs"
                    >
                      <Upload size={16} className="group-hover:scale-110 transition-transform" />
                      {selectedFile ? selectedFile.name.substring(0, 15) + "..." : "CHOOSE IMAGE"}
                    </label>
                  </div>
                </div>

                {/* Gift Wrap */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-primary" />
                    <div>
                      <p className="text-xs font-bold text-[#1a1a1b] uppercase">Gift Wrap (+Rs. 99)</p>
                      <p className="text-[10px] text-gray-500">Ready to give portrait</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGiftWrap(!giftWrap)}
                    className={`relative inline-flex h-5 w-10 cursor-pointer rounded-full transition-colors ${giftWrap ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${giftWrap ? 'translate-x-5' : 'translate-x-1'} mt-0.5`} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCartClick}
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-lg font-bold text-base tracking-widest uppercase transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : orderStatus === 'success' ? "bg-green-600" : "bg-[#1a1a1b] hover:bg-[#2F2F2F]"
                    } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      PROCESSING...
                    </>
                  ) : orderStatus === 'success' ? (
                    <>
                      <Check size={20} />
                      ORDER PLACED!
                    </>
                  ) : (
                    "ADD TO CART"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {orderStatus === 'error' && (
          <p className="text-red-500 text-xs text-center font-bold uppercase mt-2">
            Checkout failed. Please try again!
          </p>
        )}
      </div>

      {/* Trust & Features Icons */}
      <div className="grid grid-cols-3 gap-6 pt-5 pb-5 border-t border-gray-100">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
            <Undo2 size={18} className="text-[#A87B62]" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-bold uppercase text-[#A87B62] leading-tight tracking-tighter">
            Unlimited<br />Revisions
          </span>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
            <Truck size={18} className="text-[#A87B62]" strokeWidth={1.2} />
          </div>
          <span className="text-[10px] font-bold uppercase text-[#A87B62] leading-tight tracking-tighter">
            Free Tracked<br />Shipping
          </span>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
            <Star size={18} className="text-[#A87B62]" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-bold uppercase text-[#A87B62] leading-tight tracking-tighter">
            100% Love<br />Guarantee
          </span>
        </div>
      </div>

      {/* Testimonial Card */}
      <div className="bg-[#fcf8f5] rounded-2xl p-8 border border-[#f0e4db] relative overflow-hidden mt-4 min-h-[190px] sm:min-h-[160px] transform -translate-y-2">
        <div className="absolute top-0 right-0 p-3 text-[#f0e4db]">
          <PawPrint size={40} className="rotate-12 opacity-20" />
        </div>
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex gap-4 items-start"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-[#A87B62]">
                <Image
                  src={testimonials[testimonialIndex].avatar}
                  alt={testimonials[testimonialIndex].author}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-gray-700 leading-relaxed italic">
                  "{testimonials[testimonialIndex].content}"
                </p>
                <p className="text-[12px] font-bold text-[#1a1a1b] uppercase tracking-wider">
                  — Verified Customer ({testimonials[testimonialIndex].author})
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Social Proof Banner */}
      <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-3 bg-gray-50/30 mt-5 mb-5">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-sm relative">
              <Image
                src={`https://i.pravatar.cc/100?u=${i + 20}`}
                alt="user"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <p className="text-[13px] font-bold text-[#1a1a1b]">
          Trusted By 1,378+ Happy Pet Parents
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-2 pt-4">
        <Accordion
          label="Description"
          icon={<PawPrint size={18} />}
        >
          <div className="text-sm text-gray-600 leading-relaxed font-inter space-y-4">
            <p>Your pet isn’t just part of your life — they are your life in a thousand little moments. The way they wait for you. The way they look at you. The quiet comfort of just having them close.</p>
            <p>At Peternity, we turn your pet’s photo into a portrait that captures all of that — not just how they look, but how they feel to you.</p>
            <p>Every piece is carefully created to reflect their personality, so when you see it… it feels like they’re right there, exactly as you know them.</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Preview your artwork before it’s printed</li>
              <li>Unlimited revisions until it feels perfect</li>
              <li>Ready to hang, made to stay with you</li>
            </ul>
            <p className="font-bold italic">Because some bonds don’t fade. They deserve to be remembered, beautifully.</p>
          </div>
        </Accordion>
        <Accordion
          label="Shipping"
          icon={<Truck size={18} />}
        >
          <div className="text-sm text-gray-600 leading-relaxed font-inter space-y-4">
            <p>Within 48 hours, you’ll receive your pet’s portrait preview — the first moment it starts to feel real.</p>
            <p>We refine every detail with you, until it doesn’t just look right… it feels like them.</p>
            <p>The moment you approve, we begin printing within 24 hours — carefully, thoughtfully, as something that truly matters.</p>
            <p><strong>Delivery across India:</strong> 4–7 working days after approval.</p>
            <p>From a photo you love… to a memory you can live with, every single day.</p>
          </div>
        </Accordion>
        <Accordion
          label="Satisfaction Guarantee"
          icon={<HeartIcon size={18} />}
        >
          <div className="text-sm text-gray-600 leading-relaxed font-inter space-y-4">
            <p>You’ll receive your portrait preview within 48 hours — and we don’t print until it feels right to you.</p>
            <p>We refine every detail with you, from expression to mood, until it truly feels like <em>them</em>.</p>
            <p>Because this isn’t something you should “settle” for. It should feel personal, emotional… and exactly right.</p>
          </div>
        </Accordion>
      </div>

      {/* Photo Guide Modal */}
      <AnimatePresence>
        {showPhotoGuide && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-[2rem] w-full max-w-[500px] overflow-hidden shadow-2xl relative border border-gray-100"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-extrabold text-[#1a1a1b] text-xs md:text-sm leading-tight tracking-tight uppercase font-inter">
                  Tips for Taking the Perfect Photo of Your Pet
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPhotoGuide(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors font-bold text-lg"
                >
                  &times;
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-inter">
                  For best results, please follow our handy guide below when choosing a photo to upload. We use the exact image uploaded to create your artwork, so please only choose images you are happy for us to use.
                </p>

                {/* Bullets */}
                <ul className="space-y-2.5 font-inter text-xs md:text-sm font-bold text-[#1a1a1b] leading-tight">
                  <li className="flex items-start gap-2">
                    <span className="text-[#A87B62] font-black">•</span>
                    <span>Take your photo at eye level with your pet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#A87B62] font-black">•</span>
                    <span>Take your photo in natural daylight and don't use flash.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#A87B62] font-black">•</span>
                    <span>Try to get your pet to sit or stay still - make sure there's no blur.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#A87B62] font-black">•</span>
                    <span>Photo is sharp and not a screenshot.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#A87B62] font-black">•</span>
                    <span>Photo is a headshot and taken from a good distance.</span>
                  </li>
                </ul>

                {/* Dog Headshots Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {[
                    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200&h=260",
                    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200&h=260",
                    "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80&w=200&h=260",
                    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=200&h=260"
                  ].map((src, i) => (
                    <div key={i} className="aspect-[3/4] relative rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <img
                        src={src}
                        alt={`Dog headshot example ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Sidebar Cart */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex justify-end">
            {/* Click-outside backdrop closer */}
            <div 
              className="absolute inset-0 cursor-default" 
              onClick={() => setShowCart(false)} 
            />

            {/* Sidebar container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-[450px] bg-[#fdfdfb] h-full flex flex-col shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Promo Banner at top */}
              <div className="bg-[#A87B62] text-white text-center py-2.5 text-xs font-black uppercase tracking-wider relative">
                Save Extra 10% at Checkout
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:opacity-80 font-black text-lg p-1"
                >
                  &times;
                </button>
              </div>

              {/* Scrollable Cart Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Header Title */}
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1b] font-inter">
                    Your Cart – {!hasCustomizedItem ? 0 : (1 + (addMagnet ? 1 : 0) + (addMug ? 1 : 0))}
                  </h2>
                </div>

                {!hasCustomizedItem ? (
                  <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-6">
                    <div className="w-24 h-24 bg-[#A87B62]/10 rounded-full flex items-center justify-center text-[#A87B62]">
                      <ShoppingBag size={40} className="text-[#A87B62]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-[#1a1a1b] text-base font-inter">Your Cart is Empty</h3>
                      <p className="text-[11px] text-gray-500 max-w-[280px] leading-relaxed">
                        You haven't customized a pet portrait yet. Design a masterpiece for your furry best friend today!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCart(false);
                        const customizerSection = document.getElementById("product-customizer");
                        if (customizerSection) {
                          customizerSection.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="px-6 py-3 bg-[#A87B62] hover:bg-[#966c55] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                    >
                      START CUSTOMIZING
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Cart Portrait Item Card */}
                    <div className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
                      {/* Left Column: Image Preview */}
                      <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                        <img
                          src={photoPreviewUrl}
                          alt="Custom Pet Portrait"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Right Column: Spec Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm text-[#1a1a1b] font-inter leading-tight">
                          Custom Pet Portrait
                        </h3>
                        <div className="text-[10px] text-gray-500 font-inter space-y-0.5 mt-1.5 leading-normal">
                          <p><span className="font-bold">Size:</span> {selectedSize},</p>
                          <p><span className="font-bold">Display Type:</span> {selectedFrame === "canva" ? "Canvas" : `${selectedFrame.charAt(0).toUpperCase() + selectedFrame.slice(1)} Frame`},</p>
                          <p><span className="font-bold">Pets:</span> {selectedPets === "one" ? "1 Pet" : selectedPets === "two" ? "2 Pets" : selectedPets === "three" ? "3 Pets" : "4 Pets"},</p>
                          <p><span className="font-bold">Pet Name:</span> {petName || "teter"}</p>
                          <p className="truncate"><span className="font-bold">Choose your Photo-1:</span> {selectedFile ? selectedFile.name : "Screenshot-2026-01-14-190004.png"}</p>
                          <p><span className="font-bold">Background:</span> {selectedBg}</p>
                        </div>

                        {/* Qty & Subtotal Controls */}
                        <div className="flex items-center justify-between mt-4">
                          {/* Qty Counter */}
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7 bg-white">
                            <button
                              type="button"
                              onClick={() => setCartQty(prev => Math.max(1, prev - 1))}
                              className="px-2.5 text-gray-500 hover:bg-gray-50 font-semibold text-xs transition-colors h-full"
                            >
                              &minus;
                            </button>
                            <span className="px-3 text-xs font-bold text-[#1a1a1b] select-none">
                              {cartQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCartQty(prev => prev + 1)}
                              className="px-2.5 text-gray-500 hover:bg-gray-50 font-semibold text-xs transition-colors h-full"
                            >
                              &#43;
                            </button>
                          </div>

                          {/* Subtotal Display */}
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setPetName("");
                                setShowCart(false);
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Remove item"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <span className="text-xs font-extrabold text-[#1a1a1b] font-inter">
                              Rs. {(totalPrice * cartQty).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* You might like... Cross-Sells Section commented out
                    <div className="bg-[#A87B62] rounded-[2rem] p-5 space-y-4 shadow-sm text-white">
                      <h4 className="text-center font-black uppercase tracking-widest text-xs font-inter">
                        You might like...
                      </h4>

                      <div className="bg-white rounded-2xl p-3 flex items-center justify-between gap-3 text-[#1a1a1b]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                            <img
                              src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=150&h=150"
                              alt="Custom Fridge Magnet"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h5 className="font-extrabold text-xs leading-snug">Custom Fridge Magnet</h5>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              <span className="line-through mr-1">Rs. 349.00</span>
                              <span className="font-extrabold text-[#A87B62]">Rs. 299.00</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAddMagnet(!addMagnet)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                            addMagnet 
                              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                              : "bg-[#A87B62] text-white border-transparent hover:bg-[#966c55]"
                          }`}
                        >
                          {addMagnet ? "REMOVE" : "ADD TO CART"}
                        </button>
                      </div>

                      <div className="bg-white rounded-2xl p-3 flex items-center justify-between gap-3 text-[#1a1a1b]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                            <img
                              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=150&h=150"
                              alt="Custom Pet Portrait Mug"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h5 className="font-extrabold text-xs leading-snug">Custom Pet Portrait Mug</h5>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              <span className="line-through mr-1">Rs. 799.00</span>
                              <span className="font-extrabold text-[#A87B62]">Rs. 599.00</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAddMug(!addMug)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                            addMug 
                              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                              : "bg-[#A87B62] text-white border-transparent hover:bg-[#966c55]"
                          }`}
                        >
                          {addMug ? "REMOVE" : "ADD TO CART"}
                        </button>
                      </div>
                    </div>
                    */}

                    {/* Digital Download Toggle Card commented out
                    <div className="bg-[#f8eadd] rounded-3xl p-4 flex items-center justify-between gap-3 border border-[#e5d2c4] text-[#1a1a1b]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-white/60 border border-[#e5d2c4] flex-shrink-0 flex items-center justify-center">
                          <Package size={22} className="text-[#A87B62]" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-xs">Digital Download <span className="text-[#A87B62]">Rs. 299.00</span></h5>
                          <p className="text-[9px] text-gray-500 mt-0.5 leading-snug">
                            Receive a file of your artwork. Great for phone wallpapers or printing extras!
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAddDigitalDownload(!addDigitalDownload)}
                        className={`relative inline-flex h-5 w-10 cursor-pointer rounded-full transition-colors flex-shrink-0 ${addDigitalDownload ? 'bg-[#A87B62]' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${addDigitalDownload ? 'translate-x-5' : 'translate-x-1'} mt-0.5`} />
                      </button>
                    </div>
                    */}
                  </>
                )}
              </div>

              {/* Checkout Summary Panel */}
              {hasCustomizedItem && (
                <div className="p-5 border-t border-gray-100 bg-white space-y-4">
                  {/* Total Row */}
                  <div className="flex justify-between items-center">
                    <span className="font-black text-sm uppercase tracking-wide text-[#1a1a1b]">
                      Estimated total
                    </span>
                    <span className="font-black text-lg text-[#1a1a1b] font-inter">
                      Rs. {(
                        (totalPrice * cartQty) + 
                        (addMagnet ? 299 : 0) + 
                        (addMug ? 599 : 0) + 
                        (addDigitalDownload ? 299 : 0)
                      ).toLocaleString()}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <div>
                    <button
                      type="button"
                      onClick={async () => {
                        const grandTotal = (totalPrice * cartQty) + (addMagnet ? 299 : 0) + (addMug ? 599 : 0) + (addDigitalDownload ? 299 : 0);
                        await handleCheckout(grandTotal);
                      }}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#A87B62] hover:bg-[#966c55] text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          PROCESSING...
                        </>
                      ) : (
                        <>
                          <span>CHECKOUT</span>
                          {/* Payment Logos inside checkout button */}
                          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg">
                            <img src="https://img.icons8.com/color/48/google-logo.png" className="w-4 h-4 bg-white rounded p-0.5" alt="GPay" />
                            <img src="https://img.icons8.com/color/48/paytm.png" className="w-4 h-4 bg-white rounded p-0.5" alt="Paytm" />
                            <img src="https://img.icons8.com/color/48/bhim.png" className="w-4 h-4 bg-white rounded p-0.5" alt="BHIM" />
                          </div>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[8px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                      Powered By Razorpay
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Glassmorphic Razorpay Sandbox Modal */}
      <AnimatePresence>
        {showSandboxModal && sandboxOrderData && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Dark glassmorphic backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowSandboxModal(false);
                setIsSubmitting(false);
              }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100/30 flex flex-col"
            >
              {/* Top accent bar matching brand style */}
              <div className="h-2 bg-gradient-to-r from-[#A87B62] to-[#8A6651]" />

              {/* Modal Header */}
              <div className="p-6 text-center border-b border-gray-50 bg-[#FAF8F5]">
                <div className="inline-flex items-center gap-1 bg-[#A87B62]/10 px-3 py-1 rounded-full text-xs font-bold text-[#A87B62] uppercase tracking-wider mb-2">
                  <ShieldCheck size={12} /> Sandbox Mode
                </div>
                <h3 className="text-xl font-extrabold text-[#1a1a1b] uppercase tracking-tight">
                  Razorpay Simulation
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  API keys are not configured. Simulate checkout below:
                </p>
              </div>

              {/* Order Quick Summary */}
              <div className="p-6 space-y-4">
                <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EADFC9]/40 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Customer Email</span>
                    <span className="text-gray-800 font-bold">{customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Pet's Royal Name</span>
                    <span className="text-gray-800 font-bold">{petName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Simulation Order ID</span>
                    <span className="text-gray-800 font-mono font-bold">{sandboxOrderData.orderId}</span>
                  </div>
                  <div className="border-t border-dashed border-[#EADFC9]/60 my-2 pt-2 flex justify-between text-sm">
                    <span className="font-bold text-gray-700 uppercase tracking-tight">Total Amount</span>
                    <span className="font-black text-[#A87B62]">Rs. {sandboxOrderData.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Simulated Payment actions */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={async () => {
                      const mockPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
                      const mockSignature = `sig_mock_${Math.random().toString(36).substr(2, 9)}`;
                      await submitFinalOrder(
                        mockPaymentId,
                        sandboxOrderData.orderId,
                        mockSignature,
                        sandboxOrderData.amount
                      );
                    }}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#4A6B53] hover:bg-[#3d5944] text-white font-bold uppercase tracking-widest text-xs rounded-2xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>✓ Authorize Sandbox Payment</>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowSandboxModal(false);
                      setIsSubmitting(false);
                    }}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold uppercase tracking-widest text-xs rounded-2xl transition-colors flex items-center justify-center"
                  >
                    ✗ Decline & Cancel Checkout
                  </button>
                </div>
              </div>

              {/* Bottom Decorative footer */}
              <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Peternity Payment Sandbox
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919999999999?text=Hi!%20I'm%20customizing%20a%20pet%20portrait%20and%20had%20a%20question!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
        title="Chat on WhatsApp"
      >
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.794-4.382 9.797-9.786.001-2.617-1.01-5.078-2.85-6.918C16.37 2.062 13.916.97 11.306.97c-5.41.003-9.802 4.39-9.805 9.795-.001 1.77.462 3.5 1.34 5.025l-.95 3.473 3.56-.933zm11.238-6.84c-.31-.156-1.83-.903-2.112-1.004-.282-.102-.489-.153-.69.155-.203.307-.785.99-.963 1.196-.178.205-.355.23-.665.074-.31-.156-1.31-.483-2.493-1.54-1.183-1.055-1.183-1.055-2.096-1.536-.913-.48-.913-.48-.155-1.312.28-.307.31-.462.464-.77.154-.307.077-.577-.038-.782-.115-.205-.963-2.317-1.316-3.17-.344-.833-.694-.72-1.005-.722h-.854c-.282 0-.742.106-1.13.53-.388.423-1.48 1.446-1.48 3.528 0 2.082 1.516 4.09 1.727 4.38.21.291 2.984 4.557 7.228 6.388 1.01.436 1.8.697 2.413.89 1.014.322 1.937.276 2.666.168.812-.12 1.832-.748 2.086-1.434.254-.686.254-1.274.178-1.4-.076-.127-.282-.205-.592-.361z" />
        </svg>
      </a>
    </div>
  );
}


function Accordion({ label, icon, children, isOpenDefault = false }: any) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <div className="flex items-center gap-4">
          <span className="text-gray-400 group-hover:text-primary transition-colors">{icon}</span>
          <span className="font-bold text-[#1a1a1b] uppercase text-sm tracking-tight">{label}</span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="pb-6 animate-in fade-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
}
