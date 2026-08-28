import type { TextStyle } from "react-native";

export const MAX_FONT_SCALE = 1.25;

export const colors = {
  surface: "#111112",
  card: "#2B2B2B",
  ink: "#EDEDEA",
  ink2: "rgba(237,237,234,0.62)",
  ink3: "rgba(237,237,234,0.40)",
  inkGhost: "rgba(237,237,234,0.14)",
  line: "rgba(237,237,234,0.14)",
  lineStrong: "rgba(237,237,234,0.40)",
  hover: "rgba(237,237,234,0.06)",
  accent: "#FF4D1C",
  accentSoft: "rgba(255,77,28,0.14)",
  accentLine: "rgba(255,77,28,0.55)",
  onAccent: "#111112",
  highlight: "#FFD400",
  highlightSoft: "rgba(255,212,0,0.16)",
  highlightLine: "rgba(255,212,0,0.5)",
} as const;

export const fonts = {
  regular: "Archivo_400Regular",
  semibold: "Archivo_600SemiBold",
  bold: "Archivo_700Bold",
  display: "Archivo_900Black",
} as const;

export const radius = {
  card: 18,
  control: 12,
  chip: 10,
  badge: 4,
  pill: 999,
} as const;

export const layout = {
  gutter: 20,
  loginGutter: 26,
  control: 56,
  field: 64,
  tapTarget: 44,
  tabBar: 82,
  tabItem: 56,
  icon: 22,
} as const;

export const text = {
  display: {
    fontFamily: fonts.display,
    fontSize: 56,
    lineHeight: 54,
    letterSpacing: -1.7,
    color: colors.ink,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.7,
    color: colors.ink,
  },
  stat: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.7,
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 25,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
  bodyStrong: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
  metaSmall: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink3,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.9,
    textTransform: "uppercase",
    color: colors.ink2,
  },
  micro: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.7,
    color: colors.ink3,
  },
  caption: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.7,
    color: colors.ink3,
  },
  badge: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  button: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
} satisfies Record<string, TextStyle>;
