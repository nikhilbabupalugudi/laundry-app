"use client";

import { useEffect, useState } from "react";
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

function shouldShowActionButtons(status) {
  const normalizedStatus = normalizeStatus(status);
  return normalizedStatus !== "accepted" && normalizedStatus !== "rejected";
}

function DashboardStat({ label, value, tone }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">No orders found</h2>
      <p className="mt-2 text-sm text-slate-600">
        New booking requests will appear here once customers place an order.
      </p>
    </div>
  );
}

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const toast = useToast();

  async function getOrders() {
    const { data, error } = await supabase.from("orders").select("*");
    return { data: data || [], error };
  }

  useEffect(() => {
    let isMounted = true;

    getOrders().then(({ data, error }) => {
      if (isMounted) {
        setOrders(data);
        setIsLoading(false);

        if (error) {
          toast.error(
            "Unable to load orders",
            error.message || "Try refreshing the dashboard."
          );
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [toast]);

  async function fetchOrders() {
    const { data, error } = await getOrders();
    setOrders(data);
    return { error };
  }

  async function updateStatus(id, newStatus) {
    setActiveOrderId(id);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      setActiveOrderId(null);
      toast.error("Status update failed", error.message || "Please try again.");
      return;
    }

    const refreshResult = await fetchOrders();
    setActiveOrderId(null);

    if (refreshResult.error) {
      toast.error(
        "Updated, but refresh failed",
        refreshResult.error.message || "Reload the dashboard to verify the latest state."
      );
      return;
    }

    toast.success(
      "Order updated",
      `Order ${id} was marked as ${getStatusLabel(newStatus).toLowerCase()}.`
    );
  }

  const pendingOrders = orders.filter(
    (order) => normalizeStatus(order.status) === "pending"
  ).length;
  const acceptedOrders = orders.filter(
    (order) => normalizeStatus(order.status) === "accepted"
  ).length;
  const rejectedOrders = orders.filter(
    (order) => normalizeStatus(order.status) === "rejected"
  ).length;

  function renderActionButtons(order) {
    if (!shouldShowActionButtons(order.status)) {
      return <span className="text-sm text-slate-400">Status updated</span>;
    }

    const isUpdating = activeOrderId === order.id;

    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateStatus(order.id, "accepted")}
          disabled={isUpdating}
          className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
        >
          {isUpdating ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner size="sm" tone="light" />
              Updating...
            </span>
          ) : (
            "Accept"
          )}
        </button>

        <button
          onClick={() => updateStatus(order.id, "rejected")}
          disabled={isUpdating}
          className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {isUpdating ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner size="sm" tone="light" />
              Updating...
            </span>
          ) : (
            "Reject"
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(30,41,59,0.96),rgba(14,165,233,0.9))] px-6 py-8 text-white sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              Review incoming laundry orders, track their status, and manage
              approvals from a single workspace.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:grid-cols-3 sm:px-8">
            <DashboardStat
              label="Total Orders"
              value={orders.length}
              tone="border-slate-200 bg-slate-50 text-slate-900"
            />
            <DashboardStat
              label="Pending"
              value={pendingOrders}
              tone="border-yellow-200 bg-yellow-50 text-yellow-800"
            />
            <DashboardStat
              label="Accepted / Rejected"
              value={`${acceptedOrders} / ${rejectedOrders}`}
              tone="border-emerald-200 bg-emerald-50 text-emerald-800"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3 text-sm text-slate-600">
              <LoadingSpinner size="lg" />
              <p>Loading dashboard data...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-4 lg:hidden">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Service
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {order.service_id}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Mobile Number
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {order.mobile_number || "Not provided"}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Address
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {order.address}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    {renderActionButtons(order)}
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Mobile Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-5 text-sm font-medium text-slate-900">
                        {order.service_id}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {order.address}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {order.mobile_number || "Not provided"}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5">{renderActionButtons(order)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
