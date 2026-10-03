"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AppMode = "chat" | "pdf";

interface NavigationContextType {
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  pdfInitialPrompt: string;
  setPdfInitialPrompt: (prompt: string) => void;
}

const STORAGE_KEY_MODE = "llm_gateway_active_mode";

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({
  children,
  initialMode = "chat",
}: {
  children: React.ReactNode;
  initialMode?: AppMode;
}) {
  const [activeMode, setActiveModeState] = useState<AppMode>(initialMode);
  const [pdfInitialPrompt, setPdfInitialPrompt] = useState<string>("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODE) as AppMode;
      if (saved === "chat" || saved === "pdf") {
        setActiveModeState(saved);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setActiveMode = (mode: AppMode) => {
    setActiveModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        activeMode,
        setActiveMode,
        pdfInitialPrompt,
        setPdfInitialPrompt,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    // Provide safe default fallback to prevent crashes if rendered outside NavigationProvider
    return {
      activeMode: "chat",
      setActiveMode: () => {},
      pdfInitialPrompt: "",
      setPdfInitialPrompt: () => {},
    };
  }
  return context;
}
