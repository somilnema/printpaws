"use client";

export type UploadFailAlert = {
  title: string;
  message: string;
};

export function UploadFailDialog({
  alert,
  onClose,
  buttonLabel = "Got it",
}: {
  alert: UploadFailAlert | null;
  onClose: () => void;
  buttonLabel?: string;
}) {
  if (!alert) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-fail-dialog-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute left-0 top-0 h-1.5 w-full bg-rose-500" />
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <span className="text-2xl font-black" aria-hidden>
              !
            </span>
          </div>
          <h3 id="upload-fail-dialog-title" className="text-lg font-bold tracking-tight text-[#1a1a1b]">
            {alert.title}
          </h3>
          <p className="text-sm font-medium leading-relaxed text-[#4b5563]">{alert.message}</p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#1a1a1b] py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#2F2F2F] active:scale-[0.98]"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
