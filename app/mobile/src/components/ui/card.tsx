import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";

import { colors, radius } from "@/constants/theme";

type Props = {
  children: ReactNode;
  gap?: number;
  padding?: number;
  outlined?: boolean;
};

export function Card({
  children,
  gap = 12,
  padding = 20,
  outlined = false,
}: Props) {
  return (
    <View style={[styles.card, { gap, padding }, outlined && styles.outlined]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.line,
  },
});
