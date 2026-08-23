export type Scheme = 'light' | 'dark'

export const solids = {
  light: {
    paper: '#f6f7f5',
    surface: '#ffffff',
    scrimBase: '#14181c',
    ink1: '#14181c',
    ink2: '#454c54',
    ink3: '#676e77',
    accentSolid: '#0e5aa7',
    accentText: '#0b4b8c',
    accentInk: '#ffffff',
    ok: '#1e7a4a',
    okInk: '#17693f',
    warn: '#b4740a',
    warnInk: '#96600a',
    error: '#c0102a',
    errorInk: '#a80d24',
  },
  dark: {
    paper: '#101418',
    surface: '#171c21',
    scrimBase: '#05070a',
    ink1: '#f2f4f5',
    ink2: '#aeb6bd',
    ink3: '#7e878f',
    accentSolid: '#1a6fc4',
    accentText: '#63a6ee',
    accentInk: '#ffffff',
    ok: '#1e7a4a',
    okInk: '#4fbd80',
    warn: '#b4740a',
    warnInk: '#e0a92f',
    error: '#d4213a',
    errorInk: '#f2748a',
  },
} as const

type Mix = {
  on: keyof typeof solids.light
  light: number
  dark: number
}

export const mixes = {
  hairline: { on: 'ink1', light: 12, dark: 16 },
  scrim: { on: 'scrimBase', light: 45, dark: 65 },
  rowHover: { on: 'ink1', light: 4, dark: 7 },
  fieldFill: { on: 'ink1', light: 3, dark: 6 },
  fieldFillHover: { on: 'ink1', light: 6, dark: 10 },
  fieldBorder: { on: 'ink1', light: 14, dark: 20 },
  accentFill: { on: 'accentSolid', light: 12, dark: 18 },
  accentFillWeak: { on: 'accentSolid', light: 7, dark: 10 },
  accentBorder: { on: 'accentSolid', light: 32, dark: 38 },
  okFill: { on: 'ok', light: 14, dark: 18 },
  warnFill: { on: 'warn', light: 14, dark: 18 },
  errorFill: { on: 'error', light: 14, dark: 18 },
} satisfies Record<string, Mix>

export const radius = {
  md: 4,
  lg: 6,
  rail: 14,
  full: 999,
} as const

export const text = {
  '2xs': { size: 12, height: 1.45 },
  xs: { size: 13, height: 1.5 },
  sm: { size: 15, height: 1.55 },
} as const

export const display = {
  board: { size: 17, height: 1.62 },
  time: { size: 28, height: 1 },
  hero: { size: 64, height: 1 },
} as const

const scale = { ...text, ...display }

export const type = (key: keyof typeof scale) => ({
  fontSize: scale[key].size,
  lineHeight: Math.round(scale[key].size * scale[key].height),
})

export const tracking = {
  body: 0.005,
  bold: 0.015,
  display: 0.02,
  label: 0.1,
  labelTight: 0.12,
} as const

export const font = {
  display: 'Anton-Regular',
  sans: 'Inter-Regular',
  sansBold: 'Inter-Bold',
  mono: 'JetBrainsMono-Regular',
} as const

export const fontStack = {
  display: "'Anton', 'Arial Narrow', Impact, sans-serif",
  sans: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono Variable', ui-monospace, 'Cascadia Mono', monospace",
} as const

export const motion = {
  swift: 'cubic-bezier(0.2, 0.85, 0.25, 1)',
} as const

export type ThemeColor = keyof typeof solids.light | keyof typeof mixes

const rgba = (hex: string, percent: number) => {
  const value = parseInt(hex.slice(1), 16)
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  return `rgba(${channels.join(', ')}, ${percent / 100})`
}

export const mixed = (scheme: Scheme) => {
  const base = solids[scheme]
  return Object.fromEntries(
    Object.entries(mixes).map(([name, mix]) => [
      name,
      rgba(base[mix.on], mix[scheme]),
    ])
  ) as Record<keyof typeof mixes, string>
}

export const theme = (scheme: Scheme): Record<ThemeColor, string> => ({
  ...solids[scheme],
  ...mixed(scheme),
})
