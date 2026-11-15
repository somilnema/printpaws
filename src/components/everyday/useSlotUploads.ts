"use client";

import { useEffect, useRef, useState } from "react";
import { storedPetPhotoUrl } from "@/lib/pet-photo";
import { uploadPetPhotoFile } from "@/lib/uploadPetPhoto";
import { fill } from "@/lib/everyday-content";

export type SlotStatus = "idle" | "uploading" | "saved" | "error";

/** One upload box (group photo, "Pet 2", "Person 1", a reference photo…). */
export type SlotState = {
  fileName: string;
  fileSize: number;
  /** Local preview while uploading; the saved link after a reload. */
  previewUrl: string;
  status: SlotStatus;
  progress: number;
  /** Only set once the server has confirmed the photo is stored. */
  url: string;
  error: string;
  /** Reference photos: the pet (1-based) it shows. */
  pet?: number;
};

/** What the cart keeps in localStorage: saved links only, never files. */
export type SavedSlot = { url: string; name: string; size: number; pet?: number };

export type SlotUploadCopy = {
  maxMb: number;
  formatErrorTitle: string;
  formatError: string;
  tooLargeTitle: string;
  tooLargeError: string;
  uploadFailTitle: string;
};

/** Several labelled photo uploads with per-file progress, Replace / Remove and retry (Multi-Pet, You & Your Pet). */
export function useSlotUploads(copy: SlotUploadCopy, onFail: (title: string, message: string) => void) {
  const [slots, setSlots] = useState<Record<string, SlotState>>({});
  const slotsRef = useRef(slots);
  const files = useRef<Record<string, File>>({});
  const generations = useRef<Record<string, number>>({});
  const promises = useRef<Record<string, Promise<string>>>({});
  const objectUrls = useRef<Record<string, string>>({});

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function patch(key: string, next: Partial<SlotState>) {
    setSlots((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], ...next } } : prev));
  }

  function start(key: string, file: File) {
    const generation = (generations.current[key] || 0) + 1;
    generations.current[key] = generation;
    const promise = uploadPetPhotoFile(file, (progress) => {
      if (generations.current[key] === generation) patch(key, { progress: progress.percent });
    })
      .then((raw) => {
        if (generations.current[key] !== generation) return "";
        const url = storedPetPhotoUrl(raw);
        if (!url) throw new Error("The photo was uploaded but the saved link was invalid.");
        patch(key, { url, status: "saved", progress: 100, error: "" });
        return url;
      })
      .catch((err: unknown) => {
        if (generations.current[key] !== generation) return "";
        const raw = err instanceof Error ? err.message : "We couldn't save this photo. Please try again.";
        const badFormat = /format isn't supported/i.test(raw);
        const message = badFormat ? copy.formatError : raw;
        const tooLarge = /too large|smaller/i.test(message);
        const title = badFormat ? copy.formatErrorTitle : tooLarge ? copy.tooLargeTitle : copy.uploadFailTitle;
        patch(key, { status: "error", error: message, url: "" });
        onFail(title, message);
        throw new Error(message);
      });
    promises.current[key] = promise;
    promise.catch(() => undefined);
    return promise;
  }

  function pick(key: string, file: File, extra?: { pet?: number }) {
    if (!file.type.startsWith("image/")) {
      onFail(copy.formatErrorTitle, copy.formatError);
      return;
    }
    if (file.size > copy.maxMb * 1024 * 1024) {
      const size = (file.size / (1024 * 1024)).toFixed(1);
      onFail(copy.tooLargeTitle, fill(copy.tooLargeError, { name: file.name, size, max: copy.maxMb }));
      return;
    }
    if (objectUrls.current[key]) URL.revokeObjectURL(objectUrls.current[key]);
    const previewUrl = URL.createObjectURL(file);
    objectUrls.current[key] = previewUrl;
    files.current[key] = file;
    setSlots((prev) => ({
      ...prev,
      [key]: {
        fileName: file.name,
        fileSize: file.size,
        previewUrl,
        status: "uploading",
        progress: 6,
        url: "",
        error: "",
        pet: extra?.pet ?? prev[key]?.pet,
      },
    }));
    void start(key, file).catch(() => undefined);
  }

  function remove(key: string) {
    generations.current[key] = (generations.current[key] || 0) + 1;
    delete promises.current[key];
    delete files.current[key];
    if (objectUrls.current[key]) {
      URL.revokeObjectURL(objectUrls.current[key]);
      delete objectUrls.current[key];
    }
    setSlots((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function removeMany(keys: string[]) {
    keys.forEach(remove);
  }

  function retry(key: string) {
    const file = files.current[key];
    if (!file) return;
    patch(key, { status: "uploading", progress: 6, error: "" });
    void start(key, file).catch(() => undefined);
  }

  function setPet(key: string, pet: number | undefined) {
    patch(key, { pet });
  }

  /** Waits for these boxes to finish and returns their saved links ("" when empty or failed). */
  async function ensure(keys: string[]) {
    const out: Record<string, string> = {};
    for (const key of keys) {
      const state = slotsRef.current[key];
      if (!state) {
        out[key] = "";
        continue;
      }
      if (state.url) {
        out[key] = state.url;
        continue;
      }
      const pending = promises.current[key];
      if (pending) {
        try {
          const url = await pending;
          if (url) {
            out[key] = url;
            continue;
          }
        } catch {
          // Try once more below with the same file.
        }
      }
      const file = files.current[key];
      if (!file) {
        out[key] = "";
        continue;
      }
      patch(key, { status: "uploading", progress: 6, error: "" });
      try {
        out[key] = await start(key, file);
      } catch {
        out[key] = "";
      }
    }
    return out;
  }

  /** Brings back photos saved before a reload (links only). */
  function restore(saved: Record<string, SavedSlot> | undefined) {
    if (!saved || typeof saved !== "object") return;
    const next: Record<string, SlotState> = {};
    for (const [key, entry] of Object.entries(saved)) {
      const url = storedPetPhotoUrl(entry?.url);
      if (!url) continue;
      next[key] = {
        fileName: String(entry.name || "Photo"),
        fileSize: Number(entry.size) || 0,
        previewUrl: url,
        status: "saved",
        progress: 100,
        url,
        error: "",
        pet: Number.isInteger(entry.pet) ? entry.pet : undefined,
      };
    }
    setSlots(next);
  }

  function savedSlots(): Record<string, SavedSlot> {
    const out: Record<string, SavedSlot> = {};
    for (const [key, state] of Object.entries(slots)) {
      if (!state.url) continue;
      out[key] = { url: state.url, name: state.fileName, size: state.fileSize, ...(state.pet ? { pet: state.pet } : {}) };
    }
    return out;
  }

  return { slots, pick, remove, removeMany, retry, setPet, ensure, restore, savedSlots };
}

export type SlotUploads = ReturnType<typeof useSlotUploads>;
