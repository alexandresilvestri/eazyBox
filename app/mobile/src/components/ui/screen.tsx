import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";

import { colors, layout } from "@/constants/theme";

export function Screen({
  children,
  gap = 16,
}: {
  children: ReactNode;
  gap?: number;
}) {
  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { gap }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: layout.gutter,
  },
});
