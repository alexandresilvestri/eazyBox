import {
  isoDate,
  shortDate,
  type Checkin,
  type Workout,
  type WorkoutSession,
} from "@eazybox/shared";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ActionBar } from "@/components/ui/action-bar";
import { BoardSection } from "@/components/ui/board-section";
import { Pill } from "@/components/ui/pill";
import { ScreenHeader } from "@/components/ui/screen-header";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useCheckinToggle } from "@/hooks/use-checkin-toggle";
import { sessionsOn } from "@/lib/checkins";
import { useApi } from "@/lib/use-api";

export function HojeScreen() {
  const today = useMemo(() => isoDate(new Date()), []);
  const { data: sessions } = useApi<WorkoutSession[]>(
    `/workout-sessions?from=${today}`,
    [],
  );
  const { data: workouts } = useApi<Workout[]>("/workouts", []);
  const { data: checkins, reload } = useApi<Checkin[]>("/checkins", []);

  const todaySessions = useMemo(
    () => sessionsOn(sessions, today),
    [sessions, today],
  );
  const session = todaySessions[0];
  const workout = workouts.find((entry) => entry.id === session?.workoutId);
  const { mine, pending, error, toggle } = useCheckinToggle(
    session,
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
          <ScreenHeader
            eyebrow={shortDate(today)}
            title={session ? session.time.slice(0, 5) : "Sem treino"}
          />

          {!session ? (
            <ThemedText variant="label" themeColor="ink2">
              Nenhuma sessão publicada para hoje. Confira a semana na aba
              Check-in.
            </ThemedText>
          ) : (
            <>
              <View style={styles.status}>
                {mine ? <Pill tone="ok">Presente</Pill> : null}
                {todaySessions.length > 1 ? (
                  <ThemedText variant="label" themeColor="ink2">
                    {todaySessions.length} horários hoje
                  </ThemedText>
                ) : null}
              </View>

              <BoardSection label="Warmup">{workout?.warmUp}</BoardSection>
              <BoardSection label="Skill">{workout?.skill}</BoardSection>
              <BoardSection label="WOD" emphasis>
                {workout?.wod}
              </BoardSection>
            </>
          )}

          {error ? (
            <ThemedText variant="label" themeColor="errorInk">
              {error}
            </ThemedText>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {session ? (
        <ActionBar
          label={mine ? "Desfazer check-in" : "Fazer check-in"}
          variant={mine ? "outline" : "solid"}
          disabled={pending}
          onPress={() => void toggle()}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.five,
    paddingBottom: Spacing.seven + BottomTabInset,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  status: { alignItems: "center", flexDirection: "row", gap: Spacing.three },
});
