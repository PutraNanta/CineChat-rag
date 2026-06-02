import { createContext, useCallback, useContext, useMemo, useState } from "react";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((prev) => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const withLoading = useCallback(
    async (callback) => {
      startLoading();
      try {
        return await callback();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  const value = useMemo(
    () => ({
      isLoading: loadingCount > 0,
      loadingCount,
      startLoading,
      stopLoading,
      withLoading,
    }),
    [loadingCount, startLoading, stopLoading, withLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loadingCount > 0 && (
        <div className="pointer-events-none fixed right-4 top-4 z-[70]">
          <div className="rounded-full border border-sky-100 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
              <p className="text-xs font-medium text-slate-700">
                Memproses
                {loadingCount > 1 ? ` (${loadingCount})` : ""}...
              </p>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
