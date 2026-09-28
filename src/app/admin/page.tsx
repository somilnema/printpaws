"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getAdminDashboard, type AdminDashboard } from "@/app/actions/adminActions";
import { AdminShell } from "@/components/admin/AdminShell";
import { PasswordInput } from "@/components/PasswordInput";
import { buttonClass, errorClass, inputClass } from "@/components/admin/ui";
import "./admin.css";

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Invalid username or password");
        return;
      }
      const data = await getAdminDashboard();
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
    await fetch("/api/admin/logout", { method: "POST" });
    setDashboard(null);
  }

  async function handleRefresh() {
    setLoading(true);
    try {
      const data = await getAdminDashboard();
      if (!data) {
        setDashboard(null);
        return;
      }
      setDashboard(data);
    } catch {
      setError("Could not refresh");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="peternity-admin min-h-screen bg-[#f3f4f6] flex items-center justify-center text-sm text-[#667085]">
        Checking session…
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="peternity-admin min-h-screen bg-[#f3f4f6] text-[#1c2434] px-4 py-10">
        <div className="mx-auto max-w-md rounded-sm border border-[#e6e8ee] bg-white p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6BFF] text-sm font-semibold text-white">P</span>
            <span className="font-semibold">Peternity</span>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-[#98a2b3]">Sign in to manage orders, prices, and coupons.</p>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#667085]">Username</span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                required
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#667085]">Password</span>
              <PasswordInput
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
            </label>
            {error ? <p className={errorClass}>{error}</p> : null}
            <button type="submit" disabled={loading} className={`${buttonClass} w-full`}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <Link href="/" className="inline-block mt-6 text-sm font-medium text-[#2F6BFF]">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminShell
      dashboard={dashboard}
      onRefresh={handleRefresh}
      onLogout={handleLogout}
      refreshing={loading}
    />
  );
}
