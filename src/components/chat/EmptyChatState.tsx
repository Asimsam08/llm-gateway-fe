"use client";

import React from "react";

interface EmptyChatStateProps {
  userName?: string;
}

export function EmptyChatState({ userName = "there" }: EmptyChatStateProps) {
  const firstName = userName.trim().split(/\s+/)[0] || "there";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 max-w-4xl mx-auto w-full text-center select-none animate-fadeIn">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
        How can I help you,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
          {firstName}
        </span>
        ?
      </h1>
    </div>
  );
}
