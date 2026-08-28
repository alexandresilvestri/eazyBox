import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  activeCheckin,
  addDays,
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
import { Rail } from "@/components/ui/rail";
import { Screen } from "@/components/ui/screen";
import { Section, SectionLabel } from "@/components/ui/section";
import { colors, MAX_FONT_SCALE, radius, text } from "@/constants/theme";
import { useBox } from "@/lib/box";
import { useWorkout } from "@/lib/use-workout";

const RAIL_BACK = 7;
const RAIL_FORWARD = 13;
const RAIL_ITEM = 60;

const dayLabel = (day: string, todayKey: string) => {
  const date = dayDate(day);
  if (day === todayKey) return `Hoje · ${dayAndMonth(date)}`;
  return `${WEEK_DAY_LABEL[weekDayOf(date)]} · ${dayAndMonth(date)}`;
};

export default function WodScreen() {
  const { sessions, checkins } = useBox();
  const todayKey = useMemo(() => isoDate(new Date()), []);
  const [dayIndex, setDayIndex] = useState(RAIL_BACK);

  const railDays = useMemo(() => {
    const first = addDays(dayDate(todayKey), -RAIL_BACK);
    return Array.from({ length: RAIL_BACK + RAIL_FORWARD + 1 }, (_, index) =>
      addDays(first, index),
    );
  }, [todayKey]);
  const day = isoDate(railDays[dayIndex]);
  const daySessions = sessionsOn(sessions, day);
  const workout = useWorkout(daySessions[0]?.workoutId);
  const wod = workout ? parseWod(workout.wod) : null;
  const mine = daySessions.find((session) =>
    activeCheckin(checkins, session.id),
  );

  return (
    <Screen gap={20}>
      <Rail activeIndex={dayIndex} itemWidth={RAIL_ITEM}>
        {railDays.map((date, index) => {
          const isActive = index === dayIndex;
          const isToday = index === RAIL_BACK;
          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setDayIndex(index)}
              style={[
                styles.railDay,
                isToday && !isActive && styles.railToday,
                isActive && styles.railActive,
              ]}
            >
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
                style={[styles.railWeekDay, isActive && styles.railActiveText]}
              >
                {WEEK_DAY_LABEL[weekDayOf(date)].toUpperCase()}
              </Text>
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
                style={[styles.railNumber, isActive && styles.railActiveText]}
              >
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </Rail>

      <View style={styles.dayHead}>
        <Text style={text.label}>{dayLabel(day, todayKey)}</Text>
        <Text style={text.heading}>{wod?.name ?? "Sem treino"}</Text>
      </View>

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
                    numberOfLines={1}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
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
  railDay: {
    width: RAIL_ITEM,
    minHeight: 62,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radius.control,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  railToday: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  railActive: {
    backgroundColor: colors.ink,
  },
  railWeekDay: {
    ...text.micro,
    letterSpacing: 0.6,
  },
  railNumber: {
    ...text.bodyStrong,
    fontSize: 17,
  },
  railActiveText: {
    color: colors.surface,
  },
  dayHead: {
    gap: 6,
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
    minHeight: 38,
    paddingVertical: 8,
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
