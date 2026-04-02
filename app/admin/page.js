"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../components/ToastProvider";
import { supabase } from "../../lib/supabaseClient";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

function normalizeStatus(status) {
  return status?.toLowerCase() || "pending";
}

function getStatusLabel(status) {
  const normalizedStatus = normalizeStatus(status);
  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
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

function isReviewedStatus(status) {
  const normalizedStatus = normalizeStatus(status);
  return normalizedStatus === "accepted" || normalizedStatus === "rejected";
}

function getFilterButtonClasses(filterValue, isActive) {
  const baseClasses =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200";

  if (filterValue === "pending") {
    return isActive
      ? `${baseClasses} border-yellow-300 bg-yellow-50 text-yellow-800 shadow-sm`
      : `${baseClasses} border-slate-200 bg-white text-slate-600 hover:border-yellow-200 hover:text-yellow-700`;
  }

  if (filterValue === "accepted") {
    return isActive
      ? `${baseClasses} border-green-300 bg-green-50 text-green-800 shadow-sm`
      : `${baseClasses} border-slate-200 bg-white text-slate-600 hover:border-green-200 hover:text-green-700`;
  }

  if (filterValue === "rejected") {
    return isActive
      ? `${baseClasses} border-red-300 bg-red-50 text-red-800 shadow-sm`
      : `${baseClasses} border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-700`;
  }

  return isActive
    ? `${baseClasses} border-slate-300 bg-slate-900 text-white shadow-sm`
    : `${baseClasses} border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900`;
}

function getFilterCount(filterValue, orders) {
  if (filterValue === "all") {
    return orders.length;
  }

  return orders.filter((order) => normalizeStatus(order.status) === filterValue)
    .length;
}

function DashboardStat({ label, value, tone }) {
  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${tone}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function TableCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
  ariaLabel,
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      aria-label={ariaLabel}
      ref={(element) => {
        if (element) {
          element.indeterminate = indeterminate;
        }
      }}
      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [updatingIds, setUpdatingIds] = useState([]);
  const [pendingStatusAction, setPendingStatusAction] = useState("");
  const [updateScope, setUpdateScope] = useState("");
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingStatus, setEditingStatus] = useState("pending");
  const toast = useToast();

  async function getOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

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

  function resetEditState() {
    setEditingOrderId(null);
    setEditingStatus("pending");
  }

  function startEditingOrder(order) {
    setEditingOrderId(order.id);
    setEditingStatus(normalizeStatus(order.status));
  }

  async function applyStatusUpdate(ids, newStatus, scope = "single") {
    const eligibleIds = ids.filter((id) => {
      const matchingOrder = orders.find((order) => order.id === id);

      if (!matchingOrder) {
        return false;
      }

      if (scope === "edit") {
        return true;
      }

      return !isReviewedStatus(matchingOrder.status);
    });

    if (eligibleIds.length === 0) {
      toast.error(
        scope === "bulk" ? "No pending orders selected" : "Status locked",
        scope === "bulk"
          ? "Bulk actions work only for pending orders. Use Edit to change accepted or rejected orders."
          : "Use Edit to change an accepted or rejected order."
      );
      return;
    }

    setUpdatingIds(eligibleIds);
    setPendingStatusAction(newStatus);
    setUpdateScope(scope);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .in("id", eligibleIds);

    if (error) {
      setUpdatingIds([]);
      setPendingStatusAction("");
      setUpdateScope("");
      toast.error("Status update failed", error.message || "Please try again.");
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        eligibleIds.includes(order.id) ? { ...order, status: newStatus } : order
      )
    );

    setUpdatingIds([]);
    setPendingStatusAction("");
    setUpdateScope("");
    resetEditState();

    setSelectedOrderIds((currentIds) =>
      currentIds.filter((id) => !eligibleIds.includes(id))
    );

    if (eligibleIds.length === 1) {
      toast.success(
        "Order updated",
        `Order ${eligibleIds[0]} was marked as ${getStatusLabel(newStatus).toLowerCase()}.`
      );
      return;
    }

    toast.success(
      "Orders updated",
      `${eligibleIds.length} orders were marked as ${getStatusLabel(newStatus).toLowerCase()}.`
    );
  }

  function handleFilterChange(nextFilter) {
    setActiveFilter(nextFilter);
    setSelectedOrderIds([]);
    resetEditState();
  }

  function handleToggleOrderSelection(orderId) {
    setSelectedOrderIds((currentIds) =>
      currentIds.includes(orderId)
        ? currentIds.filter((id) => id !== orderId)
        : [...currentIds, orderId]
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") {
      return true;
    }

    return normalizeStatus(order.status) === activeFilter;
  });

  const filteredOrderIds = filteredOrders.map((order) => order.id);
  const selectedVisibleOrderIds = filteredOrderIds.filter((id) =>
    selectedOrderIds.includes(id)
  );
  const selectedPendingOrderIds = selectedVisibleOrderIds.filter((id) => {
    const matchingOrder = orders.find((order) => order.id === id);
    return matchingOrder && !isReviewedStatus(matchingOrder.status);
  });
  const allVisibleSelected =
    filteredOrders.length > 0 &&
    selectedVisibleOrderIds.length === filteredOrders.length;
  const someVisibleSelected =
    selectedVisibleOrderIds.length > 0 && !allVisibleSelected;
  const isUpdating = updatingIds.length > 0;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => normalizeStatus(order.status) === "pending"
  ).length;
  const acceptedOrders = orders.filter(
    (order) => normalizeStatus(order.status) === "accepted"
  ).length;
  const rejectedOrders = orders.filter(
    (order) => normalizeStatus(order.status) === "rejected"
  ).length;

  function handleToggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedOrderIds([]);
      return;
    }

    setSelectedOrderIds(filteredOrderIds);
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Operations
          </p>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Review, filter, and update laundry orders from a compact table
                built for day-to-day operations.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Live queue
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                {pendingOrders} pending review
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStat
            label="Total"
            value={totalOrders}
            tone="border-slate-200 bg-white"
          />
          <DashboardStat
            label="Pending"
            value={pendingOrders}
            tone="border-yellow-200 bg-yellow-50"
          />
          <DashboardStat
            label="Accepted"
            value={acceptedOrders}
            tone="border-green-200 bg-green-50"
          />
          <DashboardStat
            label="Rejected"
            value={rejectedOrders}
            tone="border-red-200 bg-red-50"
          />
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Orders Table
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Manage orders
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use filters to focus the table, select rows for bulk actions,
                  and update statuses without leaving the page.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-950">{filteredOrders.length}</span>{" "}
                of <span className="font-semibold text-slate-950">{totalOrders}</span> orders
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleFilterChange(filter.value)}
                    className={getFilterButtonClasses(
                      filter.value,
                      activeFilter === filter.value
                    )}
                  >
                    {filter.label}
                    <span className="text-xs font-semibold">
                      {getFilterCount(filter.value, orders)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="text-sm text-slate-500">
                  {selectedVisibleOrderIds.length} selected
                  {selectedVisibleOrderIds.length !== selectedPendingOrderIds.length
                    ? `, ${selectedPendingOrderIds.length} pending`
                    : ""}
                </span>

                <button
                  type="button"
                  disabled={selectedPendingOrderIds.length === 0 || isUpdating}
                  onClick={() =>
                    applyStatusUpdate(
                      selectedPendingOrderIds,
                      "accepted",
                      "bulk"
                    )
                  }
                  className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300 disabled:shadow-none"
                >
                  {updateScope === "bulk" &&
                  pendingStatusAction === "accepted" ? (
                    <span className="inline-flex items-center gap-2">
                      <LoadingSpinner size="sm" tone="light" />
                      Accepting...
                    </span>
                  ) : (
                    "Accept Selected"
                  )}
                </button>

                <button
                  type="button"
                  disabled={selectedPendingOrderIds.length === 0 || isUpdating}
                  onClick={() =>
                    applyStatusUpdate(
                      selectedPendingOrderIds,
                      "rejected",
                      "bulk"
                    )
                  }
                  className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none"
                >
                  {updateScope === "bulk" &&
                  pendingStatusAction === "rejected" ? (
                    <span className="inline-flex items-center gap-2">
                      <LoadingSpinner size="sm" tone="light" />
                      Rejecting...
                    </span>
                  ) : (
                    "Reject Selected"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex min-h-80 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
                <div className="flex flex-col items-center gap-3 text-sm text-slate-600">
                  <LoadingSpinner size="lg" />
                  <p>Loading dashboard data...</p>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <EmptyState
                title={totalOrders === 0 ? "No orders yet" : "No matching orders"}
                description={
                  totalOrders === 0
                    ? "New booking requests will appear here once customers place an order."
                    : `There are no ${activeFilter} orders to display right now.`
                }
              />
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200">
                <div className="max-h-[60vh] overflow-auto">
                  <table className="min-w-[1040px] w-full border-separate border-spacing-0 text-left">
                    <thead className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur">
                      <tr>
                        <th className="sticky left-0 z-30 border-b border-slate-200 bg-slate-50/95 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          <TableCheckbox
                            checked={allVisibleSelected}
                            indeterminate={someVisibleSelected}
                            disabled={isUpdating || filteredOrders.length === 0}
                            onChange={handleToggleSelectAll}
                            ariaLabel="Select all visible orders"
                          />
                        </th>
                        <th className="border-b border-slate-200 bg-slate-50/95 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Service
                        </th>
                        <th className="border-b border-slate-200 bg-slate-50/95 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Address
                        </th>
                        <th className="border-b border-slate-200 bg-slate-50/95 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Status
                        </th>
                        <th className="sticky right-0 z-30 border-b border-slate-200 bg-slate-50/95 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      {filteredOrders.map((order) => {
                        const normalizedStatus = normalizeStatus(order.status);
                        const isRowUpdating = updatingIds.includes(order.id);
                        const isSelected = selectedOrderIds.includes(order.id);
                        const isAccepted = normalizedStatus === "accepted";
                        const isRejected = normalizedStatus === "rejected";
                        const isReviewed = isReviewedStatus(order.status);
                        const isEditing = editingOrderId === order.id;

                        return (
                          <tr
                            key={order.id}
                            className="group transition-colors duration-200 hover:bg-slate-50"
                          >
                            <td className="sticky left-0 z-10 border-b border-slate-100 bg-white px-4 py-3.5 group-hover:bg-slate-50">
                              <TableCheckbox
                                checked={isSelected}
                                indeterminate={false}
                                disabled={isUpdating}
                                onChange={() =>
                                  handleToggleOrderSelection(order.id)
                                }
                                ariaLabel={`Select order ${order.id}`}
                              />
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3.5 align-top">
                              <div>
                                <p className="text-sm font-semibold text-slate-950">
                                  {order.service_id || "Unknown service"}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Order #{order.id}
                                </p>
                              </div>
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3.5 align-top">
                              <div className="max-w-xl">
                                <p className="text-sm text-slate-700">
                                  {order.address || "No address provided"}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {order.mobile_number || "Mobile number not provided"}
                                </p>
                              </div>
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3.5 align-top">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                                  order.status
                                )}`}
                              >
                                {getStatusLabel(order.status)}
                              </span>
                            </td>

                            <td className="sticky right-0 z-10 border-b border-slate-100 bg-white px-4 py-3.5 group-hover:bg-slate-50">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={editingStatus}
                                    disabled={isUpdating}
                                    onChange={(event) =>
                                      setEditingStatus(event.target.value)
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-slate-400"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                  </select>

                                  <button
                                    type="button"
                                    disabled={
                                      isUpdating ||
                                      editingStatus === normalizedStatus
                                    }
                                    onClick={() =>
                                      applyStatusUpdate(
                                        [order.id],
                                        editingStatus,
                                        "edit"
                                      )
                                    }
                                    className="inline-flex min-w-[72px] items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
                                  >
                                    {isRowUpdating ? (
                                      <span className="inline-flex items-center gap-2">
                                        <LoadingSpinner size="sm" tone="light" />
                                        Saving...
                                      </span>
                                    ) : (
                                      "Save"
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={resetEditState}
                                    className="inline-flex min-w-[72px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={isUpdating || isReviewed}
                                    onClick={() =>
                                      applyStatusUpdate(
                                        [order.id],
                                        "accepted",
                                        "single"
                                      )
                                    }
                                    className={`inline-flex min-w-[88px] items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 ${
                                      isReviewed
                                        ? isAccepted
                                          ? "border border-green-200 bg-green-50 text-green-700"
                                          : "border border-slate-200 bg-slate-50 text-slate-400"
                                        : "bg-green-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-green-700"
                                    }`}
                                  >
                                    {isRowUpdating && pendingStatusAction === "accepted" ? (
                                      <span className="inline-flex items-center gap-2">
                                        <LoadingSpinner size="sm" tone="light" />
                                        Updating...
                                      </span>
                                    ) : isAccepted ? (
                                      "Accepted"
                                    ) : (
                                      "Accept"
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isUpdating || isReviewed}
                                    onClick={() =>
                                      applyStatusUpdate(
                                        [order.id],
                                        "rejected",
                                        "single"
                                      )
                                    }
                                    className={`inline-flex min-w-[88px] items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 ${
                                      isReviewed
                                        ? isRejected
                                          ? "border border-red-200 bg-red-50 text-red-700"
                                          : "border border-slate-200 bg-slate-50 text-slate-400"
                                        : "bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700"
                                    }`}
                                  >
                                    {isRowUpdating && pendingStatusAction === "rejected" ? (
                                      <span className="inline-flex items-center gap-2">
                                        <LoadingSpinner size="sm" tone="light" />
                                        Updating...
                                      </span>
                                    ) : isRejected ? (
                                      "Rejected"
                                    ) : (
                                      "Reject"
                                    )}
                                  </button>

                                  {isReviewed ? (
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => startEditingOrder(order)}
                                      className="inline-flex min-w-[72px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Edit
                                    </button>
                                  ) : null}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
