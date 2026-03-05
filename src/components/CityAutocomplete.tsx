import { useEffect, useId, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchCities } from '../server/cities'

export type CitySuggestion = {
  id: string
  name: string
  state?: string
  country: string
  lat: number
  lon: number
  label: string
}

type CityAutocompleteProps = {
  onSelect: (city: CitySuggestion) => void
}

export default function CityAutocomplete({ onSelect }: CityAutocompleteProps) {
  const listboxId = useId()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hasUserTypedSinceSelection, setHasUserTypedSinceSelection] =
    useState(true)

  const trimmedQuery = query.trim()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(trimmedQuery)
    }, 260)

    return () => {
      window.clearTimeout(timer)
    }
  }, [trimmedQuery])

  const citiesQuery = useQuery({
    queryKey: ['city-search', debouncedQuery],
    queryFn: () =>
      searchCities({
        data: {
          query: debouncedQuery,
        },
      }),
    enabled: debouncedQuery.length >= 2 && hasUserTypedSinceSelection,
    retry: false,
  })

  const results = citiesQuery.data ?? []
  const fetchError = citiesQuery.error
    ? citiesQuery.error instanceof Error
      ? citiesQuery.error.message
      : 'Unable to load cities right now. Please try again.'
    : null
  const isLoading =
    trimmedQuery.length >= 2 &&
    hasUserTypedSinceSelection &&
    (trimmedQuery !== debouncedQuery || citiesQuery.isFetching)

  const activeId = useMemo(() => {
    if (!isOpen || activeIndex < 0 || activeIndex >= results.length) {
      return undefined
    }

    return `${listboxId}-option-${results[activeIndex].id}`
  }, [activeIndex, isOpen, listboxId, results])

  useEffect(() => {
    if (!hasUserTypedSinceSelection) {
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }

    if (trimmedQuery.length < 2) {
      setIsOpen(trimmedQuery.length > 0)
      setActiveIndex(-1)
      return
    }

    setIsOpen(true)
  }, [trimmedQuery, hasUserTypedSinceSelection])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setActiveIndex((current) => {
      if (results.length === 0) {
        return -1
      }

      if (current >= 0 && current < results.length) {
        return current
      }

      return 0
    })
  }, [results, isOpen])

  function handleSelect(city: CitySuggestion) {
    setHasUserTypedSinceSelection(false)
    setQuery(city.label)
    setDebouncedQuery(city.label.trim())
    setIsOpen(false)
    setActiveIndex(-1)
    onSelect(city)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((current) => {
        if (results.length === 0) {
          return -1
        }
        if (current >= results.length - 1) {
          return 0
        }
        return current + 1
      })
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((current) => {
        if (results.length === 0) {
          return -1
        }
        if (current <= 0) {
          return results.length - 1
        }
        return current - 1
      })
      return
    }

    if (
      event.key === 'Enter' &&
      isOpen &&
      activeIndex >= 0 &&
      activeIndex < results.length
    ) {
      event.preventDefault()
      handleSelect(results[activeIndex])
    }
  }

  return (
    <div className="relative">
      <label htmlFor="city-search" className="sr-only">
        Search your city
      </label>
      <input
        id="city-search"
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setHasUserTypedSinceSelection(true)
          setQuery(event.target.value)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (hasUserTypedSinceSelection && query.trim().length >= 2) {
            setIsOpen(true)
          }
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setIsOpen(false)
            setActiveIndex(-1)
          }, 120)
        }}
        placeholder="Enter your city"
        className="w-full rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-3 text-base text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(27,62,58,0.08)] outline-none ring-[rgba(50,143,151,0.3)] transition placeholder:text-[var(--sea-ink-soft)] focus:ring-2"
      />

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-2 shadow-[0_18px_34px_rgba(23,58,64,0.15)]"
        >
          {query.trim().length < 2 ? (
            <p className="m-0 rounded-xl px-3 py-2 text-sm text-[var(--sea-ink-soft)]">
              Keep typing to search global cities.
            </p>
          ) : null}

          {isLoading ? (
            <p className="m-0 rounded-xl px-3 py-2 text-sm text-[var(--sea-ink-soft)]">
              Loading global city suggestions...
            </p>
          ) : null}

          {!isLoading && fetchError ? (
            <p className="m-0 rounded-xl px-3 py-2 text-sm text-[var(--sea-ink-soft)]">
              {fetchError}
            </p>
          ) : null}

          {!isLoading && !fetchError && query.trim().length >= 2 && results.length === 0 ? (
            <p className="m-0 rounded-xl px-3 py-2 text-sm text-[var(--sea-ink-soft)]">
              No matching cities found.
            </p>
          ) : null}

          {!isLoading && !fetchError
            ? results.map((city, index) => {
                const isActive = index === activeIndex
                return (
                  <button
                    key={city.id}
                    id={`${listboxId}-option-${city.id}`}
                    role="option"
                    aria-selected={isActive}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault()
                    }}
                    onClick={() => {
                      handleSelect(city)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? 'bg-[rgba(79,184,178,0.22)] text-[var(--sea-ink)]'
                        : 'text-[var(--sea-ink-soft)] hover:bg-[rgba(79,184,178,0.14)] hover:text-[var(--sea-ink)]'
                    }`}
                  >
                    <span>{city.label}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--kicker)]">
                      {city.country}
                    </span>
                  </button>
                )
              })
            : null}
        </div>
      ) : null}
    </div>
  )
}
