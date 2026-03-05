export type AqiBand =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous'

export type SafeVerdict = 'Safe' | 'Unsafe'

export type AqiAssessment = {
  band: AqiBand
  safeVerdict: SafeVerdict
  dangerScore: 1 | 2 | 3 | 4 | 5 | 6
  summary: string
  lifeImpact: string[]
  recommendedActions: string[]
  sensitiveGroupAdvice: string[]
}

export type PollutantComponents = {
  pm2_5: number
  pm10: number
}

export type ComputedUsAqi = {
  aqi: number
  primaryPollutant: 'PM2.5' | 'PM10'
  subIndices: {
    pm2_5: number
    pm10: number
  }
}

type Breakpoint = {
  concentrationLow: number
  concentrationHigh: number
  aqiLow: number
  aqiHigh: number
}

const PM25_BREAKPOINTS: Breakpoint[] = [
  { concentrationLow: 0.0, concentrationHigh: 12.0, aqiLow: 0, aqiHigh: 50 },
  { concentrationLow: 12.1, concentrationHigh: 35.4, aqiLow: 51, aqiHigh: 100 },
  {
    concentrationLow: 35.5,
    concentrationHigh: 55.4,
    aqiLow: 101,
    aqiHigh: 150,
  },
  {
    concentrationLow: 55.5,
    concentrationHigh: 150.4,
    aqiLow: 151,
    aqiHigh: 200,
  },
  {
    concentrationLow: 150.5,
    concentrationHigh: 250.4,
    aqiLow: 201,
    aqiHigh: 300,
  },
  {
    concentrationLow: 250.5,
    concentrationHigh: 350.4,
    aqiLow: 301,
    aqiHigh: 400,
  },
  {
    concentrationLow: 350.5,
    concentrationHigh: 500.4,
    aqiLow: 401,
    aqiHigh: 500,
  },
]

const PM10_BREAKPOINTS: Breakpoint[] = [
  { concentrationLow: 0, concentrationHigh: 54, aqiLow: 0, aqiHigh: 50 },
  { concentrationLow: 55, concentrationHigh: 154, aqiLow: 51, aqiHigh: 100 },
  { concentrationLow: 155, concentrationHigh: 254, aqiLow: 101, aqiHigh: 150 },
  { concentrationLow: 255, concentrationHigh: 354, aqiLow: 151, aqiHigh: 200 },
  { concentrationLow: 355, concentrationHigh: 424, aqiLow: 201, aqiHigh: 300 },
  { concentrationLow: 425, concentrationHigh: 504, aqiLow: 301, aqiHigh: 400 },
  { concentrationLow: 505, concentrationHigh: 604, aqiLow: 401, aqiHigh: 500 },
]

function clampAqi(value: number) {
  return Math.max(0, Math.min(500, Math.round(value)))
}

function calculateSubIndex(
  concentration: number,
  breakpoints: Breakpoint[],
): number {
  if (Number.isNaN(concentration) || concentration < 0) {
    return 0
  }

  const capped = Math.min(concentration, breakpoints[breakpoints.length - 1].concentrationHigh)

  const range = breakpoints.find(
    (item) =>
      capped >= item.concentrationLow && capped <= item.concentrationHigh,
  )

  if (!range) {
    return 500
  }

  const aqi =
    ((range.aqiHigh - range.aqiLow) /
      (range.concentrationHigh - range.concentrationLow)) *
      (capped - range.concentrationLow) +
    range.aqiLow

  return clampAqi(aqi)
}

export function computeUsAqiFromComponents(
  components: PollutantComponents,
): ComputedUsAqi {
  const pm25 = Math.floor(components.pm2_5 * 10) / 10
  const pm10 = Math.floor(components.pm10)

  const pm25Index = calculateSubIndex(pm25, PM25_BREAKPOINTS)
  const pm10Index = calculateSubIndex(pm10, PM10_BREAKPOINTS)
  const aqi = Math.max(pm25Index, pm10Index)

  return {
    aqi,
    primaryPollutant: pm25Index >= pm10Index ? 'PM2.5' : 'PM10',
    subIndices: {
      pm2_5: pm25Index,
      pm10: pm10Index,
    },
  }
}

export function bandFromAqi(aqi: number): AqiBand {
  if (aqi <= 50) {
    return 'Good'
  }
  if (aqi <= 100) {
    return 'Moderate'
  }
  if (aqi <= 150) {
    return 'Unhealthy for Sensitive Groups'
  }
  if (aqi <= 200) {
    return 'Unhealthy'
  }
  if (aqi <= 300) {
    return 'Very Unhealthy'
  }
  return 'Hazardous'
}

export function analyzeAqi(aqi: number): AqiAssessment {
  const normalizedAqi = clampAqi(aqi)
  const band = bandFromAqi(normalizedAqi)

  if (band === 'Good') {
    return {
      band,
      safeVerdict: 'Safe',
      dangerScore: 1,
      summary: 'Air is clean and safe for normal outdoor activity.',
      lifeImpact: [
        'Most people can exercise outdoors without irritation.',
        'Indoor air comfort remains stable through the day.',
        'Breathing strain risk is minimal for healthy individuals.',
      ],
      recommendedActions: [
        'Continue normal outdoor routines.',
        'Ventilate your home when weather allows.',
        'Recheck AQI before long outdoor plans.',
      ],
      sensitiveGroupAdvice: ['No special precautions are usually needed.'],
    }
  }

  if (band === 'Moderate') {
    return {
      band,
      safeVerdict: 'Safe',
      dangerScore: 2,
      summary: 'Air is acceptable, but sensitive groups may notice mild symptoms.',
      lifeImpact: [
        'Long outdoor exertion can feel harder for some people.',
        'Mild throat or eye irritation may appear near heavy traffic.',
        'People with asthma can notice occasional discomfort.',
      ],
      recommendedActions: [
        'Limit prolonged high-intensity outdoor sessions.',
        'Prefer low-traffic routes for walking or running.',
        'Track AQI changes if symptoms start.',
      ],
      sensitiveGroupAdvice: [
        'Asthma or allergy-prone users should keep quick-relief medication nearby.',
      ],
    }
  }

  if (band === 'Unhealthy for Sensitive Groups') {
    return {
      band,
      safeVerdict: 'Unsafe',
      dangerScore: 3,
      summary: 'Sensitive groups face meaningful risk during outdoor exposure.',
      lifeImpact: [
        'Children, elderly adults, and respiratory patients are more likely to be affected.',
        'Outdoor workouts can trigger coughing or shortness of breath.',
        'Recovery after exertion may take longer than usual.',
      ],
      recommendedActions: [
        'Reduce outdoor intensity and total time outside.',
        'Use a well-fitted mask in polluted areas.',
        'Shift exercise indoors where possible.',
      ],
      sensitiveGroupAdvice: [
        'Sensitive groups should keep outdoor activity short and symptom-led.',
      ],
    }
  }

  if (band === 'Unhealthy') {
    return {
      band,
      safeVerdict: 'Unsafe',
      dangerScore: 4,
      summary: 'Air pollution is high enough to impact the wider population.',
      lifeImpact: [
        'Outdoor exposure can cause breathing discomfort even in healthy adults.',
        'Productivity and exercise performance can drop outdoors.',
        'Respiratory symptoms become more likely across all age groups.',
      ],
      recommendedActions: [
        'Avoid strenuous outdoor activity.',
        'Keep windows closed during peak traffic hours.',
        'Use indoor air filtration where possible.',
      ],
      sensitiveGroupAdvice: [
        'Sensitive users should avoid outdoor activity unless essential.',
      ],
    }
  }

  if (band === 'Very Unhealthy') {
    return {
      band,
      safeVerdict: 'Unsafe',
      dangerScore: 5,
      summary: 'Health alert level: short outdoor exposure can be harmful.',
      lifeImpact: [
        'Breathing and cardiovascular strain increase quickly outdoors.',
        'Irritation symptoms may appear in a short time window.',
        'Risk is significantly elevated for children and older adults.',
      ],
      recommendedActions: [
        'Stay indoors as much as possible.',
        'Avoid outdoor exercise and heavy exertion.',
        'Run air purifier continuously in occupied rooms.',
      ],
      sensitiveGroupAdvice: [
        'High-risk individuals should avoid going outside unless unavoidable.',
      ],
    }
  }

  return {
    band,
    safeVerdict: 'Unsafe',
    dangerScore: 6,
    summary: 'Emergency-level pollution: serious health risk for everyone.',
    lifeImpact: [
      'Even brief outdoor exposure may trigger severe symptoms.',
      'Respiratory and cardiac risk is sharply elevated.',
      'Population-wide health effects are expected.',
    ],
    recommendedActions: [
      'Remain indoors and seal windows and doors.',
      'Use high-filtration masks if outdoor travel is unavoidable.',
      'Monitor official local health advisories closely.',
    ],
    sensitiveGroupAdvice: [
      'Sensitive groups should strictly avoid outdoor exposure.',
    ],
  }
}
