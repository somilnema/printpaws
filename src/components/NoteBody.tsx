import { parseChangePoints } from "@/lib/change-points";

export function NoteBody({ note, className = "" }: { note?: string | null; className?: string }) {
  const text = String(note || "").trim();
  if (!text) return null;
  const points = parseChangePoints(text);
  if (!points) {
    return <p className={`whitespace-pre-wrap ${className}`}>{text}</p>;
  }
  return (
    <ol className={`list-decimal space-y-1 pl-5 ${className}`}>
      {points.map((point, index) => (
        <li key={`${index}-${point}`}>{point}</li>
      ))}
    </ol>
  );
}
