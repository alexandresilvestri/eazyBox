import "@/global.css";

import { design } from "@eazybox/shared";
import { Platform } from "react-native";

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const Radius = { control: design.radius.md } as const;

export const BottomTabInset =
  Platform.select({ ios: 56, android: 72, web: 56 }) ?? 56;
export const MaxContentWidth = 800;
