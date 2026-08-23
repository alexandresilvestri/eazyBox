import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { BottomTabInset, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ActionBarProps = {
  label: string;
  onPress: () => void;
  variant?: "solid" | "outline";
  disabled?: boolean;
  note?: string | null;
};

export function ActionBar({
  label,
  onPress,
  variant = "solid",
  disabled,
  note,
}: ActionBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.hairline,
          marginBottom: BottomTabInset,
          paddingBottom: Spacing.three + insets.bottom,
        },
      ]}
    >
      {note ? (
        <ThemedText variant="label" themeColor="ink2">
          {note}
        </ThemedText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor:
              variant === "solid" ? theme.accentSolid : "transparent",
            borderColor:
              variant === "solid" ? theme.accentSolid : theme.hairline,
            opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <ThemedText
          variant="bodyBold"
          themeColor={variant === "solid" ? "accentInk" : "ink1"}
        >
          {label}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  button: {
    alignItems: "center",
    borderRadius: Radius.control,
    borderWidth: 1,
    paddingVertical: Spacing.three,
  },
});
