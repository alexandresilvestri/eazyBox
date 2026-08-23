import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { WorkoutSession } from "@eazybox/shared";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const today = () => new Date().toISOString().slice(0, 10);

export function HomeScreen() {
  const { user, logout } = useAuth();
  const palette = useTheme();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void apiFetch<WorkoutSession[]>(`/workout-sessions?from=${today()}`)
      .catch(() => [])
      .then((rows) => {
        if (active) setSessions(rows);
      });
    return () => {
      active = false;
    };
  }, []);

  async function checkIn(workoutSessionId: string) {
    try {
      await apiFetch("/checkins", {
        method: "POST",
        body: JSON.stringify({ workoutSessionId }),
      });
      setStatus("Check-in confirmado");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erro inesperado");
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Olá, {user?.firstName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {sessions.length} sessão(ões) a partir de hoje
        </ThemedText>

        {status ? <ThemedText type="small">{status}</ThemedText> : null}

        {sessions.map((session) => (
          <Pressable
            key={session.id}
            style={[styles.row, { backgroundColor: palette.backgroundElement }]}
            onPress={() => void checkIn(session.id)}
          >
            <ThemedText type="smallBold">
              {session.sessionDate.slice(0, 10)} · {session.time}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Toque para fazer check-in
            </ThemedText>
          </Pressable>
        ))}

        <Pressable onPress={() => void logout()}>
          <ThemedText type="link">Sair</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  row: {
    borderRadius: Spacing.three,
    gap: Spacing.one,
    padding: Spacing.three,
  },
});
