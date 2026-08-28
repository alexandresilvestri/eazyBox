import { StyleSheet, View } from "react-native";

import { colors, radius } from "@/constants/theme";

export function ProgressBar({
  value,
  total,
}: {
  value: number;
  total: number;
}) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.inkGhost,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
});
