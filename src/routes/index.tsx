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
  }, [selectedCity])

  const impactItems =
    aqiReport?.assessment.lifeImpact ??
    (selectedCity
      ? ['Loading live health-impact guidance for your selected city.']
      : ['Select a city to see how current AQI can affect daily life.'])

  const actionItems =
    aqiReport?.assessment.recommendedActions ??
    (selectedCity
      ? ['Loading recommended protective actions...']
      : ['Select a city to get personalized AQI safety actions.'])

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
              {isAqiLoading ? '...' : aqiReport ? aqiReport.usAqi : '--'}
            </p>
            <p className="mb-1 text-sm text-[var(--sea-ink-soft)]">US AQI</p>
          </div>

          {!selectedCity ? (
            <p className="mt-4 inline-flex rounded-full border border-[rgba(79,184,178,0.32)] bg-[rgba(79,184,178,0.12)] px-3 py-1 text-sm font-semibold text-[var(--sea-ink)]">
              Awaiting city selection
            </p>
          ) : null}

          {selectedCity && isAqiLoading ? (
            <p className="mt-4 inline-flex rounded-full border border-[rgba(79,184,178,0.32)] bg-[rgba(79,184,178,0.12)] px-3 py-1 text-sm font-semibold text-[var(--sea-ink)]">
              Loading live AQI...
            </p>
          ) : null}

          {selectedCity && aqiError ? (
            <p className="mt-4 inline-flex rounded-full border border-[rgba(177,59,59,0.34)] bg-[rgba(177,59,59,0.14)] px-3 py-1 text-sm font-semibold text-[#7b1f1f]">
              AQI fetch failed
            </p>
          ) : null}

          {aqiReport ? (
            <p
              className={`mt-4 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${BADGE_CLASS_BY_BAND[aqiReport.assessment.band]}`}
            >
              {aqiReport.assessment.band} · {aqiReport.assessment.safeVerdict}
            </p>
          ) : null}

          <p className="mt-4 text-sm leading-7 text-[var(--sea-ink-soft)]">
            {aqiError
              ? aqiError
              : aqiReport
                ? `${aqiReport.assessment.summary} Primary pollutant: ${aqiReport.primaryPollutant}.`
                : 'Select a city to get real-time AQI and health guidance.'}
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="island-shell rounded-3xl p-5 sm:p-7">
          <p className="island-kicker mb-3">How It Affects Daily Life</p>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--sea-ink-soft)]">
            {impactItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="island-shell rounded-3xl p-5 sm:p-7">
          <p className="island-kicker mb-3">What You Should Do</p>
          <ol className="m-0 list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--sea-ink-soft)]">
            {actionItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  )
}
