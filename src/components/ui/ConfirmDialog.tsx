"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircleIcon, CloseIcon, SpinnerIcon, TrashIcon } from "@/components/icons";
import type { DialogOptions } from "@/context/DialogContext";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ConfirmDialogProps {
  options: DialogOptions;
  mode: "confirm" | "notify";
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ options, mode, onCancel, onConfirm }: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tone = options.tone ?? (mode === "notify" ? "info" : "default");
  const isDanger = tone === "danger";
  const confirmLabel = options.confirmLabel ?? (isDanger ? "Delete" : "Confirm");
  const cancelLabel = options.cancelLabel ?? "Cancel";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.hasAttribute("disabled")
      );

    const preferred =
      panel.querySelector<HTMLElement>("[data-autofocus]") ?? focusable()[0];
    preferred?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (pending) return;
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel, pending]);

  const handleConfirm = async () => {
    if (pending) return;
    if (!options.action) {
      onConfirm();
      return;
    }

    setPending(true);
    setError(null);
    try {
      await options.action();
      onConfirm();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
      setPending(false);
    }
  };

  const iconWrap =
    tone === "danger"
      ? "bg-red-500/10 text-red-400 ring-red-500/20"
      : tone === "info"
        ? "bg-indigo-500/10 text-indigo-300 ring-indigo-500/20"
        : "bg-zinc-800 text-zinc-200 ring-zinc-700";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <div
        aria-hidden="true"
        onMouseDown={(event) => {
          if (pending || event.target !== event.currentTarget) return;
          onCancel();
        }}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-150 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role={isDanger || mode === "notify" ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={pending}
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#101117] shadow-2xl shadow-black/50 transition duration-150 ${
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Close"
        >
          <CloseIcon size={16} />
        </button>

        <div className="px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
          <div className={`mb-4 inline-flex rounded-xl p-2.5 ring-1 ${iconWrap}`}>
            {isDanger ? <TrashIcon size={18} /> : <AlertCircleIcon size={18} />}
          </div>

          <h2 id={titleId} className="pr-8 text-base font-semibold tracking-tight text-white">
            {options.title}
          </h2>
          <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-zinc-400">
            {options.description}
          </p>

          {error && (
            <p role="alert" className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-zinc-800/80 bg-zinc-950/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          {mode === "confirm" && (
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              data-autofocus={isDanger ? true : undefined}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={pending}
            data-autofocus={!isDanger ? true : undefined}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
              isDanger
                ? "bg-red-600 text-white shadow-lg shadow-red-900/30 hover:bg-red-500"
                : "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500"
            }`}
          >
            {pending && <SpinnerIcon size={14} />}
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
