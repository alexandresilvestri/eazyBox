import { design } from "@eazybox/shared";
import { StyleSheet, Text, type TextProps } from "react-native";

import { useTheme } from "@/hooks/use-theme";

export type TextVariant =
  "body" | "bodyBold" | "label" | "eyebrow" | "board" | "time" | "hero";

export type ThemedTextProps = TextProps & {
  variant?: TextVariant;
  themeColor?: design.ThemeColor;
};

export function ThemedText({
  style,
  variant = "body",
  themeColor = "ink1",
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[{ color: theme[themeColor] }, styles[variant], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  body: {
    ...design.type("sm"),
    fontFamily: design.font.sans,
    letterSpacing: design.tracking.body * design.text.sm.size,
  },
  bodyBold: {
    ...design.type("sm"),
    fontFamily: design.font.sansBold,
    letterSpacing: design.tracking.bold * design.text.sm.size,
  },
  label: {
    ...design.type("xs"),
    fontFamily: design.font.sans,
  },
  eyebrow: {
    ...design.type("2xs"),
    fontFamily: design.font.sansBold,
    letterSpacing: design.tracking.label * design.text["2xs"].size,
    textTransform: "uppercase",
  },
  board: {
    ...design.type("board"),
    fontFamily: design.font.mono,
  },
  time: {
    ...design.type("time"),
    fontFamily: design.font.display,
    letterSpacing: design.tracking.display * design.display.time.size,
  },
  hero: {
    ...design.type("hero"),
    fontFamily: design.font.display,
    letterSpacing: design.tracking.display * design.display.hero.size,
  },
});
