"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../components/ToastProvider";
import { supabase } from "../../lib/supabaseClient";

function getServiceMeta(name = "") {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("wash")) {
    return {
      gradient: "from-sky-500 to-cyan-400",
      bg: "bg-sky-50",
      border: "border-sky-100",
      description: "Fresh cleaning for everyday wear and routine laundry loads.",
    };
  }

  if (normalizedName.includes("iron")) {
    return {
      gradient: "from-amber-500 to-orange-400",
      bg: "bg-amber-50",
      border: "border-amber-100",
      description: "Smooth pressing for crisp shirts, uniforms, and special outfits.",
    };
  }

  if (normalizedName.includes("dry")) {
    return {
      gradient: "from-emerald-500 to-green-400",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      description: "Gentle care for delicate fabrics, suits, and premium garments.",
    };
  }

  return {
    gradient: "from-slate-500 to-slate-400",
    bg: "bg-slate-100",
    border: "border-slate-200",
    description: "Professional laundry care with reliable pickup and tracking.",
  };
}

function ServiceIcon({ name = "", className = "h-6 w-6" }) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("wash")) {
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
        <path d="M7 18a3 3 0 1 0 0-6c-1.8 0-3 1.5-3 3.2A2.8 2.8 0 0 0 7 18Z" />
        <path d="M14 20a4 4 0 1 0 0-8c-2.3 0-4 1.9-4 4.1A3.7 3.7 0 0 0 14 20Z" />
        <path d="M18 16a2.5 2.5 0 1 0 0-5c-1.4 0-2.5 1.1-2.5 2.5S16.6 16 18 16Z" />
        <path d="M7 7c.7-1.9 1.9-3 3.6-3 1.6 0 2.7.8 3.4 2.4" />
      </svg>
    );
  }

  if (normalizedName.includes("iron")) {
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
        <path d="M5 16h11.5a2.5 2.5 0 0 0 2.3-3.5L16.5 7H8.8L5 16Z" />
        <path d="M8.8 7V5h5.4v2" />
        <path d="M9 12h6" />
        <path d="M6 19h12" />
      </svg>
    );
  }

  if (normalizedName.includes("dry")) {
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
        <path d="M12 6a2.5 2.5 0 1 0-2.5-2.5" />
        <path d="M9.5 3.5H12a3 3 0 0 1 3 3v.4l5 3.8" />
        <path d="m5 11 7 6 7-6" />
        <path d="M7 12.7V18h10v-5.3" />
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
      <rect x="4" y="7" width="16" height="11" rx="2" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
      <path d="M8 7V5h8v2" />
    </svg>
  );
}

export default function Book() {
  const [services, setServices] = useState([]);
  const [service, setService] = useState("");
  const [address, setAddress] = useState("");
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  async function getServices() {
    const { data, error } = await supabase.from("services").select("*");
    return { data: data || [], error };
  }

  useEffect(() => {
    let isMounted = true;

    getServices().then(({ data, error }) => {
      if (isMounted) {
        setServices(data);
        setIsLoadingServices(false);

        if (error) {
          toast.error(
            "Unable to load services",
            error.message || "Try refreshing the page."
          );
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const selectedService = services.find((item) => item.name === service) || null;
  const selectedServiceMeta = getServiceMeta(selectedService?.name);

  async function handleSubmit() {
    if (!service || !address.trim()) {
      toast.error(
        "Missing details",
        "Please select a service and enter your address."
      );
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("orders").insert([
      {
        service_id: service,
        address: address.trim(),
      },
    ]);

    if (!error) {
      toast.success(
        "Booking confirmed",
        "Your laundry order was placed successfully."
      );
      setService("");
      setAddress("");
    } else {
      toast.error("Booking failed", error.message || "Please try again.");
    }

    setIsSubmitting(false);
  }

  return (
    <div className="relative overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_28%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="bg-slate-950 px-6 py-8 text-white sm:px-8 sm:py-10">
            <div className="max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
                Booking
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Book Laundry Service
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                Choose a service, confirm your pickup address, and keep the
                process simple from request to delivery.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {isLoadingServices ? (
                <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex flex-col items-center gap-3 text-sm text-slate-300">
                    <LoadingSpinner size="lg" tone="light" />
                    <p>Loading services...</p>
                  </div>
                </div>
              ) : services.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  No services are available right now.
                </div>
              ) : (
                services.map((item) => {
                  const meta = getServiceMeta(item.name);
                  const isSelected = item.name === service;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                        isSelected
                          ? "border-white/30 bg-white/15 translate-x-1"
                          : "border-white/10 bg-white/5 hover:-translate-y-0.5 hover:bg-white/8"
                      }`}
                    >
                      <div
                        className={`rounded-2xl bg-gradient-to-br ${meta.gradient} p-3 text-white shadow-lg shadow-black/20`}
                      >
                        <ServiceIcon name={item.name} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-300">
                          {meta.description}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Price
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          Rs. {item.price}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                Details
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Schedule your next pickup
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Pick a service from the list and enter the address where we
                should collect your laundry.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="service"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Select service
                </label>
                <div className="relative">
                  <select
                    id="service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm transition-all duration-200 hover:border-sky-300 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="">Choose a service</option>
                    {services.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name} - Rs. {item.price}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-4 transition-all duration-300 ${
                  selectedService
                    ? `${selectedServiceMeta.border} ${selectedServiceMeta.bg} shadow-sm`
                    : "border-dashed border-slate-200 bg-slate-50"
                }`}
              >
                {selectedService ? (
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-2xl bg-gradient-to-br ${selectedServiceMeta.gradient} p-3 text-white shadow-lg shadow-slate-300/60`}
                    >
                      <ServiceIcon name={selectedService.name} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-950">
                        {selectedService.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {selectedServiceMeta.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Price
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        Rs. {selectedService.price}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    Select a service to see its icon and price summary here.
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Pickup address
                </label>
                <div className="relative">
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
                    placeholder="Enter pickup address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm transition-all duration-200 hover:border-sky-300 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !service || !address.trim()}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner size="sm" tone="light" />
                    Booking...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
