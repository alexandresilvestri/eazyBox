import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { text } from "@/constants/theme";

export function Section({ children }: { children: ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={text.label}>{children}</Text>;
}

export function SectionHeader({
  label,
  right,
}: {
  label: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <SectionLabel>{label}</SectionLabel>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
});
