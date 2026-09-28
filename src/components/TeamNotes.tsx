"use client";

import { FormEvent, useState } from "react";
import { buttonClass, errorClass, inputClass } from "@/components/admin/ui";

export type TeamNoteItem = {
  id: string;
  author: string;
  body: string;
  created_at: string;
};

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TeamNotes({
  notes,
  onAdd,
}: {
  notes: TeamNoteItem[];
  onAdd: (body: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await onAdd(body);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || "The note could not be saved.");
      return;
    }
    setBody("");
  }

  return (
    <div className="space-y-2 border-t border-[#f0f2f5] pt-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#98a2b3]">Private team notes</p>
      <p className="text-xs text-[#98a2b3]">Only the artist, shipment desk, and admin can see these. The customer cannot.</p>
      {notes.length ? (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="rounded-2xl bg-[#f7f8fa] p-3">
              <p className="whitespace-pre-wrap text-sm">{note.body}</p>
              <p className="mt-1 text-xs text-[#98a2b3]">
                {note.author}
                {note.created_at ? ` · ${formatDate(note.created_at)}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#98a2b3]">No private notes yet.</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Note for the team"
          required
          rows={3}
          maxLength={2000}
          className={inputClass}
        />
        {error ? <p className={errorClass}>{error}</p> : null}
        <button type="submit" disabled={busy} className={buttonClass}>
          {busy ? "Saving…" : "Save private note"}
        </button>
      </form>
    </div>
  );
}
