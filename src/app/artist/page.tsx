"use client";

import { FormEvent, useMemo, useState, useEffect, useRef } from "react";
import { PhotoUploadBar, PreviewImage } from "@/components/PreviewImage";
import Link from "next/link";
import {
  createArtworkUpload,
  discardArtworkUpload,
  finishArtworkUpload,
  getArtistPortal,
  startRevision,
  type ArtistOrder,
  type ArtistPortal,
} from "@/app/actions/artistActions";
import { formatSecondsLeft, uploadToSignedUrl } from "@/lib/uploadArtwork";
import { addTeamNote, removeTeamNote } from "@/app/actions/opsActions";
import { NoteBody } from "@/components/NoteBody";
import { OrderHistory } from "@/components/OrderHistory";
import { TeamNotes } from "@/components/TeamNotes";
import { OrderTimeline } from "@/components/OrderTimeline";
import { PasswordInput } from "@/components/PasswordInput";
import { sectionTabClass } from "@/components/admin/DeskSwitch";
import { buttonClass, dangerButtonClass, DeskLogo, errorClass, ghostButtonClass, inputClass, warnClass } from "@/components/admin/ui";
import { artistCanStartRevision, artistCanUpload, isOverdue, stageLabel } from "@/lib/fulfillment";
import { storedPetPhotoUrl } from "@/lib/pet-photo";

type Section = "overview" | "orders";

const NAV: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
];

const STAGE_FILTERS = [
  "artwork_in_progress",
  "artwork_review",
  "revision_requested",
  "revision_in_progress",
  "final_approval",
  "shipped",
  "delivered",
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

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function needsArtist(order: ArtistOrder) {
  return (
    order.fulfillment_stage === "artwork_in_progress" ||
    order.fulfillment_stage === "revision_requested" ||
    order.fulfillment_stage === "revision_in_progress"
  );
}

export default function ArtistPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portal, setPortal] = useState<ArtistPortal | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getArtistPortal()
      .then((data) => setPortal(data))
      .catch(() => setPortal(null))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/artist/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Invalid email or password");
        return;
      }
      const data = await getArtistPortal();
      if (!data) {
        setError("Signed in, but the portal could not load. Refresh and try again.");
        return;
      }
      setPortal(data);
      setPassword("");
    } catch {
      setError("Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/artist/logout", { method: "POST" });
    setPortal(null);
  }

  async function refresh() {
    setLoading(true);
    try {
      const data = await getArtistPortal();
      if (data) setPortal(data);
      else setPortal(null);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="peternity-admin flex min-h-[100dvh] items-center justify-center bg-[#F9F9F9] px-4 text-sm text-[#6b7280]">
        Checking session…
      </div>
    );
  }

  if (!portal) {
    return (
      <div className="peternity-admin flex min-h-[100dvh] flex-col bg-[#F9F9F9] px-4 py-8 text-[#1a1a1b] sm:py-10">
        <div className="mx-auto my-auto w-full max-w-md rounded-[2rem] border border-[#eeeeee] bg-white p-6 shadow-sm sm:p-8">
          <DeskLogo className="mx-auto" />
          <h1 className="mt-4 text-center text-3xl font-bold tracking-tight">Artist</h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-[#9ca3af]">Sign in with the email and password from admin.</p>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#6b7280]">Email</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} text-base sm:text-sm`}
                required
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#6b7280]">Password</span>
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
          <Link href="/" className="mt-6 inline-block text-sm font-medium text-primary">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ArtistShell portal={portal} refreshing={loading} onRefresh={refresh} onLogout={handleLogout} />
  );
}

function SectionNav({ section, onChange }: { section: Section; onChange: (section: Section) => void }) {
  return (
    <>
      {NAV.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={sectionTabClass(section === item.id)}
        >
          {item.label}
        </button>
      ))}
    </>
  );
}

function ArtistShell({
  portal,
  refreshing,
  onRefresh,
  onLogout,
}: {
  portal: ArtistPortal;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  const [section, setSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const orders = portal.orders;
    return {
      all: orders.length,
      turn: orders.filter(needsArtist).length,
      customer: orders.filter((order) => order.fulfillment_stage === "artwork_review").length,
      production: orders.filter((order) =>
        order.fulfillment_stage === "final_approval" || order.fulfillment_stage === "shipped" || order.fulfillment_stage === "delivered"
      ).length,
      overdue: orders.filter((order) => isOverdue(order.fulfillment_stage, order.due_at)).length,
    };
  }, [portal.orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return portal.orders.filter((order) => {
      if (stage === "turn" && !needsArtist(order)) return false;
      if (stage === "production" && order.fulfillment_stage !== "final_approval" && order.fulfillment_stage !== "shipped" && order.fulfillment_stage !== "delivered") return false;
      if (stage === "overdue" && !isOverdue(order.fulfillment_stage, order.due_at)) return false;
      if (stage && stage !== "turn" && stage !== "production" && stage !== "overdue" && (order.fulfillment_stage || "ready_for_artwork") !== stage) return false;
      if (!q) return true;
      return [order.id, order.pet_name, order.size, order.frame_style, order.background, order.font, stageLabel(order.fulfillment_stage)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [portal.orders, query, stage]);

  const urgent = portal.orders.filter(needsArtist);

  function openOrders(nextStage: string) {
    setStage(nextStage);
    setQuery("");
    setSection("orders");
  }

  return (
    <div className="peternity-admin min-h-[100dvh] overflow-x-hidden bg-[#F9F9F9] text-[#1a1a1b]">
      <div className="min-h-[100dvh] bg-[#F9F9F9]">
        <header className="border-b border-[#eeeeee] bg-white">
          <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 md:px-8">
            <DeskLogo />
            <nav className="hidden min-w-0 flex-1 justify-center gap-1 md:flex">
              <SectionNav section={section} onChange={setSection} />
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
            <SectionNav section={section} onChange={setSection} />
          </nav>
        </header>

        <div className="space-y-5 px-3 py-5 sm:px-4 sm:py-6 md:px-8">
          {section === "overview" ? (
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="mt-2 break-words text-sm text-[#9ca3af]">
                {portal.artist.name}
                {portal.artist.email ? ` · ${portal.artist.email}` : ""}
              </p>
            </div>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          )}

          {portal.warning ? <p className={warnClass}>Could not load every order: {portal.warning}</p> : null}

          {section === "overview" ? (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Assigned" value={counts.all} hint="Orders on your desk" onClick={() => openOrders("")} />
                <Stat label="Your turn" value={counts.turn} hint="Preview or revision" onClick={() => openOrders("turn")} />
                <Stat label="With customer" value={counts.customer} hint="Waiting on approval" onClick={() => openOrders("artwork_review")} />
                <Stat label="Overdue" value={counts.overdue} hint="Past the artwork deadline" onClick={() => openOrders("overdue")} />
              </div>

              <section className="rounded-3xl border border-[#eeeeee] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-5">
                <header className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold tracking-tight">Needs you</h2>
                    <p className="mt-1 text-sm leading-relaxed text-[#9ca3af]">Assigned portraits and revision requests.</p>
                  </div>
                  <button type="button" onClick={() => openOrders("turn")} className="shrink-0 text-sm font-medium text-primary">
                    View
                  </button>
                </header>
                {urgent.length === 0 ? (
                  <p className="text-sm text-[#9ca3af]">
                    {portal.orders.length === 0 ? "No orders are assigned to you yet." : "Nothing is waiting on you right now."}
                  </p>
                ) : (
                  <ul className="divide-y divide-[#f3f4f6] overflow-hidden rounded-2xl bg-[#f8f9fa]">
                    {urgent.slice(0, 5).map((order) => (
                      <li key={order.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenId(order.id);
                            openOrders("");
                          }}
                          className="flex w-full items-center gap-3 px-3 py-3 text-left"
                        >
                          <OrderThumb order={order} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{order.pet_name || "Untitled pet"}</span>
                            <span className="mt-0.5 block truncate text-xs text-[#9ca3af]">
                              #{order.id.slice(0, 8).toUpperCase()} · {stageLabel(order.fulfillment_stage)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : (
            <OrdersList
              orders={filtered}
              total={portal.orders.length}
              query={query}
              stage={stage}
              openId={openId}
              onQuery={(value) => setQuery(value)}
              onStage={(value) => setStage(value)}
              onToggle={(id) => setOpenId((current) => (current === id ? null : id))}
              onUploaded={onRefresh}
              artistEmail={portal.artist.email}
            />
          )}

          <Link href="/" className="inline-block text-sm font-medium text-primary">
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  onClick,
}: {
  label: string;
  value: number;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-3xl border border-[#eeeeee] bg-white p-4 text-left shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-5"
    >
      <p className="text-xs font-medium text-[#9ca3af]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs leading-snug text-[#6b7280]">{hint}</p>
    </button>
  );
}

function OrdersList({
  orders,
  total,
  query,
  stage,
  openId,
  onQuery,
  onStage,
  onToggle,
  onUploaded,
  artistEmail,
}: {
  orders: ArtistOrder[];
  total: number;
  query: string;
  stage: string;
  openId: string | null;
  onQuery: (value: string) => void;
  onStage: (value: string) => void;
  onToggle: (id: string) => void;
  onUploaded: () => Promise<void>;
  artistEmail: string;
}) {
  const filters = [
    { id: "", label: "All" },
    { id: "turn", label: "Your turn" },
    { id: "overdue", label: "Overdue" },
    { id: "production", label: "Approved or shipped" },
    ...STAGE_FILTERS.filter(Boolean).map((id) => ({ id, label: stageLabel(id) })),
  ];

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search pet, size, or order"
        className={`${inputClass} text-base sm:text-sm`}
      />
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex w-max gap-1">
          {filters.map((item) => (
            <button
              key={item.id || "all"}
              type="button"
              onClick={() => onStage(item.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium ${
                stage === item.id ? "bg-primary text-white" : "bg-white text-[#6b7280]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-[#9ca3af]">
        {orders.length} of {total} {total === 1 ? "order" : "orders"}
      </p>
      {total === 0 ? (
        <div className="rounded-3xl border border-[#eeeeee] bg-white p-5 text-sm text-[#9ca3af] shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          No orders are assigned to you yet.
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-[#eeeeee] bg-white p-5 text-sm text-[#9ca3af] shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          No orders match.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <ArtistOrderCard
              key={order.id}
              order={order}
              open={openId === order.id}
              onToggle={() => onToggle(order.id)}
              onUploaded={onUploaded}
              artistEmail={artistEmail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderThumb({ order }: { order: ArtistOrder }) {
  const photo = storedPetPhotoUrl(order.photo_url);
  const [broken, setBroken] = useState(false);

  if (photo && !broken) {
    return (
      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-[#f8f9fa]">
        <img src={photo} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
      </span>
    );
  }

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f8f9fa] text-[10px] text-[#9ca3af]">
      Pet
    </span>
  );
}

type PendingUpload = {
  file: File;
  controller: AbortController;
  promise: Promise<{ versionId: string; ext: string }>;
};

function ArtistOrderCard({
  order,
  open,
  onToggle,
  onUploaded,
  artistEmail,
}: {
  order: ArtistOrder;
  open: boolean;
  onToggle: () => void;
  onUploaded: () => Promise<void>;
  artistEmail: string;
}) {
  const photo = storedPetPhotoUrl(order.photo_url);
  const [broken, setBroken] = useState(false);
  const [note, setNote] = useState("");
  const [teamNote, setTeamNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [artworkPreview, setArtworkPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ percent: number; label: string; detail?: string; done?: boolean } | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const canUpload = artistCanUpload(order.fulfillment_stage);
  const canStart = artistCanStartRevision(order.fulfillment_stage);
  const revisionNotes = order.updates.filter((update) => update.kind === "revision" && update.note);
  const specs = [order.size, order.frame_style, order.background, order.font].filter(Boolean).join(" · ");

  const uploadRef = useRef<PendingUpload | null>(null);

  useEffect(() => {
    if (!file) {
      setArtworkPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setArtworkPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => uploadRef.current?.controller.abort(), []);

  function discardEntry(entry: PendingUpload | null) {
    if (!entry) return;
    entry.controller.abort();
    entry.promise
      .then(({ versionId }) => discardArtworkUpload({ orderId: order.id, versionId }))
      .catch(() => undefined);
  }

  function removeArtwork() {
    const entry = uploadRef.current;
    uploadRef.current = null;
    discardEntry(entry);
    setFile(null);
    setFileKey((current) => current + 1);
    setUploading(false);
    setProgress(null);
    setError("");
  }

  function beginUpload(next: File) {
    discardEntry(uploadRef.current);
    const entry = { file: next, controller: new AbortController() } as PendingUpload;
    uploadRef.current = entry;
    setUploading(true);
    const report = (value: NonNullable<typeof progress>) => {
      if (uploadRef.current === entry) setProgress(value);
    };

    entry.promise = (async () => {
      report({ percent: 2, label: "Starting upload", detail: formatFileSize(next.size) });
      const started = await createArtworkUpload({ orderId: order.id, type: next.type, size: next.size });
      if (!started.ok) throw new Error(started.error);
      await uploadToSignedUrl(
        started.signedUrl,
        next,
        ({ ratio, secondsLeft }) => {
          report({
            percent: 5 + ratio * 94,
            label: "Uploading artwork",
            detail: `${formatFileSize(next.size * ratio)} of ${formatFileSize(next.size)} · ${formatSecondsLeft(secondsLeft)}`,
          });
        },
        entry.controller.signal
      );
      return { versionId: started.versionId, ext: started.ext };
    })();

    entry.promise.then(
      () => {
        if (uploadRef.current !== entry) return;
        setUploading(false);
        report({
          percent: 100,
          label: "Upload complete",
          detail: `${formatFileSize(next.size)} · Press Send for review to share it with the customer`,
          done: true,
        });
      },
      (err) => {
        if (uploadRef.current !== entry || entry.controller.signal.aborted) return;
        uploadRef.current = null;
        setUploading(false);
        setProgress(null);
        setError(err instanceof Error && err.message ? err.message : "The artwork could not be uploaded. Please try again.");
      }
    );
    return entry;
  }

  function chooseFile(next: File | undefined) {
    if (!next) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type)) {
      setError("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (next.size > 20 * 1024 * 1024) {
      setError("Use an artwork file under 20 MB.");
      return;
    }
    setFile(next);
    beginUpload(next);
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose the artwork image.");
      return;
    }
    const entry = uploadRef.current?.file === file ? uploadRef.current : beginUpload(file);
    setBusy(true);
    setError("");

    let creep: number | undefined;
    let result: Awaited<ReturnType<typeof finishArtworkUpload>>;
    try {
      const started = await entry.promise;
      setProgress({ percent: 10, label: "Creating watermarked preview", detail: "Usually takes a few seconds" });
      creep = window.setInterval(() => {
        setProgress((current) => (current ? { ...current, percent: Math.min(97, current.percent + 1) } : current));
      }, 700);
      result = await finishArtworkUpload({
        orderId: order.id,
        versionId: started.versionId,
        ext: started.ext,
        note,
        teamNote,
      });
    } catch (err) {
      result = { ok: false, error: err instanceof Error && err.message ? err.message : "The artwork could not be uploaded. Please try again." };
    } finally {
      window.clearInterval(creep);
    }

    setBusy(false);
    if (uploadRef.current === entry) uploadRef.current = null;
    if (!result.ok) {
      setProgress(null);
      setError(result.error);
      return;
    }
    setProgress({ percent: 100, label: "Sent for review", detail: "The customer can now see the watermarked preview", done: true });
    window.setTimeout(() => setProgress(null), 3000);
    if ("warning" in result && result.warning) setError(result.warning);
    setNote("");
    setTeamNote("");
    setFile(null);
    setFileKey((current) => current + 1);
    await onUploaded();
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-[#eeeeee] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-4 text-left">
        <OrderThumb order={order} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{order.pet_name || "Untitled pet"}</span>
          <span className="mt-0.5 block truncate text-xs text-[#9ca3af]">
            #{order.id.slice(0, 8).toUpperCase()} · {formatDate(order.created_at)}
          </span>
        </span>
        <span className="max-w-[6.5rem] shrink-0 truncate rounded-full bg-[#f8f9fa] px-2.5 py-1 text-[11px] font-medium text-[#6b7280] sm:max-w-[9rem]">
          {stageLabel(order.fulfillment_stage)}
        </span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-[#f3f4f6] px-4 py-4 sm:px-5">
          <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
            {photo && !broken ? (
              <a href={photo} target="_blank" rel="noreferrer" className="block h-44 overflow-hidden rounded-2xl bg-[#f8f9fa] sm:h-36">
                <img src={photo} alt={order.pet_name || "Pet photo"} className="h-full w-full object-cover" onError={() => setBroken(true)} />
              </a>
            ) : (
              <div className="flex h-36 items-center justify-center rounded-2xl bg-[#f8f9fa] px-3 text-center text-xs text-[#9ca3af]">
                {order.photo_url ? "Photo not saved" : "No photo"}
              </div>
            )}
            <div className="min-w-0 space-y-2 text-sm">
              {specs ? <p className="break-words text-[#6b7280]">{specs}</p> : null}
              {order.memorial_text ? <p className="break-words">Memorial text: {order.memorial_text}</p> : null}
              <p className="text-[#6b7280]">
                Revisions: {order.revision_count ?? 0} of 2
                {order.due_at ? ` · Due ${formatDate(order.due_at)}` : ""}
                {isOverdue(order.fulfillment_stage, order.due_at) ? " · Overdue" : ""}
              </p>
              {revisionNotes.map((update) => (
                <div key={update.id} className="rounded-2xl bg-[#f8f9fa] p-3">
                  <p className="mb-1 text-xs font-medium text-[#9ca3af]">Customer changes</p>
                  <NoteBody note={update.note} />
                </div>
              ))}
              <OrderTimeline stage={order.fulfillment_stage} updates={order.updates} />
            </div>
          </div>

          {canStart ? (
            <button
              type="button"
              disabled={busy}
              className={`${ghostButtonClass} w-full sm:w-auto`}
              onClick={async () => {
                setBusy(true);
                setError("");
                const result = await startRevision(order.id);
                setBusy(false);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                await onUploaded();
              }}
            >
              {busy ? "Starting…" : "Start revision"}
            </button>
          ) : null}
          {canUpload ? (
            <form onSubmit={handleUpload} className="space-y-3 border-t border-[#f3f4f6] pt-4">
              <p className="text-xs font-medium text-[#6b7280]">Upload artwork</p>
              <p className="text-xs leading-relaxed text-[#9ca3af]">
                The customer gets a smaller preview with a Peternity watermark. Shipment downloads the original after approval.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className={`${ghostButtonClass} flex w-full cursor-pointer items-center justify-center text-center sm:w-auto ${busy ? "pointer-events-none opacity-50" : ""}`}>
                  {file ? "Change image" : "Choose image"}
                  <input
                    key={fileKey}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={(e) => chooseFile(e.target.files?.[0])}
                    className="sr-only"
                  />
                </label>
                {file ? (
                  <button type="button" disabled={busy} onClick={removeArtwork} className={`${dangerButtonClass} w-full sm:w-auto`}>
                    {uploading ? "Cancel upload" : "Remove image"}
                  </button>
                ) : null}
              </div>
              {artworkPreview ? (
                <PreviewImage
                  src={artworkPreview}
                  alt="Artwork to send"
                  busy={busy || uploading}
                  className="h-40 w-full rounded-2xl sm:w-44"
                />
              ) : null}
              {file ? <p className="break-all text-xs text-[#9ca3af]">{file.name}</p> : null}
              {progress ? <PhotoUploadBar percent={progress.percent} label={progress.label} detail={progress.detail} done={progress.done} /> : null}
              {error ? <p className={errorClass}>{error}</p> : null}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for the customer"
                rows={3}
                className={`${inputClass} text-base sm:text-sm`}
              />
              <textarea
                value={teamNote}
                onChange={(e) => setTeamNote(e.target.value)}
                placeholder="Private note for the team. The customer will not see this."
                rows={3}
                className={`${inputClass} text-base sm:text-sm`}
              />
              <button type="submit" disabled={busy} className={`${buttonClass} w-full sm:w-auto`}>
                {busy ? (uploading ? "Uploading…" : "Sending…") : "Send for review"}
              </button>
            </form>
          ) : null}
          {error && !canUpload ? <p className={errorClass}>{error}</p> : null}

          <OrderHistory updates={order.updates} />
          <TeamNotes
            notes={order.teamNotes || []}
            onAdd={(body) => addTeamNote(order.id, body)}
            onDelete={removeTeamNote}
            canDelete={(note) => note.author === artistEmail}
          />
        </div>
      ) : null}
    </article>
  );
}
