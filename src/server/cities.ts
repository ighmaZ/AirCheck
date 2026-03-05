import { createServerFn } from '@tanstack/react-start'
import type { CitySuggestion } from '../components/CityAutocomplete'

type SearchCitiesInput = {
  query: string
}

type OpenWeatherCity = {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}

function getApiKey() {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is not configured.')
  }
  return apiKey
}

function toCitySuggestion(city: OpenWeatherCity): CitySuggestion {
  const label = city.state
    ? `${city.name}, ${city.state}, ${city.country}`
    : `${city.name}, ${city.country}`

  return {
    id: `${city.name}-${city.country}-${city.lat}-${city.lon}`.toLowerCase(),
    name: city.name,
    state: city.state,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
    label,
  }
}

export const searchCities = createServerFn({ method: 'GET' })
  .inputValidator((input: SearchCitiesInput) => {
    return {
      query: input.query.trim(),
    }
  })
  .handler(async ({ data }) => {
    if (data.query.length < 2) {
      return [] as CitySuggestion[]
    }

    const apiKey = getApiKey()
    const params = new URLSearchParams({
      q: data.query,
      limit: '10',
      appid: apiKey,
    })

    let response: Response
    try {
      response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        },
      )
    } catch {
      throw new Error(
        'Unable to reach OpenWeather right now. Check your network and try again.',
      )
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          'OpenWeather API key is invalid. Update OPENWEATHER_API_KEY and restart the dev server.',
        )
      }

      if (response.status === 429) {
        throw new Error(
          'OpenWeather rate limit reached. Please wait a moment and try again.',
        )
      }

      throw new Error(
        `City lookup failed with OpenWeather status ${response.status}.`,
      )
    }

    const cities = (await response.json()) as OpenWeatherCity[]

    return cities.map(toCitySuggestion)
  })
