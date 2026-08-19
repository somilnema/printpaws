"use server";

import {
  clearAdminSession,
  getAdminSession,
  requireAdminSession,
  setAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type AdminOrder = {
  id?: string;
  pet_name?: string;
  customer_email?: string;
  size?: string;
  frame_style?: string;
  num_pets?: string | number;
  background?: string;
  font?: string;
  addon?: string;
  gift_wrap?: boolean;
  total_price?: string | number;
  photo_url?: string;
  created_at?: string;
};

export type RevenuePoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

export type AdminDashboard = {
  email: string;
  warning?: string;
  stats: {
    totalRevenue: number;
    totalOrders: number;
    averageOrder: number;
    monthRevenue: number;
    monthOrders: number;
    todayRevenue: number;
    todayOrders: number;
  };
  chart: RevenuePoint[];
  orders: AdminOrder[];
};

function parsePrice(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildDashboard(email: string, orders: AdminOrder[], warning?: string): AdminDashboard {
  const now = new Date();
  const today = startOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayCount = 14;
  const chartStart = startOfDay(new Date(today.getTime() - (dayCount - 1) * 86400000));

  const chartMap = new Map<string, RevenuePoint>();
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(chartStart.getTime() + i * 86400000);
    const key = dateKey(d);
    chartMap.set(key, {
      date: key,
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue: 0,
      orders: 0,
    });
  }

  let totalRevenue = 0;
  let monthRevenue = 0;
  let monthOrders = 0;
  let todayRevenue = 0;
  let todayOrders = 0;

  for (const order of orders) {
    const amount = parsePrice(order.total_price);
    totalRevenue += amount;
    const created = order.created_at ? new Date(order.created_at) : null;
    if (created && created >= monthStart) {
      monthRevenue += amount;
      monthOrders += 1;
    }
    if (created && created >= today) {
      todayRevenue += amount;
      todayOrders += 1;
    }
    if (created) {
      const key = dateKey(created);
      const point = chartMap.get(key);
      if (point) {
        point.revenue += amount;
        point.orders += 1;
      }
    }
  }

  return {
    email,
    warning,
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      averageOrder: orders.length ? totalRevenue / orders.length : 0,
      monthRevenue,
      monthOrders,
      todayRevenue,
      todayOrders,
    },
    chart: Array.from(chartMap.values()),
    orders,
  };
}

async function loadOrders(): Promise<{ orders: AdminOrder[]; warning?: string }> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Admin orders fetch error:", error);
    return { orders: [], warning: error.message };
  }

  return { orders: (data as AdminOrder[]) ?? [] };
}

export async function getAdminDashboard(): Promise<AdminDashboard | null> {
  const session = await getAdminSession();
  if (!session) return null;
  const { orders, warning } = await loadOrders();
  return buildDashboard(session.email, orders, warning);
}

export async function adminLogin(email: string, password: string): Promise<AdminDashboard> {
  if (!verifyAdminCredentials(email, password)) {
    throw new Error("Invalid email or password");
  }
  await setAdminSession(email);
  const { orders, warning } = await loadOrders();
  return buildDashboard(email.trim().toLowerCase(), orders, warning);
}

export async function adminLogout() {
  await clearAdminSession();
}

export async function refreshAdminDashboard(): Promise<AdminDashboard> {
  const session = await requireAdminSession();
  const { orders, warning } = await loadOrders();
  return buildDashboard(session.email, orders, warning);
}
