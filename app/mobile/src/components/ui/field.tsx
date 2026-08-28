import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

import {
  colors,
  fonts,
  layout,
  MAX_FONT_SCALE,
  radius,
  text,
} from "@/constants/theme";

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
      <View style={styles.stack}>
        <Text
          style={styles.label}
          numberOfLines={1}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {label}
        </Text>
        <TextInput
          {...input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.ink3}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={styles.input}
        />
      </View>
      {onToggleReveal ? (
        <Pressable
          accessibilityRole="button"
          onPress={onToggleReveal}
          style={styles.reveal}
        >
          <Text
            style={styles.revealLabel}
            numberOfLines={1}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {revealed ? "Ocultar" : "Mostrar"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: layout.field,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.control,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 10,
  },
  focused: {
    borderColor: colors.accent,
  },
  stack: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...text.micro,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  input: {
    padding: 0,
    includeFontPadding: false,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
  },
  reveal: {
    minHeight: layout.tapTarget,
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
