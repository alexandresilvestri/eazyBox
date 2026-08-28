import { StyleSheet, Text, View } from "react-native";
import { WEEK_DAY_LABEL, weekDayOf } from "@eazybox/shared";

import { colors, fonts, MAX_FONT_SCALE, radius } from "@/constants/theme";

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
              numberOfLines={1}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              style={[
                styles.day,
                trained && styles.trainedDay,
                !trained && isToday && styles.todayText,
              ]}
            >
              {WEEK_DAY_LABEL[weekDayOf(date)].toUpperCase()}
            </Text>
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
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
    gap: 6,
  },
  cell: {
    flex: 1,
    minHeight: 46,
    paddingVertical: 8,
    paddingHorizontal: 2,
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
    letterSpacing: 0.6,
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
