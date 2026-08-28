import { StyleSheet, Text, View } from "react-native";
import { WEEK_DAY_LABEL, weekDayOf } from "@eazybox/shared";

import { colors, fonts, radius } from "@/constants/theme";

export type WeekDayCell = { date: Date; trained: boolean };

export function WeekStrip({
  days,
  today,
}: {
  days: WeekDayCell[];
  today: Date;
}) {
  const todayKey = today.toDateString();

  return (
    <View style={styles.row}>
      {days.map(({ date, trained }) => {
        const isToday = date.toDateString() === todayKey;
        return (
          <View
            key={date.toISOString()}
            style={[
              styles.cell,
              trained && styles.trained,
              !trained && isToday && styles.today,
            ]}
          >
            <Text
              style={[
                styles.day,
                trained && styles.trainedDay,
                !trained && isToday && styles.todayText,
              ]}
            >
              {WEEK_DAY_LABEL[weekDayOf(date)].toUpperCase()}
            </Text>
            <Text
              style={[
                styles.number,
                trained && styles.trainedNumber,
                !trained && isToday && styles.todayText,
              ]}
            >
              {date.getDate()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  cell: {
    flex: 1,
    height: 46,
    borderRadius: radius.control,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  trained: {
    backgroundColor: colors.highlightSoft,
    borderWidth: 1,
    borderColor: colors.highlightLine,
  },
  today: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  day: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: colors.ink3,
  },
  trainedDay: {
    color: colors.ink2,
  },
  todayText: {
    color: colors.ink,
  },
  number: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.ink3,
  },
  trainedNumber: {
    color: colors.highlight,
  },
});
