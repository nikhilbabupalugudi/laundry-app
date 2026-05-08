import Link from "next/link";

const services = [
  {
    id: "washing",
    name: "Washing",
    price: "Rs. 50",
    description: "Fresh everyday cleaning for regular clothes and weekly loads.",
    accent: "from-sky-500 to-cyan-400",
    cardBg: "bg-sky-50",
    cardBorder: "border-sky-200",
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
  },
  {
    id: "ironing",
    name: "Ironing",
    price: "Rs. 10",
    description: "Neat, wrinkle-free finishing for shirts, uniforms, and office wear.",
    accent: "from-amber-500 to-orange-400",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-200",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
  },
  {
    id: "dry-cleaning",
    name: "Dry Cleaning",
    price: "Rs. 100",
    description: "Careful treatment for delicate fabrics, suits, and premium garments.",
    accent: "from-emerald-500 to-green-400",
    cardBg: "bg-emerald-50",
    cardBorder: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
  },
];

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

export default function Home() {
  return (
    <div className="bg-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_28%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
              Fast pickup. Clean finish. Simple booking.
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Laundry Service App
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Book your laundry pickup in minutes, track your order clearly, and
              keep weekly care simple from one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-600"
              >
                Book Now
              </Link>

              <Link
                href="/orders"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
              >
                Track Orders
              </Link>
            </div>
          </div>

          <div className="w-full">
            <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/80 sm:p-6">
              <div className="rounded-[28px] bg-slate-950 p-6 text-white sm:p-7">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-200">
                  Laundry App
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                  Cleaner routines, better visibility
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                  Manage bookings, order status, and service choices with one
                  consistent experience across every page.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Services
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">3</p>
                  <p className="mt-1 text-sm text-slate-600">Washing, ironing, and dry cleaning.</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-700/70">
                    Starting At
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">Rs. 10</p>
                  <p className="mt-1 text-sm text-slate-600">Affordable care for regular weekly use.</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700/70">
                    Tracking
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">Live</p>
                  <p className="mt-1 text-sm text-slate-600">Check accepted, pending, or rejected orders.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
            Services
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            The same service language used across booking
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            We kept the home page aligned with the booking flow so service
            choices feel familiar before you even place an order.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className={`group rounded-[28px] border ${service.cardBorder} ${service.cardBg} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${service.iconBg} ${service.iconText}`}
              >
                <ServiceIcon serviceId={service.id} />
              </div>

              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200">
                  {service.price}
                </span>
              </div>

              <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/70">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${service.accent} transition-transform duration-300 group-hover:translate-x-1`}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
