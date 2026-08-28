@AGENTS.md

# app/mobile — the student app

Expo Router + React Native, Expo SDK 57. Bun installs; the Expo CLI runs on Node. `make mobile` starts the dev server, `make mobile-lint` / `make mobile-typecheck` are the gates. `EXPO_PUBLIC_API_URL` points at the API (see `.env.example`); on a device it must be the LAN address, not `localhost`.

```
src/app/                expo-router routes
  _layout.tsx           fonts, AuthProvider, Stack
  login.tsx             redirects to / once a user exists
  (tabs)/_layout.tsx    auth gate, BoxProvider, Tabs with the custom bar
  (tabs)/*.tsx          Início, Check-in, WOD, Agenda, Perfil
src/components/         app-tab-bar.tsx and ui/ primitives
src/constants/theme.ts  the only place colors, fonts, radii and type sizes live
src/lib/                api, auth, storage, box, sessions, format, prefs, hooks
```

- `lib/api.ts` owns the bearer transport: tokens in `expo-secure-store` (`localStorage` on web via `lib/storage.ts`), single-flight refresh against `/api/mobile/auth/refresh`. Never call `fetch` directly from a screen.
- `lib/box.tsx` fetches sessions, check-ins and announcements once for the whole tab group and exposes `reload()`. A screen that writes a check-in must call it so every tab sees the new occupancy.
- Session date arithmetic lives in `@eazybox/shared` (`shared/core/sessions.ts`), shared with the web panel. `sessionDate` from the API is an ISO timestamp — use `dayKey()` (its first 10 chars) as the day and `dayDate()` to parse one, never `new Date(sessionDate)`, which shifts the day on a positive UTC offset. `lib/sessions.ts` keeps only the check-in-history helpers.
- Day names, month names and relative times are in `lib/format.ts`. Week helpers (`isoDate`, `startOfWeek`, `WEEK_DAY_LABEL`) and `parseWod` come from `@eazybox/shared`.
- Styling is `StyleSheet.create` with tokens from `constants/theme.ts`. No literal hex in a screen.
- Icons are `react-native-svg` paths in `components/ui/icons.tsx`.
- The check-in window (opens `CHECKIN_WINDOW_HOURS` before, closes at the start) is a client-side rule in `shared/core/sessions.ts`. The API does not enforce it.
