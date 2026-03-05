export type AqiBand =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous'

export type SafeVerdict = 'Safe' | 'Unsafe'

export type AqiPersona = {
  emoji: string
  title: string
  tone: string
}

export type AqiAssessment = {
  band: AqiBand
  safeVerdict: SafeVerdict
  dangerScore: 1 | 2 | 3 | 4 | 5 | 6
  severityLabel:
    | 'Low'
    | 'Guarded'
    | 'Elevated'
    | 'High'
    | 'Very High'
    | 'Extreme'
  summary: string
  importanceNote: string
  immediateWindow: string
  persona: AqiPersona
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

  const capped = Math.min(
    concentration,
    breakpoints[breakpoints.length - 1].concentrationHigh,
  )

  const range = breakpoints.find(
    (item) => capped >= item.concentrationLow && capped <= item.concentrationHigh,
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
      severityLabel: 'Low',
      summary: 'Air is clean and safe for most normal activity.',
      importanceNote:
        'Low AQI days are ideal for outdoor routines and recovery from respiratory stress.',
      immediateWindow:
        'Risk in the next 24 hours is minimal for healthy and sensitive groups.',
      persona: {
        emoji: '😊',
        title: 'Comfortable Air',
        tone: 'Great day for outdoor plans.',
      },
      lifeImpact: [
        'Outdoor running, cycling, and commuting are generally comfortable.',
        'Respiratory irritation risk is very low for most people.',
        'Indoor air quality remains stable with normal ventilation habits.',
      ],
      recommendedActions: [
        'Continue normal outdoor routines.',
        'Open windows during cleaner hours for fresh ventilation.',
        'Check AQI again before long outdoor events.',
      ],
      sensitiveGroupAdvice: [
        'No special restrictions are usually required for sensitive groups.',
      ],
    }
  }

  if (band === 'Moderate') {
    return {
      band,
      safeVerdict: 'Safe',
      dangerScore: 2,
      severityLabel: 'Guarded',
      summary:
        'Air is acceptable, but early symptoms can appear in sensitive individuals.',
      importanceNote:
        'This level often feels fine at rest but can affect prolonged outdoor exertion.',
      immediateWindow:
        'Short outdoor exposure is usually fine, but monitor symptoms during exercise.',
      persona: {
        emoji: '🙂',
        title: 'Mostly Okay Air',
        tone: 'Proceed, but with awareness.',
      },
      lifeImpact: [
        'Long outdoor workouts may feel harder than usual.',
        'Mild throat, eye, or sinus irritation can appear near traffic corridors.',
        'People with asthma may notice occasional chest tightness.',
      ],
      recommendedActions: [
        'Reduce prolonged high-intensity outdoor activity.',
        'Prefer parks and lower-traffic routes.',
        'Hydrate well and track breathing symptoms.',
      ],
      sensitiveGroupAdvice: [
        'Children, elderly users, and asthma patients should shorten intense outdoor sessions.',
      ],
    }
  }

  if (band === 'Unhealthy for Sensitive Groups') {
    return {
      band,
      safeVerdict: 'Unsafe',
      dangerScore: 3,
      severityLabel: 'Elevated',
      summary:
        'Pollution is now meaningfully risky for sensitive populations and active users.',
      importanceNote:
        'At this stage, air quality starts changing daily behavior, not just comfort.',
      immediateWindow:
        'Repeated outdoor exposure today can trigger cough, breathlessness, or fatigue.',
      persona: {
        emoji: '😷',
        title: 'Caution Air',
        tone: 'Limit exposure, especially if vulnerable.',
      },
      lifeImpact: [
        'Sensitive groups can experience respiratory symptoms quickly outdoors.',
        'Outdoor workouts can trigger wheezing, coughing, or reduced endurance.',
        'Children and older adults may experience higher fatigue with outdoor activity.',
      ],
      recommendedActions: [
        'Cut outdoor intensity and total exposure time.',
        'Use a well-fitted filtration mask on busy roads.',
        'Shift cardio workouts indoors when possible.',
      ],
      sensitiveGroupAdvice: [
        'Sensitive groups should keep outings brief and symptom-guided.',
      ],
    }
  }

  if (band === 'Unhealthy') {
    return {
      band,
      safeVerdict: 'Unsafe',
      dangerScore: 4,
      severityLabel: 'High',
      summary:
        'Air pollution is high enough to impact healthy people, not only sensitive groups.',
      importanceNote:
        'This level can affect productivity, mood, exercise tolerance, and respiratory stability.',
      immediateWindow:
        'Outdoor exertion today can cause notable breathing discomfort across the population.',
      persona: {
        emoji: '🤒',
        title: 'Risky Air',
        tone: 'Avoid unnecessary outdoor strain.',
      },
      lifeImpact: [
        'Breathing discomfort may occur even in otherwise healthy adults.',
        'Outdoor work and exercise performance can drop significantly.',
        'Symptom frequency increases across respiratory and cardiac risk groups.',
      ],
      recommendedActions: [
        'Avoid strenuous outdoor activity.',
        'Keep windows closed during peak traffic/pollution hours.',
        'Use indoor filtration in sleeping and working rooms.',
      ],
      sensitiveGroupAdvice: [
        'High-risk individuals should avoid outdoor activity unless necessary.',
      ],
    }
  }

  if (band === 'Very Unhealthy') {
    return {
      band,
      safeVerdict: 'Unsafe',
      dangerScore: 5,
      severityLabel: 'Very High',
      summary:
        'This is a health-alert level where short outdoor exposure can be harmful.',
      importanceNote:
        'Emergency-style precautions are warranted to reduce cumulative lung and heart stress.',
      immediateWindow:
        'Symptoms can appear quickly; repeated exposure materially increases near-term risk.',
      persona: {
        emoji: '⚠️',
        title: 'Health Alert Air',
        tone: 'Strongly minimize outdoor exposure.',
      },
      lifeImpact: [
        'Breathing and cardiovascular strain rise sharply during outdoor movement.',
        'Irritation, headaches, and fatigue can appear in short intervals.',
        'Children, elderly users, and respiratory patients face significant health risk.',
      ],
      recommendedActions: [
        'Stay indoors as much as possible.',
        'Cancel outdoor workouts and heavy outdoor tasks.',
        'Run air purifier continuously in occupied rooms.',
      ],
      sensitiveGroupAdvice: [
        'Sensitive groups should avoid outdoor exposure unless unavoidable.',
      ],
    }
  }

  return {
    band,
    safeVerdict: 'Unsafe',
    dangerScore: 6,
    severityLabel: 'Extreme',
    summary: 'Emergency-level pollution: serious health risk for everyone.',
    importanceNote:
      'This level is hazardous for the whole population and should be treated as a public health emergency signal.',
    immediateWindow:
      'Even short exposure can be dangerous; strict protection measures are critical now.',
    persona: {
      emoji: '☣️',
      title: 'Hazard Air',
      tone: 'Emergency precautions recommended.',
    },
    lifeImpact: [
      'Very brief outdoor exposure may trigger severe symptoms.',
      'Cardio-respiratory stress is sharply elevated for all groups.',
      'Population-wide health effects are likely without strict exposure control.',
    ],
    recommendedActions: [
      'Remain indoors and seal doors/windows as much as possible.',
      'Use high-filtration mask if you must go outside.',
      'Follow local health advisories and reduce all outdoor exertion.',
    ],
    sensitiveGroupAdvice: [
      'Children, elderly adults, pregnant users, and respiratory/cardiac patients should strictly avoid outdoor exposure.',
    ],
  }
}
