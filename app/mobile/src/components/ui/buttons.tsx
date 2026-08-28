import { Pressable, StyleSheet, Text } from "react-native";

import {
  colors,
  layout,
  MAX_FONT_SCALE,
  radius,
  text,
} from "@/constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles.primary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        style={[text.button, styles.primaryLabel]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, disabled = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles.ghost,
        pressed && styles.ghostPressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        style={[text.button, styles.ghostLabel]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.control,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.accent,
  },
  primaryLabel: {
    color: colors.onAccent,
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  ghostPressed: {
    borderColor: colors.lineStrong,
    backgroundColor: colors.hover,
  },
  ghostLabel: {
    color: colors.ink,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.5,
  },
});
