import {
  activeCheckin,
  isoDate,
  shortDate,
  startOfWeek,
  weekDates,
  type Checkin,
  type Workout,
  type WorkoutSession,
} from "@eazybox/shared";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActionBar } from "@/components/ui/action-bar";
import { BoardSection } from "@/components/ui/board-section";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SessionRow } from "@/components/ui/session-row";
import { WeekStrip } from "@/components/ui/week-strip";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useCheckinToggle } from "@/hooks/use-checkin-toggle";
import { sessionsOn } from "@/lib/checkins";
import { useApi } from "@/lib/use-api";

export function CheckinScreen() {
  const monday = useMemo(() => startOfWeek(new Date()), []);
  const dates = useMemo(() => weekDates(monday), [monday]);
  const [selected, setSelected] = useState(() => isoDate(new Date()));
  const [openSession, setOpenSession] = useState<string | null>(null);

  const { data: sessions } = useApi<WorkoutSession[]>(
    `/workout-sessions?from=${isoDate(monday)}`,
    [],
  );
  const { data: workouts } = useApi<Workout[]>("/workouts", []);
  const { data: checkins, reload } = useApi<Checkin[]>("/checkins", []);

  const daySessions = useMemo(
    () => sessionsOn(sessions, selected),
    [sessions, selected],
  );
  const open = daySessions.find((session) => session.id === openSession);
  const openWorkout = workouts.find((entry) => entry.id === open?.workoutId);
  const { mine, pending, error, toggle } = useCheckinToggle(
    open,
    checkins,
    reload,
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader eyebrow="Check-in" title="Semana" />

          <WeekStrip
            dates={dates}
            selected={selected}
            onSelect={(date) => {
              setSelected(date);
              setOpenSession(null);
            }}
          />

          {daySessions.length === 0 ? (
            <ThemedText variant="label" themeColor="ink2">
              Nenhuma sessão neste dia.
            </ThemedText>
          ) : (
            <View>
              {daySessions.map((session) => (
                <View key={session.id}>
                  <SessionRow
                    time={session.time}
                    checkedIn={Boolean(activeCheckin(checkins, session.id))}
                    expanded={session.id === openSession}
                    onPress={() =>
                      setOpenSession(
                        session.id === openSession ? null : session.id,
                      )
                    }
                  />
                  {session.id === openSession ? (
                    <View style={styles.board}>
                      <BoardSection label="Warmup">
                        {openWorkout?.warmUp}
                      </BoardSection>
                      <BoardSection label="Skill">
                        {openWorkout?.skill}
                      </BoardSection>
                      <BoardSection label="WOD" emphasis>
                        {openWorkout?.wod}
                      </BoardSection>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {error ? (
            <ThemedText variant="label" themeColor="errorInk">
              {error}
            </ThemedText>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {open ? (
        <ActionBar
          label={mine ? "Desfazer check-in" : "Fazer check-in"}
          note={`${open.time.slice(0, 5)} · ${shortDate(selected)}`}
          variant={mine ? "outline" : "solid"}
          disabled={pending}
          onPress={() => void toggle()}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  board: {
    gap: Spacing.four,
    paddingBottom: Spacing.five,
    paddingTop: Spacing.three,
  },
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.seven + BottomTabInset,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  safeArea: { flex: 1 },
  screen: { flex: 1 },
});
