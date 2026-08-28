import { Pressable, StyleSheet, Text } from "react-native";
import type { ReactNode } from "react";

import { colors, layout, radius, text } from "@/constants/theme";

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
      <Text style={[text.button, styles.primaryLabel]}>{label}</Text>
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
      <Text style={[text.button, styles.ghostLabel]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  outlined = false,
}: {
  icon: ReactNode;
  onPress: () => void;
  outlined?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.icon,
        outlined && styles.iconOutlined,
        pressed && styles.pressed,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.control,
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
  icon: {
    width: layout.tapTarget,
    height: layout.tapTarget,
    borderRadius: radius.control,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  iconOutlined: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.5,
  },
});
