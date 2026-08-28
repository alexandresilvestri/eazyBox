import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  isoDate,
  startOfWeek,
  weekDates,
  WEEK_DAYS,
  WEEK_DAY_INITIAL,
} from "@eazybox/shared";

import { colors, fonts, radius } from "@/constants/theme";

const WEEKS = 6;

const weeksOf = (month: Date) => {
  const monday = startOfWeek(
    new Date(month.getFullYear(), month.getMonth(), 1),
  );
  return Array.from({ length: WEEKS }, (_, week) => {
    const start = new Date(monday);
    start.setDate(monday.getDate() + week * 7);
    return weekDates(start);
  });
};

export function MonthGrid({
  month,
  selected,
  trained,
  onSelect,
}: {
  month: Date;
  selected: string;
  trained: Set<string>;
  onSelect: (day: string) => void;
}) {
  return (
    <View style={styles.grid}>
      <View style={styles.week}>
        {WEEK_DAYS.map((weekDay, index) => (
          <Text key={`${weekDay}-${index}`} style={styles.head}>
            {WEEK_DAY_INITIAL[weekDay]}
          </Text>
        ))}
      </View>

      {weeksOf(month).map((week) => (
        <View key={isoDate(week[0])} style={styles.week}>
          {week.map((date) => {
            const day = isoDate(date);
            const outside = date.getMonth() !== month.getMonth();
            const isSelected = day === selected;
            const didTrain = trained.has(day);

            return (
              <Pressable
                key={day}
                onPress={() => onSelect(day)}
                style={[
                  styles.cell,
                  didTrain && !isSelected && styles.trained,
                  isSelected && styles.selected,
                ]}
              >
                <Text
                  style={[
                    styles.number,
                    outside && styles.outside,
                    isSelected && styles.selectedNumber,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {didTrain && !isSelected ? <View style={styles.dot} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 4,
  },
  week: {
    flexDirection: "row",
    gap: 4,
  },
  head: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: colors.ink3,
    paddingBottom: 2,
  },
  cell: {
    flex: 1,
    height: 46,
    borderRadius: radius.chip,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  trained: {
    backgroundColor: colors.card,
  },
  selected: {
    backgroundColor: colors.accent,
  },
  number: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  outside: {
    color: colors.inkGhost,
  },
  selectedNumber: {
    fontFamily: fonts.bold,
    color: colors.onAccent,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.highlight,
  },
});
