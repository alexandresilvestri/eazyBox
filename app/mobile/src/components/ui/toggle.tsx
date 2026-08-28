import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius } from "@/constants/theme";

export function Toggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
    >
      <View
        style={[
          styles.knob,
          value ? styles.knobOn : styles.knobOff,
          { alignSelf: value ? "flex-end" : "flex-start" },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: radius.pill,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  trackOn: {
    backgroundColor: colors.highlight,
  },
  trackOff: {
    backgroundColor: colors.inkGhost,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
  },
  knobOn: {
    backgroundColor: colors.surface,
  },
  knobOff: {
    backgroundColor: colors.lineStrong,
  },
});
