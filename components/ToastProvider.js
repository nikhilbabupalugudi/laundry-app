"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

function getToastStyles(type) {
  if (type === "success") {
    return {
      wrapper: "border-green-200 bg-white text-slate-900",
      icon: "bg-green-100 text-green-700",
    };
  }

  if (type === "error") {
    return {
      wrapper: "border-red-200 bg-white text-slate-900",
      icon: "bg-red-100 text-red-700",
    };
  }

  return {
    wrapper: "border-sky-200 bg-white text-slate-900",
    icon: "bg-sky-100 text-sky-700",
  };
}

function ToastIcon({ type }) {
  if (type === "success") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.3 2.3 4.7-5.3" />
      </svg>
    );
  }

  if (type === "error") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6" />
        <path d="m15 9-6 6" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function ToastItem({ toast, onDismiss }) {
  const styles = getToastStyles(toast.type);

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border p-4 shadow-lg shadow-slate-900/10 ${styles.wrapper}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-2xl p-2 ${styles.icon}`}>
          <ToastIcon type={toast.type} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message ? (
            <p className="mt-1 text-sm leading-6 text-slate-600">{toast.message}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-xl p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss notification"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m6 6 12 12" />
            <path d="M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextToastId = useRef(0);
  const timeoutIds = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timeoutId = timeoutIds.current.get(id);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutIds.current.delete(id);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ title, message, type = "info", duration = 4000 }) => {
    const id = nextToastId.current++;

    setToasts((currentToasts) => [
      ...currentToasts,
      { id, title, message, type },
    ]);

    const timeoutId = setTimeout(() => {
      dismissToast(id);
    }, duration);

    timeoutIds.current.set(id, timeoutId);
  }, [dismissToast]);

  useEffect(() => {
    const currentTimeoutIds = timeoutIds.current;

    return () => {
      currentTimeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
      currentTimeoutIds.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      success(title, message) {
        showToast({ title, message, type: "success" });
      },
      error(title, message) {
        showToast({ title, message, type: "error" });
      },
      info(title, message) {
        showToast({ title, message, type: "info" });
      },
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4 sm:justify-end sm:px-6 lg:px-8">
        <div className="flex w-full max-w-sm flex-col gap-3">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
