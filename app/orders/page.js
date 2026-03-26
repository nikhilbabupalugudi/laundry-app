"use client";

import { useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../components/ToastProvider";
import { supabase } from "../../lib/supabaseClient";

function normalizeStatus(status) {
  return status?.toLowerCase() || "pending";
}

function getStatusBadgeClasses(status) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "accepted") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (normalizedStatus === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-yellow-200 bg-yellow-50 text-yellow-700";
}

function getStatusLabel(status) {
  const normalizedStatus = normalizeStatus(status);
  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
}

function StatusIcon({ status, className = "h-5 w-5" }) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "accepted") {
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
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.3 2.3 4.7-5.3" />
      </svg>
    );
  }

  if (normalizedStatus === "rejected") {
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
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function Orders() {
  const [address, setAddress] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const toast = useToast();

  async function fetchOrders(event) {
    event?.preventDefault();

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setOrders([]);
      setHasSearched(false);
      toast.error("Address required", "Enter an address to search for orders.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .ilike("address", `%${trimmedAddress}%`);

    if (error) {
      setOrders([]);
      setIsLoading(false);
      toast.error("Search failed", error.message || "Please try again.");
      return;
    }

    const nextOrders = data || [];

    setOrders(nextOrders);
    setIsLoading(false);

    if (nextOrders.length > 0) {
      toast.success(
        "Orders found",
        `${nextOrders.length} matching order${nextOrders.length === 1 ? "" : "s"} found.`
      );
    } else {
      toast.info("No orders found", `No orders matched "${trimmedAddress}".`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_25%)]" />

          <div className="relative grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                Order Tracking
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Track your laundry orders in one place
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Search by address to see every related order, its current
                status, and whether it is pending, accepted, or rejected.
              </p>
            </div>

            <form
              onSubmit={fetchOrders}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6"
            >
              <label
                htmlFor="address"
                className="text-sm font-medium text-slate-700"
              >
                Search by address
              </label>

              <div className="relative mt-3">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M12 21s6-4.4 6-10a6 6 0 1 0-12 0c0 5.6 6 10 6 10Z" />
                    <path d="M12 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  </svg>
                </div>

                <input
                  id="address"
                  type="text"
                  placeholder="Enter address or part of an address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm transition-all duration-200 hover:border-sky-300 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !address.trim()}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner size="sm" tone="light" />
                    Searching...
                  </span>
                ) : (
                  "Search Orders"
                )}
              </button>
            </form>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Order Results
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {hasSearched
                  ? `${orders.length} order${orders.length === 1 ? "" : "s"} found`
                  : "Search by address to view matching orders"}
              </p>
            </div>

            {hasSearched && orders.length > 0 && (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                Live status
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col items-center gap-3 text-sm text-slate-600">
                <LoadingSpinner size="lg" />
                <p>Fetching matching orders...</p>
              </div>
            </div>
          ) : !hasSearched ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">
                Start tracking an order
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Enter an address above to search for related laundry orders.
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">
                No orders found
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                No matching orders were found for <span className="font-medium text-slate-900">{address.trim()}</span>.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Service
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {order.service_id}
                      </h3>
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(order.status)}`}
                    >
                      <StatusIcon status={order.status} className="h-4 w-4" />
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Pickup Address
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {order.address}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">
                    <div className="rounded-2xl bg-slate-100 p-2 text-slate-600 transition-colors group-hover:bg-sky-100 group-hover:text-sky-700">
                      <StatusIcon status={order.status} />
                    </div>
                    <p>
                      Current status:{" "}
                      <span className="font-medium text-slate-900">
                        {getStatusLabel(order.status)}
                      </span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
