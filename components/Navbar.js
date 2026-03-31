"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function HomeIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13V10.5" />
      <path d="M9.5 20v-5h5v5" />
    </svg>
  );
}

function BookIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 4.5h9.5a3.5 3.5 0 0 1 3.5 3.5v10.5a1 1 0 0 1-1.4.9L15 18H6a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z" />
      <path d="M8 8.5h7" />
      <path d="M8 12h7" />
    </svg>
  );
}

function OrdersIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 6h11" />
      <path d="M8 12h11" />
      <path d="M8 18h11" />
      <path d="M4.5 6h.01" />
      <path d="M4.5 12h.01" />
      <path d="M4.5 18h.01" />
    </svg>
  );
}

function AdminIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="4" rx="1.5" />
      <rect x="13" y="11" width="7" height="9" rx="1.5" />
      <rect x="4" y="14" width="7" height="6" rx="1.5" />
    </svg>
  );
}

const navLinks = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/book", label: "Book", icon: BookIcon },
  { href: "/orders", label: "Orders", icon: OrdersIcon },
  { href: "/admin", label: "Admin", icon: AdminIcon },
];

function NavItem({ href, label, icon: Icon, isActive, isMobile, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "group relative transition-colors duration-300",
        isMobile
          ? "flex items-center gap-3.5 rounded-2xl px-4 py-3.5"
          : "inline-flex items-center gap-2.5 rounded-full px-4 py-3",
        isActive
          ? "font-semibold text-sky-700"
          : "font-medium text-slate-600 hover:text-sky-700",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex items-center justify-center rounded-xl transition-all duration-300",
          isMobile ? "h-10 w-10" : "h-8 w-8",
          isActive
            ? "bg-sky-50 text-sky-700"
            : "bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-700",
        ].join(" ")}
      >
        <Icon className={isMobile ? "h-5 w-5" : "h-[18px] w-[18px]"} />
      </span>

      <span className="relative z-10 text-sm tracking-tight">{label}</span>

      <span
        className={[
          "absolute bottom-1.5 left-4 right-4 h-px rounded-full bg-sky-600/90 transition-all duration-300 ease-out",
          isActive
            ? "scale-x-100 opacity-100"
            : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100",
        ].join(" ")}
        style={{ transformOrigin: "left center" }}
      />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-3.5 text-sky-600 transition-colors duration-300 hover:text-sky-700"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm ring-1 ring-sky-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M7 18a3 3 0 1 0 0-6c-1.8 0-3 1.5-3 3.2A2.8 2.8 0 0 0 7 18Z" />
              <path d="M14 20a4 4 0 1 0 0-8c-2.3 0-4 1.9-4 4.1A3.7 3.7 0 0 0 14 20Z" />
              <path d="M18 16a2.5 2.5 0 1 0 0-5c-1.4 0-2.5 1.1-2.5 2.5S16.6 16 18 16Z" />
              <path d="M7 7c.7-1.9 1.9-3 3.6-3 1.6 0 2.7.8 3.4 2.4" />
            </svg>
          </span>

          <span className="flex flex-col leading-none">
            <span className="text-lg font-semibold tracking-[-0.02em]">Laundry App</span>
            <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
              Service Platform
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-white px-2 py-1.5 shadow-sm md:flex">
          {navLinks.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              isActive={pathname === link.href}
              onClick={closeMenu}
            />
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-5 w-5 transition-transform duration-300 ${
              isOpen ? "rotate-90" : "rotate-0"
            }`}
          >
            {isOpen ? (
              <>
                <path d="m6 6 12 12" />
                <path d="M18 6 6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div
        className={`grid overflow-hidden border-t border-slate-200/80 bg-white transition-all duration-300 ease-out md:hidden ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <nav
            className={`px-4 py-4 shadow-sm transition-all duration-300 sm:px-6 ${
              isOpen
                ? "translate-y-0 scale-100"
                : "-translate-y-3 scale-[0.98]"
            }`}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1.5">
              {navLinks.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  isActive={pathname === link.href}
                  isMobile
                  onClick={closeMenu}
                />
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
