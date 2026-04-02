"use client";

import { useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../components/ToastProvider";
import { supabase } from "../../lib/supabaseClient";

const SERVICE_OPTIONS = [
  {
    id: "washing",
    name: "Washing",
    price: 50,
    description: "Fresh everyday cleaning for regular clothes and weekly loads.",
    accent: "from-sky-500 to-cyan-400",
    cardBg: "bg-sky-50",
    cardBorder: "border-sky-200",
    ring: "ring-sky-200",
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
    badge: "bg-sky-100 text-sky-800",
  },
  {
    id: "ironing",
    name: "Ironing",
    price: 10,
    description: "Neat, wrinkle-free finishing for shirts, uniforms, and office wear.",
    accent: "from-amber-500 to-orange-400",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-200",
    ring: "ring-amber-200",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    badge: "bg-amber-100 text-amber-800",
  },
  {
    id: "dry-cleaning",
    name: "Dry Cleaning",
    price: 100,
    description: "Careful treatment for delicate fabrics, suits, and premium garments.",
    accent: "from-emerald-500 to-green-400",
    cardBg: "bg-emerald-50",
    cardBorder: "border-emerald-200",
    ring: "ring-emerald-200",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
  },
];

const inputClasses =
  "w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-200/70";

function normalizeMobileNumber(value = "") {
  return value.replace(/\D/g, "");
}

function isValidMobileNumber(value = "") {
  const normalizedValue = normalizeMobileNumber(value);
  return normalizedValue.length >= 10 && normalizedValue.length <= 15;
}

function ServiceIcon({ serviceId, className = "h-6 w-6" }) {
  if (serviceId === "washing") {
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

  if (serviceId === "ironing") {
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

function CheckIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function FieldIcon({ children }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
      {children}
    </div>
  );
}

export default function Book() {
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const selectedService =
    SERVICE_OPTIONS.find((option) => option.id === selectedServiceId) || null;

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedAddress = address.trim();
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

    if (!selectedService || !trimmedAddress || !mobileNumber.trim()) {
      toast.error(
        "Missing details",
        "Please choose a service, enter your address, and add a mobile number."
      );
      return;
    }

    if (!isValidMobileNumber(mobileNumber)) {
      toast.error(
        "Invalid mobile number",
        "Enter a valid mobile number with 10 to 15 digits."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("orders").insert([
        {
          service_id: selectedService.name,
          address: trimmedAddress,
          mobile_number: normalizedMobileNumber,
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success(
        "Booking confirmed",
        `${selectedService.name} has been booked successfully.`
      );

      setSelectedServiceId("");
      setAddress("");
      setMobileNumber("");
    } catch (error) {
      toast.error("Booking failed", error.message || "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-center">
        <section className="w-full max-w-4xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600">
              Simple laundry booking
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Book your laundry pickup
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Select a service, add your pickup details, and confirm your booking
              in one clean flow.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Choose a service
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Tap a card to select the laundry service you need.
                  </p>
                </div>
                <span className="hidden text-xs font-medium uppercase tracking-[0.22em] text-slate-400 sm:inline">
                  3 options
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {SERVICE_OPTIONS.map((option) => {
                  const isSelected = option.id === selectedServiceId;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedServiceId(option.id)}
                      aria-pressed={isSelected}
                      className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 ${
                        isSelected
                          ? `${option.cardBg} ${option.cardBorder} ${option.ring} scale-[1.02] shadow-lg shadow-slate-200 ring-2`
                          : "border-slate-200 bg-slate-50/80 hover:-translate-y-1 hover:scale-[1.02] hover:border-slate-300 hover:bg-white hover:shadow-lg"
                      }`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${option.accent}`}
                      />

                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${option.iconBg} ${option.iconText}`}
                        >
                          <ServiceIcon serviceId={option.id} />
                        </div>

                        {isSelected ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${option.badge}`}
                          >
                            <CheckIcon />
                            Selected
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-5 text-xl font-semibold text-slate-950">
                        {option.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {option.description}
                      </p>

                      <div className="mt-6 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                            Price
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-slate-950">
                            ₹{option.price}
                          </p>
                        </div>

                        <span
                          className={`text-sm font-medium transition-colors ${
                            isSelected
                              ? "text-slate-900"
                              : "text-slate-500 group-hover:text-slate-900"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`rounded-3xl border p-5 transition-all duration-300 ${
                selectedService
                  ? `${selectedService.cardBg} ${selectedService.cardBorder}`
                  : "border-dashed border-slate-200 bg-slate-50"
              }`}
            >
              {selectedService ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedService.accent} text-white shadow-lg shadow-slate-200`}
                    >
                      <ServiceIcon
                        serviceId={selectedService.id}
                        className="h-7 w-7"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Selected service
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {selectedService.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {selectedService.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200">
                      ₹{selectedService.price}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium ${selectedService.badge}`}
                    >
                      <CheckIcon />
                      Ready
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <p>Select a service card above to continue with your booking.</p>
                  <span className="font-medium text-slate-400">
                    Your selection will appear here
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-5">
              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Pickup address
                </label>
                <div className="relative">
                  <FieldIcon>
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
                  </FieldIcon>

                  <input
                    id="address"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Enter your pickup address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="mobileNumber"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Mobile number
                </label>
                <div className="relative">
                  <FieldIcon>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                      <path d="M11 17h2" />
                    </svg>
                  </FieldIcon>

                  <input
                    id="mobileNumber"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Enter mobile number"
                    value={mobileNumber}
                    onChange={(event) => setMobileNumber(event.target.value)}
                    className={inputClasses}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  We use this number for booking updates and order tracking.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedService ||
                !address.trim() ||
                !mobileNumber.trim()
              }
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-slate-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner size="sm" tone="light" />
                  Confirming booking...
                </span>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
