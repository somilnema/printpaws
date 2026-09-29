"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  acceptLatestArtwork,
  assignOrderToArtist,
  cancelOrder,
  createArtist,
  createShipper,
  extendArtworkDeadline,
  holdOrder,
  resumeOrder,
  retryLoggedEmail,
  type AdminDashboard,
  type AdminOrder,
  type ArtistAccount,
} from "@/app/actions/adminActions";
import { addTeamNote, sendToVendor } from "@/app/actions/opsActions";
import { getStoreAdmin, type StoreAdmin } from "@/app/actions/storeActions";
import { MessagesPanel } from "@/components/admin/MessagesPanel";
import { TeamNotes } from "@/components/TeamNotes";
import { OrderHistory } from "@/components/OrderHistory";
import { OrderTimeline } from "@/components/OrderTimeline";
import { PasswordInput } from "@/components/PasswordInput";
import { AnalyticsOverview, DateRangeBar, defaultRange } from "@/components/admin/AnalyticsOverview";
import { CouponsPanel } from "@/components/admin/CouponsPanel";
import { ManualOrderForm } from "@/components/admin/ManualOrderForm";
import { PricingPanel } from "@/components/admin/PricingPanel";
import { sectionTabClass } from "@/components/admin/DeskSwitch";
import { buttonClass, DeskLogo, errorClass, ghostButtonClass, inputClass, Panel, warnClass } from "@/components/admin/ui";
import { orderInRange, rangeBounds, type DateRange } from "@/lib/admin-analytics";
import { adminCanAssign, adminCanCancel, adminCanHold, artworkIsOpen, maximumDueAt, safeTrackingUrl, stageLabel } from "@/lib/fulfillment";
import { isWatermarkedProof, storedPetPhotoUrl } from "@/lib/pet-photo";

type Section = "overview" | "orders" | "artists" | "shipment" | "pricing" | "coupons" | "messages";

const NAV: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "artists", label: "Artists" },
  { id: "shipment", label: "Shipment" },
  { id: "pricing", label: "Pricing" },
  { id: "coupons", label: "Coupons" },
  { id: "messages", label: "Messages" },
];

function rupee(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function orderAmount(order: AdminOrder) {
  return Number(String(order.total_price ?? "0").replace(/[^\d.]/g, "")) || 0;
}

export function AdminShell({
  dashboard,
  onRefresh,
  onLogout,
  refreshing,
}: {
  dashboard: AdminDashboard;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
  refreshing: boolean;
}) {
  const [section, setSection] = useState<Section>("overview");
  const [range, setRange] = useState<DateRange>(() => defaultRange());
  const [store, setStore] = useState<StoreAdmin | null>(null);
  const [storeState, setStoreState] = useState<"idle" | "loading" | "ready" | "signed-out">("idle");

  async function loadStore() {
    setStoreState("loading");
    const data = await getStoreAdmin();
    if (!data) {
      setStoreState("signed-out");
      return;
    }
    setStore(data);
    setStoreState("ready");
  }

  useEffect(() => {
    if ((section === "pricing" || section === "coupons") && storeState === "idle") {
      loadStore();
    }
  }, [section, storeState]);

  const title = NAV.find((item) => item.id === section)?.label;

  return (
    <div className="peternity-admin min-h-screen bg-[#F9F9F9] text-[#1a1a1b]">
      <div className="min-h-screen bg-[#F9F9F9]">
        <header className="border-b border-[#eeeeee] bg-white">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <DeskLogo />
            <nav className="flex flex-1 gap-1.5 overflow-x-auto md:justify-center">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={sectionTabClass(section === item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={onRefresh} disabled={refreshing} className={ghostButtonClass}>
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              <button type="button" onClick={onLogout} className={ghostButtonClass}>
                Log out
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 md:px-6 py-5 space-y-4">
          {section === "overview" ? (
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="mt-1 text-sm text-[#6b7280]">{dashboard.user}</p>
            </div>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          )}

          {dashboard.warning ? (
            <p className={warnClass}>Could not load every order from the database: {dashboard.warning}</p>
          ) : null}

          {section === "overview" ? (
            <AnalyticsOverview
              dashboard={dashboard}
              range={range}
              onRangeChange={setRange}
              onOpenOrders={() => setSection("orders")}
            />
          ) : null}
          {section === "orders" ? (
            <OrdersPanel dashboard={dashboard} range={range} onRangeChange={setRange} onChanged={onRefresh} />
          ) : null}
          {section === "artists" ? <ArtistsPanel artists={dashboard.artists} onCreated={onRefresh} /> : null}
          {section === "shipment" ? <ShippersPanel shippers={dashboard.shippers} onCreated={onRefresh} /> : null}
          {section === "messages" ? <MessagesPanel /> : null}
          {section === "pricing" || section === "coupons" ? (
            storeState === "signed-out" ? (
              <p className="text-sm text-[#6b7280]">Sign in again to edit prices and coupons.</p>
            ) : storeState !== "ready" || !store ? (
              <p className="text-sm text-[#6b7280]">Loading…</p>
            ) : section === "pricing" ? (
              <PricingPanel
                initial={store.catalog}
                ready={store.ready}
                setupError={store.ready ? undefined : store.error}
                onSaved={loadStore}
              />
            ) : (
              <CouponsPanel
                coupons={store.coupons}
                ready={store.ready}
                setupError={store.ready ? undefined : store.error}
                onChanged={loadStore}
              />
            )
          ) : null}

          <Link href="/" className="inline-block text-sm font-medium text-primary">
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}

const STAGES = [
  "",
  "decision",
  "overdue",
  "awaiting_images",
  "ready_for_artwork",
  "artwork_in_progress",
  "artwork_review",
  "revision_requested",
  "revision_in_progress",
  "final_approval",
  "shipped",
  "delivered",
  "on_hold",
  "cancelled",
];

function OrdersPanel({
  dashboard,
  range,
  onRangeChange,
  onChanged,
}: {
  dashboard: AdminDashboard;
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  onChanged: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("");
  const [visible, setVisible] = useState(20);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const bounds = useMemo(() => rangeBounds(range), [range]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dashboard.orders.filter((order) => {
      const status = (order.status || "").toLowerCase();
      if (status === "pending" || status === "abandoned" || status === "failed") return false;
      if (!orderInRange(order, range)) return false;
      if (stage === "decision" && !order.needs_decision) return false;
      if (stage === "overdue" && !order.overdue) return false;
      if (stage && stage !== "decision" && stage !== "overdue" && (order.fulfillment_stage || "ready_for_artwork") !== stage) return false;
      if (!q) return true;
      return [order.id, order.pet_name, order.customer_name, order.customer_phone, order.coupon_code, order.payment_mode, order.customer_email, order.size, order.frame_style, order.background]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [dashboard.orders, query, stage, range]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="space-y-3">
      {adding ? (
        <ManualOrderForm onClose={() => setAdding(false)} onCreated={onChanged} />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={buttonClass}>
          + Add offline order
        </button>
      )}
      {dashboard.workload.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.workload.map((artist) => (
            <div key={artist.id} className="rounded-3xl border border-[#eeeeee] bg-white p-4">
              <p className="font-semibold">{artist.name}</p>
              <p className="mt-1 text-sm text-[#6b7280]">{artist.open} open {artist.open === 1 ? "order" : "orders"}</p>
              <p className={`text-sm ${artist.overdue ? "font-semibold text-[#b42318]" : "text-[#9ca3af]"}`}>
                {artist.overdue} overdue
              </p>
            </div>
          ))}
        </div>
      ) : null}
      <DateRangeBar
        range={range}
        onChange={(next) => {
          onRangeChange(next);
          setVisible(20);
        }}
      />
      <div className="flex flex-col lg:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(20);
          }}
          placeholder="Search name, email, phone, size"
          className={`${inputClass} lg:max-w-sm`}
        />
        <div className="flex gap-1 overflow-x-auto">
          {STAGES.map((item) => (
            <button
              key={item || "all"}
              type="button"
              onClick={() => {
                setStage(item);
                setVisible(20);
              }}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium ${
                stage === item ? "bg-primary text-white" : "bg-white text-[#6b7280]"
              }`}
            >
              {item === "decision" ? "Decision needed" : item === "overdue" ? "Overdue" : item ? stageLabel(item) : "All"}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-[#9ca3af]">
        {filtered.length} {filtered.length === 1 ? "order" : "orders"} · {bounds.label}
      </p>
      <div className="overflow-x-auto rounded-3xl border border-[#eeeeee] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs text-[#9ca3af]">
            <tr>
              <th className="px-3 py-2 font-bold">Order</th>
              <th className="px-3 py-2 font-bold">Customer</th>
              <th className="px-3 py-2 font-bold">Stage</th>
              <th className="px-3 py-2 font-bold">Total</th>
              <th className="px-3 py-2 font-bold">Placed</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-[#9ca3af]">
                  No orders match.
                </td>
              </tr>
            ) : (
              shown.map((order, index) => {
                const id = order.id || String(index);
                const open = openId === id;
                return (
                  <OrderRows
                    key={id}
                    order={order}
                    open={open}
                    artists={dashboard.artists}
                    onToggle={() => setOpenId(open ? null : id)}
                    onChanged={onChanged}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {visible < filtered.length ? (
        <button type="button" onClick={() => setVisible((count) => count + 20)} className={ghostButtonClass}>
          Show 20 more
        </button>
      ) : null}
    </div>
  );
}

function OrderRows({
  order,
  open,
  artists,
  onToggle,
  onChanged,
}: {
  order: AdminOrder;
  open: boolean;
  artists: ArtistAccount[];
  onToggle: () => void;
  onChanged: () => Promise<void>;
}) {
  return (
    <>
      <tr className="border-t border-[#f3f4f6] cursor-pointer hover:bg-[#f8f9fa]" onClick={onToggle}>
        <td className="px-4 py-3.5">
          <p className="font-semibold">{order.pet_name || "Untitled pet"}</p>
          <p className="text-[11px] text-[#9ca3af]">{order.id ? `#${String(order.id).slice(0, 8).toUpperCase()}` : ""}</p>
        </td>
        <td className="px-3 py-3">
          <p>{order.customer_name || "—"}</p>
          <p className="text-xs text-[#9ca3af]">{order.customer_email || "No email"}</p>
        </td>
        <td className="px-3 py-3">
          <p>{stageLabel(order.fulfillment_stage)}</p>
          {order.overdue ? <p className="text-xs font-semibold text-[#b42318]">Overdue</p> : null}
          {order.needs_decision ? <p className="text-xs font-semibold text-[#8a5a00]">Decision needed</p> : null}
        </td>
        <td className="px-4 py-3.5 font-semibold">{rupee(orderAmount(order))}</td>
        <td className="px-3 py-3 text-xs">{formatDate(order.created_at)}</td>
      </tr>
      {open ? (
        <tr className="border-t border-[#f3f4f6] bg-[#f8f9fa]">
          <td colSpan={5} className="px-3 py-4">
            <OrderDetail order={order} artists={artists} onChanged={onChanged} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function OrderDetail({
  order,
  artists,
  onChanged,
}: {
  order: AdminOrder;
  artists: ArtistAccount[];
  onChanged: () => Promise<void>;
}) {
  const photo = storedPetPhotoUrl(order.photo_url);
  const [broken, setBroken] = useState(false);
  const [artistId, setArtistId] = useState(order.artist_id || "");
  const [holdReason, setHoldReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [extensionReason, setExtensionReason] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [problem, setProblem] = useState("");
  const assignedArtist = artists.find((artist) => artist.id === order.artist_id);
  const trackingLink = safeTrackingUrl(order.tracking_url);
  const cap = order.sla_started_at ? maximumDueAt(order.sla_started_at) : "";
  const approvedPreview = order.updates?.find((update) => update.id === order.approved_update_id);

  useEffect(() => {
    setArtistId(order.artist_id || "");
  }, [order.artist_id]);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    if (!order.id) return false;
    setBusy(true);
    setProblem("");
    setNotice("");
    const result = await action();
    setBusy(false);
    if (!result.ok) {
      setProblem(result.error || "That could not be saved.");
      return false;
    }
    setNotice(success);
    setHoldReason("");
    setCancelReason("");
    setExtensionReason("");
    await onChanged();
    return true;
  }

  async function handleAssign() {
    await run(() => assignOrderToArtist(order.id || "", artistId), "Artist assigned.");
  }

  return (
    <div className="grid md:grid-cols-[9rem_1fr] gap-4 text-sm">
      {photo && !broken ? (
        <a href={photo} target="_blank" rel="noreferrer" className="block h-36 rounded-2xl overflow-hidden bg-[#f8f9fa]">
          <img src={photo} alt={order.pet_name || "Pet photo"} className="w-full h-full object-cover" onError={() => setBroken(true)} />
        </a>
      ) : (
        <div className="h-36 rounded-2xl bg-[#f8f9fa] flex items-center justify-center text-xs text-[#9ca3af] px-3 text-center">
          {order.photo_url ? "Photo not saved" : "Waiting for photos"}
        </div>
      )}
      <div className="space-y-3">
        <p>
          {order.payment_mode === "partial" ? "Cash on delivery" : order.payment_mode ? "Prepaid" : "Payment not recorded"}
          {order.coupon_code ? ` · ${order.coupon_code}` : ""}
          {order.status ? ` · ${order.status}` : ""}
          {Number(order.cod_due) > 0 ? ` · due ${rupee(Number(order.cod_due))}` : ""}
        </p>
        <p className="text-[#6b7280]">
          {[order.customer_phone, order.size, order.frame_style, order.num_pets && `${order.num_pets} pet(s)`, order.background, order.font]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {(order.addon || order.gift_wrap) && (
          <p className="text-[#6b7280]">
            {order.addon ? `Add-on: ${order.addon}` : ""}
            {order.addon && order.gift_wrap ? " · " : ""}
            {order.gift_wrap ? "Gift wrap" : ""}
          </p>
        )}
        {order.memorial_text ? <p>Memorial text: {order.memorial_text}</p> : null}
        {[order.shipping_address, order.shipping_landmark, order.shipping_city, order.shipping_state, order.shipping_pincode].filter(Boolean).length ? (
          <p className="break-words">
            Ship to: {[order.shipping_address, order.shipping_landmark, order.shipping_city, order.shipping_state, order.shipping_pincode].filter(Boolean).join(", ")}
          </p>
        ) : null}
        {assignedArtist ? (
          <p>
            Artist: {assignedArtist.name} · {assignedArtist.email}
          </p>
        ) : null}
        <p>
          Revisions: {order.revision_count ?? 0} of 2
          {order.due_at ? ` · Artwork due ${formatDate(order.due_at)}` : " · Artwork clock has not started"}
          {order.overdue ? " · Overdue" : ""}
        </p>
        {order.extension_reason ? <p>Deadline extension: {order.extension_reason}</p> : null}
        {order.hold_reason ? <p>On hold: {order.hold_reason}</p> : null}
        {order.cancel_reason ? <p>Cancelled: {order.cancel_reason}</p> : null}
        {approvedPreview?.image_url ? (
          <div className="max-w-xs space-y-2">
            <img src={storedPetPhotoUrl(approvedPreview.image_url)} alt="Approved picture" className="w-full rounded-2xl" />
            <span className="block text-xs text-[#6b7280]">
              Locked picture{order.approved_at ? ` · ${formatDate(order.approved_at)}` : ""}
              {order.approved_by ? ` · ${order.approved_by}` : ""}
            </span>
            {isWatermarkedProof(approvedPreview.image_url) ? (
              <a href={`/api/artwork/original?version=${approvedPreview.id}`} className={`${buttonClass} inline-flex`}>
                Download original
              </a>
            ) : (
              <a href={storedPetPhotoUrl(approvedPreview.image_url)} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary">
                Open picture
              </a>
            )}
          </div>
        ) : null}
        <OrderTimeline stage={order.fulfillment_stage} updates={order.updates || []} trackingUrl={order.tracking_url} />
        {adminCanAssign(order.fulfillment_stage) && (
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={artistId} onChange={(e) => setArtistId(e.target.value)} className={inputClass}>
              <option value="">Choose artist</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name} · {artist.email}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleAssign} disabled={busy || !artistId} className={buttonClass}>
              {order.artist_id ? "Reassign" : "Assign"}
            </button>
          </div>
        )}
        {order.needs_decision ? (
          <button
            type="button"
            disabled={busy}
            className={buttonClass}
            onClick={() => run(() => acceptLatestArtwork(order.id || ""), "Latest picture accepted and moved to shipment.")}
          >
            Accept latest picture and move to shipment
          </button>
        ) : null}
        {artworkIsOpen(order.fulfillment_stage) && order.sla_started_at && cap ? (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => extendArtworkDeadline(order.id || "", new Date(dueAt).toISOString(), extensionReason), "Deadline extended.");
            }}
          >
            <p className="text-xs text-[#6b7280]">Extend the artwork deadline up to {formatDate(cap)}. Nights and weekends count.</p>
            <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required className={inputClass} />
            <input value={extensionReason} onChange={(e) => setExtensionReason(e.target.value)} placeholder="Reason for the extension" required className={inputClass} />
            <button type="submit" disabled={busy} className={ghostButtonClass}>
              Extend deadline
            </button>
          </form>
        ) : null}
        {order.fulfillment_stage === "final_approval" || order.fulfillment_stage === "shipped" ? (
          <div className="space-y-2">
            {order.vendor ? (
              <p className="text-[#6b7280]">
                Vendor {order.vendor.status === "sent" ? "accepted this order" : "could not take this order"}
                {order.vendor.attempted_at ? ` · ${formatDate(order.vendor.attempted_at)}` : ""}
                {order.vendor.error ? ` · ${order.vendor.error}` : ""}
              </p>
            ) : (
              <p className="text-[#6b7280]">No vendor call yet. The shipment desk can still paste the tracking link.</p>
            )}
            <button
              type="button"
              disabled={busy}
              className={ghostButtonClass}
              onClick={() =>
                run(async () => {
                  const result = await sendToVendor(order.id || "");
                  if (!result.ok) return result;
                  if (result.skipped) return { ok: false, error: "Turn on the vendor API in Messages and save an https address." };
                  return { ok: true };
                }, "Sent to the vendor.")
              }
            >
              Send to vendor
            </button>
          </div>
        ) : null}
        {order.fulfillment_stage === "final_approval" ? (
          <p className="text-[#6b7280]">This order is on the shipment dashboard, waiting for a tracking link.</p>
        ) : null}
        {trackingLink ? (
          <p>
            <a href={trackingLink} target="_blank" rel="noreferrer" className="font-bold underline">
              Shipment link
            </a>
            {order.tracking_saved_by ? ` · saved by ${order.tracking_saved_by}` : ""}
            {order.tracking_saved_at ? ` · ${formatDate(order.tracking_saved_at)}` : ""}
          </p>
        ) : null}
        {order.delivered_at ? (
          <p>
            Delivered {formatDate(order.delivered_at)}
            {order.delivered_by ? ` · ${order.delivered_by}` : ""}
          </p>
        ) : null}
        {order.fulfillment_stage === "on_hold" ? (
          <button type="button" disabled={busy} className={ghostButtonClass} onClick={() => run(() => resumeOrder(order.id || ""), "Order resumed.")}>
            Resume order
          </button>
        ) : null}
        {adminCanHold(order.fulfillment_stage) ? (
          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => holdOrder(order.id || "", holdReason), "Order put on hold.");
            }}
          >
            <input value={holdReason} onChange={(e) => setHoldReason(e.target.value)} placeholder="Why is this on hold?" required className={inputClass} />
            <button type="submit" disabled={busy} className={ghostButtonClass}>
              Put on hold
            </button>
          </form>
        ) : null}
        {adminCanCancel(order.fulfillment_stage) ? (
          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => cancelOrder(order.id || "", cancelReason), "Order cancelled.");
            }}
          >
            <input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Why is this cancelled?" required className={inputClass} />
            <button type="submit" disabled={busy} className={ghostButtonClass}>
              Cancel order
            </button>
          </form>
        ) : null}
        {problem ? <p className={errorClass}>{problem}</p> : null}
        {notice ? <p className="text-sm">{notice}</p> : null}
        <OrderHistory updates={order.updates} approvedUpdateId={order.approved_update_id} />
        <TeamNotes notes={order.teamNotes || []} onAdd={(body) => addTeamNote(order.id || "", body)} />
        {order.emails?.length ? (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Emails</p>
            {order.emails.map((email) => (
              <div key={email.id} className="rounded-2xl bg-white p-3">
                <p>
                  {email.subject} · {email.status}
                  {email.attempt_count ? ` · ${email.attempt_count} ${email.attempt_count === 1 ? "try" : "tries"}` : ""}
                </p>
                <p className="text-xs text-[#9ca3af]">
                  {email.recipient}
                  {email.sent_at ? ` · ${formatDate(email.sent_at)}` : ` · ${formatDate(email.created_at)}`}
                </p>
                {email.last_error ? <p className="text-xs text-[#b42318]">{email.last_error}</p> : null}
                {email.status === "failed" ? (
                  <button
                    type="button"
                    disabled={busy}
                    className={`${ghostButtonClass} mt-2`}
                    onClick={() => run(() => retryLoggedEmail(email.event_key), "Email sent again.")}
                  >
                    Retry email
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {order.events?.length ? (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">History of changes</p>
            {order.events.map((event) => (
              <p key={event.id} className="text-xs text-[#6b7280]">
                {formatDate(event.created_at)} · {event.actor} · {event.action}
                {event.detail ? ` · ${event.detail}` : ""}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ShippersPanel({ shippers, onCreated }: { shippers: ArtistAccount[]; onCreated: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const result = await createShipper({ name, email, password });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setMessage("Shipment account created. They sign in at /shipment with this email.");
    await onCreated();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Panel title="New shipment account" note="They use this email and password on the shipment desk.">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className={inputClass} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className={inputClass} />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={8}
            className={inputClass}
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {message ? <p className="text-sm">{message}</p> : null}
          <button type="submit" disabled={saving} className={buttonClass}>
            {saving ? "Saving…" : "Create shipment account"}
          </button>
        </form>
      </Panel>
      <Panel title="Shipment accounts">
        {shippers.length === 0 ? (
          <p className="text-sm text-[#9ca3af]">No shipment accounts yet.</p>
        ) : (
          <ul className="divide-y divide-[#f3f4f6] overflow-hidden rounded-2xl bg-[#f8f9fa]">
            {shippers.map((shipper) => (
              <li key={shipper.id} className="px-3 py-3">
                <p className="font-semibold">{shipper.name}</p>
                <p className="text-xs text-[#9ca3af]">{shipper.email}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function ArtistsPanel({ artists, onCreated }: { artists: ArtistAccount[]; onCreated: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const result = await createArtist({ name, email, password });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setMessage("Artist account created.");
    await onCreated();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Panel title="New artist" note="Create the account, then assign orders from the Orders screen.">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className={inputClass} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className={inputClass} />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={8}
            className={inputClass}
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {message ? <p className="text-sm">{message}</p> : null}
          <button type="submit" disabled={saving} className={buttonClass}>
            {saving ? "Saving…" : "Create artist"}
          </button>
        </form>
      </Panel>
      <Panel title="Artist accounts">
        {artists.length === 0 ? (
          <p className="text-sm text-[#9ca3af]">No artists yet.</p>
        ) : (
          <ul className="divide-y divide-[#f3f4f6] overflow-hidden rounded-2xl bg-[#f8f9fa]">
            {artists.map((artist) => (
              <li key={artist.id} className="px-3 py-3">
                <p className="font-semibold">{artist.name}</p>
                <p className="text-xs text-[#9ca3af]">{artist.email}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
