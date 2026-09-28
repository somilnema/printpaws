"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addTeamNote, sendToVendor } from "@/app/actions/opsActions";
import {
  getShipmentDashboard,
  markShipmentDelivered,
  saveShipmentTracking,
  type ShipmentDashboard,
  type ShipmentOrder,
} from "@/app/actions/shipmentActions";
import { TeamNotes } from "@/components/TeamNotes";
import { OrderTimeline } from "@/components/OrderTimeline";
import { PasswordInput } from "@/components/PasswordInput";
import { sectionTabClass } from "@/components/admin/DeskSwitch";
import { buttonClass, errorClass, ghostButtonClass, inputClass, okClass, warnClass } from "@/components/admin/ui";
import { safeTrackingUrl, shipperCanAddTracking, shipperCanMarkDelivered, stageLabel } from "@/lib/fulfillment";
import { isWatermarkedProof, storedPetPhotoUrl } from "@/lib/pet-photo";
import "../admin/admin.css";

type Section = "overview" | "orders";
type Filter = "" | "final_approval" | "shipped" | "delivered";

const NAV: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
];

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function addressOf(order: ShipmentOrder) {
  return [order.shipping_address, order.shipping_landmark, order.shipping_city, order.shipping_state, order.shipping_pincode]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
}

export default function ShipmentPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dashboard, setDashboard] = useState<ShipmentDashboard | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getShipmentDashboard()
      .then((data) => setDashboard(data))
      .catch(() => setDashboard(null))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shipment/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Invalid username or password");
        return;
      }
      const data = await getShipmentDashboard();
      if (!data) {
        setError("Signed in, but the dashboard could not load. Refresh and try again.");
        return;
      }
      setDashboard(data);
      setPassword("");
    } catch {
      setError("Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/shipment/logout", { method: "POST" });
    setDashboard(null);
  }

  async function refresh() {
    setLoading(true);
    try {
      const data = await getShipmentDashboard();
      setDashboard(data);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="peternity-admin flex min-h-[100dvh] items-center justify-center bg-[#f3f4f6] px-4 text-sm text-[#667085]">
        Checking session…
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="peternity-admin flex min-h-[100dvh] flex-col bg-[#f3f4f6] px-4 py-8 text-[#1c2434] sm:py-10">
        <div className="mx-auto my-auto w-full max-w-md rounded-sm border border-[#e6e8ee] bg-white p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6BFF] text-sm font-semibold text-white">P</span>
            <span className="font-semibold">Peternity</span>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Shipment</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#98a2b3]">
            Sign in with the email and password created in admin.
          </p>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#667085]">Email</span>
              <input
                type="email"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`${inputClass} text-base sm:text-sm`}
                required
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#667085]">Password</span>
              <PasswordInput
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} text-base sm:text-sm`}
                required
              />
            </label>
            {error ? <p className={errorClass}>{error}</p> : null}
            <button type="submit" disabled={loading} className={`${buttonClass} w-full`}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#2F6BFF]">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return <ShipmentShell dashboard={dashboard} refreshing={loading} onRefresh={refresh} onLogout={handleLogout} />;
}

function ShipmentShell({
  dashboard,
  refreshing,
  onRefresh,
  onLogout,
}: {
  dashboard: ShipmentDashboard;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  const [section, setSection] = useState<Section>("overview");
  const [filter, setFilter] = useState<Filter>("");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const orders = dashboard.orders;
    return {
      ready: orders.filter((order) => order.fulfillment_stage === "final_approval").length,
      shipped: orders.filter((order) => order.fulfillment_stage === "shipped").length,
      delivered: orders.filter((order) => order.fulfillment_stage === "delivered").length,
    };
  }, [dashboard.orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dashboard.orders.filter((order) => {
      if (filter && order.fulfillment_stage !== filter) return false;
      if (!q) return true;
      return [order.id, order.pet_name, order.customer_name, order.customer_phone, order.shipping_city, order.shipping_pincode, stageLabel(order.fulfillment_stage)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [dashboard.orders, filter, query]);

  function openOrders(next: Filter) {
    setFilter(next);
    setQuery("");
    setSection("orders");
  }

  return (
    <div className="peternity-admin min-h-[100dvh] overflow-x-hidden bg-[#f3f4f6] text-[#1c2434]">
      <div className="min-h-[100dvh] bg-[#f3f4f6]">
        <header className="border-b border-[#e6e8ee] bg-white">
          <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 md:px-8">
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6BFF] text-sm font-semibold text-white">P</span>
              <span className="hidden font-semibold sm:block">Peternity</span>
            </div>
            <nav className="hidden min-w-0 flex-1 justify-center gap-1 md:flex">
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
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <button type="button" onClick={onRefresh} disabled={refreshing} className={`${ghostButtonClass} px-3 py-2 sm:px-4 sm:py-2.5`}>
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              <button type="button" onClick={onLogout} className={`${ghostButtonClass} px-3 py-2 sm:px-4 sm:py-2.5`}>
                Log out
              </button>
            </div>
          </div>
          <nav className="flex gap-1.5 overflow-x-auto px-3 pb-3 md:hidden">
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
        </header>

        <div className="space-y-5 px-3 py-5 sm:px-4 sm:py-6 md:px-8">
          {section === "overview" ? (
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
              <p className="mt-2 text-sm text-[#98a2b3]">{dashboard.user} · shipment</p>
            </div>
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          )}

          {dashboard.warning ? <p className={warnClass}>{dashboard.warning}</p> : null}

          {section === "overview" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Ready to ship" value={counts.ready} hint="Approved, waiting for a tracking link" onClick={() => openOrders("final_approval")} />
              <Stat label="Shipped" value={counts.shipped} hint="Tracking link saved" onClick={() => openOrders("shipped")} />
              <Stat label="Delivered" value={counts.delivered} hint="Marked delivered" onClick={() => openOrders("delivered")} />
            </div>
          ) : (
            <div className="space-y-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pet, phone, or city"
                className={`${inputClass} text-base sm:text-sm`}
              />
              <div className="flex gap-1 overflow-x-auto">
                {(
                  [
                    ["", "All"],
                    ["final_approval", "Ready to ship"],
                    ["shipped", "Shipped"],
                    ["delivered", "Delivered"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id || "all"}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium ${filter === id ? "bg-[#1c2434] text-white" : "bg-white text-[#667085]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#98a2b3]">
                {filtered.length} of {dashboard.orders.length} {dashboard.orders.length === 1 ? "order" : "orders"}
              </p>
              {dashboard.orders.length === 0 ? (
                <div className="rounded-3xl border border-[#eef0f4] bg-white p-5 text-sm text-[#98a2b3]">
                  No approved orders are waiting. They appear here as soon as the customer approves the picture.
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-3xl border border-[#eef0f4] bg-white p-5 text-sm text-[#98a2b3]">No orders match.</div>
              ) : (
                filtered.map((order) => (
                  <ShipmentCard
                    key={order.id}
                    order={order}
                    open={openId === order.id}
                    onToggle={() => setOpenId((current) => (current === order.id ? null : order.id))}
                    onChanged={onRefresh}
                  />
                ))
              )}
            </div>
          )}

          <Link href="/" className="inline-block text-sm font-medium text-[#2F6BFF]">
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, onClick }: { label: string; value: number; hint: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-3xl border border-[#eef0f4] bg-white p-4 text-left shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-5">
      <p className="text-xs font-medium text-[#98a2b3]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs leading-snug text-[#667085]">{hint}</p>
    </button>
  );
}

function ShipmentCard({
  order,
  open,
  onToggle,
  onChanged,
}: {
  order: ShipmentOrder;
  open: boolean;
  onToggle: () => void;
  onChanged: () => Promise<void>;
}) {
  const photo = storedPetPhotoUrl(order.photo_url);
  const approved = order.updates.find((update) => update.id === order.approved_update_id) || [...order.updates].reverse().find((update) => update.kind === "approved");
  const approvedPhoto = storedPetPhotoUrl(approved?.image_url);
  const [tracking, setTracking] = useState(order.tracking_url || "");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [notice, setNotice] = useState("");
  const link = safeTrackingUrl(order.tracking_url);
  const address = addressOf(order);

  useEffect(() => {
    setTracking(order.tracking_url || "");
  }, [order.tracking_url]);

  async function handleTrack(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setProblem("");
    setNotice("");
    const result = await saveShipmentTracking(order.id, tracking);
    setBusy(false);
    if (!result.ok) {
      setProblem(result.error);
      return;
    }
    setNotice(result.updated ? "Tracking link saved. The customer was emailed." : "That link is already saved.");
    await onChanged();
  }

  async function handleDelivered() {
    setBusy(true);
    setProblem("");
    setNotice("");
    const result = await markShipmentDelivered(order.id);
    setBusy(false);
    if (!result.ok) {
      setProblem(result.error);
      return;
    }
    setNotice("Marked delivered. The customer was emailed.");
    await onChanged();
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-[#eef0f4] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-4 text-left">
        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-[#f3f5f8]">
          {approvedPhoto || photo ? (
            <img src={approvedPhoto || photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-[#98a2b3]">Pet</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{order.pet_name || "Untitled pet"}</span>
          <span className="mt-0.5 block truncate text-xs text-[#98a2b3]">
            #{order.id.slice(0, 8).toUpperCase()} · {order.customer_name || "Customer"} · {order.shipping_city || "No city"}
          </span>
        </span>
        <span className="max-w-[7rem] shrink-0 truncate rounded-full bg-[#f4f6f9] px-2.5 py-1 text-[11px] font-medium text-[#667085]">
          {stageLabel(order.fulfillment_stage)}
        </span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-[#f0f2f5] px-4 py-4 text-sm sm:px-5">
          <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
            {approvedPhoto ? (
              <div className="h-36 overflow-hidden rounded-2xl bg-[#f3f5f8]">
                <img src={approvedPhoto} alt="Approved picture" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-36 items-center justify-center rounded-2xl bg-[#f3f5f8] px-3 text-center text-xs text-[#98a2b3]">
                Approved picture not saved
              </div>
            )}
            <div className="min-w-0 space-y-2">
              <p className="font-semibold">{order.customer_name || "Customer"}</p>
              <p className="break-words text-[#667085]">
                {[order.customer_phone, order.customer_email].filter(Boolean).join(" · ") || "No contact saved"}
              </p>
              <p className="break-words">{address || "No shipping address saved"}</p>
              <p className="text-[#667085]">
                {[order.size, order.frame_style, order.addon, order.gift_wrap ? "Gift wrap" : ""].filter(Boolean).join(" · ")}
              </p>
              {Number(order.cod_due) > 0 ? <p>Cash on delivery due ₹{Math.round(Number(order.cod_due)).toLocaleString("en-IN")}</p> : <p>Prepaid</p>}
              {order.memorial_text ? <p className="break-words">Memorial text: {order.memorial_text}</p> : null}
              {order.approved_at ? <p className="text-xs text-[#98a2b3]">Approved {formatDate(order.approved_at)}</p> : null}
              <OrderTimeline stage={order.fulfillment_stage} updates={order.updates} trackingUrl={order.tracking_url} />
              {approved && isWatermarkedProof(approved.image_url) ? (
                <a href={`/api/artwork/original?version=${approved.id}`} className={`${buttonClass} inline-flex`}>
                  Download original for print
                </a>
              ) : approvedPhoto ? (
                <a href={approvedPhoto} target="_blank" rel="noreferrer" className="font-semibold text-[#2F6BFF]">
                  Open picture
                </a>
              ) : null}
            </div>
          </div>

          {order.vendor ? (
            <p className="text-[#667085]">
              Vendor {order.vendor.status === "sent" ? "accepted this order" : "could not take this order"}
              {order.vendor.error ? ` · ${order.vendor.error}` : ""}
            </p>
          ) : null}
          {order.fulfillment_stage === "final_approval" || order.fulfillment_stage === "shipped" ? (
            <button
              type="button"
              disabled={busy}
              className={ghostButtonClass}
              onClick={async () => {
                setBusy(true);
                setProblem("");
                setNotice("");
                const result = await sendToVendor(order.id);
                setBusy(false);
                if (!result.ok) {
                  setProblem(result.error);
                  return;
                }
                if (result.skipped) {
                  setProblem("The vendor API is turned off. Paste the tracking link below, or ask admin to turn it on in Messages.");
                  return;
                }
                setNotice(result.trackingSaved ? "Vendor sent a tracking link. The customer was emailed." : "Vendor accepted the order. Paste the tracking link when you have it.");
                await onChanged();
              }}
            >
              Send to vendor
            </button>
          ) : null}

          {shipperCanAddTracking(order.fulfillment_stage) ? (
            <form onSubmit={handleTrack} className="space-y-2 border-t border-[#f0f2f5] pt-4">
              <p className="text-xs font-medium text-[#667085]">
                {order.fulfillment_stage === "shipped" ? "Update the tracking link" : "Courier tracking link"}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="https://"
                  required
                  className={`${inputClass} text-base sm:text-sm`}
                />
                <button type="submit" disabled={busy} className={`${buttonClass} shrink-0`}>
                  {busy ? "Saving…" : order.fulfillment_stage === "shipped" ? "Update link" : "Save and mark shipped"}
                </button>
              </div>
            </form>
          ) : null}

          {link ? (
            <p>
              <a href={link} target="_blank" rel="noreferrer" className="font-semibold text-[#2F6BFF] underline">
                Open tracking link
              </a>
              {order.tracking_saved_by ? ` · ${order.tracking_saved_by}` : ""}
              {order.tracking_saved_at ? ` · ${formatDate(order.tracking_saved_at)}` : ""}
            </p>
          ) : null}

          {shipperCanMarkDelivered(order.fulfillment_stage) ? (
            <button type="button" disabled={busy} onClick={handleDelivered} className={buttonClass}>
              Mark delivered
            </button>
          ) : null}

          {order.delivered_at ? (
            <p>
              Delivered {formatDate(order.delivered_at)}
              {order.delivered_by ? ` · ${order.delivered_by}` : ""}
            </p>
          ) : null}
          <TeamNotes notes={order.teamNotes || []} onAdd={(body) => addTeamNote(order.id, body)} />
          {problem ? <p className={errorClass}>{problem}</p> : null}
          {notice ? <p className={okClass}>{notice}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
