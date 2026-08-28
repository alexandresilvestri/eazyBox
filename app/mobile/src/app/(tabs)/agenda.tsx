import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  activeCheckin,
  checkinState,
  dayDate,
  hourLabel,
  isFull,
  isoDate,
  monthHeading,
  monthShort,
  parseWod,
  sessionsOn,
  weekDayLong,
} from "@eazybox/shared";
import type { WorkoutSessionWithStats } from "@eazybox/shared";

import { Card } from "@/components/ui/card";
import { MonthGrid } from "@/components/ui/month-grid";
import { Rail } from "@/components/ui/rail";
import { Screen } from "@/components/ui/screen";
import { Section, SectionHeader } from "@/components/ui/section";
import { SessionRow } from "@/components/ui/session-row";
import { colors, MAX_FONT_SCALE, radius, text } from "@/constants/theme";
import { useBox } from "@/lib/box";
import { useWorkout } from "@/lib/use-workout";

const RAIL_BACK = 6;
const RAIL_ITEM = 56;

export default function AgendaScreen() {
  const { sessions, checkins, trained } = useBox();
  const today = useMemo(() => new Date(), []);
  const [monthIndex, setMonthIndex] = useState(RAIL_BACK);
  const [selected, setSelected] = useState(() => isoDate(today));

  const railMonths = useMemo(
    () =>
      Array.from(
        { length: RAIL_BACK * 2 + 1 },
        (_, index) =>
          new Date(
            today.getFullYear(),
            today.getMonth() + index - RAIL_BACK,
            1,
          ),
      ),
    [today],
  );
  const month = railMonths[monthIndex];
  const daySessions = sessionsOn(sessions, selected);
  const workout = useWorkout(daySessions[0]?.workoutId);
  const selectedDate = dayDate(selected);

  const statusOf = (session: WorkoutSessionWithStats) => {
    if (activeCheckin(checkins, session.id)) {
      return { label: "Check-in", highlighted: true };
    }
    if (isFull(session)) return { label: "Lotada" };
    if (checkinState(session, today) === "closed") return { label: "Passou" };
    return undefined;
  };

  return (
    <Screen gap={18}>
      <Text style={text.title} numberOfLines={1}>
        {monthHeading(month)}
      </Text>

      <Rail activeIndex={monthIndex} itemWidth={RAIL_ITEM}>
        {railMonths.map((candidate, index) => {
          const isActive = index === monthIndex;
          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setMonthIndex(index)}
              style={[styles.railMonth, isActive && styles.railActive]}
            >
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
                style={[styles.railLabel, isActive && styles.railActiveLabel]}
              >
                {monthShort(candidate).toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </Rail>

      <MonthGrid
        month={month}
        selected={selected}
        trained={trained}
        onSelect={setSelected}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotTrained]} />
          <Text style={styles.legendLabel}>Você treinou</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotSelected]} />
          <Text style={styles.legendLabel}>Dia selecionado</Text>
        </View>
      </View>

      <Section>
        <SectionHeader
          label={[
            `${weekDayLong(selectedDate)}, ${selectedDate.getDate()}`,
            workout ? parseWod(workout.wod).name : null,
          ]
            .filter(Boolean)
            .join(" · ")}
          right={
            <Text style={text.caption}>
              {daySessions.length} {daySessions.length === 1 ? "aula" : "aulas"}
            </Text>
          }
        />
        {daySessions.length === 0 ? (
          <Card gap={6}>
            <Text style={text.body}>Sem aulas nesse dia.</Text>
          </Card>
        ) : (
          <View>
            {daySessions.map((session) => (
              <SessionRow
                key={session.id}
                time={hourLabel(session.time)}
                detail={[
                  session.coach ? `Coach ${session.coach.firstName}` : null,
                  `${session.occupied}/${session.capacity}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                status={statusOf(session)}
              />
            ))}
          </View>
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  railMonth: {
    width: RAIL_ITEM,
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radius.control,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  railActive: {
    backgroundColor: colors.ink,
  },
  railLabel: {
    ...text.badge,
    color: colors.ink2,
  },
  railActiveLabel: {
    color: colors.surface,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  dotTrained: {
    backgroundColor: colors.highlight,
  },
  dotSelected: {
    backgroundColor: colors.accent,
  },
  legendLabel: {
    ...text.metaSmall,
    fontSize: 12,
    color: colors.ink2,
  },
});
