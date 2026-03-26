import Link from "next/link";

const services = [
  {
    name: "Washing",
    description: "Fresh everyday cleaning for regular clothes, linens, and mixed loads.",
    accent: "from-sky-500/20 to-cyan-200/40",
  },
  {
    name: "Ironing",
    description: "Crisp finishing for shirts, uniforms, and outfits that need a neat press.",
    accent: "from-amber-500/20 to-orange-200/40",
  },
  {
    name: "Dry Cleaning",
    description: "Careful treatment for delicate fabrics, formal wear, and premium garments.",
    accent: "from-emerald-500/20 to-green-200/40",
  },
];

export default function Home() {
  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_30%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-sky-200 bg-white px-3 py-1 text-sm font-medium text-sky-700 shadow-sm">
              Fast pickup. Clean finish. Simple tracking.
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Laundry Service App
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Book laundry care in minutes, keep orders organized, and get a
              cleaner routine without the usual back-and-forth.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-transform hover:-translate-y-0.5 hover:bg-sky-600"
              >
                Book Now
              </Link>

              <Link
                href="/orders"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Track Orders
              </Link>
            </div>
          </div>

          <div className="w-full lg:max-w-md">
            <div className="rounded-[28px] border border-white/70 bg-white p-5 shadow-xl shadow-slate-200/70">
              <div className="rounded-3xl bg-slate-950 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.28em] text-sky-200">
                  Weekly care
                </p>
                <p className="mt-4 text-3xl font-semibold">Fresh clothes, on schedule</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  From daily wear to delicate items, manage your laundry flow in one
                  place with clear order visibility.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-sky-50 p-4">
                  <p className="font-semibold text-slate-900">Same-day support</p>
                  <p className="mt-1 text-slate-600">Quick updates on active orders.</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="font-semibold text-slate-900">Status tracking</p>
                  <p className="mt-1 text-slate-600">Accepted, rejected, or in queue.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
            Services
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Laundry care built for everyday convenience
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Choose the service you need and keep the experience simple from
            booking through completion.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.name}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`h-2 bg-gradient-to-r ${service.accent}`} />
              <div className="p-6">
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Premium Care
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">
                  {service.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
                <div className="mt-6 text-sm font-medium text-sky-700 transition-colors group-hover:text-slate-950">
                  Ready to book
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
