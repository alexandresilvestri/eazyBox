import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function ScreenHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.hairline }]}>
      <ThemedText variant="eyebrow" themeColor="ink3">
        {eyebrow}
      </ThemedText>
      <ThemedText variant="time">{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    gap: Spacing.one,
    paddingBottom: Spacing.three,
  },
});
