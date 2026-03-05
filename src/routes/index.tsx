import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import CityAutocomplete, {
  type CitySuggestion,
} from '../components/CityAutocomplete'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null)

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

          <CityAutocomplete
            onSelect={(city) => {
              setSelectedCity(city)
            }}
          />

          <p className="mt-4 text-sm text-[var(--sea-ink-soft)]">
            Selected city:{' '}
            <span className="font-semibold text-[var(--sea-ink)]">
              {selectedCity ? selectedCity.label : 'No city selected yet'}
            </span>
          </p>
        </article>

        <article className="aqi-status-card island-shell rounded-3xl p-5 sm:p-7">
          <p className="island-kicker mb-2">Current Reading</p>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            {selectedCity ? selectedCity.label : 'Select a city to view AQI'}
          </p>
          <div className="mt-5 flex items-end gap-3">
            <p className="m-0 text-6xl leading-none font-bold text-[var(--sea-ink)]">
              --
            </p>
            <p className="mb-1 text-sm text-[var(--sea-ink-soft)]">US AQI</p>
          </div>
          <p className="mt-4 inline-flex rounded-full border border-[rgba(79,184,178,0.32)] bg-[rgba(79,184,178,0.12)] px-3 py-1 text-sm font-semibold text-[var(--sea-ink)]">
            Awaiting live AQI data
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--sea-ink-soft)]">
            City selection is now powered by global live data. AQI fetching and
            health analysis will be wired in the next step.
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
