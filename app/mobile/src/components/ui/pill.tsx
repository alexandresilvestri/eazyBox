import { design } from "@eazybox/shared";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type PillTone = "neutral" | "ok";

const FILL: Record<PillTone, design.ThemeColor> = {
  neutral: "rowHover",
  ok: "okFill",
};

const INK: Record<PillTone, design.ThemeColor> = {
  neutral: "ink2",
  ok: "okInk",
};

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: PillTone;
  children: string;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.pill, { backgroundColor: theme[FILL[tone]] }]}>
      <ThemedText variant="eyebrow" themeColor={INK[tone]}>
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
