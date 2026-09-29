export type AnalyticsPreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "month"
  | "lastMonth"
  | "year"
  | "all"
  | "custom";

export type DateRange = {
  preset: AnalyticsPreset;
  from: string;
  to: string;
};

export type AnalyticsOrder = {
  created_at?: string;
  total_price?: string | number;
  online_paid?: string | number;
  cod_due?: string | number;
  payment_mode?: string;
  status?: string;
  size?: string;
  frame_style?: string;
  coupon_code?: string | null;
  fulfillment_stage?: string | null;
  artist_id?: string | null;
  customer_phone?: string;
  customer_email?: string;
};

export type AnalyticsArtist = {
  id: string;
  name: string;
};

export type Slice = {
  label: string;
  revenue: number;
  orders: number;
};

export type SeriesPoint = {
  label: string;
  revenue: number;
  orders: number;
  previousRevenue: number;
  previousOrders: number;
};

export type PeriodTotals = {
  revenue: number;
  orders: number;
  average: number;
  collected: number;
  codDue: number;
  customers: number;
  returning: number;
};

export type AnalyticsReport = {
  label: string;
  previousLabel: string;
  compare: boolean;
  grainLabel: string;
  grainNoun: string;
  current: PeriodTotals;
  previous: PeriodTotals;
  series: SeriesPoint[];
  payments: Slice[];
  stages: Slice[];
  sizes: Slice[];
  frames: Slice[];
  coupons: Slice[];
  weekdays: Slice[];
  artists: Slice[];
  peak: SeriesPoint | null;
};

const SKIPPED = new Set(["cancelled", "canceled", "failed", "refunded", "void", "pending", "abandoned"]);

const STAGE_ORDER = [
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

const STAGE_LABELS: Record<string, string> = {
  awaiting_images: "Waiting for photos",
  ready_for_artwork: "Ready for artwork",
  artwork_in_progress: "Artwork in progress",
  artwork_review: "Artwork review",
  revision_requested: "Revision requested",
  revision_in_progress: "Revision in progress",
  final_approval: "Approved",
  shipped: "Shipped",
  delivered: "Delivered",
  on_hold: "On hold",
  cancelled: "Cancelled",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function defaultRange(now = new Date()): DateRange {
  return {
    preset: "30d",
    from: dateKey(addDays(startOfDay(now), -29)),
    to: dateKey(now),
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  if (date.getMonth() !== Number(match[2]) - 1) return null;
  return date;
}

function formatSpan(start: Date, end: Date) {
  const sameYear = start.getFullYear() === end.getFullYear();
  const startText = start.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
  const endText = end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (dateKey(start) === dateKey(end)) return endText;
  return `${startText} – ${endText}`;
}

function spanDays(start: Date, end: Date) {
  return Math.max(1, Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86400000) + 1);
}

type Grain = "day" | "week" | "month";

function grainFor(start: Date, end: Date): Grain {
  const days = spanDays(start, end);
  if (days <= 45) return "day";
  if (days <= 180) return "week";
  return "month";
}

function startOfBucket(date: Date, grain: Grain) {
  const day = startOfDay(date);
  if (grain === "day") return day;
  if (grain === "month") return new Date(day.getFullYear(), day.getMonth(), 1);
  const weekday = day.getDay();
  const mondayOffset = weekday === 0 ? 6 : weekday - 1;
  return addDays(day, -mondayOffset);
}

function addBucket(date: Date, grain: Grain) {
  if (grain === "day") return addDays(date, 1);
  if (grain === "week") return addDays(date, 7);
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function bucketLabel(date: Date, grain: Grain) {
  if (grain === "month") {
    return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function bucketsBetween(start: Date, end: Date, grain: Grain) {
  const points: Date[] = [];
  let cursor = startOfBucket(start, grain);
  const last = startOfBucket(end, grain).getTime();
  while (cursor.getTime() <= last && points.length < 400) {
    points.push(cursor);
    cursor = addBucket(cursor, grain);
  }
  return points;
}

export function rangeBounds(range: DateRange, now = new Date()) {
  const today = startOfDay(now);
  let start = today;
  let end = endOfDay(now);
  let compare = true;

  if (range.preset === "today") {
    start = today;
    end = endOfDay(now);
  } else if (range.preset === "yesterday") {
    start = addDays(today, -1);
    end = endOfDay(start);
  } else if (range.preset === "7d") {
    start = addDays(today, -6);
  } else if (range.preset === "30d") {
    start = addDays(today, -29);
  } else if (range.preset === "90d") {
    start = addDays(today, -89);
  } else if (range.preset === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (range.preset === "lastMonth") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
  } else if (range.preset === "year") {
    start = new Date(now.getFullYear(), 0, 1);
  } else if (range.preset === "all") {
    start = new Date(2000, 0, 1);
    compare = false;
  } else {
    const from = parseDay(range.from) ?? today;
    const to = parseDay(range.to) ?? today;
    start = from <= to ? from : to;
    end = endOfDay(from <= to ? to : from);
  }

  const days = spanDays(start, end);
  let previousStart = addDays(start, -days);
  let previousEnd = endOfDay(addDays(start, -1));

  if (range.preset === "month") {
    previousStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
    const previousMonthLast = new Date(start.getFullYear(), start.getMonth(), 0).getDate();
    const day = Math.min(startOfDay(end).getDate(), previousMonthLast);
    previousEnd = endOfDay(new Date(previousStart.getFullYear(), previousStart.getMonth(), day));
  } else if (range.preset === "lastMonth") {
    previousStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
    previousEnd = endOfDay(new Date(start.getFullYear(), start.getMonth(), 0));
  } else if (range.preset === "year") {
    previousStart = new Date(start.getFullYear() - 1, 0, 1);
    const endDay = startOfDay(end);
    const lastDay = new Date(endDay.getFullYear() - 1, endDay.getMonth() + 1, 0).getDate();
    previousEnd = endOfDay(
      new Date(endDay.getFullYear() - 1, endDay.getMonth(), Math.min(endDay.getDate(), lastDay))
    );
  }

  return {
    start,
    end,
    previousStart,
    previousEnd,
    compare,
    label: range.preset === "all" ? "All time" : formatSpan(start, end),
    previousLabel: formatSpan(previousStart, previousEnd),
  };
}

function parsePrice(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function counted(order: AnalyticsOrder) {
  return !SKIPPED.has((order.status || "").toLowerCase());
}

function money(order: AnalyticsOrder) {
  const revenue = parsePrice(order.total_price);
  const online = parsePrice(order.online_paid);
  const due = parsePrice(order.cod_due);
  const partial = order.payment_mode === "partial";
  return {
    revenue,
    collected: partial ? online : online || revenue,
    codDue: partial ? due : 0,
  };
}

function customerKey(order: AnalyticsOrder) {
  const phone = (order.customer_phone || "").replace(/\D/g, "").slice(-10);
  if (phone.length === 10) return `p:${phone}`;
  const email = (order.customer_email || "").trim().toLowerCase();
  if (email) return `e:${email}`;
  return "";
}

function emptyTotals(): PeriodTotals {
  return { revenue: 0, orders: 0, average: 0, collected: 0, codDue: 0, customers: 0, returning: 0 };
}

function within(date: Date, start: Date, end: Date) {
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

function topSlices(map: Map<string, Slice>, limit = 6) {
  const rows = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue || b.orders - a.orders);
  if (rows.length <= limit) return rows;
  const head = rows.slice(0, limit - 1);
  const rest = rows.slice(limit - 1);
  const other = rest.reduce(
    (sum, row) => {
      sum.revenue += row.revenue;
      sum.orders += row.orders;
      return sum;
    },
    { label: "Other", revenue: 0, orders: 0 }
  );
  return [...head, other];
}

function addSlice(map: Map<string, Slice>, label: string, revenue: number) {
  const current = map.get(label) ?? { label, revenue: 0, orders: 0 };
  current.revenue += revenue;
  current.orders += 1;
  map.set(label, current);
}

export function buildAnalytics(
  orders: AnalyticsOrder[],
  artists: AnalyticsArtist[],
  range: DateRange,
  now = new Date()
): AnalyticsReport {
  const bounds = rangeBounds(range, now);
  const earliest = range.preset === "all" ? firstOrderDate(orders) : null;
  const seriesStart = earliest ?? bounds.start;
  const activeGrain = grainFor(seriesStart, bounds.end);
  const artistNames = new Map(artists.map((artist) => [artist.id, artist.name]));

  const history = new Map<string, number>();
  for (const order of orders) {
    if (!counted(order) || !order.created_at) continue;
    const created = new Date(order.created_at);
    if (Number.isNaN(created.getTime())) continue;
    const key = customerKey(order);
    if (!key) continue;
    const previous = history.get(key);
    if (previous === undefined || created.getTime() < previous) history.set(key, created.getTime());
  }

  const currentBuckets = bucketsBetween(seriesStart, bounds.end, activeGrain);
  const points = currentBuckets.map((date) => ({
    label: bucketLabel(date, activeGrain),
    revenue: 0,
    orders: 0,
    previousRevenue: 0,
    previousOrders: 0,
  }));

  const current = emptyTotals();
  const previous = emptyTotals();
  const currentCustomers = new Set<string>();
  const previousCustomers = new Set<string>();
  const returning = new Set<string>();
  const payments = new Map<string, Slice>();
  const stages = new Map<string, Slice>();
  const sizes = new Map<string, Slice>();
  const frames = new Map<string, Slice>();
  const coupons = new Map<string, Slice>();
  const weekdays = new Map<string, Slice>(WEEKDAYS.map((label) => [label, { label, revenue: 0, orders: 0 }]));
  const artistSlices = new Map<string, Slice>();

  for (const order of orders) {
    if (!counted(order) || !order.created_at) continue;
    const created = new Date(order.created_at);
    if (Number.isNaN(created.getTime())) continue;
    const amount = money(order);
    const inCurrent = range.preset === "all" ? true : within(created, bounds.start, bounds.end);
    const inPrevious = bounds.compare && within(created, bounds.previousStart, bounds.previousEnd);

    if (inCurrent) {
      current.revenue += amount.revenue;
      current.orders += 1;
      current.collected += amount.collected;
      current.codDue += amount.codDue;
      const key = customerKey(order);
      if (key) {
        currentCustomers.add(key);
        const first = history.get(key);
        if (first !== undefined && first < bounds.start.getTime()) returning.add(key);
      }
      const index = bucketIndex(created, currentBuckets, activeGrain);
      if (index >= 0 && points[index]) {
        points[index].revenue += amount.revenue;
        points[index].orders += 1;
      }
      addSlice(payments, paymentLabel(order.payment_mode), amount.revenue);
      addSlice(stages, order.fulfillment_stage || "received", amount.revenue);
      addSlice(sizes, order.size?.trim() || "Size not set", amount.revenue);
      addSlice(frames, order.frame_style?.trim() || "Frame not set", amount.revenue);
      const coupon = order.coupon_code?.trim();
      if (coupon) addSlice(coupons, coupon.toUpperCase(), amount.revenue);
      const weekday = WEEKDAYS[(created.getDay() + 6) % 7];
      addSlice(weekdays, weekday, amount.revenue);
      if (order.artist_id) {
        addSlice(artistSlices, artistNames.get(order.artist_id) || "Artist", amount.revenue);
      }
    } else if (inPrevious) {
      previous.revenue += amount.revenue;
      previous.orders += 1;
      previous.collected += amount.collected;
      previous.codDue += amount.codDue;
      const key = customerKey(order);
      if (key) previousCustomers.add(key);
      const index = previousBucketIndex(created, bounds.previousStart, activeGrain, points.length);
      if (index >= 0 && points[index]) {
        points[index].previousRevenue += amount.revenue;
        points[index].previousOrders += 1;
      }
    }
  }

  current.average = current.orders ? current.revenue / current.orders : 0;
  previous.average = previous.orders ? previous.revenue / previous.orders : 0;
  current.customers = currentCustomers.size;
  current.returning = returning.size;
  previous.customers = previousCustomers.size;

  const stageRows = STAGE_ORDER.filter((stage) => stages.has(stage)).map((stage) => {
    const row = stages.get(stage)!;
    return { ...row, label: STAGE_LABELS[stage] || stage };
  });
  for (const [stage, row] of stages) {
    if (!STAGE_ORDER.includes(stage)) stageRows.push({ ...row, label: STAGE_LABELS[stage] || stage });
  }

  const peak = points.reduce<SeriesPoint | null>((best, point) => {
    if (!best || point.revenue > best.revenue) return point;
    return best;
  }, null);

  return {
    label: range.preset === "all" ? "All time" : bounds.label,
    previousLabel: bounds.previousLabel,
    compare: bounds.compare,
    grainLabel: activeGrain === "day" ? "Daily" : activeGrain === "week" ? "Weekly" : "Monthly",
    grainNoun: activeGrain === "day" ? "day" : activeGrain === "week" ? "week" : "month",
    current,
    previous,
    series: points,
    payments: ["Prepaid", "Cash on delivery", "Not recorded"]
      .map((label) => payments.get(label))
      .filter((row): row is Slice => !!row && row.orders > 0),
    stages: stageRows,
    sizes: topSlices(sizes),
    frames: topSlices(frames),
    coupons: topSlices(coupons),
    weekdays: WEEKDAYS.map((label) => weekdays.get(label)!),
    artists: topSlices(artistSlices),
    peak: peak && peak.revenue > 0 ? peak : null,
  };
}

function firstOrderDate(orders: AnalyticsOrder[]) {
  let earliest: Date | null = null;
  for (const order of orders) {
    if (!order.created_at) continue;
    const created = new Date(order.created_at);
    if (Number.isNaN(created.getTime())) continue;
    if (!earliest || created < earliest) earliest = created;
  }
  return earliest;
}

function bucketIndex(created: Date, buckets: Date[], grain: Grain) {
  const key = startOfBucket(created, grain).getTime();
  return buckets.findIndex((bucket) => bucket.getTime() === key);
}

function previousBucketIndex(created: Date, previousStart: Date, grain: Grain, length: number) {
  const from = startOfBucket(previousStart, grain);
  const at = startOfBucket(created, grain);
  let index = 0;
  let cursor = from;
  while (cursor.getTime() < at.getTime() && index < length) {
    cursor = addBucket(cursor, grain);
    index += 1;
  }
  if (cursor.getTime() !== at.getTime()) return -1;
  return index;
}

function paymentLabel(mode?: string) {
  if (mode === "partial") return "Cash on delivery";
  if (mode) return "Prepaid";
  return "Not recorded";
}

export function orderInRange(order: AnalyticsOrder, range: DateRange, now = new Date()) {
  if (range.preset === "all") return true;
  if (!order.created_at) return false;
  const created = new Date(order.created_at);
  if (Number.isNaN(created.getTime())) return false;
  const bounds = rangeBounds(range, now);
  return within(created, bounds.start, bounds.end);
}
