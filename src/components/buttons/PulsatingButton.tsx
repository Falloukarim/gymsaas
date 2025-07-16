"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface PulsatingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function PulsatingButton({ children, className = "", ...props }: PulsatingButtonProps) {
  return (
    <button
      {...props}
      className={`relative inline-block rounded-md bg-[#00c9a7] text-white px-4 py-2 font-semibold shadow-lg transition duration-300 hover:bg-[#00a58e] focus:outline-none focus:ring-2 focus:ring-[#00c9a7] before:absolute before:inset-0 before:rounded-md before:bg-[#00c9a7] before:opacity-60 before:animate-pulse-border before:-z-10 ${className}`}
    >
      {children}
    </button>
  );
}
