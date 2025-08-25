"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type LoadingContextType = {
  loading: boolean;
  startLoading: (fn: () => Promise<void>) => Promise<void>;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const startLoading = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingContext.Provider value={{ loading, startLoading }}>
      {children}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
