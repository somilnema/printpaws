"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  adminLogin,
  adminLogout,
  getAdminDashboard,
  refreshAdminDashboard,
  type AdminDashboard,
  type AdminOrder,
} from "@/app/actions/adminActions";

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

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getAdminDashboard()
      .then((data) => setDashboard(data))
      .catch(() => setDashboard(null))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await adminLogin(email, password);
      setDashboard(data);
      setPassword("");
    } catch (err: any) {
      setError(err?.message || "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await adminLogout();
    setDashboard(null);
    setQuery("");
  }

  async function handleRefresh() {
    setLoading(true);
    try {
      setDashboard(await refreshAdminDashboard());
    } catch (err: any) {
      setError(err?.message || "Could not refresh");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    if (!dashboard) return [];
    const q = query.trim().toLowerCase();
    if (!q) return dashboard.orders;
    return dashboard.orders.filter((order) =>
      [
        order.id,
        order.pet_name,
        order.customer_email,
        order.size,
        order.frame_style,
        order.background,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [dashboard, query]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#fcf8f5] flex items-center justify-center font-inter text-sm text-gray-500">
        Checking session…
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#fcf8f5]">
        <div className="bg-primary text-white px-6 py-12">
          <div className="container mx-auto max-w-md">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 mb-2">Peternity</p>
            <h1 className="text-4xl font-black uppercase tracking-tight">Admin</h1>
            <p className="text-white/75 text-sm mt-2 font-inter">Sign in to view revenue and orders.</p>
          </div>
        </div>

        <div className="container mx-auto max-w-md px-6 py-10">
          <form onSubmit={handleLogin} className="bg-white rounded-3xl border border-[#f0e4db] p-8 space-y-5 shadow-[0_12px_40px_rgba(168,123,98,0.08)]">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</label>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@peternity.in"
                className="w-full bg-gray-50 rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-primary/20 text-sm font-inter"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-gray-50 rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-primary/20 text-sm font-inter"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm font-inter">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-primary-dark transition-colors disabled:opacity-60 active:scale-[0.98]"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <Link href="/" className="inline-block mt-8 text-sm font-bold uppercase tracking-wide text-primary">
            ← Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...dashboard.chart.map((d) => d.revenue), 1);

  return (
    <div className="min-h-screen bg-[#fcf8f5]">
      <div className="bg-primary text-white px-6 py-8">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 mb-2">Peternity</p>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Dashboard</h1>
            <p className="text-white/75 text-sm mt-2 font-inter">{dashboard.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 rounded-full bg-white/15 text-sm font-bold uppercase tracking-wide hover:bg-white/25 transition-colors"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-white text-primary text-sm font-bold uppercase tracking-wide hover:bg-white/90 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 py-10 space-y-8">
        {dashboard.warning && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 font-inter">
            Could not load every order from the database: {dashboard.warning}
          </p>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total revenue" value={rupee(dashboard.stats.totalRevenue)} hint="All received orders" />
          <StatCard label="Orders" value={String(dashboard.stats.totalOrders)} hint="Lifetime" />
          <StatCard label="This month" value={rupee(dashboard.stats.monthRevenue)} hint={`${dashboard.stats.monthOrders} orders`} />
          <StatCard label="Today" value={rupee(dashboard.stats.todayRevenue)} hint={`${dashboard.stats.todayOrders} orders · avg ${rupee(dashboard.stats.averageOrder)}`} />
        </section>

        <section className="bg-white rounded-3xl border border-[#f0e4db] p-6 md:p-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#1a1a1b]">Revenue analytics</h2>
              <p className="text-sm text-gray-500 font-inter mt-1">Last 14 days</p>
            </div>
            <p className="text-sm font-bold text-primary">{rupee(dashboard.chart.reduce((s, d) => s + d.revenue, 0))}</p>
          </div>
          <div className="flex items-end gap-2 h-40">
            {dashboard.chart.map((point) => (
              <div key={point.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className="w-full rounded-t-lg bg-primary/80 hover:bg-primary transition-colors min-h-[4px]"
                  style={{ height: `${Math.max(6, (point.revenue / maxRevenue) * 100)}%` }}
                  title={`${point.label}: ${rupee(point.revenue)} · ${point.orders} orders`}
                />
                <span className="text-[9px] text-gray-400 font-inter hidden sm:block">{point.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1a1a1b]">Orders received</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, size…"
              className="w-full md:w-72 bg-white border border-[#f0e4db] rounded-full px-5 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 font-inter"
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#f0e4db] p-8 text-gray-500 font-inter">
              No orders match yet.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, i) => (
                <OrderCard key={order.id || i} order={order} />
              ))}
            </div>
          )}
        </section>

        <Link href="/" className="inline-block text-sm font-bold uppercase tracking-wide text-primary">
          ← Back to shop
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-white rounded-3xl border border-[#f0e4db] p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-2xl md:text-3xl font-black text-[#1a1a1b] mt-2 tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 font-inter mt-1">{hint}</p>
    </div>
  );
}

function OrderCard({ order }: { order: AdminOrder }) {
  return (
    <article className="bg-white rounded-3xl border border-[#f0e4db] p-5 md:p-6 flex flex-col md:flex-row gap-5">
      {order.photo_url ? (
        <img
          src={order.photo_url}
          alt={order.pet_name || "Pet photo"}
          className="w-full md:w-36 h-36 object-cover rounded-2xl bg-gray-100"
        />
      ) : (
        <div className="w-full md:w-36 h-36 rounded-2xl bg-[#f6efe9] flex items-center justify-center text-xs text-gray-400 font-inter">
          No photo
        </div>
      )}
      <div className="flex-1 space-y-2 font-inter text-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-black uppercase tracking-tight text-[#1a1a1b]">
            {order.pet_name || "Untitled pet"}
          </h3>
          <p className="font-black text-primary">{rupee(Number(String(order.total_price ?? "0").replace(/[^\d.]/g, "")))}</p>
        </div>
        <p className="text-gray-500">{order.customer_email || "No email"}</p>
        <p className="text-gray-600">
          {[order.size, order.frame_style, order.num_pets && `${order.num_pets} pet(s)`, order.background, order.font]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {(order.addon || order.gift_wrap) && (
          <p className="text-gray-500">
            {order.addon ? `Add-on: ${order.addon}` : ""}
            {order.addon && order.gift_wrap ? " · " : ""}
            {order.gift_wrap ? "Gift wrap" : ""}
          </p>
        )}
        <p className="text-xs text-gray-400">
          {order.id ? `#${String(order.id).slice(0, 8).toUpperCase()} · ` : ""}
          {formatDate(order.created_at)}
        </p>
      </div>
    </article>
  );
}
