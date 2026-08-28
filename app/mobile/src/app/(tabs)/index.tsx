import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  checkinState,
  dayAndMonth,
  dayDate,
  dayHeading,
  dayKey,
  hourLabel,
  initials,
  isoDate,
  nextSession,
  opensAt,
  parseWod,
  sessionsOn,
} from "@eazybox/shared";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PrimaryButton } from "@/components/ui/buttons";
import { Card } from "@/components/ui/card";
import { EmptyCard } from "@/components/ui/empty";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Screen } from "@/components/ui/screen";
import { Section, SectionHeader } from "@/components/ui/section";
import { WeekStrip } from "@/components/ui/week-strip";
import { colors, MAX_FONT_SCALE, text } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { useBox } from "@/lib/box";
import { countdown, relativeTime } from "@/lib/format";
import { weekDaysTrained } from "@/lib/sessions";
import { useWorkout } from "@/lib/use-workout";

const VISIBLE_ANNOUNCEMENTS = 2;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessions, announcements, trained } = useBox();

  const today = useMemo(() => new Date(), []);
  const todayKey = isoDate(today);
  const next = nextSession(sessions, today);
  const workout = useWorkout(sessionsOn(sessions, todayKey)[0]?.workoutId);
  const wod = workout ? parseWod(workout.wod) : null;
  const week = weekDaysTrained(trained, today);
  const weekCount = week.filter((day) => day.trained).length;

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={text.label}>{dayHeading(today)}</Text>
          <Text style={styles.greeting}>Olá, {user?.firstName}</Text>
        </View>
        {user ? (
          <Avatar label={initials(user.firstName, user.lastName)} />
        ) : null}
      </View>

      {next ? (
        <Card gap={16}>
          <View style={styles.heroHead}>
            <View style={styles.heroTop}>
              <Text
                style={styles.heroEyebrow}
                numberOfLines={1}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {dayKey(next) === todayKey
                  ? "Próxima aula"
                  : `Próxima aula · ${dayAndMonth(dayDate(dayKey(next)))}`}
              </Text>
              {checkinState(next, today) === "early" ? (
                <Badge label={`Abre em ${countdown(opensAt(next), today)}`} />
              ) : (
                <Badge label="Check-in aberto" tone="accent" />
              )}
            </View>
            <Text style={styles.heroTime} numberOfLines={1}>
              {hourLabel(next.time)}
            </Text>
          </View>

          <View style={styles.heroDetails}>
            <View style={styles.spread}>
              <Text style={[text.bodyStrong, styles.shrink]} numberOfLines={1}>
                {wod?.name ?? "Treino a definir"}
              </Text>
              {next.coach ? (
                <Text style={[text.meta, styles.shrink]} numberOfLines={1}>
                  Coach {next.coach.firstName}
                </Text>
              ) : null}
            </View>
            <View style={styles.spread}>
              <Text style={[text.meta, styles.shrink]} numberOfLines={1}>
                {next.occupied} de {next.capacity} vagas ocupadas
              </Text>
              <Text style={text.meta} numberOfLines={1}>
                {Math.max(0, next.capacity - next.occupied)} livres
              </Text>
            </View>
            <ProgressBar value={next.occupied} total={next.capacity} />
          </View>

          <PrimaryButton
            label="Fazer check-in"
            onPress={() => router.navigate("/checkin")}
          />
        </Card>
      ) : (
        <EmptyCard
          title="Nenhuma aula agendada"
          detail="A box ainda não publicou os próximos horários."
        />
      )}

      <Section>
        <SectionHeader
          label="WOD de hoje"
          right={
            <Pressable onPress={() => router.navigate("/wod")} hitSlop={12}>
              <Text style={styles.sectionLink}>Ver completo</Text>
            </Pressable>
          }
        />
        <Card gap={6} padding={18}>
          {wod ? (
            <>
              <Text style={text.title}>
                {[wod.name, wod.scheme].filter(Boolean).join(" · ")}
              </Text>
              <Text style={styles.wodBody}>{wod.movements.join(" · ")}</Text>
            </>
          ) : (
            <Text style={text.meta}>Sem treino publicado para hoje.</Text>
          )}
        </Card>
      </Section>

      <Section>
        <SectionHeader
          label="Minha semana"
          right={
            <Text style={styles.weekCount}>
              {weekCount} {weekCount === 1 ? "dia" : "dias"}
            </Text>
          }
        />
        <WeekStrip days={week} today={today} />
      </Section>

      <Section>
        <SectionHeader label="Avisos da box" />
        <View>
          {announcements.length === 0 ? (
            <Text style={text.meta}>Nenhum aviso por aqui.</Text>
          ) : (
            announcements
              .slice(0, VISIBLE_ANNOUNCEMENTS)
              .map((announcement) => (
                <View key={announcement.id} style={styles.notice}>
                  <Text style={styles.noticeBody}>{announcement.body}</Text>
                  <Text style={text.metaSmall}>
                    {relativeTime(announcement.createdAt)}
                  </Text>
                </View>
              ))
          )}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  greeting: {
    ...text.title,
    marginTop: 4,
  },
  heroHead: {
    gap: 6,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heroEyebrow: {
    ...text.label,
    flexShrink: 1,
  },
  sectionLink: {
    ...text.caption,
    color: colors.accent,
  },
  heroTime: {
    ...text.display,
  },
  shrink: {
    flexShrink: 1,
  },
  heroDetails: {
    gap: 8,
  },
  spread: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  wodBody: {
    ...text.body,
    color: colors.ink2,
  },
  weekCount: {
    ...text.badge,
    letterSpacing: 1.3,
    color: colors.highlight,
  },
  notice: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 3,
  },
  noticeBody: {
    ...text.body,
    lineHeight: 22,
  },
});
