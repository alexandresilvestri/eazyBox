import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  activeCheckin,
  dayAndMonth,
  dayDate,
  hourLabel,
  isoDate,
  parseWod,
  sessionsOn,
  WEEK_DAY_LABEL,
  weekDayOf,
} from "@eazybox/shared";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyCard } from "@/components/ui/empty";
import { Screen } from "@/components/ui/screen";
import { Section, SectionLabel } from "@/components/ui/section";
import { colors, radius, text } from "@/constants/theme";
import { useBox } from "@/lib/box";
import { useWorkout } from "@/lib/use-workout";

const shiftDay = (day: string, days: number) => {
  const date = dayDate(day);
  date.setDate(date.getDate() + days);
  return isoDate(date);
};

const dayLabel = (day: string, todayKey: string) => {
  const date = dayDate(day);
  if (day === todayKey) return `Hoje · ${dayAndMonth(date)}`;
  return `${WEEK_DAY_LABEL[weekDayOf(date)]} · ${dayAndMonth(date)}`;
};

export default function WodScreen() {
  const { sessions, checkins } = useBox();
  const todayKey = useMemo(() => isoDate(new Date()), []);
  const [day, setDay] = useState(todayKey);

  const previous = shiftDay(day, -1);
  const next = shiftDay(day, 1);
  const daySessions = sessionsOn(sessions, day);
  const workout = useWorkout(daySessions[0]?.workoutId);
  const wod = workout ? parseWod(workout.wod) : null;
  const mine = daySessions.find((session) =>
    activeCheckin(checkins, session.id),
  );

  return (
    <Screen gap={20}>
      <View style={styles.pager}>
        <Pressable style={styles.step} onPress={() => setDay(previous)}>
          <Text style={styles.stepLabel}>← {dayDate(previous).getDate()}</Text>
        </Pressable>
        <View style={styles.current}>
          <Text style={styles.currentLabel}>{dayLabel(day, todayKey)}</Text>
        </View>
        <Pressable style={styles.step} onPress={() => setDay(next)}>
          <Text style={styles.stepLabel}>{dayDate(next).getDate()} →</Text>
        </Pressable>
      </View>

      <Text style={text.heading}>{wod?.name ?? "Sem treino"}</Text>

      {workout && wod ? (
        <View style={styles.blocks}>
          {workout.warmUp ? (
            <Card gap={8} padding={18}>
              <SectionLabel>Aquecimento</SectionLabel>
              <Text style={text.body}>{workout.warmUp}</Text>
            </Card>
          ) : null}

          {workout.skill ? (
            <Card gap={8} padding={18}>
              <SectionLabel>Skill</SectionLabel>
              <Text style={text.body}>{workout.skill}</Text>
            </Card>
          ) : null}

          <Card gap={12} padding={18} outlined>
            <View style={styles.wodHead}>
              <SectionLabel>WOD</SectionLabel>
              {wod.modality ? <Badge label={wod.modality} /> : null}
            </View>
            {wod.scheme ? <Text style={text.title}>{wod.scheme}</Text> : null}
            <View style={styles.movements}>
              {wod.movements.map((movement) => (
                <View key={movement} style={styles.movement}>
                  <View style={styles.bullet} />
                  <Text style={styles.movementLabel}>{movement}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      ) : (
        <EmptyCard
          title="Nada publicado nesse dia"
          detail="Escolha outro dia para ver o treino da box."
        />
      )}

      {daySessions.length > 0 ? (
        <Section>
          <SectionLabel>Horários do dia</SectionLabel>
          <View style={styles.chips}>
            {daySessions.map((session) => {
              const isMine = session.id === mine?.id;
              return (
                <View
                  key={session.id}
                  style={[styles.chip, isMine && styles.chipMine]}
                >
                  <Text
                    style={[styles.chipLabel, isMine && styles.chipMineLabel]}
                  >
                    {hourLabel(session.time)}
                    {isMine ? " · você" : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pager: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  step: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    ...text.meta,
    fontSize: 13,
  },
  current: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  currentLabel: {
    ...text.bodyStrong,
    fontSize: 13,
    color: colors.surface,
  },
  blocks: {
    gap: 14,
  },
  wodHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  movements: {
    gap: 8,
  },
  movement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.ink3,
  },
  movementLabel: {
    ...text.body,
    flex: 1,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  chipMine: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentLine,
  },
  chipLabel: {
    ...text.meta,
    fontSize: 14,
  },
  chipMineLabel: {
    ...text.bodyStrong,
    fontSize: 14,
    color: colors.accent,
  },
});
