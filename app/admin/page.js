"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../components/ToastProvider";
import { supabase } from "../../lib/supabaseClient";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "status-asc", label: "Status: Pending first" },
  { value: "status-desc", label: "Status: Rejected first" },
];

const PAGE_SIZE_OPTIONS = [10, 20];

const STATUS_PRIORITY = {
  pending: 0,
  accepted: 1,
  rejected: 2,
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

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

function getFilterButtonClasses(filterValue, isActive) {
  const baseClasses =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200";

  if (filterValue === "pending") {
    return isActive
      ? `${baseClasses} border-yellow-300 bg-yellow-50 text-yellow-800`
      : `${baseClasses} border-slate-200 bg-white text-slate-600 hover:border-yellow-200 hover:text-yellow-700`;
  }

  if (filterValue === "accepted") {
    return isActive
      ? `${baseClasses} border-green-300 bg-green-50 text-green-800`
      : `${baseClasses} border-slate-200 bg-white text-slate-600 hover:border-green-200 hover:text-green-700`;
  }

  if (filterValue === "rejected") {
    return isActive
      ? `${baseClasses} border-red-300 bg-red-50 text-red-800`
      : `${baseClasses} border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-700`;
  }

  return isActive
    ? `${baseClasses} border-slate-900 bg-slate-900 text-white`
    : `${baseClasses} border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900`;
}

function getOrderDateValue(order) {
  const createdAtValue = order?.created_at ? Date.parse(order.created_at) : NaN;

  if (!Number.isNaN(createdAtValue)) {
    return createdAtValue;
  }

  return Number(order?.id) || 0;
}

function formatOrderDate(order) {
  const createdAtValue = order?.created_at ? Date.parse(order.created_at) : NaN;

  if (!Number.isNaN(createdAtValue)) {
    return DATE_FORMATTER.format(new Date(createdAtValue));
  }

  return `Order #${order.id}`;
}

function compareOrders(leftOrder, rightOrder, sortOption) {
  if (sortOption === "date-asc") {
    return getOrderDateValue(leftOrder) - getOrderDateValue(rightOrder);
  }

  if (sortOption === "status-asc" || sortOption === "status-desc") {
    const statusDifference =
      (STATUS_PRIORITY[normalizeStatus(leftOrder.status)] ?? 99) -
      (STATUS_PRIORITY[normalizeStatus(rightOrder.status)] ?? 99);

    if (statusDifference !== 0) {
      return sortOption === "status-asc"
        ? statusDifference
        : -statusDifference;
    }
  }

  return getOrderDateValue(rightOrder) - getOrderDateValue(leftOrder);
}

function DashboardStat({ label, value, tone, isLoading }) {
  return (
    <div className={`rounded-[28px] border p-5 shadow-sm ${tone}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {isLoading ? (
        <div className="mt-4 h-9 w-20 animate-pulse rounded-2xl bg-slate-200" />
      ) : (
        <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {value.toLocaleString()}
        </p>
      )}
    </div>
  );
}

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          {actionLabel}
        </button>
      ) : null}
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [updatingIds, setUpdatingIds] = useState([]);
  const [pendingStatusAction, setPendingStatusAction] = useState("");
  const [updateScope, setUpdateScope] = useState("");
  const toast = useToast();

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const normalizedDeferredSearchQuery = deferredSearchQuery.trim().toLowerCase();
  const isFilteringResults =
    normalizedSearchQuery !== normalizedDeferredSearchQuery;

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("id", { ascending: false });

      if (!isMounted) {
        return;
      }

      setOrders(data || []);
      setIsLoading(false);

      if (error) {
        toast.error(
          "Unable to load orders",
          error.message || "Try refreshing the dashboard."
        );
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const ordersById = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders]
  );

  const summary = useMemo(() => {
    const counts = {
      total: orders.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
    };

    orders.forEach((order) => {
      const normalizedStatus = normalizeStatus(order.status);

      if (normalizedStatus === "accepted") {
        counts.accepted += 1;
        return;
      }

      if (normalizedStatus === "rejected") {
        counts.rejected += 1;
        return;
      }

      counts.pending += 1;
    });

    return counts;
  }, [orders]);

  const processedOrders = useMemo(() => {
    const filteredOrders = orders.filter((order) => {
      if (
        activeFilter !== "all" &&
        normalizeStatus(order.status) !== activeFilter
      ) {
        return false;
      }

      if (!normalizedDeferredSearchQuery) {
        return true;
      }

      const service = `${order.service_id || ""}`.toLowerCase();
      const address = `${order.address || ""}`.toLowerCase();

      return (
        service.includes(normalizedDeferredSearchQuery) ||
        address.includes(normalizedDeferredSearchQuery)
      );
    });

    return [...filteredOrders].sort((leftOrder, rightOrder) =>
      compareOrders(leftOrder, rightOrder, sortOption)
    );
  }, [orders, activeFilter, normalizedDeferredSearchQuery, sortOption]);

  const totalPages = Math.max(1, Math.ceil(processedOrders.length / pageSize));
  const resolvedCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (resolvedCurrentPage - 1) * pageSize;
  const pageEndIndex = pageStartIndex + pageSize;
  const paginatedOrders = processedOrders.slice(pageStartIndex, pageEndIndex);
  const paginatedOrderIds = paginatedOrders.map((order) => order.id);
  const selectedPageOrderIds = paginatedOrderIds.filter((orderId) =>
    selectedOrderIds.includes(orderId)
  );
  const allVisibleSelected =
    paginatedOrders.length > 0 &&
    selectedPageOrderIds.length === paginatedOrders.length;
  const someVisibleSelected =
    selectedPageOrderIds.length > 0 && !allVisibleSelected;

  const selectedOrders = selectedOrderIds
    .map((orderId) => ordersById.get(orderId))
    .filter(Boolean);

  const selectedAcceptableCount = selectedOrders.filter(
    (order) => normalizeStatus(order.status) !== "accepted"
  ).length;
  const selectedRejectableCount = selectedOrders.filter(
    (order) => normalizeStatus(order.status) !== "rejected"
  ).length;

  const isUpdating = updatingIds.length > 0;
  const visibleStartCount =
    processedOrders.length === 0 ? 0 : pageStartIndex + 1;
  const visibleEndCount = Math.min(pageEndIndex, processedOrders.length);

  function resetSearchAndFilters() {
    setActiveFilter("all");
    setSearchQuery("");
    setSortOption("date-desc");
    setCurrentPage(1);
    setSelectedOrderIds([]);
  }

  function handleFilterChange(nextFilter) {
    setActiveFilter(nextFilter);
    setCurrentPage(1);
    setSelectedOrderIds([]);
  }

  function handleSearchChange(event) {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
    setSelectedOrderIds([]);
  }

  function handleToggleOrderSelection(orderId) {
    setSelectedOrderIds((currentIds) =>
      currentIds.includes(orderId)
        ? currentIds.filter((id) => id !== orderId)
        : [...currentIds, orderId]
    );
  }

  function handleToggleSelectAll() {
    setSelectedOrderIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (allVisibleSelected) {
        paginatedOrderIds.forEach((orderId) => nextIds.delete(orderId));
      } else {
        paginatedOrderIds.forEach((orderId) => nextIds.add(orderId));
      }

      return Array.from(nextIds);
    });
  }

  async function applyStatusUpdate(orderIds, nextStatus, scope = "single") {
    const eligibleOrderIds = orderIds.filter((orderId) => {
      const order = ordersById.get(orderId);
      return order && normalizeStatus(order.status) !== nextStatus;
    });

    if (eligibleOrderIds.length === 0) {
      toast.info(
        "No updates needed",
        `All selected orders are already ${getStatusLabel(
          nextStatus
        ).toLowerCase()}.`
      );
      return;
    }

    const eligibleIdSet = new Set(eligibleOrderIds);

    setUpdatingIds(eligibleOrderIds);
    setPendingStatusAction(nextStatus);
    setUpdateScope(scope);

    const { error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .in("id", eligibleOrderIds);

    if (error) {
      setUpdatingIds([]);
      setPendingStatusAction("");
      setUpdateScope("");
      toast.error("Status update failed", error.message || "Please try again.");
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        eligibleIdSet.has(order.id) ? { ...order, status: nextStatus } : order
      )
    );

    setSelectedOrderIds((currentIds) =>
      currentIds.filter((orderId) => !eligibleIdSet.has(orderId))
    );

    setUpdatingIds([]);
    setPendingStatusAction("");
    setUpdateScope("");

    if (eligibleOrderIds.length === 1) {
      toast.success(
        "Order updated",
        `Order ${eligibleOrderIds[0]} was marked as ${getStatusLabel(
          nextStatus
        ).toLowerCase()}.`
      );
      return;
    }

    toast.success(
      "Orders updated",
      `${eligibleOrderIds.length} orders were marked as ${getStatusLabel(
        nextStatus
      ).toLowerCase()}.`
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_34%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                Operations Console
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Review orders, update statuses in bulk, and work through a
                searchable queue designed to stay fast as volume grows.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white/85 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Queue Snapshot
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                {isLoading
                  ? "Loading orders..."
                  : `${summary.pending} pending review`}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {isLoading
                  ? "Preparing dashboard metrics"
                  : `${summary.total} total orders in the system`}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStat
            label="Total"
            value={summary.total}
            tone="border-slate-200 bg-white"
            isLoading={isLoading}
          />
          <DashboardStat
            label="Pending"
            value={summary.pending}
            tone="border-yellow-200 bg-yellow-50"
            isLoading={isLoading}
          />
          <DashboardStat
            label="Accepted"
            value={summary.accepted}
            tone="border-green-200 bg-green-50"
            isLoading={isLoading}
          />
          <DashboardStat
            label="Rejected"
            value={summary.rejected}
            tone="border-red-200 bg-red-50"
            isLoading={isLoading}
          />
        </section>

        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="border-b border-slate-200 px-5 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Orders Table
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Manage orders
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Filter instantly, search by service or address, sort by status
                  or date, and update large batches without leaving the page.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-950">
                  {visibleStartCount}-{visibleEndCount}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-950">
                  {processedOrders.length}
                </span>{" "}
                matching orders
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((filter) => {
                  const count =
                    filter.value === "all"
                      ? summary.total
                      : summary[filter.value];

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      aria-pressed={activeFilter === filter.value}
                      disabled={isUpdating}
                      onClick={() => handleFilterChange(filter.value)}
                      className={getFilterButtonClasses(
                        filter.value,
                        activeFilter === filter.value
                      )}
                    >
                      {filter.label}
                      <span className="text-xs font-semibold">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_168px_124px]">
                <label className="relative block">
                  <span className="sr-only">Search orders</span>
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </span>

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search service or address"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-200/70"
                  />

                  <span className="absolute inset-y-0 right-3 flex items-center">
                    {isFilteringResults ? (
                      <LoadingSpinner size="sm" />
                    ) : searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(1);
                          setSelectedOrderIds([]);
                        }}
                        className="rounded-full px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        Clear
                      </button>
                    ) : null}
                  </span>
                </label>

                <label className="relative block">
                  <span className="sr-only">Sort orders</span>
                  <select
                    value={sortOption}
                    disabled={isUpdating}
                    onChange={(event) => {
                      setSortOption(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-200/70"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="m7 10 5 5 5-5" />
                    </svg>
                  </span>
                </label>

                <label className="relative block">
                  <span className="sr-only">Rows per page</span>
                  <select
                    value={pageSize}
                    disabled={isUpdating}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-200/70"
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option} / page
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="m7 10 5 5 5-5" />
                    </svg>
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-950">
                    {selectedOrderIds.length}
                  </span>{" "}
                  selected across the table
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Page {resolvedCurrentPage} of {totalPages}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  disabled={selectedAcceptableCount === 0 || isUpdating}
                  onClick={() =>
                    applyStatusUpdate(selectedOrderIds, "accepted", "bulk")
                  }
                  className="inline-flex min-w-[148px] items-center justify-center rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300 disabled:shadow-none"
                >
                  {updateScope === "bulk" &&
                  pendingStatusAction === "accepted" ? (
                    <span className="inline-flex items-center gap-2">
                      <LoadingSpinner size="sm" tone="light" />
                      Accepting...
                    </span>
                  ) : (
                    `Accept Selected (${selectedAcceptableCount})`
                  )}
                </button>

                <button
                  type="button"
                  disabled={selectedRejectableCount === 0 || isUpdating}
                  onClick={() =>
                    applyStatusUpdate(selectedOrderIds, "rejected", "bulk")
                  }
                  className="inline-flex min-w-[148px] items-center justify-center rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none"
                >
                  {updateScope === "bulk" &&
                  pendingStatusAction === "rejected" ? (
                    <span className="inline-flex items-center gap-2">
                      <LoadingSpinner size="sm" tone="light" />
                      Rejecting...
                    </span>
                  ) : (
                    `Reject Selected (${selectedRejectableCount})`
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            {isLoading ? (
              <div className="flex min-h-[28rem] items-center justify-center rounded-[28px] border border-slate-200 bg-slate-50">
                <div className="flex flex-col items-center gap-3 text-sm text-slate-600">
                  <LoadingSpinner size="lg" />
                  <p>Loading dashboard data...</p>
                </div>
              </div>
            ) : processedOrders.length === 0 ? (
              <EmptyState
                title={
                  summary.total === 0 ? "No orders yet" : "No matching orders"
                }
                description={
                  summary.total === 0
                    ? "New booking requests will appear here once customers place an order."
                    : "Try clearing the search or switching filters to see more orders."
                }
                actionLabel={
                  summary.total > 0 &&
                  (activeFilter !== "all" ||
                    searchQuery ||
                    sortOption !== "date-desc")
                    ? "Reset view"
                    : ""
                }
                onAction={
                  summary.total > 0 &&
                  (activeFilter !== "all" ||
                    searchQuery ||
                    sortOption !== "date-desc")
                    ? resetSearchAndFilters
                    : undefined
                }
              />
            ) : (
              <div className="overflow-hidden rounded-[28px] border border-slate-200">
                <div className="max-h-[58vh] overflow-auto">
                  <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left">
                    <thead className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur">
                      <tr>
                        <th className="sticky left-0 z-30 border-b border-slate-200 bg-slate-50/95 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          <TableCheckbox
                            checked={allVisibleSelected}
                            indeterminate={someVisibleSelected}
                            disabled={isUpdating || paginatedOrders.length === 0}
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
                      {paginatedOrders.map((order) => {
                        const normalizedStatus = normalizeStatus(order.status);
                        const isSelected = selectedOrderIds.includes(order.id);
                        const isRowUpdating = updatingIds.includes(order.id);

                        return (
                          <tr
                            key={order.id}
                            className="group transition-colors duration-200 hover:bg-slate-50"
                          >
                            <td className="sticky left-0 z-10 border-b border-slate-100 bg-white px-4 py-3 align-top group-hover:bg-slate-50">
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

                            <td className="border-b border-slate-100 px-4 py-3 align-top">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-950">
                                  {order.service_id || "Unknown service"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  Order #{order.id}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatOrderDate(order)}
                                </p>
                              </div>
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3 align-top">
                              <div className="max-w-xl space-y-1">
                                <p className="text-sm leading-6 text-slate-700">
                                  {order.address || "No address provided"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {order.mobile_number ||
                                    "Mobile number not provided"}
                                </p>
                              </div>
                            </td>

                            <td className="border-b border-slate-100 px-4 py-3 align-top">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                                  order.status
                                )}`}
                              >
                                {getStatusLabel(order.status)}
                              </span>
                            </td>

                            <td className="sticky right-0 z-10 border-b border-slate-100 bg-white px-4 py-3 align-top group-hover:bg-slate-50">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={
                                    isUpdating || normalizedStatus === "accepted"
                                  }
                                  onClick={() =>
                                    applyStatusUpdate(
                                      [order.id],
                                      "accepted",
                                      "single"
                                    )
                                  }
                                  className={`inline-flex min-w-[88px] items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:shadow-none ${
                                    normalizedStatus === "accepted"
                                      ? "border border-green-200 bg-green-50 text-green-700"
                                      : "bg-green-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-green-700 disabled:bg-green-300"
                                  }`}
                                >
                                  {isRowUpdating &&
                                  pendingStatusAction === "accepted" ? (
                                    <span className="inline-flex items-center gap-2">
                                      <LoadingSpinner size="sm" tone="light" />
                                      Saving...
                                    </span>
                                  ) : normalizedStatus === "accepted" ? (
                                    "Accepted"
                                  ) : (
                                    "Accept"
                                  )}
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    isUpdating || normalizedStatus === "rejected"
                                  }
                                  onClick={() =>
                                    applyStatusUpdate(
                                      [order.id],
                                      "rejected",
                                      "single"
                                    )
                                  }
                                  className={`inline-flex min-w-[88px] items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:shadow-none ${
                                    normalizedStatus === "rejected"
                                      ? "border border-red-200 bg-red-50 text-red-700"
                                      : "bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700 disabled:bg-red-300"
                                  }`}
                                >
                                  {isRowUpdating &&
                                  pendingStatusAction === "rejected" ? (
                                    <span className="inline-flex items-center gap-2">
                                      <LoadingSpinner size="sm" tone="light" />
                                      Saving...
                                    </span>
                                  ) : normalizedStatus === "rejected" ? (
                                    "Rejected"
                                  ) : (
                                    "Reject"
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    Page{" "}
                    <span className="font-semibold text-slate-950">
                      {resolvedCurrentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-950">
                      {totalPages}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={resolvedCurrentPage === 1}
                      onClick={() =>
                        setCurrentPage(Math.max(1, resolvedCurrentPage - 1))
                      }
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={resolvedCurrentPage === totalPages}
                      onClick={() =>
                        setCurrentPage(
                          Math.min(totalPages, resolvedCurrentPage + 1)
                        )
                      }
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
