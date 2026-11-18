"use client";

import { useState, useRef, useEffect } from "react";
import { storedPetPhotoUrl } from "@/lib/pet-photo";
import { uploadPetPhotoFile } from "@/lib/uploadPetPhoto";
import { PhotoUploadBar, PreviewImage } from "@/components/PreviewImage";
import { UploadFailDialog, type UploadFailAlert } from "@/components/UploadFailDialog";
import {
  Upload,
  Star,
  ChevronDown,
  Check,
  Undo2,
  Truck,
  ShieldCheck,
  Gift,
  PawPrint,
  ArrowRight,
  ArrowLeft,
  Package,
  ShoppingBag,
  Wallet,
  IndianRupee,
  Tag,
  User,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useMedia, useUploadedMedia } from "@/components/SiteMedia";
import { GUIDE_STOCK_PHOTOS, uploadedKey } from "@/lib/site-media-catalog";
import {
  calculateQuote,
  cloneCatalog,
  cloneOptionMeta,
  couponOffLabel,
  DEFAULT_CATALOG,
  displaySizeLabel,
  extraProductLines,
  extrasTotal,
  bundleTierAmount,
  deskExtraPetAmount,
  greetingCardAmount,
  firstAvailablePets,
  firstAvailableSize,
  firstAvailableStyle,
  formatRupee,
  frameColorLabel,
  formatRs,
  getPortraitBreakdown,
  isOptionSelectable,
  isOptionVisible,
  PET_COUNT_LABELS,
  PORTRAIT_STYLE_LABELS,
  PRODUCT_LABELS,
  sizeOptionMeta,
  sizesForStyle,
  type CouponRule,
  type OptionMeta,
  type PaymentMethod,
  type PriceCatalog,
  type PortraitStyle,
  type PricingInput,
  type ProductType,
} from "@/lib/pricing";
import { trackPixel } from "@/lib/pixel";
import { ExtraProducts } from "@/components/ExtraProducts";
import { EverydayChooseStep } from "@/components/everyday/EverydayChooseStep";
import { EverydayCart, type CartDetail } from "@/components/everyday/EverydayCart";
import { EverydayProgress, RichText, TrustGlyph } from "@/components/everyday/ui";
import { BACKGROUNDS, backgroundById } from "@/lib/backgrounds";
import {
  compareAtPrice,
  CONFIGURATOR_MEDIA,
  CONFIGURATOR_SLUGS,
  DEFAULT_EVERYDAY_CONTENT,
  defaultContent,
  fill,
  isConfiguratorProduct,
  isNewProduct,
  limitedBackgroundIds,
  sizeHiddenForPets,
  bundleIncludedExtras,
  bundleInclusions,
  deskLayout,
  greetingOffered,
  visibleDeskColours,
  type BundleTier,
  type ConfiguratorProduct,
  type DeskPets,
  type EverydayContent,
  type ExtraId,
  type NewProduct,
  type PetTypeId,
} from "@/lib/everyday-content";
import {
  enabledMethods,
  isPhotoMethod,
  methodCopy,
  MULTI_PET_COUNTS,
  needsGroupConfirm,
  petCountNumber,
  referenceKeys,
  referenceNeedsPet,
  slotSpecs,
  type Composition,
  type FlowProduct,
  type PhotoMethod,
  newProductSlotKeys,
  type NewProductPayload,
} from "@/lib/product-order";
import { CompositionCards, PetCountCards } from "@/components/everyday/ProductChoice";
import { NamesSection, TributeSection } from "@/components/everyday/ProductPersonalize";
import { ArtistNote, MethodCards, SlotUploadsSection } from "@/components/everyday/PhotoMethodUpload";
import { useSlotUploads, type SavedSlot } from "@/components/everyday/useSlotUploads";
import { EverydayPersonalizeStep } from "@/components/everyday/EverydayPersonalizeStep";
import { EverydayUploadStep } from "@/components/everyday/EverydayUploadStep";
import { SaveOfferModal } from "@/components/SaveOfferModal";
import { SAVE_OFFER_STORAGE_KEY, SAVE_WHEEL, pickSaveOfferIndex, saveOfferRule } from "@/lib/save-offer";
import { DeliveryEstimate } from "@/components/DeliveryEstimate";
import { DeskChooseStep } from "@/components/desk/DeskChooseStep";
import { DeskPersonalizeStep } from "@/components/desk/DeskPersonalizeStep";
import { PhotoSlots, type PhotoSlotSpec } from "@/components/newproduct/PhotoSlots";
import { BundleTierCards } from "@/components/bundle/BundleTierCards";
import { GreetingCardSection } from "@/components/bundle/GreetingCardSection";
import { PetDetailsSection } from "@/components/bundle/PetDetailsSection";
import { PortraitStyleInfographic } from "@/components/PortraitStylePreview";


const PET_OPTIONS = [
  { id: "one", label: "One Pet", image: "/no-of-pets/one-pet.png", names: 1 },
  { id: "two", label: "Two Pets", image: "/no-of-pets/two-pet.png", names: 2 },
  { id: "three", label: "Three Pets", image: "/no-of-pets/three-pet.png", names: 3 },
  { id: "four", label: "Four Pets", image: "/no-of-pets/four-pet.png", names: 4 },
  { id: "human", label: "Human + Pet", image: "", names: 1 },
];



function isValidIndianMobile(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return /^[6-9]\d{9}$/.test(digits);
  if (digits.length === 12 && digits.startsWith("91")) return /^91[6-9]\d{9}$/.test(digits);
  return false;
}

const ADD_ONS = [
  // { id: "bowtie_bonus", label: "Bow Tie (Bonus)", image: "/bonus-image/bow-tie.png" },
  { id: "halo_effect", label: "Halo Effect", image: "/bonus-image/halo-effect.png" },
  // { id: "heart", label: "Heart", image: "/bonus-image/heart.png" },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

type SavedCart = Record<string, unknown>;
type CartOwner = ConfiguratorProduct | "standard";

/**
 * Pages that can show the same cart item. The home page, Memorial and Everyday are all one-photo flows and keep
 * sharing one cart as before; Multi-Pet and You & Your Pet carts carry their own photos and choices.
 */
function cartGroup(owner: CartOwner) {
  return owner === "standard" || owner === "everyday" ? "single" : owner;
}

/** Which configurator owns a saved cart. Older carts only saved the pet choice. */
function cartProductOf(saved: SavedCart): CartOwner {
  if (saved.cartProduct === "standard" || isConfiguratorProduct(saved.cartProduct) || isNewProduct(saved.cartProduct)) {
    return saved.cartProduct as ConfiguratorProduct | "standard";
  }
  const pets = String(saved.selectedPets || "");
  if (pets === "human") return "you_and_your_pet";
  if (pets === "two" || pets === "three" || pets === "four") return "multi_pet";
  return "everyday";
}

/** Page that shows a saved cart: where it was added ("/" or a product page), else the product's page. */
function savedCartPath(saved: SavedCart, product: CartOwner) {
  if (typeof saved.cartPath === "string" && /^\/(portraits\/[a-z0-9-]+)?$/.test(saved.cartPath)) return saved.cartPath;
  return `/portraits/${product === "standard" ? CONFIGURATOR_SLUGS.everyday : CONFIGURATOR_SLUGS[product]}`;
}

/** This page can show the saved cart. Carts saved before products were tagged stay shared with the home page, as before. */
function cartIsOwn(saved: SavedCart, page: CartOwner) {
  if (!saved.cartProduct && page === "standard") return true;
  return cartGroup(cartProductOf(saved)) === cartGroup(page);
}

/** Where to open the cart when it holds a portrait this page can't show; null when this page owns it. Never this page. */
function foreignCartTarget(saved: SavedCart, page: CartOwner): string | null {
  if (!saved.addedToCart || cartIsOwn(saved, page)) return null;
  const owner = cartProductOf(saved);
  const path = savedCartPath(saved, owner);
  return path === window.location.pathname ? null : path;
}

function foreignCartPath(page: CartOwner): string | null {
  try {
    const raw = localStorage.getItem("peternity_cart");
    return raw ? foreignCartTarget(JSON.parse(raw) as SavedCart, page) : null;
  } catch {
    return null;
  }
}

/** Multi-Pet / You & Your Pet / Desk Portrait / Gift Bundle keep their unfinished choices here, whichever page owns the cart. */
function draftKey(product: FlowProduct | NewProduct) {
  return `peternity_draft_${product}`;
}

const DESK_PET_IDS = ["one", "two", "three"] as const;

/** Desk Portrait pet count from a stored / admin number (1..3). */
function clampDeskPets(value: unknown): DeskPets {
  const n = Math.round(Number(value));
  return n === 2 ? 2 : n === 3 ? 3 : 1;
}

function isBundleTierId(value: unknown): value is BundleTier {
  return value === "essential" || value === "signature";
}

function isPetTypeId(value: unknown): value is PetTypeId {
  return value === "dog" || value === "cat" || value === "other";
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] font-bold text-red-500 mt-1.5">{message}</p>;
}

type ProductInfoProps = {
  title?: string;
  /** Pet choice a product page opens on. Ignored while the cart holds a portrait. */
  presetPets?: string;
  /** Three-step configurator (Everyday design). Multi-Pet and You & Your Pet add their own choices to it. */
  flow?: ConfiguratorProduct | "standard";
  /** Admin → Configurator copy for the Everyday flow. Defaults when omitted. */
  everydayContent?: EverydayContent;
  /** Live prices from the server, so the first paint never shows the built-in defaults. */
  initialCatalog?: PriceCatalog | null;
};

export function ProductInfo({
  title = "Custom Pet Portrait",
  presetPets,
  flow = "standard",
  everydayContent,
  initialCatalog,
}: ProductInfoProps = {}) {
  // "everyday" = the Everyday three-step design. Multi-Pet and You & Your Pet use it with their own content.
  const everyday = flow !== "standard";
  const configurator: ConfiguratorProduct | null = flow === "standard" ? null : flow;
  const flowProduct: FlowProduct | null = flow === "multi_pet" || flow === "you_and_your_pet" ? flow : null;
  const isMulti = flowProduct === "multi_pet";
  const isYouPet = flowProduct === "you_and_your_pet";
  // Desk Portrait / Signature Gift Bundle: Everyday design with their own steps (never FlowProducts).
  const isDesk = flow === "mini_desk";
  const isBundle = flow === "gift_bundle";
  const newProduct: NewProduct | null = isDesk ? "mini_desk" : isBundle ? "gift_bundle" : null;
  const content = everydayContent ?? (configurator ? defaultContent(configurator) : DEFAULT_EVERYDAY_CONTENT);
  const deskCopy = isDesk ? content.desk : undefined;
  const bundleCopy = isBundle ? content.bundle : undefined;
  const flowCopy = flowProduct ? content.flow : undefined;
  const mediaPrefix = configurator ? CONFIGURATOR_MEDIA[configurator].prefix : "everyday";
  /** Pets value each product prices with: Everyday one pet, You & Your Pet "human", Multi-Pet the chosen count. */
  const productPets = (pets: string) =>
    flow === "everyday" || isBundle
      ? "one"
      : isDesk
        ? DESK_PET_IDS[deskPets - 1] || "one"
        : isYouPet
        ? "human"
        : isMulti
          ? (MULTI_PET_COUNTS as readonly string[]).includes(pets)
            ? pets
            : "two"
          : pets;
  const startStyle: PortraitStyle = everyday && content.step1.defaultStyle === "canvas" ? "canvas" : "framed";
  const visibleFrames = content.frames.filter((frame) => frame.visible);
  // Frame a framed Everyday portrait starts on; a hidden default falls back to the first one on show.
  const framedFrameDefault = everyday
    ? visibleFrames.find((frame) => frame.id === content.step2.defaultFrame)?.id || visibleFrames[0]?.id || "black"
    : "black";
  const media = useMedia();
  const [currentStep, setCurrentStepRaw] = useState(1);
  const currentStepSafe = Math.min(Math.max(currentStep, 1), 3);
  const setCurrentStep = (value: number | ((prev: number) => number)) => {
    setCurrentStepRaw((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      return Math.min(Math.max(next, 1), 3);
    });
  };
  const [productType, setProductType] = useState<ProductType>("portrait");
  const [catalog, setCatalog] = useState<PriceCatalog>(() => (initialCatalog ? cloneCatalog(initialCatalog) : DEFAULT_CATALOG));
  const [couponRule, setCouponRule] = useState<CouponRule | null>(null);
  const [customPaymentAmount, setCustomPaymentAmount] = useState<number>(500);
  const [digitalDownloadAmount, setDigitalDownloadAmount] = useState<number>(300);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("prepaid");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [portraitStyle, setPortraitStyle] = useState<PortraitStyle>(startStyle);
  const [showStylePreview, setShowStylePreview] = useState(false);
  const [selectedSize, setSelectedSize] = useState(
    !everyday ? '12"x16"' : startStyle === "canvas" ? content.step1.defaultCanvasSize : content.step1.defaultFramedSize
  );
  const [selectedFrame, setSelectedFrame] = useState(startStyle === "canvas" ? "canva" : framedFrameDefault);
  const [selectedPets, setSelectedPets] = useState(isMulti ? "two" : isYouPet ? "human" : "one");
  const petNameCount = PET_OPTIONS.find((pet) => pet.id === selectedPets)?.names ?? 1;
  const humanPetImage = useUploadedMedia("pets-human");
  const [selectedBg, setSelectedBg] = useState(everyday ? content.step2.defaultBackground : "Pearl");
  const [selectedAddOn, setSelectedAddOn] = useState("none");
  const [giftWrap, setGiftWrap] = useState(false);
  const [priorityPreview, setPriorityPreview] = useState(everyday && content.step2.showPriority && content.step2.priorityDefaultOn);
  const [includePetName, setIncludePetName] = useState(everyday && content.step2.petNameDefaultOn);
  const [includeSubtitle, setIncludeSubtitle] = useState(
    isDesk ? Boolean(content.desk?.subtitleDefaultOn) : everyday && content.step2.subtitleDefaultOn
  );
  const [subtitle, setSubtitle] = useState("");
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
  const [addDesk, setAddDesk] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("/feature-detail.png");
  const [photoStatus, setPhotoStatus] = useState<"idle" | "uploading" | "saved" | "error">("idle");
  const [photoProgress, setPhotoProgress] = useState(0);
  const [photoError, setPhotoError] = useState("");
  const [uploadFailAlert, setUploadFailAlert] = useState<UploadFailAlert | null>(null);
  const uploadedPhotoUrlRef = useRef("");
  const uploadPromiseRef = useRef<Promise<string> | null>(null);
  const photoUploadGeneration = useRef(0);
  const previewObjectUrl = useRef<string | null>(null);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxOrderData, setSandboxOrderData] = useState<any>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<{ title: string; message: string } | null>(null);
  const [saveOffer, setSaveOffer] = useState<{ index: number; revealed: boolean } | null>(null);
  const [saveOfferError, setSaveOfferError] = useState<string | null>(null);
  const [isClaimingOffer, setIsClaimingOffer] = useState(false);
  const paymentSettled = useRef(false);
  const [deliveryDates, setDeliveryDates] = useState("");
  // Multi-Pet / You & Your Pet only.
  const [composition, setComposition] = useState<Composition>("solo");
  const [nameList, setNameList] = useState<string[]>([]);
  const [familyNames, setFamilyNames] = useState("");
  const [tribute, setTribute] = useState(false);
  const [haloPet, setHaloPet] = useState<number | null>(null);
  const [haloNote, setHaloNote] = useState("");
  const [photoMethod, setPhotoMethod] = useState<PhotoMethod>("group");
  const [confirmGroup, setConfirmGroup] = useState(false);
  const [artistNote, setArtistNote] = useState("");
  // Desk Portrait / Signature Gift Bundle only.
  const deskColourList = isDesk ? visibleDeskColours(content) : [];
  const deskColourDefault =
    deskColourList.find((colour) => colour.id === content.desk?.defaultColour)?.id || deskColourList[0]?.id || "";
  const [deskPets, setDeskPets] = useState<DeskPets>(() => clampDeskPets(content.desk?.defaultPets));
  const [deskColour, setDeskColour] = useState(deskColourDefault);
  const [deskNames, setDeskNames] = useState("");
  const [bundleTier, setBundleTier] = useState<BundleTier | "">(() =>
    isBundleTierId(content.bundle?.defaultTier) ? (content.bundle?.defaultTier as BundleTier) : ""
  );
  const [greetingCard, setGreetingCard] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState("");
  const [petType, setPetType] = useState<PetTypeId | "">("");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  // Path of the page whose portrait is already in the cart, when this page can't show it.
  const foreignCartRef = useRef<string | null>(null);
  const pageOwner: CartOwner = configurator ?? "standard";
  const uploads = useSlotUploads(
    {
      maxMb: content.step3.uploadMaxMb,
      formatErrorTitle: content.step3.formatErrorTitle,
      formatError: content.step3.formatError,
      tooLargeTitle: content.step3.tooLargeTitle,
      tooLargeError: content.step3.tooLargeError,
      uploadFailTitle: content.step3.uploadFailTitle,
    },
    (title, message) => setUploadFailAlert({ title, message })
  );
  const pricedPets = productPets(selectedPets);
  const petCount = isMulti ? petCountNumber(pricedPets) : 1;
  const methods = flowCopy ? enabledMethods(flowCopy) : [];
  const activeMethod: PhotoMethod = methods.includes(photoMethod) ? photoMethod : methods[0] || "group";
  const flowShape = flowProduct ? { product: flowProduct, method: activeMethod, composition, petCount } : null;
  const slotList = flowCopy && flowShape ? slotSpecs(flowCopy, flowShape) : [];
  const refKeys = flowCopy ? referenceKeys(flowCopy, activeMethod) : [];
  const usedRefKeys = refKeys.filter((key) => uploads.slots[key]);
  const activeSlotKeys = [...slotList.map((spec) => spec.key), ...usedRefKeys];
  const groupConfirmNeeded = Boolean(flowCopy && flowShape && needsGroupConfirm(flowCopy, flowShape));
  const tributeOn = isMulti && tribute && Boolean(flowCopy?.showTribute);
  // Size rules: Multi-Pet per pet count, You & Your Pet per composition.
  const sizeRule = isMulti ? pricedPets : isYouPet ? composition : isBundle ? bundleTier : "";
  const haloPetName = haloPet ? (nameList[haloPet - 1] || "").trim() : "";
  // A named pet is easy to find; otherwise the customer says which one gets the halo.
  // A name alone does not show which animal it is in a group photo (handoff p11), so ask whenever a halo pet is chosen.
  // Blanking the label in the admin turns the question off (the server then stops requiring it too).
  const haloNoteNeeded = tributeOn && Boolean(haloPet) && Boolean(flowCopy?.tributeNoteLabel.trim());
  // Desk Portrait / Gift Bundle photos live in `uploads` too (keys "pet-1".."pet-N").
  const deskPetsLabel = deskCopy
    ? deskPets === 1
      ? deskCopy.onePetLabel
      : fill(deskCopy.manyPetsLabel, { count: deskPets })
    : "";
  const deskLayoutLabel = deskCopy
    ? deskLayout(deskPets) === "vertical"
      ? deskCopy.verticalLabel
      : deskCopy.horizontalLabel
    : "";
  const deskNameParts = deskNames
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const bundlePhotoLabel = (() => {
    const text = content.step3.uploadHeading.replace(/^\s*\d+\.\s*/, "").replace(/^upload\s+/i, "").trim();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "Your pet's photo";
  })();
  const newSlotKeys = newProduct ? newProductSlotKeys(newProduct, { numPets: pricedPets }) : [];
  const newSlotSpecs: PhotoSlotSpec[] = newSlotKeys.map((key, index) => ({
    key,
    label: isDesk
      ? `${fill(deskCopy?.slotLabel || "Pet {n}", { n: index + 1 })}${
          deskNameParts.length === deskPets && deskNameParts[index] ? ` · ${deskNameParts[index]}` : ""
        }`
      : bundlePhotoLabel,
  }));
  const newSlotError = deskCopy?.slotError || content.step3.photoError;
  const newUploading = newSlotKeys.some((key) => uploads.slots[key]?.status === "uploading");
  // Before a bundle is chosen, prices show the first bundle on offer.
  const quoteTier: BundleTier =
    bundleTier || (bundleCopy && !bundleCopy.essentialVisible && bundleCopy.signatureVisible ? "signature" : "essential");
  const greetingPrice = isBundle ? greetingCardAmount(catalog, { configurator: "gift_bundle", greetingCard: true }) : 0;
  const greetingIsOffered = isBundle && greetingOffered(content, bundleTier) && greetingPrice >= 1;
  const greetingOn = greetingIsOffered && greetingCard;
  const deskExtraAmount = isDesk ? deskExtraPetAmount(catalog, pricedPets) : 0;
  const deskColourLabel = deskColourList.find((colour) => colour.id === deskColour)?.label || deskColour;
  const deskProductionSize = deskCopy?.productionSize || "Desk Portrait (fixed size)";
  const bundleIncluded: ExtraId[] = isBundle ? bundleIncludedExtras(quoteTier) : [];

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
    return () => {
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    };
  }, []);

  // 1. Listen for global cart toggles (e.g. from the Navbar)
  useEffect(() => {
    const handleToggleCart = () => {
      // The portrait in the cart was built on another product page: show it there.
      if (foreignCartRef.current) {
        window.location.assign(`${foreignCartRef.current}?cart=open`);
        return;
      }
      setShowCart(prev => !prev);
    };
    window.addEventListener('toggleCart', handleToggleCart);
    return () => window.removeEventListener('toggleCart', handleToggleCart);
  }, []);

  // Pages without the order form send the cart button here with ?cart=open
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("cart") !== "open") return;
    url.searchParams.delete("cart");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    const elsewhere = foreignCartPath(pageOwner);
    if (elsewhere) {
      window.location.replace(`${elsewhere}?cart=open`);
      return;
    }
    setShowCart(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pricing", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.catalog) setCatalog(cloneCatalog(data.catalog as PriceCatalog));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Drop selections that admin has hidden or marked out of stock.
  useEffect(() => {
    const styleOk =
      isOptionSelectable(catalog.options.styles[portraitStyle]) &&
      !!firstAvailableSize(portraitStyle, catalog);
    if (!styleOk) {
      const nextStyle = firstAvailableStyle(catalog);
      if (nextStyle) {
        setPortraitStyle(nextStyle);
        setSelectedFrame(nextStyle === "framed" ? framedFrameDefault : "canva");
        const nextSize = firstAvailableSize(nextStyle, catalog);
        if (nextSize) setSelectedSize(nextSize);
      }
      return;
    }

    const sizeMeta = sizeOptionMeta(catalog, portraitStyle, selectedSize);
    // Missing meta = size doesn't belong to this style (e.g. framed size after switching to canvas).
    if (!sizeMeta || !isOptionSelectable(sizeMeta)) {
      const nextSize = firstAvailableSize(portraitStyle, catalog);
      if (nextSize) setSelectedSize(nextSize);
    }

    if (!isOptionSelectable(catalog.options.pets[selectedPets])) {
      const nextPets = firstAvailablePets(catalog);
      if (nextPets) setSelectedPets(nextPets);
    }
  }, [catalog, portraitStyle, selectedSize, selectedPets]);

  // 2. Load customizer choices & cart details from persisted cache on mount
  useEffect(() => {
    let cartHasPortrait = false;
    let restoredOwnChoices = false;
    // Portrait choices, from the cart or (Multi-Pet / You & Your Pet) from this product's draft.
    const applyChoices = (src: SavedCart) => {
      if (src.portraitStyle === "framed" || src.portraitStyle === "canvas") setPortraitStyle(src.portraitStyle);
      if (typeof src.selectedSize === "string" && src.selectedSize) setSelectedSize(src.selectedSize);
      if (typeof src.selectedFrame === "string" && src.selectedFrame) setSelectedFrame(src.selectedFrame);
      if (typeof src.selectedPets === "string" && src.selectedPets) setSelectedPets(src.selectedPets);
      if (typeof src.selectedBg === "string" && src.selectedBg) setSelectedBg(src.selectedBg);
      if (typeof src.priorityPreview === "boolean") setPriorityPreview(src.priorityPreview);
      if (typeof src.includePetName === "boolean") setIncludePetName(src.includePetName);
      if (typeof src.includeSubtitle === "boolean") setIncludeSubtitle(src.includeSubtitle);
      if (typeof src.subtitle === "string" && src.subtitle) setSubtitle(src.subtitle);
      if (newProduct) {
        if (src.deskPets !== undefined) setDeskPets(clampDeskPets(src.deskPets));
        if (typeof src.deskColour === "string" && src.deskColour) setDeskColour(src.deskColour);
        if (typeof src.deskNames === "string") setDeskNames(src.deskNames);
        if (src.bundleTier === "" || isBundleTierId(src.bundleTier)) setBundleTier(src.bundleTier as BundleTier | "");
        if (typeof src.greetingCard === "boolean") setGreetingCard(src.greetingCard);
        if (typeof src.greetingMessage === "string") setGreetingMessage(src.greetingMessage);
        if (src.petType === "" || isPetTypeId(src.petType)) setPetType(src.petType as PetTypeId | "");
        if (typeof src.petBreed === "string") setPetBreed(src.petBreed);
        if (typeof src.petAge === "string") setPetAge(src.petAge);
        if (typeof src.petName === "string" && src.petName) setPetName(src.petName);
        if (src.flowPhotos && typeof src.flowPhotos === "object") uploads.restore(src.flowPhotos as Record<string, SavedSlot>);
        return;
      }
      if (!flowProduct) return;
      if (src.composition === "solo" || src.composition === "family") setComposition(src.composition);
      if (Array.isArray(src.nameList)) setNameList(src.nameList.slice(0, 4).map((name: unknown) => String(name ?? "")));
      if (typeof src.familyNames === "string") setFamilyNames(src.familyNames);
      if (typeof src.tribute === "boolean") setTribute(src.tribute);
      if (typeof src.haloPet === "number" && Number.isInteger(src.haloPet)) setHaloPet(src.haloPet);
      if (typeof src.haloNote === "string") setHaloNote(src.haloNote);
      if (isPhotoMethod(src.photoMethod)) setPhotoMethod(src.photoMethod);
      if (typeof src.confirmGroup === "boolean") setConfirmGroup(src.confirmGroup);
      if (typeof src.artistNote === "string") setArtistNote(src.artistNote);
      if (src.flowPhotos && typeof src.flowPhotos === "object") uploads.restore(src.flowPhotos as Record<string, SavedSlot>);
    };
    try {
      const saved = localStorage.getItem('peternity_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        // A page only takes back carts it can show (see cartGroup). A portrait from another product stays in the
        // cart untouched, and this page leaves it alone until it adds its own.
        const own = cartIsOwn(parsed, pageOwner);
        if (!own) foreignCartRef.current = foreignCartTarget(parsed, pageOwner);
        if (parsed.customerName) setCustomerName(parsed.customerName);
        if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
        if (parsed.customerEmail) setCustomerEmail(parsed.customerEmail);
        if (parsed.shippingAddress) setShippingAddress(parsed.shippingAddress);
        if (parsed.shippingCity) setShippingCity(parsed.shippingCity);
        if (parsed.shippingState) setShippingState(parsed.shippingState);
        if (parsed.shippingPincode) setShippingPincode(parsed.shippingPincode);
        if (parsed.shippingLandmark) setShippingLandmark(parsed.shippingLandmark);
        if (own) {
          restoredOwnChoices = true;
          cartHasPortrait = Boolean(parsed.addedToCart);
          applyChoices(parsed);
          if (parsed.productType === "portrait") setProductType("portrait");
          if (parsed.customPaymentAmount) setCustomPaymentAmount(parsed.customPaymentAmount);
          if (parsed.digitalDownloadAmount) setDigitalDownloadAmount(parsed.digitalDownloadAmount);
          if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
          if (parsed.appliedCoupon) setAppliedCoupon(parsed.appliedCoupon);
          if (parsed.couponInput) setCouponInput(parsed.couponInput);
          if (parsed.selectedAddOn) setSelectedAddOn(parsed.selectedAddOn);
          if (parsed.giftWrap !== undefined) setGiftWrap(parsed.giftWrap);
          if (parsed.petName) setPetName(parsed.petName);
          if (parsed.cartQty) setCartQty(parsed.cartQty);
          if (parsed.addMagnet !== undefined) setAddMagnet(parsed.addMagnet);
          if (parsed.addMug !== undefined) setAddMug(parsed.addMug);
          if (parsed.addDigitalDownload !== undefined) setAddDigitalDownload(parsed.addDigitalDownload);
          if (parsed.addDesk !== undefined) setAddDesk(parsed.addDesk);
          if (parsed.addedToCart) setAddedToCart(true);
          if (parsed.memorialText) setMemorialText(parsed.memorialText);
        }
      }
      // Multi-Pet / You & Your Pet / Desk / Bundle: unfinished work survives a visit to another product page.
      const draftProduct = flowProduct ?? newProduct;
      if (draftProduct && !restoredOwnChoices) {
        const draft = localStorage.getItem(draftKey(draftProduct));
        if (draft) {
          applyChoices(JSON.parse(draft) as SavedCart);
          restoredOwnChoices = true;
        }
      }
    } catch (e) {
      console.warn("Failed to load persisted cart cache:", e);
    }
    // Changing pets here would silently change the portrait already in the cart.
    if (flow === "everyday") {
      if (!cartHasPortrait) setSelectedPets("one");
    } else if (flowProduct) {
      if (!restoredOwnChoices) setSelectedPets(isYouPet ? "human" : "two");
    } else if (newProduct) {
      // Desk pets live in deskPets; the bundle is always one pet.
      setSelectedPets("one");
    } else if (presetPets && !cartHasPortrait) {
      setSelectedPets(presetPets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetPets, everyday]);

  // 3. Keep cache synchronized in localStorage when configurations change
  useEffect(() => {
    // Another product's portrait is in the cart: keep it until this page adds its own.
    if (foreignCartRef.current && !addedToCart) return;
    const cartState = {
      cartProduct: configurator ?? "standard",
      cartPath: window.location.pathname,
      productType,
      customPaymentAmount,
      digitalDownloadAmount,
      paymentMethod,
      appliedCoupon,
      couponInput,
      portraitStyle,
      selectedSize,
      selectedFrame,
      selectedPets: everyday ? productPets(selectedPets) : selectedPets,
      selectedBg,
      selectedAddOn,
      giftWrap,
      priorityPreview,
      includePetName,
      includeSubtitle,
      subtitle,
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
      addDesk,
      addedToCart,
      hasCustomizedItem: addedToCart,
      ...(flowProduct
        ? {
            composition,
            nameList,
            familyNames,
            tribute,
            haloPet,
            haloNote,
            photoMethod: activeMethod,
            confirmGroup,
            artistNote,
            flowPhotos: uploads.savedSlots(),
          }
        : {}),
      ...(newProduct
        ? {
            deskPets,
            deskColour,
            deskNames,
            bundleTier,
            greetingCard,
            greetingMessage,
            petType,
            petBreed,
            petAge,
            flowPhotos: uploads.savedSlots(),
          }
        : {}),
    };
    try {
      localStorage.setItem('peternity_cart', JSON.stringify(cartState));
      
      const count = addedToCart
        ? (1 + (addMagnet ? 1 : 0) + (addMug ? 1 : 0) + (addDigitalDownload ? 1 : 0) + (addDesk ? 1 : 0) + (giftWrap ? 1 : 0) + (greetingOn ? 1 : 0))
        : 0;
      window.dispatchEvent(new CustomEvent('cartBadgeUpdated', { detail: count }));
    } catch (e) {
      console.warn("Failed to persist cart cache:", e);
    }
    // configurator / flowProduct come from props; saved photos follow uploads.slots.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    portraitStyle,
    selectedSize,
    selectedFrame,
    selectedPets,
    selectedBg,
    selectedAddOn,
    giftWrap,
    priorityPreview,
    includePetName,
    includeSubtitle,
    subtitle,
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
    addDesk,
    addedToCart,
    selectedFile,
    productType,
    customPaymentAmount,
    digitalDownloadAmount,
    paymentMethod,
    appliedCoupon,
    couponInput,
    everyday,
    composition,
    nameList,
    familyNames,
    tribute,
    haloPet,
    haloNote,
    activeMethod,
    confirmGroup,
    artistNote,
    uploads.slots,
    deskPets,
    deskColour,
    deskNames,
    bundleTier,
    greetingCard,
    greetingMessage,
    greetingOn,
    petType,
    petBreed,
    petAge,
  ]);

  // Multi-Pet / You & Your Pet / Desk / Bundle draft, kept whichever page owns the cart (photos are saved links, never files).
  useEffect(() => {
    const draftProduct = flowProduct ?? newProduct;
    if (!draftProduct) return;
    try {
      if (newProduct) {
        localStorage.setItem(
          draftKey(newProduct),
          JSON.stringify({
            portraitStyle,
            selectedSize,
            selectedFrame,
            selectedPets: pricedPets,
            selectedBg,
            includePetName,
            includeSubtitle,
            subtitle,
            petName,
            deskPets,
            deskColour,
            deskNames,
            bundleTier,
            greetingCard,
            greetingMessage,
            petType,
            petBreed,
            petAge,
            flowPhotos: uploads.savedSlots(),
          })
        );
        return;
      }
      localStorage.setItem(
        draftKey(draftProduct),
        JSON.stringify({
          portraitStyle,
          selectedSize,
          selectedFrame,
          selectedPets: pricedPets,
          selectedBg,
          priorityPreview,
          includePetName,
          includeSubtitle,
          subtitle,
          composition,
          nameList,
          familyNames,
          tribute,
          haloPet,
          haloNote,
          photoMethod: activeMethod,
          confirmGroup,
          artistNote,
          flowPhotos: uploads.savedSlots(),
        })
      );
    } catch {
      // Private mode or full storage: the page still works, only the draft is not kept.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    flowProduct,
    portraitStyle,
    selectedSize,
    selectedFrame,
    pricedPets,
    selectedBg,
    priorityPreview,
    includePetName,
    includeSubtitle,
    subtitle,
    composition,
    nameList,
    familyNames,
    tribute,
    haloPet,
    haloNote,
    activeMethod,
    confirmGroup,
    artistNote,
    uploads.slots,
    newProduct,
    petName,
    deskPets,
    deskColour,
    deskNames,
    bundleTier,
    greetingCard,
    greetingMessage,
    petType,
    petBreed,
    petAge,
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  const SOCIAL_PROOF_AVATARS = [
    { src: "review bar image 1.jpg.jpeg", face: "57% 32%", zoom: 2.4 },
    { src: "Review bar image 2.jpg.jpeg", face: "64% 55%", zoom: 1.8 },
    { src: "Review bat image 3.jpg.jpeg", face: "53% 18%", zoom: 3 },
  ];

  const testimonials = [
    {
      content: content.below.testimonialText,
      author: content.below.testimonialAuthor,
      avatar: "review bar image 1.jpg.jpeg"
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
    // Desk Portrait has one fixed size and no style (the server ignores both for its price).
    portraitStyle: isDesk ? "framed" : portraitStyle,
    size: isDesk ? deskProductionSize : selectedSize,
    numPets: everyday ? pricedPets : selectedPets,
    background: isDesk ? deskColour : selectedBg,
    addon: everyday ? "none" : selectedAddOn,
    giftWrap,
    priorityPreview: everyday ? priorityPreview : false,
    cartQty,
    addDigitalDownload: productType === "portrait" ? addDigitalDownload : false,
    addMagnet,
    addMug,
    addDesk: everyday ? addDesk : false,
    customPaymentAmount,
    digitalDownloadAmount,
    couponCode: appliedCoupon,
    couponRule,
    paymentMethod: productType === "portrait" ? paymentMethod : "prepaid",
    ...(flowProduct
      ? {
          configurator: flowProduct,
          composition: isYouPet ? composition : undefined,
          tribute: isMulti ? tributeOn : undefined,
        }
      : {}),
    ...(newProduct
      ? {
          configurator: newProduct,
          bundleTier: isBundle ? quoteTier : undefined,
          greetingCard: isBundle ? greetingOn : undefined,
        }
      : {}),
  };
  // Multi-Pet / You & Your Pet / Gift Bundle charge Limited Edition for their own background list; Desk has none.
  const quoteCatalog: PriceCatalog = isDesk
    ? { ...catalog, limitedBackgrounds: [] }
    : flowProduct || isBundle
      ? { ...catalog, limitedBackgrounds: limitedBackgroundIds(content) }
      : catalog;

  // Names exactly as the order needs them: one per pet (Multi-Pet), or the chosen composition (You & Your Pet).
  const orderNames = isMulti
    ? Array.from({ length: petCount }, (_, i) => (nameList[i] || "").trim())
    : isYouPet
      ? composition === "solo"
        ? [(nameList[0] || "").trim(), (nameList[1] || "").trim()]
        : [familyNames.trim()]
      : [];
  const flowNamesText = (isYouPet && composition === "solo" ? orderNames.filter(Boolean).join(" & ") : orderNames.filter(Boolean).join(", "));
  const effectivePetName = isDesk
    ? deskNames.trim()
    : flowProduct
    ? includePetName
      ? flowNamesText
      : ""
    : everyday
      ? includePetName
        ? petName.trim()
        : ""
      : petName;
  const effectiveSubtitle = everyday ? (includeSubtitle ? subtitle.trim() : "") : memorialText;
  // Everyday tiles: admin order, labels and visibility; ids stay the order / pricing keys.
  // Limited Edition stays hidden on Multi-Pet / You & Your Pet until the admin switches it on (handoffs).
  const everydayBackgrounds = content.backgrounds
    .filter((entry) => entry.visible && (!flowCopy || flowCopy.showLimited || !entry.limited))
    .map((entry) => {
      const builtIn = backgroundById(entry.id);
      return {
        id: entry.id,
        label: entry.label,
        value: builtIn?.isImage ? media(builtIn.value) : entry.color,
        isImage: builtIn?.isImage,
        limited: entry.limited,
      };
    });
  const everydayBgIds = everydayBackgrounds.map((bg) => bg.id).join("|");
  const everydayFrameIds = visibleFrames.map((frame) => frame.id).join("|");

  // A background the admin has hidden falls back to the first one still on show.
  useEffect(() => {
    if (!everyday || addedToCart) return;
    const ids = everydayBgIds.split("|").filter(Boolean);
    if (ids.length && !ids.includes(selectedBg)) setSelectedBg(ids[0]);
  }, [everyday, everydayBgIds, selectedBg, addedToCart]);

  // Same for a frame the admin has hidden or removed.
  useEffect(() => {
    if (!everyday || addedToCart || portraitStyle !== "framed") return;
    const ids = everydayFrameIds.split("|").filter(Boolean);
    if (ids.length && !ids.includes(selectedFrame)) setSelectedFrame(framedFrameDefault);
  }, [everyday, everydayFrameIds, framedFrameDefault, selectedFrame, portraitStyle, addedToCart]);

  // Never charge for an add-on the admin has taken off the page (it may still be in a saved cart).
  useEffect(() => {
    if (!everyday) return;
    if (!content.extras.mug.visible) setAddMug(false);
    if (!content.extras.magnet.visible) setAddMagnet(false);
    if (!content.extras.digital.visible) setAddDigitalDownload(false);
    if (!content.extras.desk.visible) setAddDesk(false);
    if (!content.cart.showGift) setGiftWrap(false);
    if (!content.step2.showPriority) setPriorityPreview(false);
  }, [
    everyday,
    content.extras.mug.visible,
    content.extras.magnet.visible,
    content.extras.digital.visible,
    content.extras.desk.visible,
    content.cart.showGift,
    content.step2.showPriority,
  ]);

  // A size the admin keeps off sale for this many pets / this composition moves to the first one still offered.
  useEffect(() => {
    if (!sizeRule || !sizeHiddenForPets(content, sizeRule, portraitStyle, selectedSize)) return;
    const next = sizesForStyle(portraitStyle, catalog).find(
      (size) =>
        isOptionSelectable(sizeOptionMeta(catalog, portraitStyle, size)) &&
        !sizeHiddenForPets(content, sizeRule, portraitStyle, size)
    );
    if (next) setSelectedSize(next);
  }, [sizeRule, content, portraitStyle, selectedSize, catalog]);

  // Multi-Pet: a pet count switched off in Pricing moves to the first count still on sale.
  useEffect(() => {
    if (!isMulti || isOptionSelectable(catalog.options.pets[pricedPets])) return;
    const next = MULTI_PET_COUNTS.find((id) => isOptionSelectable(catalog.options.pets[id]));
    if (next && next !== pricedPets) setSelectedPets(next);
  }, [isMulti, catalog, pricedPets]);

  // A photo method the admin switched off falls back to the first one still offered.
  useEffect(() => {
    if (flowProduct && activeMethod !== photoMethod) setPhotoMethod(activeMethod);
  }, [flowProduct, activeMethod, photoMethod]);

  // The halo goes when the admin turns A Special Tribute off (it may still be in a saved cart).
  useEffect(() => {
    if (isMulti && !flowCopy?.showTribute && tribute) setTribute(false);
  }, [isMulti, flowCopy?.showTribute, tribute]);

  // Desk Portrait: a colour the admin has hidden falls back to the default / first one on show.
  const deskColourIds = deskColourList.map((colour) => colour.id).join("|");
  useEffect(() => {
    if (!isDesk || addedToCart) return;
    const ids = deskColourIds.split("|").filter(Boolean);
    if (ids.length && !ids.includes(deskColour)) setDeskColour(deskColourDefault);
  }, [isDesk, deskColourIds, deskColour, deskColourDefault, addedToCart]);

  // Desk Portrait: a pet count the admin hides moves back to one pet (its extra photos go with it).
  const deskTwoOn = deskCopy?.showTwoPets !== false;
  const deskThreeOn = deskCopy?.showThreePets !== false;
  useEffect(() => {
    if (!isDesk) return;
    if ((deskPets === 2 && !deskTwoOn) || (deskPets === 3 && !deskThreeOn)) {
      setDeskPets(1);
      uploads.removeMany(Object.keys(uploads.slots).filter((key) => /^pet-[2-9]$/.test(key)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesk, deskPets, deskTwoOn, deskThreeOn]);

  // Gift Bundle: the greeting card goes when it is no longer offered with this bundle.
  useEffect(() => {
    if (isBundle && !greetingIsOffered && greetingCard) setGreetingCard(false);
  }, [isBundle, greetingIsOffered, greetingCard]);

  // Gift Bundle: what the bundle already includes is never added again as a paid extra.
  const bundleIncludedIds = bundleIncluded.join("|");
  useEffect(() => {
    if (!isBundle) return;
    const ids = bundleIncludedIds.split("|");
    if (ids.includes("mug")) setAddMug(false);
    if (ids.includes("magnet")) setAddMagnet(false);
    if (ids.includes("digital")) setAddDigitalDownload(false);
    if (ids.includes("desk")) setAddDesk(false);
  }, [isBundle, bundleIncludedIds, addMug, addMagnet, addDigitalDownload, addDesk]);

  const backgroundLabel = (id: string) =>
    content.backgrounds.find((bg) => bg.id === id)?.label || backgroundById(id)?.label || id;

  let quote;
  try {
    quote = calculateQuote(pricingInput, quoteCatalog);
  } catch {
    quote = calculateQuote({ ...pricingInput, couponCode: null, couponRule: null }, quoteCatalog);
  }

  const prepaidQuote = calculateQuote({
    ...pricingInput,
    couponCode: quote.couponCode,
    couponRule: quote.couponRule,
    paymentMethod: "prepaid",
  }, quoteCatalog);
  const codQuote = calculateQuote({
    ...pricingInput,
    couponCode: quote.couponCode,
    couponRule: quote.couponRule,
    paymentMethod: "cod",
  }, quoteCatalog);

  const totalPrice = quote.originalAmount;
  const cutPrice = Math.round(totalPrice / 0.70);
  const displayQuote = quote;
  const extraLines = extraProductLines(pricingInput, quoteCatalog);
  const extrasAmount = extrasTotal(pricingInput, quoteCatalog);
  const portraitBaseAmount = Math.max(0, quote.originalAmount - extrasAmount);
  const breakdown = getPortraitBreakdown(pricingInput, quoteCatalog);
  const cartTotal = quote.afterCouponAmount;
  const offerSlice = saveOffer ? SAVE_WHEEL[saveOffer.index] : null;
  const offerRule = offerSlice ? saveOfferRule(offerSlice.code) : null;
  let offerQuote = quote;
  if (offerRule) {
    try {
      offerQuote = calculateQuote({ ...pricingInput, couponCode: offerRule.code, couponRule: offerRule }, quoteCatalog);
    } catch {
      offerQuote = quote;
    }
  }
  const keepCurrentOffer = Boolean(appliedCoupon && offerQuote.couponDiscount < quote.couponDiscount);

  const extraProductsPicker = (title?: string) =>
    productType === "portrait" ? (
    <ExtraProducts
      catalog={catalog}
      addMug={addMug}
      addMagnet={addMagnet}
      addGift={addDigitalDownload}
      addDesk={addDesk}
      showDesk={everyday}
      onToggleMug={() => setAddMug(!addMug)}
      onToggleMagnet={() => setAddMagnet(!addMagnet)}
      onToggleGift={() => setAddDigitalDownload(!addDigitalDownload)}
      onToggleDesk={() => setAddDesk(!addDesk)}
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
    if (productType === "custom_payment" && !catalog.customPayments.includes(customPaymentAmount)) {
      errors.customPayment = "Please select a Custom Payment amount.";
    }
    // Pet options switched off in Pricing (Number of pets) also close these products.
    if (flowProduct && !isOptionSelectable(catalog.options.pets[pricedPets])) {
      errors.pets = content.step1.unavailableLabel;
      setWarningMessage(errors.pets);
    }
    // Gift Bundle: a bundle must be chosen (nothing is preselected).
    if (isBundle && !bundleTier) {
      errors.tier = bundleCopy?.tierError || content.step1.unavailableLabel;
      setWarningMessage(errors.tier);
    }
    // Only sizes the admin offers for this many pets / this composition may continue.
    if (sizeRule && sizeHiddenForPets(content, sizeRule, portraitStyle, selectedSize)) {
      errors.size = flowCopy
        ? fill(flowCopy.sizeHiddenError, { size: displaySizeLabel(selectedSize), count: petCount })
        : `Size ${displaySizeLabel(selectedSize)} is not available for this portrait. Please choose another size.`;
      setWarningMessage(errors.size);
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    // Everyday's name and subtitle are optional: left empty, they simply show as not added.
    if (!everyday && (productType === "portrait" || productType === "digital_download")) {
      if (!petName.trim()) errors.petName = "Please enter your pet's name to continue.";
      if (!selectedFile) errors.photo = "Please choose a pet photo to continue.";
    }
    // Multi-Pet halo: exactly one chosen pet.
    if (tributeOn && !(haloPet && haloPet >= 1 && haloPet <= petCount)) {
      errors.haloPet = flowCopy?.tributeError || "Choose the pet who should have the halo.";
    } else if (haloNoteNeeded && !haloNote.trim()) {
      errors.haloNote = flowCopy?.tributeNoteError || "Please tell us which pet should have the halo.";
    }
    // Desk Portrait: a colour on show and the pet name(s) are required.
    if (isDesk) {
      if (!deskColourList.some((colour) => colour.id === deskColour)) errors.colour = content.step1.unavailableLabel;
      if (!deskNames.trim()) errors.names = deskCopy?.namesError || "Please enter your pet's name to continue.";
    }
    // Gift Bundle: the greeting card needs its message.
    if (greetingOn && !greetingMessage.trim()) {
      errors.greeting = bundleCopy?.greetingError || "Please write the message for your greeting card.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (flow === "everyday") {
      if (!selectedFile) errors.photo = content.step3.photoError;
      if (photoStatus === "error") errors.photo = photoError || content.step3.photoError;
    }
    if (flowProduct && flowCopy) {
      for (const key of activeSlotKeys) {
        const state = uploads.slots[key];
        if (state?.status === "error") errors[`photo:${key}`] = state.error || content.step3.uploadFailedLabel;
      }
      for (const spec of slotList) {
        if (spec.required && !uploads.slots[spec.key]) errors[`photo:${spec.key}`] = fill(flowCopy.slotError, { slot: spec.label });
      }
      if (referenceNeedsPet(flowProduct)) {
        for (const key of usedRefKeys) {
          if (!errors[`photo:${key}`] && !uploads.slots[key]?.pet) errors[`photo:${key}`] = flowCopy.referencePetError;
        }
      }
      if (groupConfirmNeeded && !confirmGroup) errors.confirmGroup = flowCopy.confirmGroupError;
    }
    if (newProduct) {
      for (const spec of newSlotSpecs) {
        const state = uploads.slots[spec.key];
        if (state?.status === "error") errors[`photo:${spec.key}`] = state.error || content.step3.uploadFailedLabel;
        else if (!state) errors[`photo:${spec.key}`] = fill(newSlotError, { slot: spec.label });
      }
    }
    if (!customerName.trim()) {
      errors.customerName = everyday ? content.step3.nameError : "Please enter your full name to continue.";
    }
    if (!everyday) {
      if (!customerEmail.trim()) errors.customerEmail = "Please enter your email to continue.";
      else if (!isValidEmail(customerEmail)) errors.customerEmail = "Please enter a valid email to continue.";
    } else if (customerEmail.trim() && !isValidEmail(customerEmail)) {
      errors.customerEmail = content.step3.emailError;
    }
    if (everyday) {
      if (!isValidIndianMobile(customerPhone)) {
        errors.customerPhone = content.step3.phoneError;
      }
    } else if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 10) {
      errors.customerPhone = "Please enter a valid mobile number to continue.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Multi-Pet / You & Your Pet: Add to Cart stays off until every required photo is saved on the server
  // and the required details are valid (handoffs §5). The first missing item is shown above the button.
  const flowUploading = activeSlotKeys.some((key) => uploads.slots[key]?.status === "uploading");
  const flowBlocker = (() => {
    if (!flowProduct || !flowCopy) return "";
    if (flowUploading) return flowCopy.uploadsPendingLabel;
    for (const key of activeSlotKeys) {
      const state = uploads.slots[key];
      if (state?.status === "error") return state.error || content.step3.uploadFailedLabel;
    }
    for (const spec of slotList) {
      if (spec.required && uploads.slots[spec.key]?.status !== "saved") return fill(flowCopy.slotError, { slot: spec.label });
    }
    if (referenceNeedsPet(flowProduct) && usedRefKeys.some((key) => !uploads.slots[key]?.pet)) return flowCopy.referencePetError;
    if (groupConfirmNeeded && !confirmGroup) return flowCopy.confirmGroupError;
    if (!customerName.trim()) return content.step3.nameError;
    if (!isValidIndianMobile(customerPhone)) return content.step3.phoneError;
    if (customerEmail.trim() && !isValidEmail(customerEmail)) return content.step3.emailError;
    return "";
  })();
  // Desk Portrait / Gift Bundle: same rule, for their "pet-N" photos.
  const newBlocker = (() => {
    if (!newProduct) return "";
    if (newUploading) return deskCopy?.uploadsPendingLabel || content.flow?.uploadsPendingLabel || content.step3.photoError;
    for (const spec of newSlotSpecs) {
      const state = uploads.slots[spec.key];
      if (state?.status === "error") return state.error || content.step3.uploadFailedLabel;
      if (state?.status !== "saved") return fill(newSlotError, { slot: spec.label });
    }
    if (!customerName.trim()) return content.step3.nameError;
    if (!isValidIndianMobile(customerPhone)) return content.step3.phoneError;
    if (customerEmail.trim() && !isValidEmail(customerEmail)) return content.step3.emailError;
    return "";
  })();
  const cartBlocker = flowProduct ? flowBlocker : newBlocker;
  const newPreviewUrl = newSlotKeys.map((key) => uploads.slots[key]?.previewUrl || "").find(Boolean) || "";

  /** Desk Portrait / Gift Bundle: waits for every slot photo; returns the first photo and all saved links. */
  const ensureNewPhotos = async () => {
    const urls = await uploads.ensure(newSlotKeys);
    const missing = newSlotSpecs.find((spec) => !urls[spec.key]);
    if (missing) throw new Error(fill(newSlotError, { slot: missing.label }));
    return { primary: urls[newSlotKeys[0]] || "", urls };
  };

  /** Desk Portrait pet count. Photos for pets taken out go after a confirmation. */
  const chooseDeskPets = (next: DeskPets) => {
    if (!isDesk || next === deskPets) return;
    const removedSlots = Object.keys(uploads.slots).filter((key) => {
      const petSlot = /^pet-(\d+)$/.exec(key);
      return petSlot ? Number(petSlot[1]) > next : false;
    });
    if (removedSlots.length && deskCopy?.petRemoveConfirm && !window.confirm(deskCopy.petRemoveConfirm)) return;
    setDeskPets(next);
    uploads.removeMany(removedSlots);
    for (const key of removedSlots) clearFieldError(`photo:${key}`);
  };

  const flowPrimaryKey =
    slotList.find((spec) => spec.role === "group" && uploads.slots[spec.key])?.key ||
    slotList.find((spec) => uploads.slots[spec.key])?.key ||
    "";
  const flowPreviewUrl = flowPrimaryKey ? uploads.slots[flowPrimaryKey].previewUrl : "";

  /** Waits for every photo this order needs; returns the main photo and all saved links. */
  const ensureFlowPhotos = async () => {
    const urls = await uploads.ensure(activeSlotKeys);
    const missing = slotList.find((spec) => spec.required && !urls[spec.key]);
    if (missing) throw new Error(fill(flowCopy?.slotError || "Please upload a photo for {slot}.", { slot: missing.label }));
    const primary = urls.group || slotList.map((spec) => urls[spec.key]).find(Boolean) || "";
    return { primary, urls };
  };

  /** Multi-Pet pet count. Data for remaining pets is kept; removed pets' names / photos go after a confirmation. */
  const choosePets = (next: string) => {
    if (!isMulti || next === pricedPets) return;
    if (!isOptionSelectable(catalog.options.pets[next])) return;
    const nextCount = petCountNumber(next);
    const removedSlots = Object.keys(uploads.slots).filter((key) => {
      const petSlot = /^pet-(\d+)$/.exec(key);
      if (petSlot) return Number(petSlot[1]) > nextCount;
      return key.startsWith("ref-") && (uploads.slots[key]?.pet || 0) > nextCount;
    });
    const removedNames = nameList.slice(nextCount).some((name) => name.trim());
    const haloLost = Boolean(haloPet && haloPet > nextCount);
    if ((removedSlots.length || removedNames || (tributeOn && haloLost)) && flowCopy?.petRemoveConfirm) {
      if (!window.confirm(flowCopy.petRemoveConfirm)) return;
    }
    setSelectedPets(next);
    setNameList((prev) => prev.slice(0, nextCount));
    uploads.removeMany(removedSlots);
    if (haloLost) {
      setHaloPet(null);
      setHaloNote("");
    }
    // "Every pet is visible" was confirmed for the old count.
    setConfirmGroup(false);
    clearFieldError("haloPet");
    window.dispatchEvent(new CustomEvent("petSelectionChanged", { detail: next }));
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

  const handleContinueFromStep2 = async () => {
    if (!validateStep2()) return;
    if (!everyday && (productType === "portrait" || productType === "digital_download")) {
      try {
        const url = await ensurePhotoUploaded();
        if (!storedPetPhotoUrl(url)) {
          setFieldErrors((prev) => ({ ...prev, photo: "Please choose a pet photo to continue." }));
          return;
        }
      } catch (err) {
        setFieldErrors((prev) => ({
          ...prev,
          photo: err instanceof Error ? err.message : "We couldn't save the pet photo. Please try again.",
        }));
        return;
      }
    }
    goToStep(3);
  };

  const handleAddToCart = async () => {
    if (!validateStep3()) return;
    if (flowProduct) {
      try {
        await ensureFlowPhotos();
      } catch (err) {
        setFieldErrors((prev) => ({
          ...prev,
          photo: err instanceof Error ? err.message : content.step3.photoError,
        }));
        return;
      }
    } else if (newProduct) {
      try {
        await ensureNewPhotos();
      } catch (err) {
        setFieldErrors((prev) => ({
          ...prev,
          photo: err instanceof Error ? err.message : content.step3.photoError,
        }));
        return;
      }
    } else if (everyday && (productType === "portrait" || productType === "digital_download")) {
      try {
        const url = await ensurePhotoUploaded();
        if (!storedPetPhotoUrl(url)) {
          setFieldErrors((prev) => ({ ...prev, photo: content.step3.photoError }));
          return;
        }
      } catch (err) {
        setFieldErrors((prev) => ({
          ...prev,
          photo: err instanceof Error ? err.message : content.step3.uploadFailTitle,
        }));
        return;
      }
    }
    // The cart holds one portrait: replacing another page's portrait needs a yes first.
    if (foreignCartRef.current && content.cart.replaceConfirm && !window.confirm(content.cart.replaceConfirm)) return;
    foreignCartRef.current = null;
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

  // Desk Portrait / Gift Bundle: the structured order the server rebuilds and checks (contract §4).
  const newProductPayload = (urls?: Record<string, string>): NewProductPayload | null =>
    newProduct
      ? {
          configurator: newProduct,
          photos: newSlotKeys
            .map((key) => ({ key, url: urls?.[key] || uploads.slots[key]?.url || "" }))
            .filter((photo) => photo.url),
          names: isDesk ? deskNames.trim() : includePetName ? petName.trim() : "",
          namesEnabled: isDesk ? true : includePetName,
          subtitleEnabled: includeSubtitle,
          subtitle: includeSubtitle ? subtitle.trim() : "",
          colour: isDesk ? deskColour : undefined,
          bundleTier: isBundle && bundleTier ? bundleTier : undefined,
          greetingCard: isBundle ? greetingOn : undefined,
          greetingMessage: isBundle ? (greetingOn ? greetingMessage.trim() : "") : undefined,
          petType: isBundle ? petType : undefined,
          petBreed: isBundle ? petBreed.trim().slice(0, 40) : undefined,
          petAge: isBundle ? ((content.bundleAges ?? []).includes(petAge) ? petAge : "") : undefined,
        }
      : null;

  const checkoutPayload = (photoUrl = "", flowUrls?: Record<string, string>) => ({
    ...pricingInput,
    size: productType === "portrait" ? (isDesk ? deskProductionSize : selectedSize) : PRODUCT_LABELS[productType],
    frameStyle: productType === "portrait" ? (isDesk ? "desk_stand" : selectedFrame) : productType,
    numPets: productType === "portrait" ? (everyday ? pricedPets : selectedPets) : "one",
    background: productType === "portrait" ? (isDesk ? deskColour : selectedBg) : "",
    backgroundLabel:
      productType === "portrait" && everyday ? (isDesk ? deskColourLabel : backgroundLabel(selectedBg)) : "",
    addon: productType === "portrait"
      ? [
          everyday ? "" : selectedAddOn !== "none" ? selectedAddOn : "",
          everyday && priorityPreview ? "priority_preview" : "",
          tributeOn ? "halo_tribute" : "",
          addMug ? "custom_mug" : "",
          addMagnet ? "fridge_magnet" : "",
          addDigitalDownload ? "digital_download" : "",
          everyday && addDesk ? "desk_portrait" : "",
        ].filter(Boolean).join(", ") || "none"
      : productType,
    petName: effectivePetName || (flowProduct || newProduct ? content.header.productName : PRODUCT_LABELS[productType]),
    memorialText: everyday ? effectiveSubtitle : memorialText,
    giftWrap,
    portraitStyle: productType === "portrait" ? (isDesk ? "framed" : portraitStyle) : productType,
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPincode,
    shippingLandmark,
    photoUrl,
    // Multi-Pet / You & Your Pet: the server rebuilds and checks the structured order from these.
    ...(flowProduct
      ? {
          configurator: flowProduct,
          composition: isYouPet ? composition : undefined,
          tribute: isMulti ? tributeOn : undefined,
          haloPet: tributeOn ? haloPet ?? undefined : undefined,
          haloNote: tributeOn ? haloNote.trim() : undefined,
          photoMethod: activeMethod,
          photos: activeSlotKeys
            .map((key) => ({ key, url: flowUrls?.[key] || uploads.slots[key]?.url || "", pet: uploads.slots[key]?.pet }))
            .filter((photo) => photo.url),
          namesEnabled: includePetName,
          names: includePetName ? orderNames : [],
          artistNote: flowCopy?.showInstructions ? artistNote.trim() : "",
          confirmGroup: groupConfirmNeeded ? confirmGroup : undefined,
        }
      : {}),
    ...(newProductPayload(flowUrls) ?? {}),
  });

  const showPhotoUploadFail = (title: string, message: string) => {
    setPhotoStatus("error");
    setPhotoError(message);
    setUploadFailAlert({ title, message });
  };

  const startPhotoUpload = (file: File) => {
    const uploadCopy = content.step3;
    if (!file.type.startsWith("image/")) {
      const message = everyday ? uploadCopy.formatError : "Please choose a photo (JPG, PNG, or WebP).";
      showPhotoUploadFail(everyday ? uploadCopy.formatErrorTitle : "Photo format not supported", message);
      return Promise.reject(new Error(message));
    }
    const maxMb = everyday ? uploadCopy.uploadMaxMb : 25;
    if (file.size > maxMb * 1024 * 1024) {
      const size = (file.size / (1024 * 1024)).toFixed(1);
      const message = everyday
        ? fill(uploadCopy.tooLargeError, { name: file.name, size, max: maxMb })
        : `“${file.name}” is too large (${size} MB). Please choose a photo under 25 MB.`;
      showPhotoUploadFail(everyday ? uploadCopy.tooLargeTitle : "File is too large", message);
      return Promise.reject(new Error(message));
    }

    const generation = ++photoUploadGeneration.current;
    uploadedPhotoUrlRef.current = "";
    setPhotoStatus("uploading");
    setPhotoProgress(6);
    setPhotoError("");
    const promise = uploadPetPhotoFile(file, (progress) => {
      if (photoUploadGeneration.current !== generation) return;
      setPhotoProgress(progress.percent);
    })
      .then((url) => {
        if (photoUploadGeneration.current !== generation) return "";
        uploadedPhotoUrlRef.current = url;
        setPhotoProgress(100);
        setPhotoStatus("saved");
        setPhotoError("");
        return url;
      })
      .catch((err: unknown) => {
        if (photoUploadGeneration.current !== generation) return "";
        const raw = err instanceof Error ? err.message : "We couldn't save the pet photo. Please try again.";
        uploadedPhotoUrlRef.current = "";
        // Browsers that can't decode a photo (HEIC outside Safari) get the admin's wording.
        const badFormat = everyday && /format isn't supported/i.test(raw);
        const message = badFormat ? uploadCopy.formatError : raw;
        const tooLarge = /too large|smaller/i.test(message);
        const failTitle = badFormat
          ? uploadCopy.formatErrorTitle
          : tooLarge
            ? everyday ? uploadCopy.tooLargeTitle : "File is too large"
            : everyday ? uploadCopy.uploadFailTitle : "Photo upload failed";
        showPhotoUploadFail(failTitle, message);
        throw new Error(message);
      });
    uploadPromiseRef.current = promise;
    return promise;
  };

  const ensurePhotoUploaded = async () => {
    if (storedPetPhotoUrl(uploadedPhotoUrlRef.current)) return uploadedPhotoUrlRef.current;
    if (uploadPromiseRef.current) {
      try {
        const url = await uploadPromiseRef.current;
        if (storedPetPhotoUrl(url)) return url;
      } catch {
        uploadPromiseRef.current = null;
      }
    }
    if (!selectedFile) return "";
    return startPhotoUpload(selectedFile);
  };

  const submitFinalOrder = async (
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
  ) => {
    setIsSubmitting(true);
    setOrderStatus('idle');

    try {
      let publicUrl = "";
      let flowUrls: Record<string, string> | undefined;
      if (flowProduct) {
        const ensured = await ensureFlowPhotos().catch(() => null);
        publicUrl = ensured?.primary || "";
        flowUrls = ensured?.urls;
      } else if (newProduct) {
        const ensured = await ensureNewPhotos().catch(() => null);
        publicUrl = ensured?.primary || "";
        flowUrls = ensured?.urls;
      } else {
        publicUrl = await ensurePhotoUploaded().catch(() => uploadedPhotoUrlRef.current);
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkoutPayload(publicUrl, flowUrls),
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
        }),
      });

      const result = await response.json();

      if (result.success && result.orderId) {
        setOrderStatus('success');
        localStorage.removeItem('peternity_cart');
        if (flowProduct) localStorage.removeItem(draftKey(flowProduct));
        if (newProduct) localStorage.removeItem(draftKey(newProduct));
        window.location.assign(`/checkout/success?orderId=${encodeURIComponent(result.orderId)}`);
        return;
      }
      setOrderStatus('error');
      setPaymentNotice({
        title: "Payment received",
        message: `${result.error || "We could not finish saving the order."} If money was deducted, contact Peternity with payment ${razorpayPaymentId}.`,
      });
    } catch (err: any) {
      console.error("Checkout Submit Order Error:", err);
      setOrderStatus('error');
      setPaymentNotice({
        title: "Payment received",
        message: `${err.message || "We could not finish saving the order."} If money was deducted, contact Peternity with payment ${razorpayPaymentId}.`,
      });
    } finally {
      setIsSubmitting(false);
      setShowSandboxModal(false);
    }
  };

  const couponAppliedText = (code: string, off: string) =>
    everyday ? fill(content.cart.couponAppliedMessage, { code, off }) : `${code} applied — ${off} off`;

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      setCouponError(everyday ? content.cart.couponEmptyError : "Please enter a coupon code.");
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
        setCouponRule(null);
        setCouponError(data.error || "This coupon code is invalid.");
        return;
      }
      setAppliedCoupon(data.quote.couponCode);
      setCouponRule(data.quote.couponRule || null);
      setCouponMessage(couponAppliedText(data.quote.couponCode, couponOffLabel(data.quote)));
    } catch {
      setCouponError(everyday ? content.cart.couponCheckError : "Could not validate coupon. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponRule(null);
    setCouponInput("");
    setCouponError(null);
    setCouponMessage(null);
  };

  const openSaveOffer = () => {
    setPaymentNotice(null);
    setSaveOfferError(null);
    try {
      const saved = sessionStorage.getItem(SAVE_OFFER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { index?: number; revealed?: boolean };
        if (typeof parsed.index === "number" && parsed.index >= 0 && parsed.index < SAVE_WHEEL.length) {
          setSaveOffer({ index: parsed.index, revealed: Boolean(parsed.revealed) });
          return;
        }
      }
    } catch {
      // A bad session value just starts a fresh spin.
    }
    const next = { index: pickSaveOfferIndex(), revealed: false };
    try {
      sessionStorage.setItem(SAVE_OFFER_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The offer still works for this visit if storage is blocked.
    }
    setSaveOffer(next);
  };

  const revealSaveOffer = () => {
    setSaveOffer((prev) => {
      if (!prev || prev.revealed) return prev;
      const next = { ...prev, revealed: true };
      try {
        sessionStorage.setItem(SAVE_OFFER_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // The revealed prize still stays in memory for this visit.
      }
      return next;
    });
  };

  const leaveAfterSaveOffer = () => {
    setSaveOffer(null);
    setPaymentNotice(null);
    setShowCheckout(false);
    setShowCart(false);
  };

  const claimSaveOffer = async () => {
    if (!saveOffer || !offerSlice || !offerRule) return;
    if (keepCurrentOffer) {
      setSaveOffer(null);
      setShowCheckout(true);
      return;
    }
    setIsClaimingOffer(true);
    setSaveOfferError(null);
    try {
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pricingInput, couponCode: offerRule.code, customerEmail }),
      });
      const data = await res.json();
      if (!data.success) {
        setSaveOfferError(data.error || "This offer could not be applied.");
        return;
      }
      setAppliedCoupon(data.quote.couponCode);
      setCouponRule(data.quote.couponRule || offerRule);
      setCouponInput(data.quote.couponCode || offerRule.code);
      setCouponError(null);
      setCouponMessage(couponAppliedText(data.quote.couponCode, couponOffLabel(data.quote)));
      setSaveOffer(null);
      setShowCheckout(true);
    } catch {
      setSaveOfferError("Could not apply this offer. Please try again.");
    } finally {
      setIsClaimingOffer(false);
    }
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
    setPaymentNotice(null);
    paymentSettled.current = false;

    try {
      const photoRequired = productType === "portrait" || productType === "digital_download";
      let photoUrl = storedPetPhotoUrl(uploadedPhotoUrlRef.current);
      let flowUrls: Record<string, string> | undefined;
      if (flowProduct) {
        const ensured = await ensureFlowPhotos();
        photoUrl = ensured.primary;
        flowUrls = ensured.urls;
      } else if (newProduct) {
        const ensured = await ensureNewPhotos();
        photoUrl = ensured.primary;
        flowUrls = ensured.urls;
      } else {
        if (photoRequired || selectedFile) {
          photoUrl = await ensurePhotoUploaded();
        }
        if (photoRequired && !storedPetPhotoUrl(photoUrl)) {
          throw new Error("The pet photo was not saved. Please upload it again before paying.");
        }
      }
      const payload = checkoutPayload(photoUrl, flowUrls);

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
          callback_url: `${window.location.origin}/api/razorpay/callback`,
          redirect: true,
          handler: async function (response: any) {
            paymentSettled.current = true;
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
              if (paymentSettled.current) return;
              setPaymentNotice({
                title: "Payment not completed",
                message: "The payment window was closed before the payment finished. You have not been charged. Your order details are still here, so you can try again.",
              });
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.on("payment.failed", function (response: any) {
          paymentSettled.current = true;
          setIsSubmitting(false);
          const reason = response?.error?.description || "The bank or UPI app declined this payment. You have not been charged.";
          setPaymentNotice({
            title: "Payment failed",
            message: reason,
          });
        });
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

  // Multi-Pet / You & Your Pet cart card: only filled-in details are listed (empty ones stay hidden).
  const cartSizeLabel = selectedSize.replace(/\s*x\s*/i, " × ");
  const cartStyleLabel = portraitStyle === "framed" ? content.step1.framedTitle : content.step1.canvasTitle;
  const cartFrameLabel =
    portraitStyle === "canvas"
      ? content.cart.canvasFrameLabel
      : content.frames.find((frame) => frame.id === selectedFrame)?.label || selectedFrame;
  const flowChoiceLabel = !flowCopy
    ? ""
    : isYouPet
      ? composition === "family"
        ? flowCopy.familyTitle
        : flowCopy.soloTitle
      : `${petCount} ${flowCopy.petsWord}`.trim();
  const flowPhotoValue = (() => {
    if (!flowCopy) return "";
    if (activeMethod === "separate") {
      return slotList
        .filter((spec) => uploads.slots[spec.key])
        .map((spec) => spec.label)
        .join(", ");
    }
    const refs = usedRefKeys.length;
    return [uploads.slots.group?.fileName || "", refs ? fill(flowCopy.referencesCartValue, { count: refs }) : ""]
      .filter(Boolean)
      .join(" ");
  })();
  const haloLabel = haloPet
    ? `${fill(flowCopy?.petSlotLabel || "Pet {n}", { n: haloPet })}${
        includePetName && haloPetName ? ` (${haloPetName})` : haloNote.trim() ? ` – ${haloNote.trim()}` : ""
      }`
    : "";
  const flowCartDetails: CartDetail[] | undefined =
    flowProduct && flowCopy
      ? ([
          { icon: isYouPet ? "composition" : "pets", label: flowCopy.choiceCartLabel, value: flowChoiceLabel },
          { icon: "size", label: content.cart.sizeLabel, value: cartSizeLabel },
          { icon: "background", label: content.cart.backgroundLabel, value: backgroundLabel(selectedBg) },
          portraitStyle === "framed" ? { icon: "frame", label: content.cart.frameLabel, value: cartFrameLabel } : null,
          effectivePetName ? { icon: "name", label: flowCopy.namesCartLabel, value: effectivePetName } : null,
          effectiveSubtitle ? { icon: "subtitle", label: content.cart.subtitleLabel, value: effectiveSubtitle } : null,
          tributeOn && haloPet
            ? {
                icon: "halo",
                label: flowCopy.haloCartLabel,
                value: haloLabel,
              }
            : null,
          priorityPreview
            ? { icon: "priority", label: content.cart.priorityLabel, value: formatRupee(catalog.priorityPreview) }
            : null,
          { icon: "method", label: flowCopy.methodCartLabel, value: methodCopy(flowCopy, activeMethod).title },
          { icon: "photos", label: flowCopy.photosCartLabel, value: flowPhotoValue || "—", thumb: flowPreviewUrl },
          flowCopy.showInstructions && artistNote.trim()
            ? { icon: "note", label: flowCopy.instructionsCartLabel, value: artistNote.trim() }
            : null,
        ].filter(Boolean) as CartDetail[])
      : undefined;

  // Desk Portrait / Gift Bundle cart card: only filled-in details are listed.
  const newPhotoValue = newSlotSpecs
    .filter((spec) => uploads.slots[spec.key])
    .map((spec) => uploads.slots[spec.key]?.fileName || spec.label)
    .join(", ");
  const bundleTierTitle = (tier: BundleTier | "") =>
    !bundleCopy || !tier ? "" : tier === "signature" ? bundleCopy.signatureTitle : bundleCopy.essentialTitle;
  const petTypeLabel = !bundleCopy
    ? ""
    : petType === "dog"
      ? bundleCopy.dogLabel
      : petType === "cat"
        ? bundleCopy.catLabel
        : petType === "other"
          ? bundleCopy.otherLabel
          : "";
  const petDetailsValue = [petTypeLabel, petBreed.trim(), petAge].filter(Boolean).join(" · ");
  const inclusionLabel = (item: ReturnType<typeof bundleInclusions>[number]) => {
    if (!bundleCopy) return item;
    switch (item) {
      case "portrait":
        return bundleCopy.itemPortrait;
      case "mug":
        return bundleCopy.itemMug;
      case "digital":
        return bundleCopy.itemDigital;
      case "magnet":
        return bundleCopy.itemMagnet;
      case "standard_packaging":
        return bundleCopy.itemStandardPackaging;
      case "premium_packaging":
        return bundleCopy.itemPremiumPackaging;
      default:
        return String(item);
    }
  };
  const newCartDetails: CartDetail[] | undefined =
    isDesk && deskCopy
      ? ([
          { icon: "pets", label: deskCopy.petsCartLabel, value: deskPetsLabel },
          { icon: "layout", label: deskCopy.layoutCartLabel, value: deskLayoutLabel },
          { icon: "colour", label: deskCopy.colourCartLabel, value: deskColourLabel },
          deskNames.trim() ? { icon: "name", label: deskCopy.namesCartLabel, value: deskNames.trim() } : null,
          effectiveSubtitle ? { icon: "subtitle", label: content.cart.subtitleLabel, value: effectiveSubtitle } : null,
          { icon: "stand", label: deskCopy.standCartLabel, value: deskCopy.standCartValue },
          deskExtraAmount > 0
            ? { icon: "pets", label: deskCopy.extraPetsCartLabel, value: `+${formatRupee(deskExtraAmount)}` }
            : null,
          { icon: "photos", label: deskCopy.photosCartLabel, value: newPhotoValue || "—", thumb: newPreviewUrl },
        ].filter(Boolean) as CartDetail[])
      : isBundle && bundleCopy
        ? ([
            { icon: "style", label: content.cart.styleLabel, value: cartStyleLabel },
            { icon: "size", label: content.cart.sizeLabel, value: cartSizeLabel },
            { icon: "background", label: content.cart.backgroundLabel, value: backgroundLabel(selectedBg) },
            effectivePetName ? { icon: "name", label: content.cart.petNameLabel, value: effectivePetName } : null,
            effectiveSubtitle ? { icon: "subtitle", label: content.cart.subtitleLabel, value: effectiveSubtitle } : null,
            petDetailsValue ? { icon: "petdetails", label: bundleCopy.petDetailsCartLabel, value: petDetailsValue } : null,
            { icon: "photos", label: content.cart.photoLabel, value: newPhotoValue || "—", thumb: newPreviewUrl },
          ].filter(Boolean) as CartDetail[])
        : undefined;
  const newSummaryLine = isDesk
    ? [deskPetsLabel, deskLayoutLabel].filter(Boolean).join(" · ")
    : isBundle
      ? [bundleTierTitle(bundleTier), cartStyleLabel, cartSizeLabel].filter(Boolean).join(" · ")
      : "";
  const bundleIncludedCard =
    isBundle && bundleCopy && bundleTier
      ? {
          heading: bundleCopy.includedHeading,
          value: bundleCopy.includedValue,
          items: bundleInclusions(bundleTier).map(inclusionLabel),
        }
      : undefined;
  // The greeting card is its own paid line, so the bundle line leaves its price out (totals still add up).
  const greetingLineAmount = greetingOn ? Math.max(0, breakdown.greeting || 0) : 0;
  const newExtraLines =
    greetingOn && bundleCopy
      ? [
          {
            id: "greeting_card",
            label: bundleCopy.greetingCartLabel,
            price: greetingLineAmount,
            note: greetingMessage.trim() ? `${bundleCopy.greetingMessageCartLabel}: ${greetingMessage.trim()}` : undefined,
          },
        ]
      : undefined;
  const newVisibleExtras = (["mug", "magnet", "digital", "desk"] as ExtraId[]).filter(
    (id) => content.extras[id].visible && !bundleIncluded.includes(id)
  );

  const choosePortraitStyle = (style: PortraitStyle) => {
    // Tapping the style that is already chosen keeps the size and frame the customer picked.
    if (style === portraitStyle) return;
    if (!isOptionSelectable(catalog.options.styles[style])) return;
    const preferred = !everyday ? "" : style === "canvas" ? content.step1.defaultCanvasSize : content.step1.defaultFramedSize;
    const preferredMeta = preferred ? sizeOptionMeta(catalog, style, preferred) : undefined;
    const nextSize = preferredMeta && isOptionSelectable(preferredMeta) ? preferred : firstAvailableSize(style, catalog);
    if (!nextSize) return;
    const frame = style === "framed" ? framedFrameDefault : "canva";
    setPortraitStyle(style);
    setSelectedFrame(frame);
    setSelectedSize(nextSize);
    window.dispatchEvent(new CustomEvent('frameSelectionChanged', { detail: frame }));
  };

  const styleCard = (style: PortraitStyle, image: string, tagline: string) => {
    const meta = catalog.options.styles[style];
    if (!isOptionVisible(meta)) return null;
    const selectable = isOptionSelectable(meta);
    const selected = portraitStyle === style;

    return (
      <button
        key={style}
        type="button"
        disabled={!selectable}
        aria-disabled={!selectable}
        onClick={() => choosePortraitStyle(style)}
        className={`group relative flex flex-col md:flex-row items-center gap-2 md:gap-4 p-2 md:p-3.5 rounded-2xl border-[2px] transition-all text-center md:text-left ${
          !selectable
            ? "cursor-not-allowed border-gray-200 bg-gray-50"
            : selected
              ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10"
              : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
      >
        <div
          className={`relative w-16 h-16 flex-shrink-0 bg-white rounded-[10px] border border-gray-100 overflow-hidden shadow-sm ${
            selectable ? "" : "opacity-50"
          }`}
        >
          <Image src={image} alt={PORTRAIT_STYLE_LABELS[style]} fill sizes="160px" className="object-cover" />
        </div>
        <div className="flex-1 flex flex-col items-center md:items-start w-full">
          <span className={`block font-black text-[11px] md:text-sm ${selectable ? "text-[#292522]" : "text-gray-400"}`}>
            {PORTRAIT_STYLE_LABELS[style]}
          </span>
          {meta.badge ? (
            <span className="mt-1 text-[10px] font-black text-white bg-[#A97659] px-1.5 py-0.5 rounded uppercase tracking-wider">
              {meta.badge}
            </span>
          ) : null}
          <span className={`text-[10px] font-medium ${selectable ? "hidden text-gray-500 md:block" : "text-gray-500"}`}>
            {selectable ? tagline : "Temporarily unavailable"}
          </span>
        </div>
        {selectable ? (
          <div
            className={`absolute top-2 right-2 md:static flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"
            }`}
          >
            {selected && <Check size={10} className="text-white md:w-3 md:h-3" strokeWidth={3} />}
          </div>
        ) : null}
      </button>
    );
  };

  const sizeCard = (style: PortraitStyle, size: string, price: number, meta: OptionMeta) => {
    if (!isOptionVisible(meta)) return null;
    const selectable = isOptionSelectable(meta);
    const selected = selectedSize === size;
    const eventDetail = style === "framed" ? "framed_size" : "canvas_size";

    return (
      <button
        key={size}
        type="button"
        disabled={!selectable}
        aria-disabled={!selectable}
        onClick={() => {
          if (!selectable) return;
          setSelectedSize(size);
          window.dispatchEvent(new CustomEvent("sizeSelectionChanged", { detail: eventDetail }));
        }}
        className={`group relative flex items-center justify-between p-4 rounded-2xl border-[2px] transition-all text-left ${
          !selectable
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : selected
              ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10"
              : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
      >
        <div className={selectable ? "" : "opacity-50"}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-[#1a1a1b] text-base">{displaySizeLabel(size)}</span>
            {meta.badge ? (
              <span className="text-[10px] font-black text-white bg-[#A87B62] px-1.5 py-0.5 rounded uppercase tracking-wider">
                {meta.badge}
              </span>
            ) : null}
          </div>
          <span className="text-xs font-bold text-gray-500">{formatRupee(price)}</span>
        </div>
        {selectable ? (
          <div
            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"
            }`}
          >
            {selected && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
        ) : (
          <span className="text-[10px] font-black text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Out of Stock
          </span>
        )}
      </button>
    );
  };

  return (
    <div ref={containerRef} id="product-customizer" className="flex flex-col gap-0 scroll-mt-24">
      {/* Header Info */}
      <div className="lg:space-y-4 space-y-1">
        <div className={`${everyday && !content.header.reviewsLabel ? "hidden" : "hidden lg:flex"} items-center gap-1.5`}>
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
          <span className="text-sm font-medium text-gray-400 ml-1">{everyday ? content.header.reviewsLabel : "145 Reviews"}</span>
        </div>
        <h1 className="hidden lg:block text-5xl lg:text-[56px] font-normal text-[#1a1a1b] leading-tight font-playfair tracking-tight">
          {title}
        </h1>
    
        {everyday ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-inter text-[18px] font-semibold text-[#2D2D2D]">{fill(content.header.priceFormat, { price: totalPrice })}</span>
            {productType === "portrait" && content.header.discountPercent > 0 ? (
              <>
                <span className="font-inter text-[14px] text-[#9B8B7D] line-through">
                  {fill(content.header.priceFormat, { price: compareAtPrice(totalPrice, content.header.discountPercent) })}
                </span>
                {content.header.discountBadge ? (
                  <span className="inline-flex h-6 items-center rounded-[12px] bg-[#F28B82] px-3 text-[12px] font-bold uppercase text-white">
                    {fill(content.header.discountBadge, { percent: content.header.discountPercent })}
                  </span>
                ) : null}
              </>
            ) : null}
          </div>
        ) : (
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
        )}
        {productType === "portrait" && !everyday && breakdown.petUpgrade > 0 ? (
          <p className="text-[11px] font-medium text-gray-500 mt-1">
            {formatRupee(breakdown.sizePrice)} size
            {" · "}
            {formatRupee(breakdown.petUpgrade)} {PET_COUNT_LABELS[selectedPets] || "pets"} upgrade
            {breakdown.halo + breakdown.wrap + breakdown.premiumBg > 0
              ? ` · ${formatRupee(breakdown.halo + breakdown.wrap + breakdown.premiumBg)} extras`
              : ""}
          </p>
        ) : null}
        {productType === "portrait" && isDesk && deskCopy && deskExtraAmount > 0 ? (
          <p className="mt-1 text-[12px] font-medium text-[#8B7B6B]">
            {`+${formatRupee(deskExtraAmount)} · ${deskPetsLabel}`}
          </p>
        ) : null}
        {productType === "portrait" && everyday && ((breakdown.priority || 0) + breakdown.premiumBg + (breakdown.tribute || 0) > 0) ? (
          <p className="mt-1 text-[12px] font-medium text-[#8B7B6B]">
            {[
              breakdown.premiumBg > 0 ? `${formatRupee(breakdown.premiumBg)} ${content.step2.limitedHeading}` : "",
              (breakdown.priority || 0) > 0 ? `${formatRupee(breakdown.priority)} ${content.step2.priorityTitle}` : "",
              (breakdown.tribute || 0) > 0 ? `${formatRupee(breakdown.tribute)} ${flowCopy?.haloCartLabel || ""}` : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
      </div>

      <hr className="hidden lg:block border-gray-100 my-2" />

      {!everyday ? (
      <div className="lg:hidden space-y-4 mb-6 mt-2">
        <div className="bg-[#1a1a1b] text-white p-4 rounded-3xl flex items-center gap-4 shadow-lg mx-1 transform -translate-y-1.5">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
            <Image 
              src={media("Nandini review image.jpg.jpeg")} 
              alt="Review attachment" 
              fill
              sizes="48px"
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

        <div className="flex items-start gap-3 px-2">
          <Package size={18} className="text-[#A87B62] opacity-70 mt-0.5" />
          <p className="text-[12px] text-gray-500 font-medium leading-tight">
            You&apos;ll receive your design preview first. Once approved, we print, pack & ship! ✅
          </p>
        </div>
      </div>
      ) : null}

      <div className={everyday ? "mb-3 mt-4 lg:mb-5" : "mb-6 lg:mb-8"}>
        {everyday ? (
          <EverydayProgress
            content={content}
            step={currentStepSafe}
            onBack={() => {
              if (currentStepSafe > 1) {
                prevStep();
                return;
              }
              if (window.history.length > 1) window.history.back();
              else window.location.assign("/");
            }}
          />
        ) : (
          <>
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
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </>
        )}
      </div>

      {/* Selectors with Transitions */}      {/* Selectors with Transitions */}
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
              {isDesk ? (
                <DeskChooseStep
                  content={content}
                  catalog={catalog}
                  mediaPrefix={mediaPrefix}
                  petCount={deskPets}
                  onPetCount={chooseDeskPets}
                  onContinue={handleContinueFromStep1}
                />
              ) : everyday ? (
                <EverydayChooseStep
                  content={content}
                  catalog={catalog}
                  petsExtra={
                    isBundle
                      ? bundleTierAmount(catalog, bundleTier || quoteTier)
                      : (catalog.pets[everyday ? pricedPets : selectedPets] ?? 0) + (isYouPet && composition === "family" ? Math.max(0, catalog.familyUpgrade) : 0)
                  }
                  mediaPrefix={mediaPrefix}
                  beforeStyle={
                    isYouPet ? (
                      <CompositionCards
                        content={content}
                        catalog={catalog}
                        composition={composition}
                        onComposition={(next) => setComposition(next)}
                      />
                    ) : isBundle ? (
                      <BundleTierCards
                        content={content}
                        catalog={catalog}
                        mediaPrefix={mediaPrefix}
                        tier={bundleTier}
                        onTier={(next) => {
                          setBundleTier(next);
                          clearFieldError("tier");
                        }}
                        error={fieldErrors.tier}
                      />
                    ) : undefined
                  }
                  afterStyle={
                    isMulti ? (
                      <PetCountCards content={content} catalog={catalog} selectedPets={pricedPets} onPets={choosePets} />
                    ) : undefined
                  }
                  isSizeOffered={
                    sizeRule ? (size) => !sizeHiddenForPets(content, sizeRule, portraitStyle, size) : undefined
                  }
                  portraitStyle={portraitStyle}
                  onStyle={choosePortraitStyle}
                  selectedSize={selectedSize}
                  onSize={(size) => {
                    setSelectedSize(size);
                    window.dispatchEvent(
                      new CustomEvent("sizeSelectionChanged", {
                        detail: portraitStyle === "framed" ? "framed_size" : "canvas_size",
                      })
                    );
                  }}
                  onPreview={() => setShowStylePreview(true)}
                  onContinue={handleContinueFromStep1}
                  continueDisabled={isBundle && !bundleTier}
                  footer={
                    content.step1.showDeliveryEstimate ? (
                      <DeliveryEstimate
                        copy={{
                          title: content.step1.deliveryTitle,
                          subtitle: content.step1.deliverySubtitle,
                          placeholder: content.step1.deliveryPlaceholder,
                          invalid: content.step1.deliveryInvalid,
                          result: content.step1.deliveryResult,
                          range: content.step1.deliveryRange,
                          minDays: content.step1.deliveryMinDays,
                          maxDays: content.step1.deliveryMaxDays,
                        }}
                      />
                    ) : null
                  }
                />
              ) : (
              <div className="space-y-6">

                {/* 1. Portrait Style */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-lg font-semibold text-[#2D2D2D] font-inter">
                      1. Choose Your Portrait Style
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowStylePreview(true)}
                      className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#1a1a1b] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1a1a1b] transition-colors hover:bg-[#1a1a1b] hover:text-white"
                    >
                      <Eye size={13} strokeWidth={2.5} />
                      Preview
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {styleCard("framed", "/framestyle/black-frame.png", "Ready to Hang • Classic Look")}
                    {styleCard("canvas", "/framestyle/canvas-frame.png", "Gallery Wrapped • Premium")}
                  </div>
                </div>



                {/* 2. Choose Your Size */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-[#2D2D2D] font-inter">
                    2. Choose Your Size
                  </label>
                  <div className="flex flex-col gap-3">
                    {sizesForStyle(portraitStyle, catalog).map((size) =>
                      sizeCard(
                        portraitStyle,
                        size,
                        ((portraitStyle === "framed" ? catalog.framed : catalog.canvas)[size] ?? 0) + (catalog.pets[selectedPets] ?? 0),
                        sizeOptionMeta(catalog, portraitStyle, size) ?? cloneOptionMeta()
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-base font-bold text-[#1a1a1b] font-inter">
                    3. Number of Pets
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {PET_OPTIONS.map((pet) => {
                      const meta = catalog.options.pets[pet.id];
                      if (!isOptionVisible(meta)) return null;
                      const selectable = isOptionSelectable(meta);
                      const selected = selectedPets === pet.id;
                      return (
                      <button
                        key={pet.id}
                        type="button"
                        disabled={!selectable}
                        aria-disabled={!selectable}
                        onClick={() => {
                          if (!selectable) return;
                          setSelectedPets(pet.id);
                          window.dispatchEvent(new CustomEvent('petSelectionChanged', { detail: pet.id }));
                        }}
                        className={`group relative flex flex-col md:flex-row items-center md:items-center justify-between gap-2 md:gap-4 p-2 md:p-3.5 rounded-2xl border-[2px] transition-all overflow-hidden ${pet.id === "human" ? "col-span-2" : ""} ${
                          !selectable
                            ? "cursor-not-allowed border-gray-200 bg-gray-50"
                            : selected
                              ? "border-[#1a1a1b] shadow-md bg-[#fafafa] scale-[1.01] z-10"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                      >
                        <div className={`flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full ${selectable ? "" : "opacity-50"}`}>
                           <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative shadow-sm">
                             {pet.id === "human" ? (
                               humanPetImage ? (
                                 <img src={humanPetImage} alt={pet.label} className="h-full w-full object-cover" />
                               ) : (
                                 <div className="flex h-full w-full items-center justify-center gap-0.5 text-[#A87B62]">
                                   <User size={18} strokeWidth={2.5} />
                                   <PawPrint size={16} strokeWidth={2.5} />
                                 </div>
                               )
                             ) : (
                               <Image src={pet.image} alt={pet.label} fill sizes="64px" className="object-cover" />
                             )}
                           </div>
                           <div className="text-center md:text-left flex-1">
                             <span className={`block font-black text-[11px] md:text-sm ${selectable ? "text-[#1a1a1b]" : "text-gray-400"}`}>
                               {pet.label}
                             </span>
                             {meta.badge ? (
                               <span className="inline-block mt-1 text-[10px] font-black text-white bg-[#A87B62] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                 {meta.badge}
                               </span>
                             ) : null}
                             <span className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                               {!selectable
                                 ? "Temporarily unavailable"
                                 : pet.id === "one" || !(catalog.pets[pet.id] > 0)
                                   ? "Included"
                                   : `+${formatRupee(catalog.pets[pet.id])}`}
                             </span>
                           </div>
                        </div>
                        {selectable ? (
                        <div className={`absolute top-2 right-2 md:static flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                          {selected && <Check size={10} className="text-white md:w-3 md:h-3" strokeWidth={3} />}
                        </div>
                        ) : null}
                      </button>
                      );
                    })}
                  </div>
                </div>

              <button
                type="button"
                onClick={handleContinueFromStep1}
                className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1b] text-sm font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#2F2F2F] active:scale-[0.98]"
              >
                Continue <ArrowRight size={18} />
              </button>
              <DeliveryEstimate />
              </div>
              )}
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
              {isDesk ? (
                <DeskPersonalizeStep
                  content={content}
                  colours={deskColourList}
                  colour={deskColour}
                  onColour={(id) => {
                    setDeskColour(id);
                    clearFieldError("colour");
                  }}
                  names={deskNames}
                  onNames={(v) => {
                    setDeskNames(v);
                    clearFieldError("names");
                  }}
                  namesError={fieldErrors.names}
                  includeSubtitle={includeSubtitle}
                  onIncludeSubtitle={setIncludeSubtitle}
                  subtitle={subtitle}
                  onSubtitle={(v) => {
                    setSubtitle(v);
                    clearFieldError("subtitle");
                  }}
                  onContinue={() => void handleContinueFromStep2()}
                  continueDisabled={!deskNames.trim() || !deskColourList.some((colour) => colour.id === deskColour)}
                />
              ) : everyday ? (
                <EverydayPersonalizeStep
                  content={content}
                  portraitStyle={portraitStyle}
                  frames={visibleFrames}
                  selectedFrame={selectedFrame}
                  onFrame={(frame) => {
                    setSelectedFrame(frame);
                    window.dispatchEvent(new CustomEvent("frameSelectionChanged", { detail: frame }));
                  }}
                  backgrounds={everydayBackgrounds}
                  selectedBg={selectedBg}
                  onBg={(name) => {
                    setSelectedBg(name);
                    window.dispatchEvent(new CustomEvent("backgroundSelectionChanged", { detail: name }));
                  }}
                  catalog={catalog}
                  includePetName={includePetName}
                  onIncludePetName={setIncludePetName}
                  petName={petName}
                  onPetName={(v) => {
                    setPetName(v);
                    clearFieldError("petName");
                  }}
                  includeSubtitle={includeSubtitle}
                  onIncludeSubtitle={setIncludeSubtitle}
                  subtitle={subtitle}
                  onSubtitle={(v) => {
                    setSubtitle(v);
                    clearFieldError("subtitle");
                  }}
                  priorityPreview={priorityPreview}
                  onPriorityPreview={setPriorityPreview}
                  onContinue={() => void handleContinueFromStep2()}
                  mediaPrefix={mediaPrefix}
                  renumber={Boolean(flowProduct)}
                  renderNames={
                    flowProduct
                      ? (heading) => (
                          <NamesSection
                            product={flowProduct}
                            content={content}
                            heading={heading}
                            on={includePetName}
                            onToggle={() => setIncludePetName(!includePetName)}
                            names={isYouPet && composition === "family" ? [familyNames] : nameList}
                            onName={(index, value) => {
                              if (isYouPet && composition === "family") {
                                setFamilyNames(value);
                                return;
                              }
                              setNameList((prev) => {
                                const next = [...prev];
                                while (next.length <= index) next.push("");
                                next[index] = value;
                                return next;
                              });
                            }}
                            composition={composition}
                            petCount={petCount}
                          />
                        )
                      : undefined
                  }
                  extraSection={
                    isMulti && flowCopy?.showTribute
                      ? {
                          heading: flowCopy.tributeHeading,
                          render: (heading) => (
                            <TributeSection
                              content={content}
                              heading={heading}
                              on={tribute}
                              onToggle={() => {
                                setTribute(!tribute);
                                clearFieldError("haloPet");
                              }}
                              petCount={petCount}
                              names={includePetName ? nameList : []}
                              haloPet={haloPet && haloPet <= petCount ? haloPet : null}
                              onHaloPet={(pet) => {
                                // A description typed for another pet would point the artist at the wrong one.
                                if (pet !== haloPet) setHaloNote("");
                                setHaloPet(pet);
                                clearFieldError("haloPet");
                                clearFieldError("haloNote");
                              }}
                              price={Math.max(0, catalog.multiPetHalo)}
                              error={fieldErrors.haloPet}
                              note={haloNote}
                              onNote={(value) => {
                                setHaloNote(value);
                                clearFieldError("haloNote");
                              }}
                              noteNeeded={haloNoteNeeded}
                              noteError={fieldErrors.haloNote}
                            />
                          ),
                        }
                      : isBundle && bundleCopy && greetingIsOffered
                        ? {
                            heading: bundleCopy.greetingHeading,
                            render: (heading) => (
                              <GreetingCardSection
                                content={content}
                                heading={heading}
                                price={greetingPrice}
                                on={greetingCard}
                                onToggle={() => {
                                  setGreetingCard(!greetingCard);
                                  clearFieldError("greeting");
                                }}
                                message={greetingMessage}
                                onMessage={(v) => {
                                  setGreetingMessage(v);
                                  clearFieldError("greeting");
                                }}
                                error={fieldErrors.greeting}
                              />
                            ),
                          }
                        : undefined
                  }
                />
              ) : (
              <>
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
                      {portraitStyle === "framed" ? "2. Background Color" : "1. Background Color"}
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
                      {portraitStyle === "framed" ? "3. Add-on Illustration" : "2. Add-on Illustration"}
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
                              +{catalog.halo}
                            </span>
                          </div>
                          <Image
                            src={addon.image}
                            alt={addon.label}
                            fill
                            sizes="96px"
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

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        5. Pet Name{petNameCount > 1 ? "s" : ""} <span className="text-red-500">*</span>
                      </label>
                      <div className={`grid gap-3 ${petNameCount === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {Array.from({ length: petNameCount }).map((_, i) => {
                          const names = petName.split(", ");
                          const currentName = names[i] || "";
                          return (
                            <input
                              key={i}
                              type="text"
                              value={currentName}
                              onChange={(e) => {
                                const newNames = [...names];
                                while (newNames.length < petNameCount) newNames.push("");
                                newNames[i] = e.target.value;
                                setPetName(newNames.slice(0, petNameCount).join(", ").replace(/^, |, $/g, ''));
                                clearFieldError("petName");
                              }}
                              placeholder={petNameCount > 1 ? `Pet ${i + 1} Name` : "E.g. Lola"}
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
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (!file) return;
                          if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
                          const url = URL.createObjectURL(file);
                          previewObjectUrl.current = url;
                          setPhotoPreviewUrl(url);
                          setSelectedFile(file);
                          clearFieldError("photo");
                          void startPhotoUpload(file).catch(() => undefined);
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
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-3">
                          <PreviewImage
                            src={photoPreviewUrl}
                            alt="Uploaded pet"
                            busy={photoStatus === "uploading"}
                            className="h-14 w-14 rounded-lg border border-gray-100"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-gray-500 font-medium truncate">{selectedFile.name}</p>
                            {photoStatus === "error" && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!selectedFile) return;
                                  void startPhotoUpload(selectedFile).catch(() => undefined);
                                }}
                                className="text-left text-[11px] font-bold text-red-600"
                              >
                                {photoError || "We couldn't save the pet photo."} Tap to retry.
                              </button>
                            )}
                          </div>
                        </div>
                        {photoStatus === "uploading" && <PhotoUploadBar percent={photoProgress} />}
                        {photoStatus === "saved" && (
                          <PhotoUploadBar percent={100} done label="Photo uploaded" detail="Looks great! We'll use this for your portrait." />
                        )}
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
              </>
              )}
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
              {everyday ? (
                <EverydayUploadStep
                  content={content}
                  showPhotoGuide={() => setShowPhotoGuide(true)}
                  selectedFile={selectedFile}
                  photoPreviewUrl={photoPreviewUrl}
                  photoStatus={photoStatus}
                  photoProgress={photoProgress}
                  photoError={photoError}
                  onPickFile={(file) => {
                    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
                    const url = URL.createObjectURL(file);
                    previewObjectUrl.current = url;
                    setPhotoPreviewUrl(url);
                    setSelectedFile(file);
                    clearFieldError("photo");
                    void startPhotoUpload(file).catch(() => undefined);
                  }}
                  onRemovePhoto={() => {
                    photoUploadGeneration.current += 1;
                    uploadPromiseRef.current = null;
                    uploadedPhotoUrlRef.current = "";
                    if (previewObjectUrl.current) {
                      URL.revokeObjectURL(previewObjectUrl.current);
                      previewObjectUrl.current = null;
                    }
                    setSelectedFile(null);
                    setPhotoPreviewUrl("/feature-detail.png");
                    setPhotoStatus("idle");
                    setPhotoProgress(0);
                    setPhotoError("");
                    clearFieldError("photo");
                  }}
                  onRetryUpload={() => {
                    if (!selectedFile) return;
                    void startPhotoUpload(selectedFile).catch(() => undefined);
                  }}
                  fieldErrors={fieldErrors}
                  customerName={customerName}
                  onCustomerName={(v) => {
                    setCustomerName(v);
                    clearFieldError("customerName");
                  }}
                  customerPhone={customerPhone}
                  onCustomerPhone={(v) => {
                    setCustomerPhone(v);
                    clearFieldError("customerPhone");
                  }}
                  customerEmail={customerEmail}
                  onCustomerEmail={(v) => {
                    setCustomerEmail(v);
                    clearFieldError("customerEmail");
                  }}
                  onAddToCart={() => void handleAddToCart()}
                  beforeGuide={
                    flowProduct ? (
                      <MethodCards
                        content={content}
                        methods={methods}
                        method={activeMethod}
                        onMethod={(next) => {
                          setPhotoMethod(next);
                          setFieldErrors({});
                        }}
                      />
                    ) : undefined
                  }
                  uploadSection={
                    flowProduct ? (
                      <div className="space-y-2">
                        <SlotUploadsSection
                          product={flowProduct}
                          content={content}
                          method={activeMethod}
                          specs={slotList}
                          uploads={uploads}
                          petCount={petCount}
                          confirmGroup={confirmGroup}
                          onConfirmGroup={(on) => {
                            setConfirmGroup(on);
                            clearFieldError("confirmGroup");
                          }}
                          showConfirm={groupConfirmNeeded && Boolean(uploads.slots.group)}
                          errors={fieldErrors}
                          onSlotChange={(key) => {
                            if (key === "group") setConfirmGroup(false);
                          }}
                        />
                        {fieldErrors.photo ? <p className="text-[12px] font-semibold text-red-500">{fieldErrors.photo}</p> : null}
                      </div>
                    ) : newProduct ? (
                      <div className="space-y-3">
                        <PhotoSlots
                          specs={newSlotSpecs}
                          uploads={uploads}
                          content={content}
                          note={deskCopy ? fill(deskCopy.selectedLabel, { count: deskPetsLabel, layout: deskLayoutLabel }) : undefined}
                          errors={fieldErrors}
                          onChange={(key) => {
                            clearFieldError(`photo:${key}`);
                            clearFieldError("photo");
                          }}
                        />
                        {fieldErrors.photo ? <p className="text-[12px] font-semibold text-red-500">{fieldErrors.photo}</p> : null}
                      </div>
                    ) : undefined
                  }
                  beforeDetails={
                    flowProduct ? (
                      <ArtistNote content={content} value={artistNote} onValue={setArtistNote} />
                    ) : isBundle && bundleCopy?.showPetDetails ? (
                      <PetDetailsSection
                        content={content}
                        ages={content.bundleAges ?? []}
                        petType={petType}
                        onPetType={setPetType}
                        breed={petBreed}
                        onBreed={setPetBreed}
                        age={petAge}
                        onAge={setPetAge}
                      />
                    ) : undefined
                  }
                  addToCartDisabled={Boolean((flowProduct || newProduct) && cartBlocker)}
                  addToCartHint={cartBlocker}
                />
              ) : (
              <>
              <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={prevStep} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase">
                  <ArrowLeft size={14} /> Back
                </button>
                <label className="block text-base font-medium text-[#1a1a1b]">
                  Customer Details
                </label>
              </div>

              <p className="text-[12px] text-gray-500 leading-relaxed">
                These details are carried to checkout. You can still change them there if the order is for someone else.
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
              </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {orderStatus === 'error' && (
          <p className="text-red-500 text-xs text-center font-bold uppercase mt-2">
            Checkout failed. Please try again!
          </p>
        )}
      </div>

      {/* Trust & Features Icons (the Everyday flow shows its own strip inside each step) */}
      {!everyday ? (
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
      ) : null}

      {/* Testimonial Card */}
      {content.below.showTestimonial ? (
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
                  src={(everyday && media(uploadedKey(`${mediaPrefix}-testimonial`))) || media(testimonials[testimonialIndex].avatar)}
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
      ) : null}

      {/* Social Proof Banner */}
      {content.below.showTrustedBanner ? (
      <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-3 bg-gray-50/30 mt-5 mb-5">
        <div className="flex -space-x-2">
          {SOCIAL_PROOF_AVATARS.map((avatar, index) => {
            const own = everyday ? media(uploadedKey(`${mediaPrefix}-trusted-${index + 1}`)) : "";
            return (
              <div key={avatar.src} className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-sm">
                <Image
                  src={own || media(avatar.src)}
                  alt="Happy pet parent"
                  fill
                  sizes="96px"
                  className="object-cover"
                  style={own ? undefined : { objectPosition: avatar.face, transformOrigin: avatar.face, transform: `scale(${avatar.zoom})` }}
                />
              </div>
            );
          })}
        </div>
        <p className="text-[13px] font-bold text-[#1a1a1b]">
          {content.below.trustedLabel}
        </p>
      </div>
      ) : null}

      {/* Accordions */}
      <div className="space-y-2 pt-4">
        {content.accordions
          .filter((item) => item.title.trim())
          .map((item, index) => (
            <Accordion key={`${item.title}-${index}`} label={item.title} icon={<TrustGlyph icon={item.icon} />}>
              <RichText text={item.body} />
            </Accordion>
          ))}
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
                  {content.photoGuide.title}
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
                  {content.photoGuide.intro}
                </p>

                {/* Bullets */}
                <ul className="space-y-2.5 font-inter text-xs md:text-sm font-bold text-[#1a1a1b] leading-tight">
                  {content.photoGuide.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#A87B62] font-black">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>

                {/* Dog Headshots Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {GUIDE_STOCK_PHOTOS.map((src, i) => (
                    <PhotoGuideImage
                      key={src}
                      slot={`${mediaPrefix}-guide-${i + 1}`}
                      fallbackSlot={`everyday-guide-${i + 1}`}
                      stock={src}
                      position={i + 1}
                    />
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
              className={`w-full max-w-[450px] h-full flex flex-col shadow-2xl relative z-10 overflow-hidden ${everyday ? "bg-[#FAF7F2]" : "bg-[#fdfdfb]"}`}
            >
              {everyday ? (
                <EverydayCart
                  content={content}
                  catalog={catalog}
                  mediaPrefix={mediaPrefix}
                  hasItem={hasCustomizedItem}
                  onClose={() => setShowCart(false)}
                  photoUrl={newProduct ? newPreviewUrl : flowProduct ? flowPreviewUrl : photoPreviewUrl}
                  photoBusy={newProduct ? newUploading : flowProduct ? flowUploading : photoStatus === "uploading"}
                  summaryLine={
                    newProduct
                      ? newSummaryLine
                      : flowProduct
                        ? [cartStyleLabel, flowChoiceLabel, cartSizeLabel].filter(Boolean).join(" · ")
                        : undefined
                  }
                  details={newProduct ? newCartDetails : flowCartDetails}
                  included={bundleIncludedCard}
                  extraLines={newExtraLines}
                  hideExtras={newProduct ? newVisibleExtras.length === 0 : undefined}
                  hideGift={newProduct ? !content.cart.showGift : undefined}
                  fileName={selectedFile?.name || ""}
                  styleLabel={portraitStyle === "framed" ? content.step1.framedTitle : content.step1.canvasTitle}
                  sizeLabel={selectedSize.replace(/\s*x\s*/i, " × ")}
                  backgroundLabel={backgroundLabel(selectedBg)}
                  frameLabel={
                    portraitStyle === "canvas"
                      ? content.cart.canvasFrameLabel
                      : content.frames.find((frame) => frame.id === selectedFrame)?.label || selectedFrame
                  }
                  petName={effectivePetName}
                  subtitle={effectiveSubtitle}
                  priority={priorityPreview}
                  itemPrice={Math.max(0, portraitBaseAmount - breakdown.wrap - greetingLineAmount)}
                  qty={cartQty}
                  onQty={setCartQty}
                  onRemove={() => {
                    setAddedToCart(false);
                    setShowCart(false);
                  }}
                  extras={{ mug: addMug, magnet: addMagnet, digital: addDigitalDownload, desk: addDesk }}
                  onToggleExtra={(id: ExtraId) => {
                    if (id === "mug") setAddMug((v) => !v);
                    else if (id === "magnet") setAddMagnet((v) => !v);
                    else if (id === "digital") setAddDigitalDownload((v) => !v);
                    else setAddDesk((v) => !v);
                  }}
                  giftWrap={giftWrap}
                  onGiftWrap={setGiftWrap}
                  couponInput={couponInput}
                  onCouponInput={(value) => {
                    setCouponInput(value.toUpperCase());
                    setCouponError(null);
                  }}
                  couponApplied={Boolean(appliedCoupon)}
                  couponBusy={isApplyingCoupon}
                  couponError={couponError}
                  couponMessage={couponMessage}
                  onApplyCoupon={applyCoupon}
                  onRemoveCoupon={removeCoupon}
                  itemCount={cartQty + extraLines.length + (greetingLineAmount > 0 ? 1 : 0)}
                  subtotal={quote.originalAmount}
                  discount={displayQuote.couponDiscount}
                  total={cartTotal}
                  onCheckout={handleInitiateCheckout}
                />
              ) : (
              <>
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
                    <div className="bg-white p-4 space-y-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex gap-4">
                        <PreviewImage
                          src={photoPreviewUrl}
                          alt="Custom Pet Portrait"
                          busy={photoStatus === "uploading"}
                          className="h-24 w-24 flex-shrink-0 rounded-xl border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-sm text-[#1a1a1b] font-inter leading-tight">
                            {productType === "portrait"
                              ? PORTRAIT_STYLE_LABELS[portraitStyle]
                              : PRODUCT_LABELS[productType]}
                          </h3>
                          <p className="text-[11px] font-bold mt-1 text-[#A87B62]">
                            {formatRs(portraitBaseAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-3 border-gray-50">
                        {productType === "portrait" ? (
                          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-[#1a1a1b]">
                            <p><span className="text-gray-400 block">Portrait style</span><span className="font-bold">{PORTRAIT_STYLE_LABELS[portraitStyle]}</span></p>
                            <p><span className="text-gray-400 block">Size</span><span className="font-bold">{selectedSize}</span></p>
                            <p><span className="text-gray-400 block">Number of pets</span><span className="font-bold">{PET_COUNT_LABELS[selectedPets]}</span></p>
                            <p><span className="text-gray-400 block">Frame / finish</span><span className="font-bold">{frameColorLabel(selectedFrame, portraitStyle)}</span></p>
                            <p><span className="text-gray-400 block">Background</span><span className="font-bold">{selectedBg}</span></p>
                            <p><span className="text-gray-400 block">Add-on illustration</span><span className="font-bold">{selectedAddOn === "halo_effect" ? `Halo Effect · ${formatRs(catalog.halo)}` : "None"}</span></p>
                            {petName ? (
                              <p><span className="text-gray-400 block">Pet name</span><span className="font-bold">{petName}</span></p>
                            ) : null}
                            <p className="col-span-2"><span className="text-gray-400 block">Memorial text</span><span className="font-bold">{memorialText || "—"}</span></p>
                            <p className="col-span-2 truncate"><span className="text-gray-400 block">Uploaded photo</span><span className="font-bold">{selectedFile ? selectedFile.name : "—"}</span></p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-[#1a1a1b]">
                            <p className="col-span-2"><span className="text-gray-400 block">Service</span><span className="font-bold">{PRODUCT_LABELS[productType]}</span></p>
                            {petName && <p className="col-span-2"><span className="text-gray-400 block">Pet name</span><span className="font-bold">{petName}</span></p>}
                          </div>
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
                          className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {extraProductsPicker("Additional Products")}

                    {productType === "portrait" ? (
                      <div className="rounded-[12px] border-2 border-[#A97659]/35 bg-[#FAF7F2] p-4 space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <h4 className="text-center font-semibold uppercase tracking-[0.18em] text-[10px] text-[#6B5E53]">
                            Gift Wrapping
                          </h4>
                          <span className="rounded-full bg-[#F1E7DC] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#A97659]">
                            Optional
                          </span>
                        </div>
                        <div className="flex items-center gap-3 rounded-[10px] border-2 border-[#EBD6C8] bg-white p-3.5">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] bg-[#F9EFE4] text-[#A97659]">
                            <Gift size={22} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#2D2D2D]">Make it gift-ready</p>
                            <p className="text-[11px] leading-snug text-[#6B5E53] mt-0.5">
                              We&apos;ll beautifully wrap your portrait, ready to gift to someone special.
                            </p>
                            <p className="text-[12px] font-bold text-[#A97659] mt-1">{formatRs(catalog.giftWrap)}</p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={giftWrap}
                            aria-label="Gift wrapping"
                            onClick={() => setGiftWrap(!giftWrap)}
                            className="relative inline-flex h-6 w-11 min-h-[44px] min-w-[44px] items-center justify-center"
                          >
                            <span className={`relative block h-6 w-11 rounded-full ${giftWrap ? "bg-[#A97659]" : "bg-[#D9CDB8]"}`}>
                              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${giftWrap ? "translate-x-5" : "translate-x-0"}`} />
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : null}

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
                        <span>Coupon {displayQuote.couponCode} ({couponOffLabel(displayQuote)})</span>
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
                      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#A97659] text-base font-semibold uppercase text-white transition-all hover:bg-[#966c55] active:scale-[0.98]"
                    >
                      Proceed to Checkout →
                    </button>
                  </div>
                </div>
              )}
              </>
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
                          <p className="text-[11px] text-green-700 font-bold mt-0.5">{catalog.prepaidPercent}% discount for paying the full amount now</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "prepaid" ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                        {paymentMethod === "prepaid" && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                      <div className="space-y-1 text-[12px] bg-[#faf8f5] rounded-xl p-3">
                      {prepaidQuote.couponDiscount > 0 && (
                        <div className="flex justify-between text-green-700">
                          <span>Coupon {prepaidQuote.couponCode}</span>
                          <span className="font-bold">- {formatRs(prepaidQuote.couponDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between"><span className="text-gray-500">Order Total</span><span className="font-bold">{formatRs(prepaidQuote.afterCouponAmount)}</span></div>
                      <div className="flex justify-between text-green-700"><span>Prepaid Discount ({catalog.prepaidPercent}%)</span><span className="font-bold">- {formatRs(prepaidQuote.prepaidDiscount)}</span></div>
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
                              Pay {catalog.codAdvancePercent}% now to confirm your order. Remaining {100 - catalog.codAdvancePercent}% will be payable at the time of delivery.
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-[#1a1a1b] bg-[#1a1a1b]" : "border-gray-300"}`}>
                          {paymentMethod === "cod" && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <div className="space-y-1 text-[12px] bg-[#faf8f5] rounded-xl p-3">
                        {codQuote.couponDiscount > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span>Coupon {codQuote.couponCode}</span>
                            <span className="font-bold">- {formatRs(codQuote.couponDiscount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between"><span className="text-gray-500">Order Total</span><span className="font-bold">{formatRs(codQuote.afterCouponAmount)}</span></div>
                        <div className="flex justify-between"><span>{catalog.codAdvancePercent}% Advance</span><span className="font-bold">{formatRs(codQuote.advanceAmount)}</span></div>
                        <div className="flex justify-between pt-1 border-t border-dashed border-[#eadfc9]">
                          <span>Remaining {100 - catalog.codAdvancePercent}%</span>
                          <span className="font-bold">{formatRs(codQuote.remainingAmount)} — Payable on Delivery</span>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery Details</h3>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
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
                        className={`w-full px-3 py-2.5 border-[1.5px] rounded-lg outline-none text-sm ${fieldErrors.customerName ? "border-red-400 bg-red-50/40" : "border-gray-200 focus:border-[#1a1a1b]"}`}
                      />
                      <FieldError message={fieldErrors.customerName} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
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
                        className={`w-full px-3 py-2.5 border-[1.5px] rounded-lg outline-none text-sm ${fieldErrors.customerEmail ? "border-red-400 bg-red-50/40" : "border-gray-200 focus:border-[#1a1a1b]"}`}
                      />
                      <FieldError message={fieldErrors.customerEmail} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
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
                        className={`w-full px-3 py-2.5 border-[1.5px] rounded-lg outline-none text-sm ${fieldErrors.customerPhone ? "border-red-400 bg-red-50/40" : "border-gray-200 focus:border-[#1a1a1b]"}`}
                      />
                      <FieldError message={fieldErrors.customerPhone} />
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
                      setPaymentNotice({
                        title: "Payment failed",
                        message: "The payment was cancelled. You have not been charged. Your order details are still here, so you can try again.",
                      });
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

      <AnimatePresence>
        {paymentNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 ${paymentNotice.title === "Payment received" ? "bg-[#A87B62]" : "bg-rose-500"}`} />
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${paymentNotice.title === "Payment received" ? "bg-[#fcf8f5] text-[#A87B62]" : "bg-rose-50 text-rose-500"}`}>
                  {paymentNotice.title === "Payment received" ? <ShieldCheck size={26} /> : <span className="text-2xl font-black">!</span>}
                </div>
                <h3 className="text-lg font-black text-[#1a1a1b] uppercase tracking-tight">{paymentNotice.title}</h3>
                <p className="text-sm font-medium text-gray-500 leading-relaxed">{paymentNotice.message}</p>
                <button
                  type="button"
                  onClick={() => setPaymentNotice(null)}
                  className="w-full py-3 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#2F2F2F] transition-colors shadow-md active:scale-[0.98]"
                >
                  {paymentNotice.title === "Payment received" ? "Close" : "Try again"}
                </button>
                {paymentNotice.title !== "Payment received" && (
                  <button
                    type="button"
                    onClick={openSaveOffer}
                    className="w-full py-3 rounded-xl border border-[#e7e1da] bg-white text-[#1a1a1b] font-bold uppercase tracking-wider text-[11px] hover:bg-[#faf8f5] transition-colors active:scale-[0.98]"
                  >
                    Go back (changed my mind)
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saveOffer && offerSlice && (
          <SaveOfferModal
            petName={petName}
            slice={offerSlice}
            sliceIndex={saveOffer.index}
            alreadyRevealed={saveOffer.revealed}
            savingsLabel={formatRs(offerQuote.couponDiscount)}
            payNowLabel={formatRs(offerQuote.payableNow)}
            previousPayLabel={formatRs(quote.payableNow)}
            keepCurrent={keepCurrentOffer}
            currentCode={appliedCoupon}
            currentSavingsLabel={formatRs(quote.couponDiscount)}
            claiming={isClaimingOffer}
            error={saveOfferError}
            onRevealed={revealSaveOffer}
            onClaim={claimSaveOffer}
            onLeave={leaveAfterSaveOffer}
          />
        )}
      </AnimatePresence>

      <UploadFailDialog alert={uploadFailAlert} onClose={() => setUploadFailAlert(null)} buttonLabel={everyday ? content.step3.dialogButton : "Try again"} />

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
                <h3 className="text-lg font-black text-[#1a1a1b] uppercase tracking-tight">
                  {everyday ? content.header.noticeTitle : "Missing Details"}
                </h3>
                <p className="text-sm font-medium text-gray-500">{warningMessage}</p>
                <button
                  onClick={() => setWarningMessage(null)}
                  className="w-full py-3 bg-[#1a1a1b] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#2F2F2F] transition-all shadow-md active:scale-95 mt-2"
                >
                  {everyday ? content.header.noticeButton : "Got It"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PortraitStyleInfographic
        open={showStylePreview}
        onClose={() => setShowStylePreview(false)}
        styleOptions={catalog.options.styles}
        mediaPrefix={everyday ? mediaPrefix : undefined}
        copy={
          everyday
            ? {
                title: content.step1.previewTitle,
                framedTitle: content.step1.previewFramedTitle,
                framedTagline: content.step1.previewFramedTagline,
                canvasTitle: content.step1.previewCanvasTitle,
                canvasTagline: content.step1.previewCanvasTagline,
                unavailable: content.step1.previewUnavailable,
              }
            : undefined
        }
      />
    </div>
  );
}


function PhotoGuideImage({
  slot,
  fallbackSlot,
  stock,
  position,
}: {
  slot: string;
  fallbackSlot: string;
  stock: string;
  position: number;
}) {
  const uploaded = useUploadedMedia(slot);
  const everydayUpload = useUploadedMedia(fallbackSlot);
  return (
    <div className="aspect-[3/4] relative rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <img src={uploaded || everydayUpload || stock} alt={`Pet photo example ${position}`} className="w-full h-full object-cover" />
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
