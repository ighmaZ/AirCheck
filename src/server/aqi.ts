import { createServerFn } from '@tanstack/react-start'
import { analyzeAqi, computeUsAqiFromComponents } from '../lib/aqi'

type GetCityAqiInput = {
  lat: number
  lon: number
  cityLabel: string
}

type OpenWeatherAirData = {
  list?: Array<{
    main: {
      aqi: number
    }
    components: {
      pm2_5: number
      pm10: number
    }
    dt: number
  }>
}

export type CityAqiReport = {
  cityLabel: string
  lat: number
  lon: number
  observedAt: string
  openWeatherScaleAqi: number
  usAqi: number
  primaryPollutant: 'PM2.5' | 'PM10'
  components: {
    pm2_5: number
    pm10: number
  }
  assessment: ReturnType<typeof analyzeAqi>
}

function getApiKey() {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is not configured.')
  }

  return apiKey
}

export const getCityAqi = createServerFn({ method: 'GET' })
  .inputValidator((input: GetCityAqiInput) => ({
    lat: Number(input.lat),
    lon: Number(input.lon),
    cityLabel: input.cityLabel.trim(),
  }))
  .handler(async ({ data }) => {
    if (
      !Number.isFinite(data.lat) ||
      !Number.isFinite(data.lon) ||
      !data.cityLabel
    ) {
      throw new Error('Invalid city coordinates.')
    }

    const apiKey = getApiKey()
    const params = new URLSearchParams({
      lat: String(data.lat),
      lon: String(data.lon),
      appid: apiKey,
    })

    let response: Response
    try {
      response = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?${params.toString()}`,
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

      throw new Error(`AQI lookup failed with OpenWeather status ${response.status}.`)
    }

    const payload = (await response.json()) as OpenWeatherAirData
    const reading = payload.list?.[0]

    if (!reading) {
      throw new Error('No AQI data available for this city right now.')
    }

    const pm2_5 = Number(reading.components.pm2_5)
    const pm10 = Number(reading.components.pm10)

    const computed = computeUsAqiFromComponents({
      pm2_5,
      pm10,
    })

    return {
      cityLabel: data.cityLabel,
      lat: data.lat,
      lon: data.lon,
      observedAt: new Date(reading.dt * 1000).toISOString(),
      openWeatherScaleAqi: reading.main.aqi,
      usAqi: computed.aqi,
      primaryPollutant: computed.primaryPollutant,
      components: {
        pm2_5,
        pm10,
      },
      assessment: analyzeAqi(computed.aqi),
    } satisfies CityAqiReport
  })
