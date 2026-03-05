import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import CityAutocomplete, {
  type CitySuggestion,
} from '../components/CityAutocomplete'
import type { AqiBand } from '../lib/aqi'
import { getCityAqi, type CityAqiReport } from '../server/aqi'

export const Route = createFileRoute('/')({ component: App })

const BADGE_CLASS_BY_BAND: Record<AqiBand, string> = {
  Good: 'border-[rgba(47,143,97,0.34)] bg-[rgba(47,143,97,0.13)] text-[#20593f]',
  Moderate:
    'border-[rgba(164,106,29,0.34)] bg-[rgba(164,106,29,0.14)] text-[#74460e]',
  'Unhealthy for Sensitive Groups':
    'border-[rgba(180,90,13,0.34)] bg-[rgba(180,90,13,0.14)] text-[#7b3901]',
  Unhealthy:
    'border-[rgba(177,59,59,0.34)] bg-[rgba(177,59,59,0.14)] text-[#7b1f1f]',
  'Very Unhealthy':
    'border-[rgba(122,60,165,0.34)] bg-[rgba(122,60,165,0.14)] text-[#5e2f82]',
  Hazardous:
    'border-[rgba(111,30,40,0.34)] bg-[rgba(111,30,40,0.14)] text-[#5e1d2b]',
}

function App() {
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null)
  const [aqiReport, setAqiReport] = useState<CityAqiReport | null>(null)
  const [aqiError, setAqiError] = useState<string | null>(null)
  const [isAqiLoading, setIsAqiLoading] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    if (!selectedCity) {
      setAqiReport(null)
      setAqiError(null)
      setIsAqiLoading(false)
      return
    }

    let active = true
    setIsAqiLoading(true)
    setAqiError(null)

    getCityAqi({
      data: {
        lat: selectedCity.lat,
        lon: selectedCity.lon,
        cityLabel: selectedCity.label,
      },
    })
      .then((report) => {
        if (!active) {
          return
        }

        setAqiReport(report)
      })
      .catch((error) => {
        if (!active) {
          return
        }

        setAqiReport(null)
        setAqiError(
          error instanceof Error
            ? error.message
            : 'Unable to load AQI data for this city.',
        )
      })
      .finally(() => {
        if (active) {
          setIsAqiLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedCity, refreshToken])

  const isSearchOnlyView = !selectedCity

  return (
    <main
      className={`page-wrap aqi-page px-4 pb-12 pt-12 ${
        isSearchOnlyView ? 'aqi-search-mode' : ''
      }`}
    >
      <section
        className={`aqi-hero island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12 ${
          isSearchOnlyView ? 'text-center' : ''
        }`}
      >
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.3),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(44,154,120,0.24),transparent_66%)]" />
        <p className="island-kicker mb-3">AirCheck AQI Risk Advisor</p>
        <h1 className="display-title mb-4 text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Understand how dangerous your city&apos;s air is right now.
        </h1>
        <p
          className={`text-base text-[var(--sea-ink-soft)] sm:text-lg ${
            isSearchOnlyView ? 'mx-auto max-w-2xl' : 'max-w-3xl'
          }`}
        >
          This is not a generic weather screen. It gives severity, health impact,
          urgency level, and what actions matter most right now.
        </p>
      </section>

      <section className="mx-auto mt-8 w-full max-w-2xl">
        <article className="island-shell rounded-3xl p-6 sm:p-8">
          <p className="island-kicker mb-2 text-center">City Search</p>
          <h2 className="mb-4 text-center text-2xl font-semibold text-[var(--sea-ink)] sm:text-3xl">
            Enter your city to generate a live AQI risk briefing
          </h2>

          <div className="mx-auto w-full max-w-xl">
            <CityAutocomplete
              onSelect={(city) => {
                setSelectedCity(city)
                setAqiReport(null)
                setAqiError(null)
              }}
            />
          </div>

          <p className="mt-4 text-center text-sm text-[var(--sea-ink-soft)]">
            {selectedCity
              ? `Selected city: ${selectedCity.label}`
              : 'Start typing to search all global cities.'}
          </p>
        </article>
      </section>

      {selectedCity && isAqiLoading ? (
        <section className="mx-auto mt-8 w-full max-w-3xl">
          <article className="island-shell rounded-3xl p-6 text-center sm:p-8">
            <p className="text-4xl">🔎</p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--sea-ink)]">
              Building your AQI report...
            </h3>
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
              We are fetching live pollution data and computing severity guidance.
            </p>
          </article>
        </section>
      ) : null}

      {selectedCity && aqiError ? (
        <section className="mx-auto mt-8 w-full max-w-3xl">
          <article className="island-shell rounded-3xl p-6 text-center sm:p-8">
            <p className="text-4xl">⚠️</p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--sea-ink)]">
              AQI data unavailable
            </h3>
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{aqiError}</p>
            <button
              type="button"
              onClick={() => {
                setRefreshToken((value) => value + 1)
              }}
              className="mt-4 rounded-2xl border border-[rgba(44,154,120,0.35)] bg-[rgba(44,154,120,0.18)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5 hover:bg-[rgba(44,154,120,0.28)]"
            >
              Retry AQI Fetch
            </button>
          </article>
        </section>
      ) : null}

      {aqiReport ? (
        <>
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="aqi-status-card island-shell rounded-3xl p-6 sm:p-8">
              <p className="island-kicker mb-2">Current AQI Severity</p>
              <p className="text-sm text-[var(--sea-ink-soft)]">{aqiReport.cityLabel}</p>
              <div className="mt-4 flex items-end gap-3">
                <p className="m-0 text-6xl leading-none font-bold text-[var(--sea-ink)]">
                  {aqiReport.usAqi}
                </p>
                <p className="mb-1 text-sm text-[var(--sea-ink-soft)]">US AQI</p>
              </div>

              <p
                className={`mt-4 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${BADGE_CLASS_BY_BAND[aqiReport.assessment.band]}`}
              >
                {aqiReport.assessment.band} · {aqiReport.assessment.safeVerdict}
              </p>

              <p className="mt-3 text-sm font-semibold text-[var(--sea-ink)]">
                Severity Level: {aqiReport.assessment.severityLabel}
              </p>

              <div className="mt-4 flex gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <span
                    key={`risk-step-${index}`}
                    className={`h-2 flex-1 rounded-full ${
                      index < aqiReport.assessment.dangerScore
                        ? 'bg-[var(--lagoon-deep)]'
                        : 'bg-[rgba(23,58,64,0.14)]'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <p className="mt-4 text-sm leading-7 text-[var(--sea-ink-soft)]">
                {aqiReport.assessment.summary}
              </p>
            </article>

            <article className="island-shell rounded-3xl p-6 sm:p-8">
              <p className="island-kicker mb-2">AQI Persona</p>
              <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4 text-center">
                <p className="text-5xl leading-none">{aqiReport.assessment.persona.emoji}</p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--sea-ink)]">
                  {aqiReport.assessment.persona.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                  {aqiReport.assessment.persona.tone}
                </p>
              </div>

              <p className="mt-4 text-sm leading-7 text-[var(--sea-ink-soft)]">
                {aqiReport.assessment.importanceNote}
              </p>
              <p className="mt-3 text-sm leading-7 font-semibold text-[var(--sea-ink)]">
                Immediate Outlook: {aqiReport.assessment.immediateWindow}
              </p>
              <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
                Primary pollutant now: <strong>{aqiReport.primaryPollutant}</strong>
              </p>
            </article>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <article className="island-shell rounded-3xl p-6">
              <p className="island-kicker mb-3">How Pollution Affects Your Day</p>
              <ul className="m-0 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--sea-ink-soft)]">
                {aqiReport.assessment.lifeImpact.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="island-shell rounded-3xl p-6">
              <p className="island-kicker mb-3">What You Should Do Now</p>
              <ol className="m-0 list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--sea-ink-soft)]">
                {aqiReport.assessment.recommendedActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </article>

            <article className="island-shell rounded-3xl p-6">
              <p className="island-kicker mb-3">Sensitive Group Advisory</p>
              <ul className="m-0 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--sea-ink-soft)]">
                {aqiReport.assessment.sensitiveGroupAdvice.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>
        </>
      ) : null}
    </main>
  )
}
