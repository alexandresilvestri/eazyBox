import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { colors, text } from "@/constants/theme";

export function ListRow({
  icon,
  label,
  detail,
  right,
  divided = false,
  onPress,
}: {
  icon?: ReactNode;
  label: string;
  detail?: string;
  right?: ReactNode;
  divided?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      {icon}
      <View style={styles.content}>
        <Text style={text.body}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      {right}
    </>
  );

  const row = [styles.row, divided && styles.divided];

  if (!onPress) {
    return <View style={row}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
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
  pressed: {
    backgroundColor: colors.hover,
  },
  content: {
    flex: 1,
  },
  detail: {
    ...text.metaSmall,
    marginTop: 2,
  },
});
