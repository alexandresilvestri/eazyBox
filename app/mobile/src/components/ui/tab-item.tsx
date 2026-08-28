import { Pressable, StyleSheet, Text } from "react-native";
import type { ReactNode } from "react";

import { colors, fonts, layout } from "@/constants/theme";

export function TabItem({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: (color: string) => ReactNode;
  active: boolean;
  onPress: () => void;
}) {
  const color = active ? colors.accent : colors.ink3;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.item}
    >
      {icon(color)}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    height: layout.tabItem,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.7,
  },
});
