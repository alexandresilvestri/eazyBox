import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  activeCheckin,
  checkinState,
  dayDate,
  hourLabel,
  isFull,
  isoDate,
  monthHeading,
  parseWod,
  sessionsOn,
  weekDayLong,
} from "@eazybox/shared";
import type { WorkoutSessionWithStats } from "@eazybox/shared";

import { IconButton } from "@/components/ui/buttons";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { MonthGrid } from "@/components/ui/month-grid";
import { Screen } from "@/components/ui/screen";
import { Section, SectionHeader } from "@/components/ui/section";
import { SessionRow } from "@/components/ui/session-row";
import { colors, radius, text } from "@/constants/theme";
import { useBox } from "@/lib/box";
import { useWorkout } from "@/lib/use-workout";

const shiftMonth = (month: Date, offset: number) =>
  new Date(month.getFullYear(), month.getMonth() + offset, 1);

export default function AgendaScreen() {
  const { sessions, checkins, trained } = useBox();
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState(() => isoDate(today));

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
      <View style={styles.header}>
        <Text style={text.title}>{monthHeading(month)}</Text>
        <View style={styles.nav}>
          <IconButton
            icon={<ChevronLeft color={colors.ink} size={16} />}
            onPress={() => setMonth(shiftMonth(month, -1))}
          />
          <IconButton
            icon={<ChevronRight color={colors.ink} size={16} />}
            onPress={() => setMonth(shiftMonth(month, 1))}
          />
        </View>
      </View>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nav: {
    flexDirection: "row",
    gap: 8,
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
