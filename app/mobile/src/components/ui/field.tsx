import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

import { colors, fonts, layout, radius, text } from "@/constants/theme";

type Props = TextInputProps & {
  label: string;
  onToggleReveal?: () => void;
  revealed?: boolean;
};

export function Field({
  label,
  onToggleReveal,
  revealed = false,
  ...input
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, focused && styles.focused]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.ink3}
        style={styles.input}
      />
      {onToggleReveal ? (
        <Pressable
          accessibilityRole="button"
          onPress={onToggleReveal}
          style={styles.reveal}
        >
          <Text style={styles.revealLabel}>
            {revealed ? "Ocultar" : "Mostrar"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: layout.field,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.control,
    paddingLeft: 16,
    paddingRight: 8,
  },
  focused: {
    borderColor: colors.accent,
  },
  label: {
    ...text.micro,
    position: "absolute",
    left: 16,
    top: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingTop: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  reveal: {
    height: layout.tapTarget,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  revealLabel: {
    ...text.badge,
    letterSpacing: 1.3,
    color: colors.ink2,
  },
});
