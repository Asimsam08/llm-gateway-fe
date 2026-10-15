"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export type DialogTone = "danger" | "default" | "info";

export interface DialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: DialogTone;
  /** Runs after the user confirms. The dialog stays open until this settles. */
  action?: () => void | Promise<void>;
}

interface DialogRequest {
  options: DialogOptions;
  mode: "confirm" | "notify";
  resolve: (confirmed: boolean) => void;
}

interface DialogContextValue {
  confirm: (options: DialogOptions) => Promise<boolean>;
  notify: (options: Omit<DialogOptions, "action" | "cancelLabel" | "tone">) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const queueRef = useRef<DialogRequest[]>([]);
  const activeRef = useRef<DialogRequest | null>(null);
  const [active, setActive] = useState<DialogRequest | null>(null);

  const showNext = useCallback(() => {
    if (activeRef.current) return;
    const next = queueRef.current.shift() ?? null;
    activeRef.current = next;
    setActive(next);
  }, []);

  const settle = useCallback(
    (confirmed: boolean) => {
      const current = activeRef.current;
      activeRef.current = null;
      setActive(null);
      current?.resolve(confirmed);
      showNext();
    },
    [showNext]
  );

  const enqueue = useCallback(
    (request: Omit<DialogRequest, "resolve">) =>
      new Promise<boolean>((resolve) => {
        queueRef.current.push({ ...request, resolve });
        showNext();
      }),
    [showNext]
  );

  const confirm = useCallback(
    (options: DialogOptions) => enqueue({ options, mode: "confirm" }),
    [enqueue]
  );

  const notify = useCallback(
    (options: Omit<DialogOptions, "action" | "cancelLabel" | "tone">) =>
      enqueue({
        options: { ...options, tone: "info", confirmLabel: options.confirmLabel ?? "Got it" },
        mode: "notify",
      }).then(() => undefined),
    [enqueue]
  );

  return (
    <DialogContext.Provider value={{ confirm, notify }}>
      {children}
      {active && (
        <ConfirmDialog
          key={`${active.options.title}-${queueRef.current.length}`}
          options={active.options}
          mode={active.mode}
          onCancel={() => settle(false)}
          onConfirm={() => settle(true)}
        />
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
