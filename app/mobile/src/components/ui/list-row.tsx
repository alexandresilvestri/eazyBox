import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { ChevronRight } from "@/components/ui/icons";
import { colors, text } from "@/constants/theme";

export function ListRow({
  icon,
  label,
  detail,
  right,
  divided = false,
}: {
  icon?: ReactNode;
  label: string;
  detail?: string;
  right?: ReactNode;
  divided?: boolean;
}) {
  return (
    <View style={[styles.row, divided && styles.divided]}>
      {icon}
      <View style={styles.content}>
        <Text style={text.body}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      {right ?? <ChevronRight color={colors.ink3} size={16} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  divided: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  content: {
    flex: 1,
  },
  detail: {
    ...text.metaSmall,
    marginTop: 2,
  },
});
