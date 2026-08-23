import { WEEK_DAY_INITIAL, isoDate, weekDayOf } from "@eazybox/shared";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type WeekStripProps = {
  dates: Date[];
  selected: string;
  onSelect: (date: string) => void;
};

export function WeekStrip({ dates, selected, onSelect }: WeekStripProps) {
  const theme = useTheme();

  return (
    <View style={[styles.strip, { borderBottomColor: theme.hairline }]}>
      {dates.map((date) => {
        const value = isoDate(date);
        const isSelected = value === selected;

        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(value)}
            style={[
              styles.day,
              isSelected && {
                backgroundColor: theme.accentFill,
                borderColor: theme.accentBorder,
              },
            ]}
          >
            <ThemedText
              variant="eyebrow"
              themeColor={isSelected ? "accentText" : "ink3"}
            >
              {WEEK_DAY_INITIAL[weekDayOf(date)]}
            </ThemedText>
            <ThemedText
              variant="bodyBold"
              themeColor={isSelected ? "accentText" : "ink1"}
            >
              {String(date.getDate())}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  day: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: Radius.control,
    borderWidth: 1,
    flex: 1,
    gap: Spacing.half,
    paddingVertical: Spacing.two,
  },
  strip: {
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: Spacing.one,
    paddingBottom: Spacing.three,
  },
});
