import { NoteBody } from "@/components/NoteBody";
import { storedPetPhotoUrl } from "@/lib/pet-photo";

type HistoryUpdate = {
  id: string;
  kind: string;
  image_url?: string | null;
  note?: string | null;
  created_at?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function kindLabel(kind: string) {
  if (kind === "preview") return "Preview";
  if (kind === "revision") return "Revision note";
  if (kind === "approved") return "Approved";
  return kind;
}

export function OrderHistory({
  updates,
  approvedUpdateId,
}: {
  updates?: HistoryUpdate[] | null;
  approvedUpdateId?: string | null;
}) {
  if (!updates?.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">History</p>
      {updates.map((update) => {
        const photo = storedPetPhotoUrl(update.image_url);
        return (
          <div key={update.id} className="rounded-2xl bg-[#fcf8f5] p-3 space-y-2">
            <p className="text-xs text-gray-400 font-inter">
              {kindLabel(update.kind)}
              {update.id === approvedUpdateId ? " · locked for shipment" : ""}
              {update.created_at ? ` · ${formatDate(update.created_at)}` : ""}
            </p>
            {update.note ? <NoteBody note={update.note} className="text-sm text-[#1a1a1b] font-inter" /> : null}
            {photo && <img src={photo} alt="Portrait preview" className="w-full max-w-xs rounded-xl object-cover" />}
          </div>
        );
      })}
    </div>
  );
}
