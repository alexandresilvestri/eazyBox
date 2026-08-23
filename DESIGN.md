# Design System — Plate & Board

The visual system for both eazybox clients: the member app (`app/mobile`, Expo) and the box console (`app/web/client`, React 19 bundled by Bun).

Two artifacts from the subject supply the whole language. Every box has a **whiteboard** — the WOD written in marker, sections labelled, attendance tallied in a column. Every box has **Olympic bumper plates**, colour-coded by load worldwide. The board sets the type and the structure; the plates set the accent.

Source of truth: `shared/design/tokens.ts`. Everything else derives from it.

---

## Token pipeline

One TypeScript module holds every raw value. Neither client hardcodes a colour.

```
shared/design/tokens.ts
  solids   per-theme hex
  mixes    { on: <solid key>, light: %, dark: % }
  radius / text / display / tracking / font / fontStack / motion
        |
        +--> bun run tokens  (app/web/scripts/tokens.ts)
        |      writes app/web/client/tokens.css  (committed)
        |
        +--> design.theme('light' | 'dark')
               returns a flat Record<ThemeColor, string> for StyleSheet.create
```

`mixes` declares a tint once — "hairline is ink-1 at 12% light, 16% dark" — and the module resolves it to `rgba()`. The generator emits the same resolved value into CSS.

**Alpha rungs are resolved in TypeScript, not by CSS `color-mix`.** An earlier pass emitted `color-mix(in oklab, var(--ink-1) 3%, transparent)`; the bundler folded some of those to opaque ink, so every field rendered as a solid black block. Chromium resolves `color-mix` correctly — the CSS never reached the browser intact. Resolving in TS removes the class of bug and keeps one implementation for both platforms.

`bun run tokens` after any token change. `client/tokens.css` is generated; edit `shared/design/tokens.ts` instead.

### Generated blocks

| Block | Contents |
| --- | --- |
| `:root` | light solids and resolved mixes |
| `.dark` | dark solids and resolved mixes |
| `@theme` | radius ladder, type scale with `--text-*--line-height` companions, tracking ladder, font stacks, `--ease-swift` |
| `@theme inline` | `--color-*` aliases pointing at the theme-switching variables, plus `--color-border: var(--hairline)` |

The type scale must stay in the plain `@theme` block. `@theme inline` emits no `:root` variable, so the `--line-height` companions would resolve to nothing.

Display sizes sit deliberately **outside** Tailwind's namespaces — `--board-size`, `--time-size`, `--hero-size`. Inside `--text-*` they would generate `text-board` / `text-time` utilities, and `tailwind-merge` classifies a non-t-shirt `text-*` class as a colour utility and silently drops it inside `cn()`. `--board-size` is consumed by the `board-body` utility; the other two are consumed by React Native through `design.type()`, where the console instead pairs `display-numeral` with a stock Tailwind size.

---

## Color

### Neutrals

Board-neutral: cool, never cream.

| Token | Light | Dark |
| --- | --- | --- |
| `--paper` | `#f6f7f5` | `#101418` |
| `--surface` | `#ffffff` | `#171c21` |
| `--ink-1` | `#14181c` | `#f2f4f5` |
| `--ink-2` | `#454c54` | `#aeb6bd` |
| `--ink-3` | `#676e77` | `#7e878f` |
| `--hairline` | ink-1 @ 12% | ink-1 @ 16% |

Measured against `--paper`:

| Token | Light | Dark |
| --- | --- | --- |
| `--ink-1` | 16.60:1 | 16.77:1 |
| `--ink-2` | 8.09:1 | 9.01:1 |
| `--ink-3` | 4.80:1 | 5.06:1 |

`--ink-3` carries `eyebrow` and `field-label` at 12px bold. 12px bold is not large text, so it must clear 4.5:1 — which is why light `--ink-3` is `#676e77` and not something lighter.

### Accent — plate blue

One interactive colour. Every rung derives from `--accent-solid`.

| Token | Light | Dark |
| --- | --- | --- |
| `--accent-solid` | `#0e5aa7` | `#1a6fc4` |
| `--accent-text` | `#0b4b8c` | `#63a6ee` |
| `--accent-fill` | 12% | 18% |
| `--accent-fill-weak` | 7% | 10% |
| `--accent-border` | 32% | 38% |

Measured: `--accent-solid` reads **6.43:1** on light paper and **3.62:1** on dark; white on it reads **6.91:1** light, **5.10:1** dark. `--accent-text` reads 8.14:1 / 7.24:1.

Two consequences:

1. **White sits on the accent at body size.** The primary button is a solid accent surface with a white label. This is the one place the system diverges hard from its Scan360 ancestor, whose orange primary read 3.03:1 on white and forced a near-black button label.
2. **The dark theme lifts the accent** from `#0e5aa7` to `#1a6fc4`. The raw value reads 2.69:1 against the dark surface, below the 3:1 floor for a mark; the lifted value reaches 3.62:1.

`--accent-text` is the only accent rung allowed on text.

### Plate ramp — removed until it has data

The plate ladder (red 25 kg, blue 20 kg, yellow 15 kg, green 10 kg, white 5 kg) is where the palette's name comes from, and `--accent-solid` is its 20 kg blue. The other four rungs are **not** in the token module: nothing in the API carries a load or a percentage, so a colour ramp for load would be tokens with no data behind them. Yellow (1.82:1) and plate-white (1.26:1) also fail the 3:1 mark threshold on light paper, so they could only ever be fills behind ink. Reintroduce the ramp with the load fields, not before.

### Status ramp — state only

`--ok` `#1e7a4a`, `--warn` `#b4740a`, `--error` `#c0102a` (dark `#d4213a`), each with an `-ink` and `-fill` rung. Ink measured on paper: ok 6.25 / 7.86, warn 4.92 / 8.71, error 7.11 / 6.73.

`--scrim` has its own base (`--scrim-base`, `#14181c` light and `#05070a` dark) at 45% / 65%, because mixing the scrim from `--ink-1` would produce a near-white overlay in the dark theme.

### Collisions to watch

When the plate ramp returns: its blue sits ~4° from `--accent-solid`, and its green and red neighbour `--ok` and `--error`. The structural mitigation is the same in both directions — status always pairs tint + `-ink` + dot, a plate colour always pairs a numeral and never carries interactive state.

---

## Typography

Three roles. Each carries one job and never borrows another's.

| Role | Face | Used for |
| --- | --- | --- |
| display | **Anton** 400, the only cut | Session times, hero numerals, weekday letters, tally counts. Numerals and short caps — never a sentence. |
| body | **Inter** — variable on web, 400 and 700 on native | Running text, labels, tables |
| data | **JetBrains Mono** — variable on web, 400 on native | The WOD body |

Anton earns its place: it is the competition-bib voice, condensed enough that `06:00` and a check-in count read from a phone at arm's length, and one weight means it cannot sprawl.

**The WOD body is mono, and that is not decoration.** Coaches write `8x a cada 45seg - 60%` and `200m/150m/100m run`. On a physical board those are aligned columns in a fixed-width grid; proportional type breaks them. The board preserves the coach's line breaks verbatim — `white-space: pre-line` on web, plain `Text` on native. No markdown, no reflow, no parsing.

Fonts are self-hosted, not fetched: `app/web/client/fonts/*.woff2` (variable Inter and JetBrains Mono, static Anton) and four `app/mobile/assets/fonts/*.ttf` loaded through `expo-font` — one file per family and weight the app actually renders, since `useFonts` blocks the first frame. All three are SIL OFL 1.1; see `app/mobile/assets/fonts/NOTICE`. Bun inlines the web faces into the stylesheet as data URIs.

### Scale

```
--text-2xs: 12px / 1.45
--text-xs:  13px / 1.5
--text-sm:  15px / 1.55
--board-size: 17px / 1.62
--time-size:  28px / 1
--hero-size:  64px / 1
```

Tracking: `--tracking-body` 0.005em, `--tracking-bold` 0.015em, `--tracking-display` 0.02em, `--tracking-label` 0.1em, `--tracking-label-tight` 0.12em. Display tracking is positive and larger than its ancestor's, because Anton is already condensed and needs opening rather than tightening.

`design.type(key)` returns `{ fontSize, lineHeight }` in px for React Native, where line height is absolute rather than a ratio.

### Named utilities

`app/web/client/index.css` owns them; `app/mobile/src/components/themed-text.tsx` mirrors them as `variant` values.

| Utility | Web | Mobile variant |
| --- | --- | --- |
| `eyebrow` | 12px, 700, `--tracking-label`, uppercase, ink-3 | `eyebrow` |
| `field-label` | 12px, 600, `--tracking-label-tight`, uppercase, ink-3 | — |
| `board-body` | mono, `--board-size`, `white-space: pre-line` | `board` |
| `display-numeral` | Anton, `--tracking-display`, tabular numerals, size chosen at the call site | `time` (28px), `hero` (64px) |
| `field-fill` | the five-rung field state machine | — |
| `hover-row` | row hover surface | — |
| `radix-pop` / `scrim-fade` | overlay enter and exit | — |

---

## Geometry

```
--radius-md:   4px     --radius-rail: 14px
--radius-lg:   6px     --radius-full: 999px
```

Four rungs, and the discipline is flat:

- `rounded-md` (4px) — every control: buttons, icon buttons, fields, select triggers, badges, menu items, tab pills
- `rounded-lg` (6px) — every surface: cards, panels, dialogs, popovers
- `rounded-r-rail` — the nav rail's outer edge, one use
- `rounded-full` — dot marks only

Squarer than a pill-based system on purpose: signage and plates, not chat bubbles.

Layout metrics: `--rail-width` 68px, `--rail-width-expanded` 232px, `--page-max-width` `min(1320px, 100%)`.

---

## Depth and motion

Depth is hairlines and surface steps. Shadows appear in exactly two places: floating overlays (`shadow-lg` on dialog and select content) and the mobile action bar's top rule. There is no button emboss and no ripple — a flat accent surface with a hover step and a pressed opacity step carries the whole affordance.

`--ease-swift: cubic-bezier(0.2, 0.85, 0.25, 1)` is the house curve.

**Motion is colour transitions and overlay enter/exit — nothing else.** The intended orchestrated moment was the check-in: your own tick drawing into the tally. It is not built, because neither client can identify "your tick" yet — the console is an admin view, and a member cannot read occupancy at all (see Gaps). The keyframe was removed rather than left unreachable; add it back with the counts endpoint.

Reduced motion is guarded two ways: `motion-reduce:` variants, and `prefers-reduced-motion` media queries inside `field-fill`, `hover-row`, `radix-pop` and `scrim-fade`. No JS drives animation, so there is no third path to guard.

---

## Signature: the tally meter

Attendance is a tally on a board, not a percentage ring. The same device reads two truths:

**Web — occupancy.** `client/components/ui-x/TallyMeter.tsx`. One tick per check-in on a session, with the count beside them, at `row` (3×12px) or `detail` (4×20px) size.

**Mobile — your week.** `src/components/ui/week-tally.tsx`. Seven ticks, one per weekday, filled where you checked in. This is what the API can actually tell a member.

At most 12 ticks are drawn and the numeral is always present, so the ticks never carry meaning alone. The meter takes no capacity: nothing in the API supplies one (see Gaps), and a parameter no caller can fill is a parameter that rots.

---

## Web — the console

`app/web/client`. Tailwind v4, CSS-first: there is no `tailwind.config.*`. Radix through the unified `radix-ui` package with namespace imports, `@tabler/icons-react`, `react-router` v8 declarative, `cn()` from `clsx` + `tailwind-merge`.

```
client/
  index.css          imports, @font-face, @theme, keyframes, @utility, @layer base
  tokens.css         generated
  components/ui/     button, icon-button, input, textarea, label, badge, select, dialog
  components/ui-x/   SectionCard, Band (+ StatCell), HairlineTable, InlineAlert,
                     TallyMeter, BoardSection, WeekGrid
  components/layout/ ConsoleShell, NavRail (+ NavStrip), TopBar
  pages/             Entrar, Painel, Programacao, Grade, Sessoes, Membros
  lib/               api, use-api, utils, color-scheme, theme/tokens
```

There is no `ui/card.tsx` and no `ui/table.tsx`. `SectionCard` and `HairlineTable` fill those roles; a card inside a `SectionCard` would double the hairline.

### Component notes

- **Button** — four variants (`solid`, `outline`, `ghost`, `danger`), three sizes. `solid` is the accent surface with `--accent-ink`; it is the only one the console uses so far.
- **IconButton** — `aria-label` is required at the type level, so an unlabelled icon button will not compile.
- **field-fill** — five rungs: rest, hover while not focused, filled or open, focused, invalid. Focus is a border change to `--accent-solid` plus a 2px `--accent-fill` ring; fields take no outline.
- **Badge** — a `tone` axis (`neutral`, `accent`, `ok`), never a style class. `client/lib/theme/tokens.ts` maps domain to tone through `roleOf(user)`, which returns the label and the tone together so a copy edit cannot orphan the colour. Tones grow when a screen needs one, not before.
- **InlineAlert** — the error callout: left rule, tint, `role="alert"`. It has no `variant` axis, because every call site reports a failure.
- **NavRail** — floating capsule pinned to the left edge, expanding on hover and on `has-[:focus-visible]`, with a staggered label reveal driven by an inline `--reveal-delay`. Below `md` it is replaced by `NavStrip`, a horizontal scrollable row, and the shell drops its `md:pl-(--rail-width)`.

### Focus and hover

Two focus treatments, not six: controls take `focus-visible:outline-2 outline-offset-2 outline-accent-solid`; `field-fill` controls step their border and fill. Hover: buttons step their surface, rows use `hover-row`, the rail expands its width, menu items promote their background.

### Pages

| Path | Content |
| --- | --- |
| `/entrar` | Login. Test ids `login-card`, `login-email`, `login-password`, `login-submit`, `login-error`. |
| `/` | **Painel** — the `WeekGrid`: weekday columns × time rows, each cell a tally. The one view an owner reads at a glance. |
| `/programacao` | Workout list plus an editor split — textareas on the left, a live `BoardSection` preview on the right. What the coach types is what the member reads. |
| `/grade` | Weekly slot CRUD, one card per weekday |
| `/sessoes` | Session list and creation; a row opens the published board in a dialog |
| `/membros` | Member table with role and status badges |

`ConsoleShell` carries `data-testid="dashboard"`, `TopBar` carries `current-user` and `logout`. Three Playwright specs read those nine ids; they are the contract.

---

## Mobile — the member app

`app/mobile`. React Native StyleSheet, no NativeWind: `design.theme(scheme)` returns plain values and `useTheme()` hands them to `StyleSheet.create`. The web `@utility` layer cannot cross to RN, so the type roles are mirrored in `themed-text.tsx` as variants.

```
src/
  app/            _layout (fonts + login gate), index, checkin, perfil
  components/     themed-text, themed-view, app-tabs(.web)
  components/ui/  board-section, tally-meter, week-tally, week-strip,
                  session-row, pill, action-bar, screen-header
  screens/        hoje-screen, checkin-screen, perfil-screen, login-screen
  lib/            api, auth, use-api, checkins
```

Three tabs, `NativeTabs` with template-rendered PNG icons (`assets/images/tabIcons/`):

| Tab | Screen |
| --- | --- |
| **Hoje** | Opens on the board, not on a greeting: today's time, then Warmup / Skill / WOD, with a sticky check-in bar |
| **Check-in** | Week strip over the day's sessions; a row expands in place to the board plus the action bar |
| **Perfil** | Name, active pill, the week tally, total check-ins, sign out |

The login gate lives in `_layout.tsx`, so it wraps all three tabs.

**The check-in action is a sticky bar, never a floating pill.** The competitor app the brief referenced floats a "Check-In" button over the WOD text, covering it mid-sentence in two of five screenshots. A bar in the safe-area inset, clearing `BottomTabInset`, costs nothing and never occludes the programming.

Token storage is platform-aware: `expo-secure-store` on native, `localStorage` on web (SecureStore has no web implementation). The web target is a development convenience — the console, not the Expo web build, is the browser product, and it uses httpOnly cookies.

---

## Deviations from the ancestor system

This system inherited its architecture from Scan360's design doc and replaced its identity. What was dropped, and why:

| Dropped | Reason |
| --- | --- |
| Orange brand triad, olive and navy | A security scanner's identity. Plate blue is the subject's own. |
| Neumorphic `soft-raised` / `soft-pressed` and the JS ripple | Emboss and ripple contradict a whiteboard. Flat surfaces with a hover step do the same work. |
| Pill buttons (`rounded-full`) everywhere | 4px controls read as signage. `rounded-full` is now dots only. |
| Eight radius rungs in use | Four: control, surface, rail, dot. |
| Six focus treatments | Two: outline for controls, border-and-fill step for fields. |
| `ping-hover` radar ring | Scan360's signature. Ours is the tally. |
| Floating-label fields, `OtpInput`, charts, sheets, tabs, tooltips | No consumer yet. Add them when a screen needs one. |
| `tw-animate-css`, `@fontsource` CSS imports | Bun's CSS pipeline does not resolve bare package `@import`s. Four keyframes and three `@font-face` rules replace them. |
| `color-mix` in generated CSS | Folded to opaque by the bundler; resolved in TypeScript instead. |

Kept verbatim: the four-block token architecture, hairline-only depth, named type utilities, tone-not-style, the `field-fill` state machine, reduced-motion gating in all three mechanisms, `--ease-swift`, the "never `deleted_at is null` in a SELECT policy" class of hard-won rule, and the habit of writing measured contrast and known collisions into this document rather than trusting the palette.

---

## Gaps

The UI is built only on endpoints that exist. These are named, not mocked:

| Screen feature | What is missing |
| --- | --- |
| Class name (`TREINO NO RANCHO`, `OPEN BOX`) | `workout_schedule.name` |
| Coach per session | `workout_sessions.coach_id` → `users` |
| Occupancy cap (`2/20`) | `workout_schedule.capacity`. `TallyMeter` accepts `capacity` and falls back to a bare count until it exists. |
| **Occupancy for members** | `GET /checkins` is RLS-filtered to the caller, so a member cannot see how full a class is. Needs a counts endpoint (or an aggregate on the session) before the occupancy tally can appear on mobile. |
| Attendance list per session | `GET /workout-sessions/:id/checkins` plus a policy letting a member see co-attendees |
| Bounded check-in reads | `GET /checkins` takes no `from`, so every caller downloads the box's entire check-in history to count one week. Mirror `/workout-sessions?from=`. |
| Splash overlay | `app/mobile/src/components/animated-icon.tsx` still carries the Expo starter's blue and logo — the one surface in either client that hardcodes a colour. |
| Contracts, due dates, plan quota | Whole domain |
| Feed, likes, comments | Whole domain |
| Member activation, avatar | `updateUserSchema` covers `email`, `firstName`, `lastName` only — no `isActive` / `isAdmin` / `isCoach`, so the console cannot toggle a member's status. |
| "Nível fitness" trophy | No source data. Recommend dropping it; it is a badge with nothing behind it. |
