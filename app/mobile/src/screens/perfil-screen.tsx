import {
  isActive,
  isoDate,
  startOfWeek,
  weekDates,
  type Checkin,
  type WorkoutSession,
} from "@eazybox/shared";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Pill } from "@/components/ui/pill";
import { ScreenHeader } from "@/components/ui/screen-header";
import { WeekTally } from "@/components/ui/week-tally";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useApi } from "@/lib/use-api";
import { useAuth } from "@/lib/auth";

export function PerfilScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const monday = useMemo(() => startOfWeek(new Date()), []);
  const dates = useMemo(() => weekDates(monday), [monday]);

  const { data: checkins } = useApi<Checkin[]>("/checkins", []);
  const { data: sessions } = useApi<WorkoutSession[]>(
    `/workout-sessions?from=${isoDate(monday)}`,
    [],
  );

  const dateBySession = useMemo(
    () =>
      new Map(
        sessions.map((session) => [
          session.id,
          session.sessionDate.slice(0, 10),
        ]),
      ),
    [sessions],
  );

  const doneDates = useMemo(
    () =>
      checkins
        .filter(isActive)
        .map((checkin) => dateBySession.get(checkin.workoutSessionId))
        .filter((date): date is string => Boolean(date)),
    [checkins, dateBySession],
  );

  const total = checkins.filter(isActive).length;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader eyebrow="Perfil" title={user?.firstName ?? "Aluno"} />

          <View style={styles.identity}>
            <ThemedText variant="body" themeColor="ink2">
              {user?.email}
            </ThemedText>
            <Pill tone={user?.isActive ? "ok" : "neutral"}>
              {user?.isActive ? "Ativo" : "Inativo"}
            </Pill>
          </View>

          <View style={[styles.block, { borderTopColor: theme.hairline }]}>
            <ThemedText variant="eyebrow" themeColor="ink3">
              Treinos esta semana
            </ThemedText>
            <WeekTally dates={dates} done={doneDates} />
          </View>

          <View style={[styles.block, { borderTopColor: theme.hairline }]}>
            <ThemedText variant="eyebrow" themeColor="ink3">
              Check-ins no total
            </ThemedText>
            <ThemedText variant="hero">{String(total)}</ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => void logout()}
            style={[styles.block, { borderTopColor: theme.hairline }]}
          >
            <ThemedText variant="bodyBold" themeColor="accentText">
              Sair
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  block: {
    borderTopWidth: 1,
    gap: Spacing.three,
    paddingTop: Spacing.four,
  },
  content: {
    gap: Spacing.five,
    paddingBottom: Spacing.seven + BottomTabInset,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  identity: { alignItems: "flex-start", gap: Spacing.two },
  safeArea: { flex: 1 },
  screen: { flex: 1 },
});
