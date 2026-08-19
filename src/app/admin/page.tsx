"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { listOrders } from "@/app/actions/supabaseActions";

type Order = {
  id?: string;
  pet_name?: string;
  customer_email?: string;
  size?: string;
  frame_style?: string;
  num_pets?: string;
  background?: string;
  total_price?: string | number;
  photo_url?: string;
  created_at?: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await listOrders(password);
      setOrders(data as Order[]);
    } catch (err: any) {
      setOrders(null);
      setError(err?.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fcf8f5]">
      <div className="bg-primary text-white px-6 py-10">
        <div className="container mx-auto max-w-5xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 mb-2">Peternity</p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Admin</h1>
          <p className="text-white/70 text-sm mt-2 font-inter">View incoming portrait orders.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-10 space-y-8">
        {orders === null && (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#f0e4db] p-8 max-w-md space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank on localhost"
              className="w-full bg-gray-50 rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-primary/20 text-sm"
            />
            {error && <p className="text-red-500 text-sm font-inter">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Open orders"}
            </button>
          </form>
        )}

        {orders && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 font-inter">{orders.length} order{orders.length === 1 ? "" : "s"}</p>
              <button
                type="button"
                onClick={() => setOrders(null)}
                className="text-sm text-primary font-bold uppercase tracking-wide"
              >
                Lock
              </button>
            </div>

            {orders.length === 0 && (
              <div className="bg-white rounded-3xl border border-[#f0e4db] p-8 text-gray-500 font-inter">
                No orders yet.
              </div>
            )}

            {orders.map((order, i) => (
              <article key={order.id || i} className="bg-white rounded-3xl border border-[#f0e4db] p-6 flex flex-col md:flex-row gap-6">
                {order.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={order.photo_url}
                    alt={order.pet_name || "Pet photo"}
                    className="w-full md:w-40 h-40 object-cover rounded-2xl bg-gray-100"
                  />
                )}
                <div className="space-y-2 font-inter text-sm">
                  <h2 className="text-lg font-black uppercase tracking-tight text-[#1a1a1b]">
                    {order.pet_name || "Untitled pet"}
                  </h2>
                  <p className="text-gray-500">{order.customer_email || "No email"}</p>
                  <p className="text-gray-600">
                    {[order.size, order.frame_style, order.num_pets, order.background].filter(Boolean).join(" · ")}
                  </p>
                  <p className="font-bold text-primary">₹{order.total_price ?? "—"}</p>
                  {order.created_at && (
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <Link href="/" className="inline-block text-sm font-bold uppercase tracking-wide text-primary">
          ← Back to shop
        </Link>
      </div>
    </div>
  );
}
