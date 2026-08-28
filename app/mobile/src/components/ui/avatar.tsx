import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, MAX_FONT_SCALE } from "@/constants/theme";

export function Avatar({ label, size = 44 }: { label: string; size?: number }) {
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size }]}
    >
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        style={[styles.label, { fontSize: size / 3.1 }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    borderCurve: "circular",
  },
  label: {
    fontFamily: fonts.bold,
    color: colors.ink,
    letterSpacing: 0.5,
  },
});
