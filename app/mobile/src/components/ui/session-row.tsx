import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Pill } from "@/components/ui/pill";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type SessionRowProps = {
  time: string;
  checkedIn: boolean;
  expanded: boolean;
  onPress: () => void;
};

export function SessionRow({
  time,
  checkedIn,
  expanded,
  onPress,
}: SessionRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: theme.hairline,
          backgroundColor: pressed ? theme.rowHover : "transparent",
        },
      ]}
    >
      <ThemedText variant="time">{time.slice(0, 5)}</ThemedText>
      <View style={styles.trailing}>
        {checkedIn ? <Pill tone="ok">Presente</Pill> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.three,
  },
  trailing: { alignItems: "flex-end", gap: Spacing.one },
});
