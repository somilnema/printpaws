"use client";

import { useMemo, useState, type MouseEvent } from "react";
import type { AdminDashboard } from "@/app/actions/adminActions";
import {
  buildAnalytics,
  defaultRange,
  type AnalyticsPreset,
  type DateRange,
  type PeriodTotals,
  type SeriesPoint,
  type Slice,
} from "@/lib/admin-analytics";

const PRESETS: { id: AnalyticsPreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "month", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "year", label: "This year" },
  { id: "all", label: "All time" },
  { id: "custom", label: "Custom" },
];

export function DateRangeBar({
  range,
  onChange,
}: {
  range: DateRange;
  onChange: (range: DateRange) => void;
}) {
  return (
    <div className="rounded-sm border border-[#e6e8ee] bg-white p-2">
      <div className="flex gap-1.5 overflow-x-auto">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange({ ...range, preset: preset.id })}
            className={`shrink-0 rounded-sm px-3 py-1.5 text-xs font-medium ${
              range.preset === preset.id ? "bg-[#1c2434] text-white" : "bg-[#f4f6f9] text-[#667085]"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {range.preset === "custom" ? (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-[#98a2b3]">From</span>
            <input
              type="date"
              value={range.from}
              onChange={(event) => onChange({ ...range, preset: "custom", from: event.target.value })}
              className="rounded-xl border border-[#e6e8ee] bg-[#f7f8fa] px-3 py-2 text-sm text-[#1c2434] outline-none focus:border-[#2F6BFF] focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-[#98a2b3]">To</span>
            <input
              type="date"
              value={range.to}
              onChange={(event) => onChange({ ...range, preset: "custom", to: event.target.value })}
              className="rounded-xl border border-[#e6e8ee] bg-[#f7f8fa] px-3 py-2 text-sm text-[#1c2434] outline-none focus:border-[#2F6BFF] focus:bg-white"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function rupee(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function trimNumber(value: number) {
  return (value >= 10 ? value.toFixed(0) : value.toFixed(1)).replace(/\.0$/, "");
}

function axisRupee(value: number) {
  if (value <= 0) return "₹0";
  if (value >= 10000000) return `₹${trimNumber(value / 10000000)}Cr`;
  if (value >= 100000) return `₹${trimNumber(value / 100000)}L`;
  if (value >= 1000) return `₹${trimNumber(value / 1000)}k`;
  return `₹${Math.round(value)}`;
}

function niceAxis(peak: number) {
  if (!(peak > 0)) return { max: 1, ticks: [0, 1] };
  const magnitude = 10 ** Math.floor(Math.log10(peak * 1.15));
  const options = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
    .map((step) => step * magnitude)
    .filter((max) => max >= peak * 1.04);
  const max = options.find((option) => peak / option <= 0.9) ?? options[0] ?? peak * 1.1;
  const stepMagnitude = 10 ** Math.floor(Math.log10(max / 4));
  const step =
    [1, 2, 2.5, 5, 10]
      .map((factor) => factor * stepMagnitude)
      .find((candidate) => max % candidate === 0 && max / candidate >= 3 && max / candidate <= 5) ?? max / 4;
  const count = Math.round(max / step);
  return {
    max,
    ticks: Array.from({ length: count + 1 }, (_, index) => Number((step * index).toPrecision(12))),
  };
}

function axisLabelIndexes(count: number, slot: number) {
  if (count <= 1) return [0];
  const minGap = 72;
  const maxLabels = Math.max(2, Math.floor((count * slot) / minGap));
  const step = Math.max(1, Math.ceil((count - 1) / (maxLabels - 1)));
  const indexes: number[] = [];
  for (let index = 0; index < count; index += step) indexes.push(index);
  const last = count - 1;
  const previous = indexes[indexes.length - 1];
  if (previous !== last) {
    if ((last - previous) * slot >= minGap) indexes.push(last);
    else indexes[indexes.length - 1] = last;
  }
  return indexes;
}

function topRoundedBar(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, Math.max(0, h / 2));
  if (h <= 0 || w <= 0) return "";
  return `M${x} ${y + h}V${y + radius}Q${x} ${y} ${x + radius} ${y}H${x + w - radius}Q${x + w} ${y} ${x + w} ${y + radius}V${y + h}Z`;
}

function Delta({
  current,
  previous,
  compare,
  previousLabel,
}: {
  current: number;
  previous: number;
  compare: boolean;
  previousLabel: string;
}) {
  if (!compare) return <p className="mt-1 text-xs text-[#98a2b3]">Lifetime</p>;
  if (previous === 0 && current === 0) {
    return <p className="mt-1 text-xs text-[#98a2b3]">No orders in either period</p>;
  }
  if (previous === 0) {
    return <p className="mt-1 text-xs text-[#067647]">First orders in this period</p>;
  }
  const pct = ((current - previous) / previous) * 100;
  const flat = Math.abs(pct) < 0.05;
  const up = pct > 0;
  const tone = flat ? "text-[#98a2b3]" : up ? "text-[#067647]" : "text-[#b42318]";
  const arrow = flat ? "→" : up ? "↑" : "↓";
  const amount = Math.abs(pct) >= 10 ? Math.abs(pct).toFixed(0) : Math.abs(pct).toFixed(1);
  return (
    <p className={`mt-1 text-xs ${tone}`}>
      {arrow} {flat ? "0%" : `${amount}%`} vs {previousLabel}
    </p>
  );
}

function Stat({
  label,
  value,
  current,
  previous,
  compare,
  previousLabel,
  hint,
}: {
  label: string;
  value: string;
  current: number;
  previous: number;
  compare: boolean;
  previousLabel: string;
  hint?: string;
}) {
  return (
    <div className="rounded-sm border border-[#e6e8ee] bg-white p-4">
      <p className="text-xs font-medium text-[#667085]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#667085]">{hint}</p> : null}
      <Delta current={current} previous={previous} compare={compare} previousLabel={previousLabel} />
    </div>
  );
}

function Mix({
  title,
  slices,
  empty,
  showEmpty,
}: {
  title: string;
  slices: Slice[];
  empty: string;
  showEmpty?: boolean;
}) {
  const visible = showEmpty ? slices : slices.filter((slice) => slice.orders > 0);
  const max = Math.max(...visible.map((slice) => slice.revenue), 1);
  return (
    <div className="rounded-sm border border-[#e6e8ee] bg-white p-4">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {visible.length === 0 || visible.every((slice) => slice.orders === 0 && !showEmpty) ? (
        <p className="mt-4 text-sm text-[#98a2b3]">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((slice) => (
              <li key={slice.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate">{slice.label}</span>
                  <span className="shrink-0 font-semibold">{rupee(slice.revenue)}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-[#eef2f8]">
                  <div
                    className="h-full rounded-full bg-[#2F6BFF]"
                    style={{ width: `${slice.revenue > 0 ? Math.max(4, (slice.revenue / max) * 100) : 0}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#98a2b3]">
                  {slice.orders} {slice.orders === 1 ? "order" : "orders"}
                </p>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function RevenueChart({
  series,
  compare,
}: {
  series: SeriesPoint[];
  compare: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 800;
  const height = 288;
  const pad = { l: 56, r: 12, t: 14, b: 36 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const plotBottom = pad.t + innerH;
  const showCompare = compare && series.length > 1 && series.some((point) => point.previousRevenue > 0);
  const peak = Math.max(
    ...series.flatMap((point) => [point.revenue, showCompare ? point.previousRevenue : 0]),
    0
  );
  const axis = niceAxis(peak);
  const slot = series.length ? innerW / series.length : innerW;
  const barCap = series.length <= 3 ? 72 : series.length <= 14 ? 40 : 18;
  const barW = Math.min(barCap, Math.max(4, slot * 0.62));
  const labels = axisLabelIndexes(series.length, slot);
  const peakRevenue = Math.max(...series.map((point) => point.revenue), 0);

  function y(value: number) {
    return plotBottom - (value / axis.max) * innerH;
  }

  const previousLine =
    showCompare
      ? series
          .map((point, index) => {
            const x = pad.l + slot * index + slot / 2;
            return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y(point.previousRevenue).toFixed(2)}`;
          })
          .join(" ")
      : "";

  const active = hover !== null ? series[hover] : null;
  const hoverCenter = hover === null ? 0 : ((pad.l + slot * hover + slot / 2) / width) * 100;

  function hoverIndex(event: MouseEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !series.length) return null;
    const x = ((event.clientX - bounds.left) / bounds.width) * width;
    const index = Math.floor((x - pad.l) / slot);
    if (index < 0 || index >= series.length) return null;
    return index;
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block w-full h-auto overflow-hidden"
        role="img"
        aria-label="Revenue chart"
        onMouseMove={(event) => {
          const next = hoverIndex(event);
          setHover((current) => (current === next ? current : next));
        }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <clipPath id="revenue-plot">
            <rect x={pad.l} y={pad.t} width={innerW} height={innerH} />
          </clipPath>
        </defs>
        {axis.ticks.map((tick) => {
          const yy = y(tick);
          const baseline = tick === 0;
          return (
            <g key={tick}>
              <line
                x1={pad.l}
                x2={width - pad.r}
                y1={yy}
                y2={yy}
                stroke={baseline ? "#e4e7ec" : "#eef1f6"}
                strokeWidth="1"
              />
              <text x={pad.l - 10} y={yy + 4} textAnchor="end" fill="#98a2b3" fontSize="11">
                {axisRupee(tick)}
              </text>
            </g>
          );
        })}
        <g clipPath="url(#revenue-plot)">
          {series.map((point, index) => {
            const x = pad.l + slot * index + (slot - barW) / 2;
            const barH = point.revenue > 0 ? Math.max(2, plotBottom - y(point.revenue)) : 0;
            const hot = point.revenue > 0 && point.revenue === peakRevenue;
            return (
              <g key={`${point.label}-${index}`}>
                <rect
                  x={pad.l + slot * index}
                  y={pad.t}
                  width={slot}
                  height={innerH}
                  fill={hover === index ? "#f4f7ff" : "transparent"}
                />
                {barH > 0 ? (
                  <path
                    d={topRoundedBar(x, plotBottom - barH, barW, barH, 3)}
                    fill={hover === index || hot ? "#2F6BFF" : "#d5e2ff"}
                    pointerEvents="none"
                  />
                ) : null}
              </g>
            );
          })}
          {previousLine ? (
            <path
              d={previousLine}
              fill="none"
              stroke="#667085"
              strokeWidth="1.75"
              strokeDasharray="4 4"
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="none"
            />
          ) : null}
          {hover !== null ? (
            <line
              x1={pad.l + slot * hover + slot / 2}
              x2={pad.l + slot * hover + slot / 2}
              y1={pad.t}
              y2={plotBottom}
              stroke="#c5d4f7"
              strokeWidth="1"
              pointerEvents="none"
            />
          ) : null}
        </g>
        {labels.map((index) => {
          const point = series[index];
          if (!point) return null;
          const center = pad.l + slot * index + slot / 2;
          const half = 28;
          const x = Math.min(width - pad.r - half, Math.max(pad.l + half, center));
          return (
            <text key={`label-${index}`} x={x} y={height - 12} textAnchor="middle" fill="#98a2b3" fontSize="11">
              {point.label}
            </text>
          );
        })}
      </svg>
      {active && hover !== null ? (
        <div
          className="pointer-events-none absolute top-3 z-10 -translate-x-1/2 rounded-2xl bg-[#1c2434] px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: `${Math.min(88, Math.max(12, hoverCenter))}%` }}
        >
          <p className="font-semibold">{active.label}</p>
          <p className="mt-1">
            {rupee(active.revenue)} · {active.orders} {active.orders === 1 ? "order" : "orders"}
          </p>
          {compare ? (
            <p className="mt-0.5 text-white/70">
              Previous {rupee(active.previousRevenue)}
              {active.previousOrders
                ? ` · ${active.previousOrders} ${active.previousOrders === 1 ? "order" : "orders"}`
                : ""}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AnalyticsOverview({
  dashboard,
  range,
  onRangeChange,
  onOpenOrders,
}: {
  dashboard: AdminDashboard;
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  onOpenOrders: () => void;
}) {
  const report = useMemo(
    () => buildAnalytics(dashboard.orders, dashboard.artists, range),
    [dashboard.orders, dashboard.artists, range]
  );
  const totals = report.current;
  const before = report.previous;

  return (
    <div className="space-y-4">
      <DateRangeBar range={range} onChange={onRangeChange} />
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Stat
          label="Revenue"
          value={rupee(totals.revenue)}
          current={totals.revenue}
          previous={before.revenue}
          compare={report.compare}
          previousLabel={report.previousLabel}
          hint={`Collected ${rupee(totals.collected)}`}
        />
        <Stat
          label="Orders"
          value={String(totals.orders)}
          current={totals.orders}
          previous={before.orders}
          compare={report.compare}
          previousLabel={report.previousLabel}
          hint={totals.codDue > 0 ? `${rupee(totals.codDue)} still due on delivery` : "Nothing left to collect"}
        />
        <Stat
          label="Average order"
          value={rupee(totals.average)}
          current={totals.average}
          previous={before.average}
          compare={report.compare}
          previousLabel={report.previousLabel}
        />
        <Stat
          label="Customers"
          value={String(totals.customers)}
          current={totals.customers}
          previous={before.customers}
          compare={report.compare}
          previousLabel={report.previousLabel}
          hint={
            totals.customers === 0
              ? "No customers in this range"
              : !report.compare
                ? "Everyone in this history"
                : totals.returning > 0
                  ? `${totals.returning} ordered before this period`
                  : "All first-time in this period"
          }
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-4">
        <div className="rounded-sm border border-[#e6e8ee] bg-white p-4">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Revenue</h2>
              <p className="text-sm text-[#98a2b3] mt-1">
                {report.grainLabel} · {report.label}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#667085]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#2F6BFF]" />
                This period
              </span>
              {report.compare && before.revenue > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-4 border-t border-dashed border-[#667085]" />
                  {report.previousLabel}
                </span>
              ) : null}
            </div>
          </div>
          {totals.orders === 0 ? (
            <div className="flex h-52 items-center justify-center text-sm text-[#98a2b3]">No orders in this range.</div>
          ) : (
            <RevenueChart series={report.series} compare={report.compare} />
          )}
          {report.peak ? (
            <p className="mt-2 text-xs text-[#667085]">
              Peak {report.grainNoun}: {report.peak.label} · {rupee(report.peak.revenue)} ·{" "}
              {report.peak.orders} {report.peak.orders === 1 ? "order" : "orders"}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col justify-between rounded-sm bg-[#2F6BFF] p-4 text-white">
          <div>
            <p className="text-sm text-white/80">{report.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{rupee(totals.revenue)}</p>
            <p className="mt-2 text-sm text-white/80">
              {totals.orders} {totals.orders === 1 ? "order" : "orders"} · average {rupee(totals.average)}
            </p>
            <p className="mt-4 text-sm text-white/90">Collected {rupee(totals.collected)}</p>
            {totals.codDue > 0 ? <p className="mt-1 text-sm text-white/80">{rupee(totals.codDue)} due on delivery</p> : null}
          </div>
          <button
            type="button"
            onClick={onOpenOrders}
            className="mt-5 self-start rounded-sm bg-white px-3 py-1.5 text-sm font-semibold text-[#2F6BFF]"
          >
            View these orders
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Mix title="Payment" slices={report.payments} empty="No payments in this range." />
        <Mix title="Fulfillment" slices={report.stages} empty="No orders in this range." />
        <Mix title="Size" slices={report.sizes} empty="No sizes in this range." />
        <Mix title="Frame" slices={report.frames} empty="No frames in this range." />
        <Mix title="Coupons" slices={report.coupons} empty="No coupon was used in this range." />
        <Mix title="Weekday" slices={report.weekdays} empty="No orders in this range." showEmpty />
        {report.artists.length > 0 ? <Mix title="Artists" slices={report.artists} empty="No artist is assigned in this range." /> : null}
      </section>

      <Ledger series={report.series} grainLabel={report.grainLabel} totals={totals} />
    </div>
  );
}

function Ledger({
  series,
  grainLabel,
  totals,
}: {
  series: SeriesPoint[];
  grainLabel: string;
  totals: PeriodTotals;
}) {
  const rows = [...series].reverse().filter((point) => point.orders > 0 || point.revenue > 0);
  if (rows.length === 0) return null;
  return (
    <div className="rounded-sm border border-[#e6e8ee] bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-sm font-semibold tracking-tight">{grainLabel} breakdown</h3>
        <p className="text-xs text-[#98a2b3]">{rupee(totals.revenue)}</p>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-white text-xs text-[#98a2b3]">
            <tr>
              <th className="px-5 py-2 font-medium">{grainLabel === "Monthly" ? "Month" : "Date"}</th>
              <th className="px-3 py-2 font-medium">Orders</th>
              <th className="px-3 py-2 font-medium">Revenue</th>
              <th className="px-5 py-2 font-medium">Average</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((point, index) => (
              <tr key={`${point.label}-${index}`} className="border-t border-[#f0f2f5]">
                <td className="px-5 py-3">{point.label}</td>
                <td className="px-3 py-3">{point.orders}</td>
                <td className="px-3 py-3 font-semibold">{rupee(point.revenue)}</td>
                <td className="px-5 py-3 text-[#667085]">{point.orders ? rupee(point.revenue / point.orders) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { defaultRange };
