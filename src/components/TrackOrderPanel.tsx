"use client";

import { FormEvent, useState } from "react";
import { approvePreview, lookupOrdersByPhone, requestRevision, type TrackOrder } from "@/app/actions/trackActions";
import { NoteBody } from "@/components/NoteBody";
import { MAX_CHANGE_POINTS, MIN_CHANGE_POINTS } from "@/lib/change-points";
import { OrderHistory } from "@/components/OrderHistory";
import { OrderTimeline } from "@/components/OrderTimeline";
import { X } from "lucide-react";

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TrackOrderPanel({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<TrackOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(nextPhone = phone) {
    setLoading(true);
    setError("");
    const result = await lookupOrdersByPhone(nextPhone);
    setLoading(false);
    if (!result.ok) {
      setOrders(null);
      setError(result.error);
      return;
    }
    setOrders(result.orders);
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    await search();
  }

  return (
    <div className="fixed inset-0 z-[80] flex">
      <button type="button" aria-label="Close track order" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative ml-0 h-full w-full max-w-md bg-[#fcf8f5] shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-primary text-white px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">Peternity</p>
            <h2 className="text-2xl font-black uppercase tracking-tight">Track order</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-white/15">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-inter">
              Phone number from your order
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              className="w-full bg-white border border-[#f0e4db] rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20 font-inter"
              required
            />
            {error && <p className="text-sm text-red-500 font-inter">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
            >
              {loading ? "Looking up…" : "Show my orders"}
            </button>
          </form>

          {orders && orders.length === 0 && (
            <p className="text-sm text-gray-500 font-inter">No orders found for this number.</p>
          )}

          {orders?.map((order) => (
            <TrackedOrder
              key={order.id}
              order={order}
              phone={phone}
              onUpdated={(next) => setOrders(next)}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}

function TrackedOrder({
  order,
  phone,
  onUpdated,
}: {
  order: TrackOrder;
  phone: string;
  onUpdated: (orders: TrackOrder[]) => void;
}) {
  const [points, setPoints] = useState<string[]>(() => Array.from({ length: MIN_CHANGE_POINTS }, () => ""));
  const [revising, setRevising] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const latestPreview = [...order.updates].reverse().find((update) => update.kind === "preview" && update.image_url);
  const canDecide = order.fulfillment_stage === "artwork_review" && Boolean(latestPreview);
  const roundsLeft = Math.max(0, order.revision_limit - order.revision_count);
  const canRevise = canDecide && roundsLeft > 0;
  const locked = Boolean(order.approved_update_id);

  async function applyResult(result: { ok: true; orders: TrackOrder[] } | { ok: false; error: string }) {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPoints(Array.from({ length: MIN_CHANGE_POINTS }, () => ""));
    setRevising(false);
    onUpdated(result.orders);
  }

  async function handleApprove() {
    setBusy(true);
    setError("");
    const result = await approvePreview(order.id, phone);
    setBusy(false);
    await applyResult(result);
  }

  async function handleRevision(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await requestRevision(order.id, phone, points);
    setBusy(false);
    await applyResult(result);
  }

  return (
    <article className="bg-white rounded-3xl border border-[#f0e4db] p-4 space-y-4">
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight">{order.pet_name}</h3>
        <p className="text-xs text-gray-400 font-inter">
          #{order.id.slice(0, 8).toUpperCase()}
          {order.created_at ? ` · ${formatDate(order.created_at)}` : ""}
        </p>
      </div>
      <OrderTimeline stage={order.fulfillment_stage} updates={order.updates} trackingUrl={order.tracking_url} />
      <p className="text-xs text-gray-500 font-inter">
        Revision rounds used: {order.revision_count} of {order.revision_limit}
      </p>

      {latestPreview?.image_url && (
        <div>
          <img src={latestPreview.image_url} alt="Latest portrait preview" className="w-full rounded-2xl object-cover" />
          <p className="mt-2 text-xs leading-relaxed text-gray-500 font-inter">
            This preview includes a Peternity watermark. The printed portrait is produced from the original, without the watermark.
          </p>
        </div>
      )}
      {locked && (
        <p className="text-sm font-inter text-[#1a1a1b]">
          This picture is locked
          {order.approved_at ? ` · ${formatDate(order.approved_at)}` : ""}. It is the one going to shipment.
        </p>
      )}
      {order.needs_decision && canDecide && (
        <p className="text-sm font-inter text-gray-600">
          Both revision rounds are used. You can still approve this picture. If you do not, the team will accept it and move the order to shipment.
        </p>
      )}
      {latestPreview?.note && order.fulfillment_stage === "artwork_review" && (
        <NoteBody note={latestPreview.note} className="text-sm font-inter text-gray-600" />
      )}

      {canDecide && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleApprove}
            disabled={busy}
            className="w-full bg-primary text-white rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
          >
            {busy && !revising ? "Approving…" : "Approve"}
          </button>
          {canRevise && revising ? (
            <form onSubmit={handleRevision} className="space-y-2">
              <p className="text-xs font-inter text-gray-500">Write 3 to 5 separate changes. Each one is its own point.</p>
              {points.map((point, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={point}
                    onChange={(e) =>
                      setPoints((current) => current.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)))
                    }
                    placeholder={`Change ${index + 1}`}
                    required={index < MIN_CHANGE_POINTS}
                    maxLength={240}
                    className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20 font-inter"
                  />
                  {index >= MIN_CHANGE_POINTS ? (
                    <button
                      type="button"
                      onClick={() => setPoints((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="px-3 text-xs font-bold uppercase tracking-wide text-gray-400"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
              {points.length < MAX_CHANGE_POINTS ? (
                <button
                  type="button"
                  onClick={() => setPoints((current) => [...current, ""])}
                  className="text-sm font-bold uppercase tracking-wide text-primary"
                >
                  Add another change
                </button>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 border border-primary text-primary rounded-full px-4 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Send revision"}
                </button>
                <button
                  type="button"
                  onClick={() => setRevising(false)}
                  className="px-4 py-3 text-sm font-bold uppercase tracking-wide text-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : canRevise ? (
            <button
              type="button"
              onClick={() => setRevising(true)}
              className="w-full border border-[#f0e4db] rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wide text-[#1a1a1b]"
            >
              Request revision
            </button>
          ) : null}
        </div>
      )}
      {error && <p className="text-sm text-red-500 font-inter">{error}</p>}
      <OrderHistory updates={order.updates} approvedUpdateId={order.approved_update_id} />
    </article>
  );
}
