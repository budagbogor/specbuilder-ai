"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
};

const defaultDurationMs = 4200;

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function variantStyles(variant: ToastVariant) {
  if (variant === "success") {
    return {
      container:
        "border-emerald-300/80 bg-emerald-50/95 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/90 dark:text-emerald-200",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    };
  }

  if (variant === "error") {
    return {
      container:
        "border-red-300/80 bg-red-50/95 text-red-900 dark:border-red-700/60 dark:bg-red-950/90 dark:text-red-200",
      icon: <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
    };
  }

  return {
    container: "border-border/80 bg-card/95 text-card-foreground",
    icon: <Info className="h-4 w-4 text-primary" />,
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((previousToasts) =>
      previousToasts.filter((toastItem) => toastItem.id !== id),
    );
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = createToastId();
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "info",
        durationMs: input.durationMs,
      };

      setToasts((previousToasts) => [...previousToasts, item].slice(-4));

      const timeout = input.durationMs ?? defaultDurationMs;
      window.setTimeout(() => {
        dismiss(id);
      }, timeout);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toast,
      dismiss,
    }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:left-auto sm:right-4 sm:w-[360px] sm:items-stretch">
        {toasts.map((toastItem) => {
          const styles = variantStyles(toastItem.variant);

          return (
            <div
              key={toastItem.id}
              className={cn(
                "pointer-events-auto w-full rounded-xl border px-3 py-2 shadow-lg backdrop-blur",
                styles.container,
              )}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5">{styles.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toastItem.title}</p>
                  {toastItem.description ? (
                    <p className="mt-0.5 text-xs leading-relaxed opacity-90">
                      {toastItem.description}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  onClick={() => dismiss(toastItem.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close notification</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
