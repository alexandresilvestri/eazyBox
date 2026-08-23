import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type BoardSectionProps = {
  label: string;
  children?: string | null;
  emphasis?: boolean;
};

export function BoardSection({ label, children, emphasis }: BoardSectionProps) {
  const theme = useTheme();
  if (!children) return null;

  return (
    <View
      style={[
        styles.section,
        { borderLeftColor: emphasis ? theme.accentSolid : theme.hairline },
      ]}
    >
      <ThemedText variant="eyebrow" themeColor="ink3">
        {label}
      </ThemedText>
      <ThemedText variant="board">{children}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderLeftWidth: 2,
    gap: Spacing.two,
    paddingLeft: Spacing.four,
  },
});
