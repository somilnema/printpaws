"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadPetPhoto } from "@/app/actions/supabaseActions";
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
  ShoppingBag,
  Wallet,
  IndianRupee,
  Tag
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getCloudinaryUrl } from "@/utils/cloudinary";
import {
  ADDON_PRICES,
  calculateQuote,
  extraProductLines,
  extrasTotal,
  frameColorLabel,
  formatRs,
  getPortraitBreakdown,
  GIFT_WRAP_PRICE,
  PET_COUNT_LABELS,
  PORTRAIT_STYLE_LABELS,
  PRODUCT_LABELS,
  type PaymentMethod,
  type PricingInput,
  type ProductType,
} from "@/lib/pricing";
import { trackPixel } from "@/lib/pixel";
import { ExtraProducts } from "@/components/ExtraProducts";


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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] font-bold text-red-500 mt-1.5">{message}</p>;
}

export function ProductInfo() {
  const router = useRouter();
  const [currentStep, setCurrentStepRaw] = useState(1);
  const currentStepSafe = Math.min(Math.max(currentStep, 1), 3);
  const setCurrentStep = (value: number | ((prev: number) => number)) => {
    setCurrentStepRaw((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      return Math.min(Math.max(next, 1), 3);
    });
  };
  const [productType, setProductType] = useState<ProductType>("portrait");
  const [customPaymentAmount, setCustomPaymentAmount] = useState<number>(500);
  const [digitalDownloadAmount, setDigitalDownloadAmount] = useState<number>(300);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("prepaid");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [portraitStyle, setPortraitStyle] = useState<"framed" | "canvas">("framed");
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
  const [memorialText, setMemorialText] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  const [shippingLandmark, setShippingLandmark] = useState("");
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartQty, setCartQty] = useState(1);
  const [addMagnet, setAddMagnet] = useState(false);
  const [addMug, setAddMug] = useState(false);
  const [addDigitalDownload, setAddDigitalDownload] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("/feature-detail.png");
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxOrderData, setSandboxOrderData] = useState<any>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [deliveryDates, setDeliveryDates] = useState("");

  useEffect(() => {
    const today = new Date();
    const date1 = new Date(today);
    date1.setDate(today.getDate() + 8);
    const date2 = new Date(today);
    date2.setDate(today.getDate() + 10);
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    setDeliveryDates(`${date1.toLocaleDateString('en-US', options)} - ${date2.toLocaleDateString('en-US', options)}`);
  }, []);

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
        if (parsed.productType === "portrait") setProductType("portrait");
        if (parsed.customPaymentAmount) setCustomPaymentAmount(parsed.customPaymentAmount);
        if (parsed.digitalDownloadAmount) setDigitalDownloadAmount(parsed.digitalDownloadAmount);
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        if (parsed.appliedCoupon) setAppliedCoupon(parsed.appliedCoupon);
        if (parsed.couponInput) setCouponInput(parsed.couponInput);
        if (parsed.portraitStyle) setPortraitStyle(parsed.portraitStyle);
        if (parsed.selectedSize) setSelectedSize(parsed.selectedSize);
        if (parsed.selectedFrame) setSelectedFrame(parsed.selectedFrame);
        if (parsed.selectedPets) setSelectedPets(parsed.selectedPets);
        if (parsed.selectedBg) setSelectedBg(parsed.selectedBg);
        if (parsed.selectedAddOn) setSelectedAddOn(parsed.selectedAddOn);
        if (parsed.giftWrap !== undefined) setGiftWrap(parsed.giftWrap);
        if (parsed.petName) setPetName(parsed.petName);
        if (parsed.customerName) setCustomerName(parsed.customerName);
        if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
        if (parsed.customerEmail) setCustomerEmail(parsed.customerEmail);
        if (parsed.shippingAddress) setShippingAddress(parsed.shippingAddress);
        if (parsed.shippingCity) setShippingCity(parsed.shippingCity);
        if (parsed.shippingState) setShippingState(parsed.shippingState);
        if (parsed.shippingPincode) setShippingPincode(parsed.shippingPincode);
        if (parsed.shippingLandmark) setShippingLandmark(parsed.shippingLandmark);
        if (parsed.cartQty) setCartQty(parsed.cartQty);
        if (parsed.addMagnet !== undefined) setAddMagnet(parsed.addMagnet);
        if (parsed.addMug !== undefined) setAddMug(parsed.addMug);
        if (parsed.addDigitalDownload !== undefined) setAddDigitalDownload(parsed.addDigitalDownload);
        if (parsed.addedToCart) setAddedToCart(true);
        if (parsed.memorialText) setMemorialText(parsed.memorialText);
      }
    } catch (e) {
      console.warn("Failed to load persisted cart cache:", e);
    }
  }, []);

  // 3. Keep cache synchronized in localStorage when configurations change
  useEffect(() => {
    const cartState = {
      productType,
      customPaymentAmount,
      digitalDownloadAmount,
      paymentMethod,
      appliedCoupon,
      couponInput,
      portraitStyle,
      selectedSize,
      selectedFrame,
      selectedPets,
      selectedBg,
      selectedAddOn,
      giftWrap,
      petName,
      memorialText,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      shippingLandmark,
      cartQty,
      addMagnet,
      addMug,
      addDigitalDownload,
      addedToCart,
      hasCustomizedItem: addedToCart
    };
    try {
      localStorage.setItem('peternity_cart', JSON.stringify(cartState));
      
      const count = addedToCart ? (1 + (addMagnet ? 1 : 0) + (addMug ? 1 : 0) + (addDigitalDownload ? 1 : 0)) : 0;
      window.dispatchEvent(new CustomEvent('cartBadgeUpdated', { detail: count }));
    } catch (e) {
      console.warn("Failed to persist cart cache:", e);
    }
  }, [
    portraitStyle,
    selectedSize,
    selectedFrame,
    selectedPets,
    selectedBg,
    selectedAddOn,
    giftWrap,
    petName,
    memorialText,
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPincode,
    shippingLandmark,
    cartQty,
    addMagnet,
    addMug,
    addDigitalDownload,
    addedToCart,
    selectedFile,
    productType,
    customPaymentAmount,
    digitalDownloadAmount,
    paymentMethod,
    appliedCoupon,
    couponInput
  ]);

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
  }, [currentStepSafe]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('overlayOpen', { detail: showCart || showCheckout || showSandboxModal }));
    return () => {
      window.dispatchEvent(new CustomEvent('overlayOpen', { detail: false }));
    };
  }, [showCart, showCheckout, showSandboxModal]);

  const pricingInput: PricingInput = {
    productType,
    portraitStyle,
    size: selectedSize,
    numPets: selectedPets,
    background: selectedBg,
    addon: selectedAddOn,
    giftWrap,
    cartQty,
    addDigitalDownload: productType === "portrait" ? addDigitalDownload : false,
    addMagnet,
    addMug,
    customPaymentAmount,
    digitalDownloadAmount,
    couponCode: appliedCoupon,
    paymentMethod: productType === "portrait" ? paymentMethod : "prepaid",
  };

  let quote;
  try {
    quote = calculateQuote(pricingInput);
  } catch {
    quote = calculateQuote({ ...pricingInput, couponCode: null });
  }

  const prepaidQuote = calculateQuote({
    ...pricingInput,
    couponCode: quote.couponCode,
    paymentMethod: "prepaid",
  });
  const codQuote = calculateQuote({
    ...pricingInput,
    couponCode: quote.couponCode,
    paymentMethod: "cod",
  });

  const totalPrice = quote.originalAmount;
  const cutPrice = Math.round(totalPrice / 0.70);
  const displayQuote = quote;
  const extraLines = extraProductLines(pricingInput);
  const extrasAmount = extrasTotal(pricingInput);
  const portraitBaseAmount = Math.max(0, quote.originalAmount - extrasAmount);
  const breakdown = getPortraitBreakdown(pricingInput);
  const cartTotal = quote.afterCouponAmount;

  const extraProductsPicker = (title?: string) =>
    productType === "portrait" ? (
    <ExtraProducts
      addMug={addMug}
      addMagnet={addMagnet}
      addGift={addDigitalDownload}
      onToggleMug={() => setAddMug(!addMug)}
      onToggleMagnet={() => setAddMagnet(!addMagnet)}
      onToggleGift={() => setAddDigitalDownload(!addDigitalDownload)}
      title={title || "Additional Products"}
    />
  ) : null;

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (productType === "custom_payment" && ![500, 600].includes(customPaymentAmount)) {
      errors.customPayment = "Please select a Custom Payment amount.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (productType === "portrait" || productType === "digital_download") {
      if (!petName.trim()) errors.petName = "Please enter your pet's name to continue.";
      if (!selectedFile) errors.photo = "Please choose a pet photo to continue.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) errors.customerName = "Please enter your full name to continue.";
    if (!customerEmail.trim()) errors.customerEmail = "Please enter your email to continue.";
    else if (!isValidEmail(customerEmail)) errors.customerEmail = "Please enter a valid email to continue.";
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 10) {
      errors.customerPhone = "Please enter a valid mobile number to continue.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCheckout = () => {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) errors.customerName = "Please enter your full name to continue.";
    if (!customerEmail.trim()) errors.customerEmail = "Please enter your email to continue.";
    else if (!isValidEmail(customerEmail)) errors.customerEmail = "Please enter a valid email to continue.";
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 10) {
      errors.customerPhone = "Please enter a valid mobile number to continue.";
    }
    if (productType === "portrait") {
      if (!shippingAddress.trim()) errors.shippingAddress = "Please enter your full address to continue.";
      if (!shippingCity.trim()) errors.shippingCity = "Please enter your city to continue.";
      if (!shippingState.trim()) errors.shippingState = "Please enter your state to continue.";
      if (!shippingPincode.trim() || shippingPincode.replace(/\D/g, "").length < 6) {
        errors.shippingPincode = "Please enter a valid PIN code to continue.";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToStep = (step: number) => setCurrentStep(Math.min(Math.max(step, 1), 3));

  const handleContinueFromStep1 = () => {
    if (!validateStep1()) return;
    goToStep(2);
  };

  const handleContinueFromStep2 = () => {
    if (!validateStep2()) return;
    goToStep(3);
  };

  const handleAddToCart = () => {
    if (!validateStep3()) return;
    setAddedToCart(true);
    setShowCheckout(false);
    setShowCart(true);
    trackPixel("AddToCart", { value: totalPrice, currency: "INR" });
  };

  const prevStep = () => goToStep(currentStepSafe - 1);

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

  const checkoutPayload = (photoUrl = "") => ({
    ...pricingInput,
    size: productType === "portrait" ? selectedSize : PRODUCT_LABELS[productType],
    frameStyle: productType === "portrait" ? selectedFrame : productType,
    numPets: productType === "portrait" ? selectedPets : "one",
    background: productType === "portrait" ? selectedBg : "",
    addon: productType === "portrait"
      ? [
          selectedAddOn !== "none" ? selectedAddOn : "",
          addMug ? "custom_mug" : "",
          addMagnet ? "fridge_magnet" : "",
          addDigitalDownload ? "digital_download" : "",
        ].filter(Boolean).join(", ") || "none"
      : productType,
    petName: petName || PRODUCT_LABELS[productType],
    memorialText,
    giftWrap,
    portraitStyle: productType === "portrait" ? portraitStyle : productType,
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPincode,
    shippingLandmark,
    photoUrl,
  });

  const submitFinalOrder = async (
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
  ) => {
    setIsSubmitting(true);
    setOrderStatus('idle');

    try {
      let publicUrl = "";
      try {
        if (selectedFile) {
          const formData = new FormData();
          formData.append('file', selectedFile);
          publicUrl = await uploadPetPhoto(formData);
        }
      } catch (uploadError: any) {
        console.warn("Supabase Storage Upload Failed. Falling back to local object URL:", uploadError);
        if (selectedFile) {
          publicUrl = URL.createObjectURL(selectedFile);
        }
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkoutPayload(publicUrl),
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOrderStatus('success');
        localStorage.removeItem('peternity_cart');
        router.push(`/checkout/success?orderId=${result.orderId}`);
      } else {
        setOrderStatus('error');
        setWarningMessage(result.error || "Server failed to record order specifications.");
      }
    } catch (err: any) {
      console.error("Checkout Submit Order Error:", err);
      setOrderStatus('error');
      setWarningMessage(err.message || "Failed to submit finalized order data.");
    } finally {
      setIsSubmitting(false);
      setShowSandboxModal(false);
    }
  };

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      setCouponMessage(null);
      return;
    }
    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponMessage(null);
    try {
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pricingInput, couponCode: code }),
      });
      const data = await res.json();
      if (!data.success) {
        setAppliedCoupon(null);
        setCouponError(data.error || "This coupon code is invalid.");
        return;
      }
      setAppliedCoupon(data.quote.couponCode);
      setCouponMessage(`${data.quote.couponCode} applied — ${data.quote.couponPercent}% off`);
    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
    setCouponMessage(null);
  };

  const handleCheckout = async () => {
    if (!addedToCart) {
      setWarningMessage("Please add your portrait to the cart before placing the order.");
      return;
    }
    if (!validateStep2()) {
      setShowCheckout(false);
      setShowCart(false);
      goToStep(2);
      return;
    }
    if (!validateCheckout()) {
      setShowCheckout(true);
      setShowCart(false);
      return;
    }

    setIsSubmitting(true);
    setOrderStatus('idle');
    const payload = checkoutPayload();

    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize Razorpay Order endpoint");
      }

      const payableNow = orderData.quote?.payableNow ?? orderData.amount;
      const isMock = orderData.isMock || orderData.keyId === "rzp_test_mockKey123";

      if (isMock) {
        setSandboxOrderData({
          orderId: orderData.orderId,
          amount: payableNow,
          keyId: orderData.keyId,
        });
        setShowSandboxModal(true);
        setIsSubmitting(false);
      } else {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Razorpay SDK failed to load. Please verify your connection.");
        }

        const options = {
          key: orderData.keyId,
          amount: Math.round(payableNow * 100),
          currency: "INR",
          name: "Peternity",
          description: PRODUCT_LABELS[productType],
          order_id: orderData.orderId,
          handler: async function (response: any) {
            await submitFinalOrder(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
            );
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: "#A87B62",
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Razorpay Checkout Error:", err);
      setOrderStatus('error');
      setIsSubmitting(false);
      setWarningMessage(err.message || "Failed to initiate secure payment portal.");
    }
  };

  const handleInitiateCheckout = () => {
    if (!addedToCart) return;
    if (!validateStep3()) {
      setShowCart(false);
      goToStep(3);
      return;
    }
    trackPixel("InitiateCheckout", { value: cartTotal, currency: "INR" });
    setShowCart(false);
    setShowCheckout(true);
  };

  const hasCustomizedItem = addedToCart;

  return (
    <div ref={containerRef} id="product-customizer" className="flex flex-col gap-0 scroll-mt-24">
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
          {productType === "portrait" && (
            <>
              <span className="text-[20px] font-medium text-[#A87B62] line-through font-inter opacity-80">Rs. {cutPrice}.00</span>
              <span className="bg-[#FF9494] text-white text-[10px] font-bold px-2 py-1 rounded-full tracking-wider">
                30% OFF
              </span>
            </>
          )}
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
            See your artwork first, then choose your favorite font from <span className="text-[#A87B62] font-bold">20+ styles on WhatsApp.</span>
          </p>
        </div>
      </div>

      {/* Step Navigator */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Step {currentStepSafe} of 3 · {currentStepSafe === 1 ? "Choose Portrait" : currentStepSafe === 2 ? "Customize" : "Your Details"}
          </span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            {Math.round((currentStepSafe / 3) * 100)}% Complete
          </span>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStepSafe / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
      </div>

      {/* Selectors with Transitions */}
      <div className="relative min-h-[250px] md:min-h-[240px] overflow-visible">
        <AnimatePresence mode="wait">
          {currentStepSafe === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-6">
                {/* 1. Portrait Style */}
                <div className="space-y-3">
                  <label className="block text-base font-bold text-[#1a1a1b] font-inter">
                    1. Choose Your Portrait Style
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setPortraitStyle("framed");
                        setSelectedFrame("black");
                        setSelectedSize('8"x10"');
                        window.dispatchEvent(new CustomEvent('frameSelectionChanged', { detail: "black" }));
                      }}
                      className={`group relative flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 p-2 md:p-3.5 rounded-2xl border-[2px] transition-all text-center md:text-left ${portraitStyle === "framed"
                        ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <Image src="/framestyle/black-frame.png" alt="Framed" fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col items-center md:items-start w-full">
                        <span className="block font-black text-[#1a1a1b] text-[11px] md:text-sm">Framed Portrait</span>
                        <span className="hidden md:block text-[10px] text-gray-500 font-medium">Ready to Hang • Classic Look</span>
                      </div>
                      <div className={`absolute top-2 right-2 md:static flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${portraitStyle === "framed" ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                        {portraitStyle === "framed" && <Check size={10} className="text-white md:w-3 md:h-3" strokeWidth={3} />}
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setPortraitStyle("canvas");
                        setSelectedFrame("canva");
                        setSelectedSize('16"x20"');
                        window.dispatchEvent(new CustomEvent('frameSelectionChanged', { detail: "canva" }));
                      }}
                      className={`group relative flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 p-2 md:p-3.5 rounded-2xl border-[2px] transition-all text-center md:text-left ${portraitStyle === "canvas"
                        ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <Image src="/framestyle/canvas-frame.png" alt="Canvas" fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col items-center md:items-start w-full">
                        <span className="block font-black text-[#1a1a1b] text-[11px] md:text-sm">Canvas Portrait</span>
                        <span className="hidden md:block text-[10px] text-gray-500 font-medium">Gallery Wrapped • Premium</span>
                      </div>
                      <div className={`absolute top-2 right-2 md:static flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${portraitStyle === "canvas" ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                        {portraitStyle === "canvas" && <Check size={10} className="text-white md:w-3 md:h-3" strokeWidth={3} />}
                      </div>
                    </button>
                  </div>
                </div>



                {/* 2. Choose Your Size */}
                <div className="space-y-3">
                  <label className="block text-base font-bold text-[#1a1a1b] font-inter">
                    2. Choose Your Size
                  </label>
                  <div className="flex flex-col gap-3">
                    {portraitStyle === "framed" ? (
                      <>
                        <button onClick={() => { setSelectedSize('8"x10"'); window.dispatchEvent(new CustomEvent('sizeSelectionChanged', { detail: 'framed_size' })); }} className={`group relative flex items-center justify-between p-4 rounded-2xl border-[2px] transition-all text-left ${selectedSize === '8"x10"' ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <div>
                            <div className="flex items-center gap-2"><span className="font-black text-[#1a1a1b] text-base">8×10</span></div>
                            <span className="text-xs font-bold text-gray-500">₹1,499</span>
                          </div>
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSize === '8"x10"' ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                            {selectedSize === '8"x10"' && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        </button>
                        <button onClick={() => { setSelectedSize('12"x16"'); window.dispatchEvent(new CustomEvent('sizeSelectionChanged', { detail: 'framed_size' })); }} className={`group relative flex items-center justify-between p-4 rounded-2xl border-[2px] transition-all text-left ${selectedSize === '12"x16"' ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <div>
                            <div className="flex items-center gap-2"><span className="font-black text-[#1a1a1b] text-base">12×16</span><span className="text-[10px] font-black text-white bg-[#A87B62] px-1.5 py-0.5 rounded uppercase tracking-wider">⭐ Most Popular</span></div>
                            <span className="text-xs font-bold text-gray-500">₹1,999</span>
                          </div>
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSize === '12"x16"' ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                            {selectedSize === '12"x16"' && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        </button>
                        <button onClick={() => { setSelectedSize('18"x24"'); window.dispatchEvent(new CustomEvent('sizeSelectionChanged', { detail: 'framed_size' })); }} className={`group relative flex items-center justify-between p-4 rounded-2xl border-[2px] transition-all text-left ${selectedSize === '18"x24"' ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <div>
                            <div className="flex items-center gap-2"><span className="font-black text-[#1a1a1b] text-base">18×24</span></div>
                            <span className="text-xs font-bold text-gray-500">₹2,499</span>
                          </div>
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSize === '18"x24"' ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                            {selectedSize === '18"x24"' && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setSelectedSize('8"x12"'); window.dispatchEvent(new CustomEvent('sizeSelectionChanged', { detail: 'canvas_size' })); }} className={`group relative flex items-center justify-between p-4 rounded-2xl border-[2px] transition-all text-left ${selectedSize === '8"x12"' ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <div>
                            <div className="flex items-center gap-2"><span className="font-black text-[#1a1a1b] text-base">8×12</span></div>
                            <span className="text-xs font-bold text-gray-500">₹1,699</span>
                          </div>
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSize === '8"x12"' ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                            {selectedSize === '8"x12"' && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        </button>
                        <button onClick={() => { setSelectedSize('16"x20"'); window.dispatchEvent(new CustomEvent('sizeSelectionChanged', { detail: 'canvas_size' })); }} className={`group relative flex items-center justify-between p-4 rounded-2xl border-[2px] transition-all text-left ${selectedSize === '16"x20"' ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <div>
                            <div className="flex items-center gap-2"><span className="font-black text-[#1a1a1b] text-base">16×20</span><span className="text-[10px] font-black text-white bg-[#A87B62] px-1.5 py-0.5 rounded uppercase tracking-wider">⭐ Best Seller</span></div>
                            <span className="text-xs font-bold text-gray-500">₹2,499</span>
                          </div>
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSize === '16"x20"' ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                            {selectedSize === '16"x20"' && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        </button>
                        <button onClick={() => { setSelectedSize('20"x30"'); window.dispatchEvent(new CustomEvent('sizeSelectionChanged', { detail: 'canvas_size' })); }} className={`group relative flex items-center justify-between p-4 rounded-2xl border-[2px] transition-all text-left ${selectedSize === '20"x30"' ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <div>
                            <div className="flex items-center gap-2"><span className="font-black text-[#1a1a1b] text-base">20×30</span></div>
                            <span className="text-xs font-bold text-gray-500">₹3,499</span>
                          </div>
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSize === '20"x30"' ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                            {selectedSize === '20"x30"' && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Number of Pets */}
                <div className="space-y-3">
                  <label className="block text-base font-bold text-[#1a1a1b] font-inter">
                    3. Number of Pets
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {PET_OPTIONS.map((pet) => (
                      <button
                        key={pet.id}
                        onClick={() => {
                          setSelectedPets(pet.id);
                          window.dispatchEvent(new CustomEvent('petSelectionChanged', { detail: pet.id }));
                        }}
                        className={`group relative flex flex-col md:flex-row items-center md:items-center justify-between gap-2 md:gap-4 p-2 md:p-3.5 rounded-2xl border-[2px] transition-all overflow-hidden ${selectedPets === pet.id
                          ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                      >
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full">
                           <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative shadow-sm">
                             <Image src={pet.image} alt={pet.label} fill className="object-cover" />
                           </div>
                           <div className="text-center md:text-left flex-1">
                             <span className="block font-black text-[11px] md:text-sm text-[#1a1a1b]">{pet.label} Pet{pet.id !== "one" ? "s" : ""}</span>
                             <span className="hidden md:block text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                               {pet.id === "one" ? "Included" : pet.id === "two" ? "+₹300" : pet.id === "three" ? "+₹600" : "+₹1,500"}
                             </span>
                           </div>
                        </div>
                        <div className={`absolute top-2 right-2 md:static flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPets === pet.id ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                          {selectedPets === pet.id && <Check size={10} className="text-white md:w-3 md:h-3" strokeWidth={3} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              <button 
                type="button"
                onClick={handleContinueFromStep1}
                className="w-full py-4 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-sm mt-4 hover:bg-[#2F2F2F] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={18} />
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-500 bg-gray-50/80 py-2.5 rounded-lg border border-gray-100">
                <Truck size={14} className="text-[#A87B62]" />
                <span className="text-[11px] font-medium tracking-wide uppercase">
                  Order today, receive it by: <strong className="text-[#1a1a1b] font-black">{deliveryDates}</strong>
                </span>
              </div>
              </div>
            </motion.div>
          )}

          {currentStepSafe === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                  <ArrowLeft size={14} /> Back
                </button>
                <label className="block text-base font-medium text-[#1a1a1b]">
                  Customize Your Portrait
                </label>
              </div>

              {productType === "portrait" && (
                <>
                  {portraitStyle === "framed" && (
                    <div className="space-y-3">
                      <label className="block text-base font-bold text-[#1a1a1b] font-inter">
                        1. Frame Color
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFrame("black");
                            window.dispatchEvent(new CustomEvent('frameSelectionChanged', { detail: "black" }));
                          }}
                          className={`group relative flex items-center justify-center p-3.5 rounded-xl border-[2px] transition-all text-center ${selectedFrame === "black"
                            ? "border-[#1a1a1b] shadow-md bg-[#fafafa] z-10"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                          <span className="font-bold text-[#1a1a1b] text-sm">Black Frame</span>
                          {selectedFrame === "black" && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1a1a1b] flex items-center justify-center">
                              <Check size={10} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFrame("white");
                            window.dispatchEvent(new CustomEvent('frameSelectionChanged', { detail: "white" }));
                          }}
                          className={`group relative flex items-center justify-center p-3.5 rounded-xl border-[2px] transition-all text-center ${selectedFrame === "white"
                            ? "border-[#1a1a1b] shadow-md bg-[#fafafa] z-10"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                          <span className="font-bold text-[#1a1a1b] text-sm">White Frame</span>
                          {selectedFrame === "white" && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1a1a1b] flex items-center justify-center">
                              <Check size={10} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-base font-bold text-[#1a1a1b] font-inter">
                      2. Background Color
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {BACKGROUNDS.map((bg) => (
                        <div key={bg.name} className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBg(bg.name);
                              window.dispatchEvent(new CustomEvent('backgroundSelectionChanged', { detail: bg.name }));
                            }}
                            className={`group relative w-12 h-12 rounded-xl border-[2px] transition-all overflow-hidden flex items-center justify-center shadow-sm flex-shrink-0 ${selectedBg === bg.name
                              ? "border-gray-300 scale-[1.05] shadow-md"
                              : "border-gray-100 hover:border-gray-200"
                              }`}
                            style={{
                              backgroundColor: bg.isImage ? undefined : bg.value,
                              backgroundImage: bg.isImage ? `url(${bg.value})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          >
                            {selectedBg === bg.name && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                <Check size={20} className={bg.name === "Black" ? "text-white" : "text-[#1a1a1b]"} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center w-12 leading-tight">
                            {bg.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-base font-bold text-[#1a1a1b] font-inter">
                      3. Add-on Illustration
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {ADD_ONS.map((addon) => (
                        <button
                          type="button"
                          key={addon.id}
                          onClick={() => setSelectedAddOn(selectedAddOn === addon.id ? "none" : addon.id)}
                          className={`group relative w-24 h-24 rounded-xl border-[2.5px] transition-all overflow-hidden flex-shrink-0 ${selectedAddOn === addon.id
                            ? "border-[#1a1a1b] shadow-lg scale-[1.05] z-10"
                            : "border-gray-100 hover:border-gray-200"
                            }`}
                        >
                          <div className="absolute top-1.5 right-1.5 z-10">
                            <span className="text-[7px] font-black text-white bg-black/60 px-1 py-0.5 rounded font-inter tracking-wider">
                              +{ADDON_PRICES[addon.id] || 200}
                            </span>
                          </div>
                          <Image
                            src={addon.image}
                            alt={addon.label}
                            fill
                            className="object-cover"
                          />
                          <div className={`absolute inset-0 flex items-center justify-center transition-colors ${selectedAddOn === addon.id ? 'bg-black/20' : 'bg-black/0 group-hover:bg-black/10'}`}>
                            <div className={`absolute bottom-2 text-white font-bold uppercase tracking-widest text-[8px] bg-black/60 px-1.5 py-0.5 rounded transition-opacity ${selectedAddOn === addon.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              {addon.label}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-base font-bold text-[#1a1a1b] font-inter">
                      4. Gift Wrap
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={20} className="text-primary" />
                        <div>
                          <p className="text-xs font-bold text-[#1a1a1b] uppercase">Premium Gift Wrap (+Rs. {GIFT_WRAP_PRICE})</p>
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
                  </div>
                </>
              )}

              {(productType === "portrait" || productType === "digital_download") && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        5. Pet Name{selectedPets !== "one" ? "s" : ""} <span className="text-red-500">*</span>
                      </label>
                      <div className={`grid gap-3 ${selectedPets === "one" ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {Array.from({ length: selectedPets === "four" ? 4 : selectedPets === "three" ? 3 : selectedPets === "two" ? 2 : 1 }).map((_, i) => {
                          const names = petName.split(", ");
                          const currentName = names[i] || "";
                          return (
                            <input
                              key={i}
                              type="text"
                              value={currentName}
                              onChange={(e) => {
                                const numPets = selectedPets === "four" ? 4 : selectedPets === "three" ? 3 : selectedPets === "two" ? 2 : 1;
                                const newNames = [...names];
                                while (newNames.length < numPets) newNames.push("");
                                newNames[i] = e.target.value;
                                setPetName(newNames.slice(0, numPets).join(", ").replace(/^, |, $/g, ''));
                                clearFieldError("petName");
                              }}
                              placeholder={selectedPets !== "one" ? `Pet ${i + 1} Name` : "E.g. Lola"}
                              className={`w-full px-4 py-3 border-[1.5px] rounded-lg focus:border-[#1a1a1b] outline-none transition-all font-inter text-sm ${fieldErrors.petName ? "border-red-400 bg-red-50/40" : "border-gray-200"}`}
                            />
                          );
                        })}
                      </div>
                      <FieldError message={fieldErrors.petName} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        6. Memorial Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={memorialText}
                        onChange={(e) => setMemorialText(e.target.value)}
                        placeholder="E.g. Always in our hearts"
                        className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg focus:border-[#1a1a1b] outline-none transition-all font-inter text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                        7. Upload Photo <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPhotoGuide(true)}
                        className="text-[10px] font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-wider flex items-center gap-1 bg-[#A87B62]/10 px-2 py-0.5 rounded-full"
                      >
                        Photo Guide
                      </button>
                    </div>
                    <div className={`border-[1.5px] border-dashed rounded-xl p-4 ${fieldErrors.photo ? "border-red-400 bg-red-50/40" : "border-gray-300 bg-gray-50/50"}`}>
                      <input
                        type="file"
                        id="pet-photo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                            clearFieldError("photo");
                          }
                        }}
                      />
                      <label
                        htmlFor="pet-photo-upload"
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-50 text-[#1a1a1b] border-[1.5px] border-gray-200 rounded-lg font-bold transition-all shadow-sm group cursor-pointer text-sm"
                      >
                        <Upload size={18} className="group-hover:scale-110 transition-transform" />
                        {selectedFile ? selectedFile.name.substring(0, 20) + "..." : "CHOOSE IMAGE"}
                      </label>
                    </div>
                    {selectedFile && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100">
                          <img src={photoPreviewUrl} alt="Uploaded pet" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium truncate">{selectedFile.name}</p>
                      </div>
                    )}
                    <FieldError message={fieldErrors.photo} />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={handleContinueFromStep2}
                className="w-full py-4 bg-[#1a1a1b] text-white rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 mt-4 hover:bg-[#2F2F2F]"
              >
                Continue <ArrowRight size={18} />
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-500 bg-gray-50/80 py-2.5 rounded-lg border border-gray-100">
                <Truck size={14} className="text-[#A87B62]" />
                <span className="text-[11px] font-medium tracking-wide uppercase">
                  Order today, receive it by: <strong className="text-[#1a1a1b] font-black">{deliveryDates}</strong>
                </span>
              </div>
            </motion.div>
          )}

          {currentStepSafe === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                  <ArrowLeft size={14} /> Back
                </button>
                <label className="block text-base font-medium text-[#1a1a1b]">
                  Customer Details
                </label>
              </div>

              <p className="text-[12px] text-gray-500 leading-relaxed">
                Entered once and carried forward to checkout. You will not be asked again.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    clearFieldError("customerName");
                  }}
                  placeholder="Your full name"
                  className={`w-full px-4 py-3 border-[1.5px] rounded-lg focus:border-[#1a1a1b] outline-none transition-all font-inter text-sm ${fieldErrors.customerName ? "border-red-400 bg-red-50/40" : "border-gray-200"}`}
                />
                <FieldError message={fieldErrors.customerName} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    clearFieldError("customerEmail");
                  }}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border-[1.5px] rounded-lg focus:border-[#1a1a1b] outline-none transition-all font-inter text-sm ${fieldErrors.customerEmail ? "border-red-400 bg-red-50/40" : "border-gray-200"}`}
                />
                <FieldError message={fieldErrors.customerEmail} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    clearFieldError("customerPhone");
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full px-4 py-3 border-[1.5px] rounded-lg focus:border-[#1a1a1b] outline-none transition-all font-inter text-sm ${fieldErrors.customerPhone ? "border-red-400 bg-red-50/40" : "border-gray-200"}`}
                />
                <FieldError message={fieldErrors.customerPhone} />
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 bg-[#A87B62] hover:bg-[#966c55] text-white rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-500 bg-gray-50/80 py-2.5 rounded-lg border border-gray-100">
                <Truck size={14} className="text-[#A87B62]" />
                <span className="text-[11px] font-medium tracking-wide uppercase">
                  Order today, receive it by: <strong className="text-[#1a1a1b] font-black">{deliveryDates}</strong>
                </span>
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
                  - {testimonials[testimonialIndex].author}
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
            <p>Your pet isn’t just part of your life - they are your life in a thousand little moments. The way they wait for you. The way they look at you. The quiet comfort of just having them close.</p>
            <p>At Peternity, we turn your pet’s photo into a portrait that captures all of that - not just how they look, but how they feel to you.</p>
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
            <p>Within 48 hours, you’ll receive your pet’s portrait preview - the first moment it starts to feel real.</p>
            <p>We refine every detail with you, until it doesn’t just look right… it feels like them.</p>
            <p>The moment you approve, we begin printing within 24 hours - carefully, thoughtfully, as something that truly matters.</p>
            <p><strong>Delivery across India:</strong> 4-7 working days after approval.</p>
            <p>From a photo you love… to a memory you can live with, every single day.</p>
          </div>
        </Accordion>
        <Accordion
          label="Satisfaction Guarantee"
          icon={<HeartIcon size={18} />}
        >
          <div className="text-sm text-gray-600 leading-relaxed font-inter space-y-4">
            <p>You’ll receive your portrait preview within 48 hours - and we don’t print until it feels right to you.</p>
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
                Your Selection
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
                    Your Cart
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
                        Complete the 3-step customizer and tap Add to Cart to review your portrait here.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCart(false)}
                      className="px-6 py-3 bg-[#A87B62] hover:bg-[#966c55] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                    >
                      Continue customizing
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                          <img
                            src={photoPreviewUrl}
                            alt="Custom Pet Portrait"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-sm text-[#1a1a1b] font-inter leading-tight">
                            {productType === "portrait"
                              ? PORTRAIT_STYLE_LABELS[portraitStyle]
                              : PRODUCT_LABELS[productType]}
                          </h3>
                          <p className="text-[11px] font-bold text-[#A87B62] mt-1">
                            {formatRs(portraitBaseAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-[#1a1a1b] border-t border-gray-50 pt-3">
                        {productType === "portrait" ? (
                          <>
                            <p><span className="text-gray-400 block">Portrait style</span><span className="font-bold">{PORTRAIT_STYLE_LABELS[portraitStyle]}</span></p>
                            <p><span className="text-gray-400 block">Size</span><span className="font-bold">{selectedSize}</span></p>
                            <p><span className="text-gray-400 block">Number of pets</span><span className="font-bold">{PET_COUNT_LABELS[selectedPets]}</span></p>
                            <p><span className="text-gray-400 block">Frame color</span><span className="font-bold">{frameColorLabel(selectedFrame, portraitStyle)}</span></p>
                            <p><span className="text-gray-400 block">Background</span><span className="font-bold">{selectedBg}</span></p>
                            <p><span className="text-gray-400 block">Add-on illustration</span><span className="font-bold">{selectedAddOn === "halo_effect" ? `Halo Effect · ${formatRs(ADDON_PRICES.halo_effect)}` : "None"}</span></p>
                            <p><span className="text-gray-400 block">Gift wrap</span><span className="font-bold">{giftWrap ? `Yes · ${formatRs(GIFT_WRAP_PRICE)}` : "No"}</span></p>
                            <p><span className="text-gray-400 block">Pet name</span><span className="font-bold">{petName || "—"}</span></p>
                            <p className="col-span-2"><span className="text-gray-400 block">Memorial text</span><span className="font-bold">{memorialText || "—"}</span></p>
                            <p className="col-span-2 truncate"><span className="text-gray-400 block">Uploaded photo</span><span className="font-bold">{selectedFile ? selectedFile.name : "—"}</span></p>
                          </>
                        ) : (
                          <>
                            <p className="col-span-2"><span className="text-gray-400 block">Service</span><span className="font-bold">{PRODUCT_LABELS[productType]}</span></p>
                            {petName && <p className="col-span-2"><span className="text-gray-400 block">Pet name</span><span className="font-bold">{petName}</span></p>}
                          </>
                        )}
                      </div>

                      {breakdown.portraitLines.length > 0 && productType === "portrait" && (
                        <div className="space-y-1.5 border-t border-gray-50 pt-3 text-[11px]">
                          {breakdown.portraitLines.map((line) => (
                            <div key={line.id} className="flex justify-between">
                              <span className="text-gray-500">{line.label}</span>
                              <span className="font-bold">{formatRs(line.price)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        {productType === "portrait" && (
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
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setAddedToCart(false);
                            setShowCart(false);
                          }}
                          className="ml-auto text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {extraProductsPicker("Additional Products")}

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Coupon Code
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase());
                              setCouponError(null);
                            }}
                            placeholder="Enter coupon code"
                            className={`w-full pl-9 pr-3 py-3 border-[1.5px] rounded-lg outline-none font-inter text-sm uppercase tracking-wider ${couponError ? "border-red-400 bg-red-50/40" : "border-gray-200 focus:border-[#1a1a1b]"}`}
                          />
                        </div>
                        {appliedCoupon ? (
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="px-4 py-3 rounded-lg border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 hover:bg-gray-50"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={applyCoupon}
                            disabled={isApplyingCoupon}
                            className="px-4 py-3 rounded-lg bg-[#1a1a1b] text-white text-xs font-black uppercase tracking-wider hover:bg-[#2F2F2F] disabled:opacity-60"
                          >
                            {isApplyingCoupon ? "..." : "Apply"}
                          </button>
                        )}
                      </div>
                      {couponError && <p className="text-[11px] font-bold text-red-500">{couponError}</p>}
                      {couponMessage && <p className="text-[11px] font-bold text-green-700">{couponMessage}</p>}
                    </div>
                  </>
                )}
              </div>

              {hasCustomizedItem && (
                <div className="p-5 border-t border-gray-100 bg-white space-y-4">
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold">{formatRs(portraitBaseAmount)}</span>
                    </div>
                    {extraLines.map((line) => (
                      <div key={line.id} className="flex justify-between">
                        <span className="text-gray-500">{line.label}</span>
                        <span className="font-bold">{formatRs(line.price)}</span>
                      </div>
                    ))}
                    {displayQuote.couponDiscount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Coupon {displayQuote.couponCode} ({displayQuote.couponPercent}%)</span>
                        <span className="font-bold">- {formatRs(displayQuote.couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                      <span className="font-black text-sm uppercase tracking-wide text-[#1a1a1b]">
                        Total
                      </span>
                      <span className="font-black text-lg text-[#1a1a1b] font-inter">
                        {formatRs(cartTotal)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleInitiateCheckout}
                      className="w-full py-4 bg-[#A87B62] hover:bg-[#966c55] text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      Initiate Checkout
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] flex justify-end">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowCheckout(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-[520px] bg-[#fdfdfb] h-full flex flex-col shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="bg-[#1a1a1b] text-white py-3 px-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckout(false);
                    setShowCart(true);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:text-white"
                >
                  <ArrowLeft size={14} /> Cart
                </button>
                <h2 className="text-sm font-black uppercase tracking-widest">Checkout</h2>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="text-white/80 hover:text-white font-black text-lg p-1 leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery Details</h3>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                      <p className="text-sm font-bold text-[#1a1a1b]">{customerName}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                      <input
                        type="email"
                        value={customerEmail}
                        readOnly
                        className="w-full px-3 py-2.5 border-[1.5px] border-gray-100 rounded-lg bg-gray-50 text-sm font-medium text-[#1a1a1b]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        readOnly
                        className="w-full px-3 py-2.5 border-[1.5px] border-gray-100 rounded-lg bg-gray-50 text-sm font-medium text-[#1a1a1b]"
                      />
                    </div>
                    {productType === "portrait" && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Full Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={shippingAddress}
                            onChange={(e) => {
                              setShippingAddress(e.target.value);
                              clearFieldError("shippingAddress");
                            }}
                            placeholder="House / Street / Area"
                            rows={3}
                            className={`w-full px-3 py-2.5 border-[1.5px] rounded-lg outline-none text-sm resize-none ${fieldErrors.shippingAddress ? "border-red-400 bg-red-50/40" : "border-gray-200 focus:border-[#1a1a1b]"}`}
                          />
                          <FieldError message={fieldErrors.shippingAddress} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              PIN Code <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={shippingPincode}
                              onChange={(e) => {
                                setShippingPincode(e.target.value);
                                clearFieldError("shippingPincode");
                              }}
                              placeholder="400001"
                              className={`w-full px-3 py-2.5 border-[1.5px] rounded-lg outline-none text-sm ${fieldErrors.shippingPincode ? "border-red-400 bg-red-50/40" : "border-gray-200 focus:border-[#1a1a1b]"}`}
                            />
                            <FieldError message={fieldErrors.shippingPincode} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              City <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={shippingCity}
                              onChange={(e) => {
                                setShippingCity(e.target.value);
                                clearFieldError("shippingCity");
                              }}
                              placeholder="Mumbai"
                              className={`w-full px-3 py-2.5 border-[1.5px] rounded-lg outline-none text-sm ${fieldErrors.shippingCity ? "border-red-400 bg-red-50/40" : "border-gray-200 focus:border-[#1a1a1b]"}`}
                            />
                            <FieldError message={fieldErrors.shippingCity} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              State <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={shippingState}
                              onChange={(e) => {
                                setShippingState(e.target.value);
                                clearFieldError("shippingState");
                              }}
                              placeholder="Maharashtra"
                              className={`w-full px-3 py-2.5 border-[1.5px] rounded-lg outline-none text-sm ${fieldErrors.shippingState ? "border-red-400 bg-red-50/40" : "border-gray-200 focus:border-[#1a1a1b]"}`}
                            />
                            <FieldError message={fieldErrors.shippingState} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Landmark</label>
                            <input
                              type="text"
                              value={shippingLandmark}
                              onChange={(e) => setShippingLandmark(e.target.value)}
                              placeholder="Optional"
                              className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg outline-none text-sm focus:border-[#1a1a1b]"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Options</h3>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("prepaid")}
                    className={`w-full text-left p-4 rounded-2xl border-[2px] transition-all ${paymentMethod === "prepaid" ? "border-[#1a1a1b] bg-white shadow-md" : "border-gray-200 bg-white"}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <Wallet size={18} className="text-[#A87B62] mt-0.5" />
                        <div>
                          <p className="font-black text-sm text-[#1a1a1b]">Full Payment / Prepaid</p>
                          <p className="text-[11px] text-green-700 font-bold mt-0.5">4% discount for paying the full amount now</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "prepaid" ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                        {paymentMethod === "prepaid" && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="space-y-1 text-[12px] bg-[#faf8f5] rounded-xl p-3">
                      <div className="flex justify-between"><span className="text-gray-500">Order Total</span><span className="font-bold">{formatRs(prepaidQuote.afterCouponAmount)}</span></div>
                      <div className="flex justify-between text-green-700"><span>Prepaid Discount (4%)</span><span className="font-bold">- {formatRs(prepaidQuote.prepaidDiscount)}</span></div>
                      <div className="flex justify-between pt-1 border-t border-dashed border-[#eadfc9] font-black"><span>Pay Now</span><span>{formatRs(prepaidQuote.payableNow)}</span></div>
                    </div>
                  </button>

                  {displayQuote.allowsCod && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`w-full text-left p-4 rounded-2xl border-[2px] transition-all ${paymentMethod === "cod" ? "border-[#1a1a1b] bg-white shadow-md" : "border-gray-200 bg-white"}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <IndianRupee size={18} className="text-[#A87B62] mt-0.5" />
                          <div>
                            <p className="font-black text-sm text-[#1a1a1b]">Cash on Delivery</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                              Pay 40% now to confirm your order. Remaining 60% will be payable at the time of delivery.
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                          {paymentMethod === "cod" && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <div className="space-y-1 text-[12px] bg-[#faf8f5] rounded-xl p-3">
                        <div className="flex justify-between"><span className="text-gray-500">Order Total</span><span className="font-bold">{formatRs(codQuote.afterCouponAmount)}</span></div>
                        <div className="flex justify-between"><span>40% Advance</span><span className="font-bold">{formatRs(codQuote.advanceAmount)}</span></div>
                        <div className="flex justify-between pt-1 border-t border-dashed border-[#eadfc9]">
                          <span>Remaining 60%</span>
                          <span className="font-bold">{formatRs(codQuote.remainingAmount)} — Payable on Delivery</span>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 bg-white space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500">Amount to pay now</span>
                  <span className="font-black text-[#1a1a1b]">{formatRs(displayQuote.payableNow)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#A87B62] hover:bg-[#966c55] text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      <span>Place Order & Pay</span>
                      <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg">
                        <img src="https://img.icons8.com/color/48/google-logo.png" className="w-4 h-4 bg-white rounded p-0.5" alt="GPay" />
                        <img src="https://img.icons8.com/color/48/paytm.png" className="w-4 h-4 bg-white rounded p-0.5" alt="Paytm" />
                        <img src="https://img.icons8.com/color/48/bhim.png" className="w-4 h-4 bg-white rounded p-0.5" alt="BHIM" />
                      </div>
                    </>
                  )}
                </button>
                <p className="text-center text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                  Powered By Razorpay
                </p>
              </div>
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

      {/* Warning Modal */}
      <AnimatePresence>
        {warningMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-[#1a1a1b] uppercase tracking-tight">Missing Details</h3>
                <p className="text-sm font-medium text-gray-500">{warningMessage}</p>
                <button
                  onClick={() => setWarningMessage(null)}
                  className="w-full py-3 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#2F2F2F] transition-all shadow-md active:scale-95 mt-2"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
