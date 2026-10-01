"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { createManualOrder, type ManualOrderInput } from "@/app/actions/adminActions";
import { buttonClass, errorClass, Field, ghostButtonClass, inputClass, okClass, Panel } from "@/components/admin/ui";
import { PhotoUploadBar, PreviewImage } from "@/components/PreviewImage";
import { CANVAS_SIZES, FRAMED_SIZES } from "@/lib/pricing";
import { uploadPetPhotoFile } from "@/lib/uploadPetPhoto";

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function emptyForm(): ManualOrderInput {
  return {
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    petName: "",
    portraitStyle: "framed",
    size: FRAMED_SIZES[0],
    numPets: "one",
    background: "",
    font: "",
    memorialText: "",
    addon: "",
    giftWrap: false,
    photoUrl: "",
    shippingAddress: "",
    shippingLandmark: "",
    shippingCity: "",
    shippingState: "",
    shippingPincode: "",
    totalPrice: 0,
    paymentMode: "prepaid",
    advancePaid: 0,
    orderDate: nowLocal(),
    sendEmail: false,
  };
}

export function ManualOrderForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => Promise<void> }) {
  const [form, setForm] = useState<ManualOrderInput>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [localPreview, setLocalPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const previewUrl = useRef("");

  useEffect(() => {
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, []);

  function set<K extends keyof ManualOrderInput>(key: K, value: ManualOrderInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    const url = URL.createObjectURL(file);
    previewUrl.current = url;
    setLocalPreview(url);
    setUploading(true);
    setUploadProgress(6);
    setError("");
    try {
      const url = await uploadPetPhotoFile(file, (progress) => setUploadProgress(progress.percent));
      set("photoUrl", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The photo could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const result = await createManualOrder({
      ...form,
      orderDate: new Date(form.orderDate).toISOString(),
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setForm(emptyForm());
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = "";
    setLocalPreview("");
    setNotice(`Order #${result.orderId.slice(0, 8).toUpperCase()} added.`);
    await onCreated();
  }

  const sizes = form.portraitStyle === "canvas" ? CANVAS_SIZES : FRAMED_SIZES;

  return (
    <Panel title="Add offline order" note="For orders that came in on WhatsApp, phone, or in person. It shows up in Orders and the overview for the date you pick.">
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Customer name *">
            <input value={form.customerName} onChange={(e) => set("customerName", e.target.value)} required className={inputClass} />
          </Field>
          <Field label="Phone *">
            <input type="tel" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} required className={inputClass} />
          </Field>
          <Field label="Email" hint="Optional">
            <input type="email" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-[10rem_1fr]">
          <div className="space-y-2">
            <span className="block text-xs font-medium text-[#6b7280]">Pet photo</span>
            <label className="flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#e5e7eb] bg-[#f8f9fa] text-center text-xs text-[#9ca3af]">
              {localPreview || form.photoUrl ? (
                <PreviewImage
                  src={localPreview || form.photoUrl}
                  alt="Pet photo"
                  busy={uploading}
                  className="h-full w-full"
                />
              ) : (
                "Tap to upload"
              )}
              <input type="file" accept="image/*" onChange={handlePhoto} disabled={uploading} className="hidden" />
            </label>
            {uploading ? <PhotoUploadBar percent={uploadProgress} /> : null}
            {form.photoUrl ? (
              <button
                type="button"
                onClick={() => {
                  set("photoUrl", "");
                  if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
                  previewUrl.current = "";
                  setLocalPreview("");
                }}
                className="text-xs font-medium text-primary"
              >
                Remove photo
              </button>
            ) : (
              <p className="text-[11px] text-[#9ca3af] leading-snug">Without a photo the order waits in &ldquo;Awaiting images&rdquo;.</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Pet name">
              <input value={form.petName} onChange={(e) => set("petName", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Style">
              <select
                value={form.portraitStyle}
                onChange={(e) => {
                  const style = e.target.value === "canvas" ? "canvas" : "framed";
                  setForm((prev) => ({ ...prev, portraitStyle: style, size: (style === "canvas" ? CANVAS_SIZES : FRAMED_SIZES)[0] }));
                }}
                className={inputClass}
              >
                <option value="framed">Framed</option>
                <option value="canvas">Canvas</option>
              </select>
            </Field>
            <Field label="Size">
              <select value={form.size} onChange={(e) => set("size", e.target.value)} className={inputClass}>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Number of pets">
              <select value={form.numPets} onChange={(e) => set("numPets", e.target.value)} className={inputClass}>
                <option value="one">One</option>
                <option value="two">Two</option>
                <option value="three">Three</option>
                <option value="four">Four</option>
              </select>
            </Field>
            <Field label="Background">
              <input value={form.background} onChange={(e) => set("background", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Font">
              <input value={form.font} onChange={(e) => set("font", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Memorial text">
              <input value={form.memorialText} onChange={(e) => set("memorialText", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Add-ons / notes">
              <input value={form.addon} onChange={(e) => set("addon", e.target.value)} placeholder="Mug, magnet, halo…" className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
              <input type="checkbox" checked={form.giftWrap} onChange={(e) => set("giftWrap", e.target.checked)} />
              Gift wrap
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-5">
            <Field label="Full address *">
              <textarea
                value={form.shippingAddress}
                onChange={(e) => set("shippingAddress", e.target.value)}
                required
                rows={2}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Landmark">
            <input value={form.shippingLandmark} onChange={(e) => set("shippingLandmark", e.target.value)} className={inputClass} />
          </Field>
          <Field label="City">
            <input value={form.shippingCity} onChange={(e) => set("shippingCity", e.target.value)} className={inputClass} />
          </Field>
          <Field label="State">
            <input value={form.shippingState} onChange={(e) => set("shippingState", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Pincode">
            <input value={form.shippingPincode} onChange={(e) => set("shippingPincode", e.target.value)} inputMode="numeric" className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Order date *">
            <input
              type="datetime-local"
              value={form.orderDate}
              max={nowLocal()}
              onChange={(e) => set("orderDate", e.target.value)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Order amount (₹) *">
            <input
              type="number"
              min={1}
              value={form.totalPrice || ""}
              onChange={(e) => set("totalPrice", Number(e.target.value))}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Payment">
            <select
              value={form.paymentMode}
              onChange={(e) => set("paymentMode", e.target.value === "partial" ? "partial" : "prepaid")}
              className={inputClass}
            >
              <option value="prepaid">Fully paid</option>
              <option value="partial">Cash on delivery (part paid)</option>
            </select>
          </Field>
          {form.paymentMode === "partial" ? (
            <Field label="Advance paid (₹)" hint={`Due on delivery: ₹${Math.max(0, (form.totalPrice || 0) - (form.advancePaid || 0))}`}>
              <input
                type="number"
                min={0}
                value={form.advancePaid || ""}
                onChange={(e) => set("advancePaid", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          ) : null}
        </div>

        {form.customerEmail ? (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.sendEmail} onChange={(e) => set("sendEmail", e.target.checked)} />
            Send the order confirmation email to the customer
          </label>
        ) : null}

        {error ? <p className={errorClass}>{error}</p> : null}
        {notice ? <p className={okClass}>{notice}</p> : null}

        <div className="flex gap-2">
          <button type="submit" disabled={saving || uploading} className={buttonClass}>
            {saving ? "Saving…" : "Add order"}
          </button>
          <button type="button" onClick={onClose} className={ghostButtonClass}>
            Close
          </button>
        </div>
      </form>
    </Panel>
  );
}
