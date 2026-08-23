import { design } from "@eazybox/shared";
import { View, type ViewProps } from "react-native";

import { useTheme } from "@/hooks/use-theme";

export type ThemedViewProps = ViewProps & {
  themeColor?: design.ThemeColor;
};

export function ThemedView({
  style,
  themeColor = "paper",
  ...rest
}: ThemedViewProps) {
  const theme = useTheme();

  return (
    <View style={[{ backgroundColor: theme[themeColor] }, style]} {...rest} />
  );
}
