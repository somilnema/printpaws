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
  onDelete,
  canDelete,
}: {
  notes: TeamNoteItem[];
  onAdd: (body: string) => Promise<{ ok: boolean; error?: string }>;
  onDelete?: (id: string) => Promise<{ ok: boolean; error?: string }>;
  canDelete?: (note: TeamNoteItem) => boolean;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [deleted, setDeleted] = useState<string[]>([]);
  const shown = notes.filter((note) => !deleted.includes(note.id));

  async function handleDelete(note: TeamNoteItem) {
    if (!onDelete || !window.confirm("Delete this note? It is removed for everyone on the team.")) return;
    setDeletingId(note.id);
    setError("");
    const result = await onDelete(note.id);
    setDeletingId("");
    if (!result.ok) {
      setError(result.error || "The note could not be deleted.");
      return;
    }
    setDeleted((current) => [...current, note.id]);
  }

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
    <div className="space-y-2 border-t border-[#f3f4f6] pt-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Private team notes</p>
      <p className="text-xs text-[#9ca3af]">Only the artist, shipment desk, and admin can see these. The customer cannot.</p>
      {shown.length ? (
        <div className="space-y-2">
          {shown.map((note) => (
            <div key={note.id} className="rounded-2xl bg-[#f8f9fa] p-3">
              <p className="whitespace-pre-wrap text-sm">{note.body}</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="min-w-0 text-xs text-[#9ca3af]">
                  {note.author}
                  {note.created_at ? ` · ${formatDate(note.created_at)}` : ""}
                </p>
                {onDelete && canDelete?.(note) ? (
                  <button
                    type="button"
                    disabled={Boolean(deletingId)}
                    onClick={() => handleDelete(note)}
                    className="shrink-0 text-xs font-medium text-[#b42318] disabled:opacity-50"
                  >
                    {deletingId === note.id ? "Deleting…" : "Delete"}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#9ca3af]">No private notes yet.</p>
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
