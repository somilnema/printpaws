"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { uploadPetPhotoFile } from "@/lib/uploadPetPhoto";
import { formatRupee } from "@/lib/pricing";
import { trackPixel } from "@/lib/pixel";

type PayChoice = "prepaid" | "cod";

type OfferCheckoutProps = {
  id: string;
  name: string;
  description: string;
  image: string;
  priceLabel: string;
  prepaidLabel: string;
  codNowLabel: string;
  codLaterLabel: string;
};

const fieldClass =
  "w-full rounded-xl border border-cocoa/15 bg-white px-3.5 py-3 text-sm text-cocoa outline-none focus:border-terracotta";

export function OfferCheckout({
  id,
  name,
  description,
  image,
  priceLabel,
  prepaidLabel,
  codNowLabel,
  codLaterLabel,
}: OfferCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<PayChoice>("prepaid");
  const [coupon, setCoupon] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sandbox, setSandbox] = useState<{ orderId: string; amount: number } | null>(null);

  const payload = (photoUrl: string) => ({
    productType: "landing_offer",
    offerId: id,
    paymentMethod,
    couponCode: coupon.trim() || null,
    photoUrl,
    petName: (document.getElementById("offer-pet") as HTMLInputElement | null)?.value || "",
    customerName: (document.getElementById("offer-name") as HTMLInputElement | null)?.value || "",
    customerEmail: (document.getElementById("offer-email") as HTMLInputElement | null)?.value || "",
    customerPhone: (document.getElementById("offer-phone") as HTMLInputElement | null)?.value || "",
    shippingAddress: (document.getElementById("offer-address") as HTMLInputElement | null)?.value || "",
    shippingCity: (document.getElementById("offer-city") as HTMLInputElement | null)?.value || "",
    shippingState: (document.getElementById("offer-state") as HTMLInputElement | null)?.value || "",
    shippingPincode: (document.getElementById("offer-pin") as HTMLInputElement | null)?.value || "",
    shippingLandmark: (document.getElementById("offer-landmark") as HTMLInputElement | null)?.value || "",
  });

  async function finish(paymentId: string, orderId: string, signature: string, photoUrl: string) {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload(photoUrl),
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature,
      }),
    });
    const result = await response.json();
    if (!result.success || !result.orderId) {
      throw new Error(result.error || "We could not finish saving the order.");
    }
    window.location.assign(`/checkout/success?orderId=${encodeURIComponent(result.orderId)}`);
  }

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!photo) {
      setError("Choose a pet photo to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const photoUrl = await uploadPetPhotoFile(photo);
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(photoUrl)),
      });
      const orderData = await res.json();
      if (!res.ok || !orderData.success) throw new Error(orderData.error || "Payment could not be started.");

      const payableNow = orderData.quote?.payableNow ?? orderData.amount;
      trackPixel("InitiateCheckout", { value: payableNow, currency: "INR", content_name: name, content_ids: [id] });
      const isMock = orderData.isMock || orderData.keyId === "rzp_test_mockKey123";
      if (isMock) {
        setSandbox({ orderId: orderData.orderId, amount: payableNow });
        setSubmitting(false);
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']");
        if (existing && (window as unknown as { Razorpay?: unknown }).Razorpay) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Razorpay could not be loaded. Check your connection and try again."));
        document.body.appendChild(script);
      });

      const Razorpay = (window as unknown as { Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (response: { error?: { description?: string } }) => void) => void } }).Razorpay;
      const instance = new Razorpay({
        key: orderData.keyId,
        amount: Math.round(payableNow * 100),
        currency: "INR",
        name: "Peternity",
        description: name,
        order_id: orderData.orderId,
        redirect: true,
        callback_url: `${window.location.origin}/api/razorpay/callback`,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          await finish(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature, photoUrl);
        },
        prefill: {
          name: (document.getElementById("offer-name") as HTMLInputElement | null)?.value,
          email: (document.getElementById("offer-email") as HTMLInputElement | null)?.value,
          contact: (document.getElementById("offer-phone") as HTMLInputElement | null)?.value,
        },
        theme: { color: "#B4472A" },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError("The payment window was closed before the payment finished. You have not been charged.");
          },
        },
      });
      instance.on("payment.failed", (response) => {
        setSubmitting(false);
        setError(response?.error?.description || "The payment was declined. You have not been charged.");
      });
      instance.open();
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Payment could not be started.");
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 md:grid-cols-2 md:py-12">
      <div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-cream-deep">
          {image ? <Image src={image} alt={name} fill sizes="(min-width: 768px) 480px, 100vw" className="object-cover" priority /> : null}
        </div>
      </div>
      <form onSubmit={pay} className="flex flex-col gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-semibold text-cocoa">{name}</h1>
          <p className="mt-2 text-sm text-cocoa/75">{description}</p>
          <p className="mt-3 text-lg font-bold text-terracotta">{priceLabel}</p>
        </div>

        <label className="block text-sm font-semibold text-cocoa">
          Pet photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(event) => setPhoto(event.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
        </label>
        <input id="offer-pet" required placeholder="Pet's name" className={fieldClass} />
        <input id="offer-name" required autoComplete="name" placeholder="Your name" className={fieldClass} />
        <input id="offer-email" required type="email" autoComplete="email" placeholder="Email" className={fieldClass} />
        <input id="offer-phone" required inputMode="tel" autoComplete="tel" placeholder="Mobile number" className={fieldClass} />
        <input id="offer-address" required autoComplete="street-address" placeholder="Full address" className={fieldClass} />
        <div className="grid grid-cols-2 gap-3">
          <input id="offer-city" required autoComplete="address-level2" placeholder="City" className={fieldClass} />
          <input id="offer-state" required autoComplete="address-level1" placeholder="State" className={fieldClass} />
        </div>
        <input id="offer-pin" required inputMode="numeric" autoComplete="postal-code" placeholder="PIN code" className={fieldClass} />
        <input id="offer-landmark" placeholder="Landmark (optional)" className={fieldClass} />
        <input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Coupon code (optional)" className={fieldClass} />

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-cocoa">Payment</legend>
          <label className="flex items-center gap-2 text-sm text-cocoa">
            <input type="radio" name="pay" checked={paymentMethod === "prepaid"} onChange={() => setPaymentMethod("prepaid")} />
            Pay now · {prepaidLabel}
          </label>
          <label className="flex items-center gap-2 text-sm text-cocoa">
            <input type="radio" name="pay" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
            Cash on delivery · {codNowLabel} now, {codLaterLabel} on delivery
          </label>
        </fieldset>

        {error ? <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="h-12 rounded-full bg-terracotta text-[15px] font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Starting payment…" : "Place order"}
        </button>
      </form>

      {sandbox ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-cocoa">
            <h2 className="font-playfair text-2xl">Test payment</h2>
            <p className="mt-2 text-sm text-cocoa/75">Razorpay keys are not configured. This simulates a payment of {formatRupee(sandbox.amount)}.</p>
            <button
              type="button"
              className="mt-5 h-11 w-full rounded-full bg-terracotta text-sm font-semibold text-white"
              onClick={async () => {
                setSubmitting(true);
                try {
                  const photoUrl = await uploadPetPhotoFile(photo as File);
                  await finish(`pay_mock_${Math.random().toString(36).slice(2, 11)}`, sandbox.orderId, "sig_mock", photoUrl);
                } catch (err) {
                  setSubmitting(false);
                  setSandbox(null);
                  setError(err instanceof Error ? err.message : "The test payment could not be saved.");
                }
              }}
            >
              Confirm test payment
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
