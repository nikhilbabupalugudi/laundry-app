"use client";

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

const toneClasses = {
  dark: "border-slate-300 border-t-slate-900",
  brand: "border-sky-200 border-t-sky-600",
  light: "border-white/30 border-t-white",
};

export default function LoadingSpinner({
  size = "md",
  tone = "brand",
  className = "",
}) {
  return (
    <span
      className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${toneClasses[tone]} ${className}`}
      aria-hidden="true"
    />
  );
}
