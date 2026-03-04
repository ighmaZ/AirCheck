import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap aqi-page px-4 pb-12 pt-12">
      <section className="aqi-hero island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.3),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(44,154,120,0.24),transparent_66%)]" />
        <p className="island-kicker mb-3">Live city air quality briefing</p>
        <h1 className="display-title mb-4 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Know your city&apos;s air risk before you step outside.
        </h1>
        <p className="max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Search your city, check the current AQI, and get practical guidance on
          whether it is safe and what precautions to take.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="island-shell rounded-3xl p-5 sm:p-7">
          <p className="island-kicker mb-2">City Search</p>
          <h2 className="mb-4 text-2xl font-semibold text-[var(--sea-ink)]">
            Where do you live?
          </h2>
          <label htmlFor="city-search" className="sr-only">
            Search your city
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="city-search"
              name="city-search"
              type="text"
              placeholder="Type your city name"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-3 text-base text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(27,62,58,0.08)] outline-none ring-[rgba(50,143,151,0.3)] transition placeholder:text-[var(--sea-ink-soft)] focus:ring-2"
            />
            <button
              type="button"
              className="rounded-2xl border border-[rgba(44,154,120,0.35)] bg-[rgba(44,154,120,0.18)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5 hover:bg-[rgba(44,154,120,0.28)]"
            >
              Check AQI
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {['New York, US', 'Delhi, IN', 'London, GB', 'Sydney, AU'].map(
              (city) => (
                <button
                  key={city}
                  type="button"
                  className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5 text-sm text-[var(--sea-ink-soft)] transition hover:border-[rgba(50,143,151,0.35)] hover:text-[var(--sea-ink)]"
                >
                  {city}
                </button>
              ),
            )}
          </div>
        </article>

        <article className="aqi-status-card island-shell rounded-3xl p-5 sm:p-7">
          <p className="island-kicker mb-2">Current Reading</p>
          <p className="text-sm text-[var(--sea-ink-soft)]">New York, US</p>
          <div className="mt-5 flex items-end gap-3">
            <p className="m-0 text-6xl leading-none font-bold text-[var(--sea-ink)]">
              86
            </p>
            <p className="mb-1 text-sm text-[var(--sea-ink-soft)]">US AQI</p>
          </div>
          <p className="mt-4 inline-flex rounded-full border border-[rgba(219,146,45,0.34)] bg-[rgba(219,146,45,0.14)] px-3 py-1 text-sm font-semibold text-[#8a5b1f]">
            Moderate · Generally safe
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--sea-ink-soft)]">
            Air quality is acceptable for most people. Sensitive individuals may
            experience minor irritation with prolonged outdoor exertion.
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="island-shell rounded-3xl p-5 sm:p-7">
          <p className="island-kicker mb-3">How It Affects Daily Life</p>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--sea-ink-soft)]">
            <li>Outdoor workouts may feel slightly more strenuous than usual.</li>
            <li>People with asthma can experience mild symptoms outdoors.</li>
            <li>
              Indoor comfort remains good if windows stay closed during traffic
              peaks.
            </li>
          </ul>
        </article>

        <article className="island-shell rounded-3xl p-5 sm:p-7">
          <p className="island-kicker mb-3">What You Should Do</p>
          <ol className="m-0 list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--sea-ink-soft)]">
            <li>Limit prolonged high-intensity outdoor activity.</li>
            <li>Prefer parks or lower-traffic routes for evening walks.</li>
            <li>Keep rescue medication available if you are respiratory-sensitive.</li>
            <li>Recheck AQI in a few hours before long outdoor exposure.</li>
          </ol>
        </article>
      </section>
    </main>
  )
}
