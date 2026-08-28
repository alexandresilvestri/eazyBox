import { StyleSheet, Text, View } from "react-native";

import { colors, MAX_FONT_SCALE, radius, text } from "@/constants/theme";

type Tone = "highlight" | "accent" | "outline";

const TONES: Record<
  Tone,
  { background: string; color: string; border?: string }
> = {
  highlight: { background: colors.highlight, color: colors.onAccent },
  accent: { background: colors.accent, color: colors.onAccent },
  outline: {
    background: "transparent",
    color: colors.ink2,
    border: colors.line,
  },
};

export function Badge({
  label,
  tone = "highlight",
}: {
  label: string;
  tone?: Tone;
}) {
  const { background, color, border } = TONES[tone];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: background },
        border ? { borderWidth: 1, borderColor: border } : null,
      ]}
    >
      <Text
        style={[text.badge, { color }]}
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.badge,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignSelf: "flex-start",
    flexShrink: 1,
  },
});
