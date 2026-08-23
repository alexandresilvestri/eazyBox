import { design } from '@eazybox/shared'

const {
  solids,
  mixes,
  mixed,
  radius,
  text,
  display,
  tracking,
  fontStack,
  motion,
} = design

const OUTPUT = new URL('../client/tokens.css', import.meta.url)

const cssName = (key: string) =>
  key.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase()

const line = (name: string, value: string) => `  --${name}: ${value};`

const block = (selector: string, lines: string[]) =>
  `${selector} {\n${lines.join('\n')}\n}`

const schemeLines = (scheme: design.Scheme) => [
  ...Object.entries(solids[scheme]).map(([key, value]) =>
    line(cssName(key), value)
  ),
  ...Object.entries(mixed(scheme)).map(([key, value]) =>
    line(cssName(key), value)
  ),
]

const scaleLines = [
  ...Object.entries(radius).map(([key, value]) =>
    line(`radius-${key}`, `${value}px`)
  ),
  ...Object.entries(text).flatMap(([key, value]) => [
    line(`text-${key}`, `${value.size}px`),
    line(`text-${key}--line-height`, String(value.height)),
  ]),
  ...Object.entries(display).flatMap(([key, value]) => [
    line(`${key}-size`, `${value.size}px`),
    line(`${key}-leading`, String(value.height)),
  ]),
  ...Object.entries(tracking).map(([key, value]) =>
    line(`tracking-${cssName(key)}`, `${value}em`)
  ),
  ...Object.entries(fontStack).map(([key, value]) =>
    line(`font-${key}`, value)
  ),
  line('ease-swift', motion.swift),
]

const aliasLines = [
  ...Object.keys(solids.light).filter((key) => key !== 'scrimBase'),
  ...Object.keys(mixes),
].map((key) => line(`color-${cssName(key)}`, `var(--${cssName(key)})`))

const css = [
  block(':root', schemeLines('light')),
  block('.dark', schemeLines('dark')),
  block('@theme', scaleLines),
  block('@theme inline', [
    ...aliasLines,
    line('color-border', 'var(--hairline)'),
  ]),
].join('\n\n')

await Bun.write(OUTPUT, `${css}\n`)
