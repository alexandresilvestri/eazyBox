import { WEEK_DAY_INITIAL, isoDate, weekDayOf } from "@eazybox/shared";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type WeekTallyProps = {
  dates: Date[];
  done: string[];
};

export function WeekTally({ dates, done }: WeekTallyProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {dates.map((date) => {
        const value = isoDate(date);
        const isDone = done.includes(value);

        return (
          <View key={value} style={styles.day}>
            <ThemedText variant="eyebrow" themeColor="ink3">
              {WEEK_DAY_INITIAL[weekDayOf(date)]}
            </ThemedText>
            <View
              style={[
                styles.tick,
                {
                  backgroundColor: isDone ? theme.accentSolid : theme.hairline,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  day: { alignItems: "center", flex: 1, gap: Spacing.two },
  row: { flexDirection: "row", gap: Spacing.two },
  tick: { borderRadius: 1, height: 28, width: 4 },
});
