export const MIN_CHANGE_POINTS = 1;
export const MAX_CHANGE_POINTS = 5;
const POINT_MAX = 240;

export function validateChangePoints(input: unknown): { ok: true; points: string[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: "Add 1 to 5 separate changes." };
  const raw = input.map((item) => String(item ?? "").replace(/\s+/g, " ").trim());
  if (raw.some((item) => item.length > POINT_MAX)) {
    return { ok: false, error: `Keep each change under ${POINT_MAX} characters.` };
  }
  const points = raw.filter(Boolean);
  if (points.length < MIN_CHANGE_POINTS || points.length > MAX_CHANGE_POINTS) {
    return { ok: false, error: "Add 1 to 5 separate changes." };
  }
  return { ok: true, points };
}

export function formatChangePoints(points: string[]) {
  return points.map((point, index) => `${index + 1}. ${point}`).join("\n");
}

export function parseChangePoints(note?: string | null): string[] | null {
  const text = String(note || "").trim();
  if (!text) return null;
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const points: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.+)$/);
    if (!match) return null;
    const point = match[1].trim();
    if (!point) return null;
    points.push(point);
  }
  return points.length ? points : null;
}
