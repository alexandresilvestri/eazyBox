import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  activeCheckin,
  CHECKIN_WINDOW_HOURS,
  checkinState,
  dayDate,
  dayHeading,
  dayKey,
  hourLabel,
  initials,
  opensAt,
  parseWod,
} from "@eazybox/shared";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GhostButton, PrimaryButton } from "@/components/ui/buttons";
import { Card } from "@/components/ui/card";
import { EmptyCard } from "@/components/ui/empty";
import { CheckCircleIcon, ClockIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Screen } from "@/components/ui/screen";
import { Section, SectionHeader } from "@/components/ui/section";
import { colors, MAX_FONT_SCALE, radius, text } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useBox } from "@/lib/box";
import { countdown } from "@/lib/format";
import { targetSession } from "@/lib/sessions";
import { useAttendees } from "@/lib/use-attendees";
import { useWorkout } from "@/lib/use-workout";

const WINDOW_RULE = `Abre ${CHECKIN_WINDOW_HOURS}h antes e fecha no início da aula.`;

type RosterEntry = {
  userId: string;
  firstName: string;
  lastName: string;
  isCoach: boolean;
};

const BANNERS = {
  early: { title: "Check-in ainda fechado", detail: WINDOW_RULE },
  open: { title: "Check-in aberto", detail: WINDOW_RULE },
  closed: { title: "Check-in encerrado", detail: "A aula já começou." },
} as const;

export default function CheckinScreen() {
  const { sessions, checkins, reload } = useBox();
  const [submitting, setSubmitting] = useState(false);

  const now = useMemo(() => new Date(), []);
  const target = targetSession(sessions, checkins, now);
  const mine = target ? activeCheckin(checkins, target.id) : undefined;
  const state = target ? checkinState(target, now) : "closed";
  const workout = useWorkout(target?.workoutId);
  const { attendees, reload: reloadAttendees } = useAttendees(target?.id);

  const coach = target?.coach;
  const roster: RosterEntry[] = [
    ...(coach
      ? [
          {
            userId: coach.id,
            firstName: coach.firstName,
            lastName: coach.lastName,
            isCoach: true,
          },
        ]
      : []),
    ...attendees.filter((attendee) => attendee.userId !== coach?.id),
  ];

  async function toggle() {
    if (!target) return;
    setSubmitting(true);
    try {
      if (mine) {
        await apiFetch(`/checkins/${mine.id}/undo`, { method: "PATCH" });
      } else {
        await apiFetch("/checkins", {
          method: "POST",
          body: JSON.stringify({ workoutSessionId: target.id }),
        });
      }
      await Promise.all([reload(), reloadAttendees()]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen gap={20}>
      <View>
        <Text style={text.label}>
          {dayHeading(target ? dayDate(dayKey(target)) : now)}
        </Text>
        <Text style={styles.title}>
          {target ? `Aula das ${hourLabel(target.time)}` : "Sem aula"}
        </Text>
      </View>

      {target ? (
        <>
          <Card gap={18} padding={22}>
            <View style={styles.cardTop}>
              <View>
                <Text style={text.label}>Vagas ocupadas</Text>
                <View style={styles.countRow}>
                  <Text
                    style={text.display}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {target.occupied}
                  </Text>
                  <Text
                    style={styles.total}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    / {target.capacity}
                  </Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
                <Text
                  style={styles.cardMetaTitle}
                  numberOfLines={2}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {workout ? parseWod(workout.wod).name : "Treino a definir"}
                </Text>
                {coach ? (
                  <Text
                    style={text.meta}
                    numberOfLines={1}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    Coach {coach.firstName}
                  </Text>
                ) : null}
              </View>
            </View>
            <ProgressBar value={target.occupied} total={target.capacity} />
          </Card>

          <View style={styles.stateBlock}>
            <View style={[styles.banner, mine && styles.bannerConfirmed]}>
              {mine ? <CheckCircleIcon /> : <ClockIcon />}
              <View style={styles.bannerText}>
                <Text style={[text.bodyStrong, mine && styles.confirmedTitle]}>
                  {mine ? "Check-in confirmado" : BANNERS[state].title}
                </Text>
                <Text style={styles.bannerDetail}>
                  {mine
                    ? `Te vejo às ${hourLabel(target.time)}. Chegue 10 min antes.`
                    : BANNERS[state].detail}
                </Text>
                {!mine && state === "early" ? (
                  <View style={styles.bannerBadge}>
                    <Badge
                      label={`Abre em ${countdown(opensAt(target), now)}`}
                    />
                  </View>
                ) : null}
              </View>
            </View>

            {mine ? (
              <GhostButton
                label="Cancelar check-in"
                onPress={toggle}
                disabled={submitting || state === "closed"}
              />
            ) : (
              <PrimaryButton
                label="Confirmar check-in"
                onPress={toggle}
                disabled={submitting || state !== "open"}
              />
            )}
          </View>

          <Section>
            <SectionHeader
              label="Quem vai"
              right={
                <Text style={text.caption}>{attendees.length} confirmados</Text>
              }
            />
            <View>
              {roster.map((attendee) => (
                <View key={attendee.userId} style={styles.attendee}>
                  <Avatar
                    label={initials(attendee.firstName, attendee.lastName)}
                    size={34}
                  />
                  <Text style={styles.attendeeName}>
                    {attendee.firstName} {attendee.lastName}
                  </Text>
                  {attendee.isCoach ? (
                    <Badge label="Coach" tone="outline" />
                  ) : null}
                </View>
              ))}
              {roster.length === 0 ? (
                <Text style={styles.empty}>
                  Ninguém confirmou essa aula ainda.
                </Text>
              ) : null}
            </View>
          </Section>
        </>
      ) : (
        <EmptyCard
          title="Nenhuma aula para confirmar"
          detail="Quando a box publicar os horários o check-in aparece aqui."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...text.title,
    marginTop: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 8,
  },
  total: {
    ...text.title,
    color: colors.ink3,
  },
  cardMeta: {
    flexShrink: 1,
    alignItems: "flex-end",
    gap: 2,
  },
  cardMetaTitle: {
    ...text.bodyStrong,
    textAlign: "right",
  },
  stateBlock: {
    gap: 12,
  },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  bannerConfirmed: {
    backgroundColor: colors.highlightSoft,
    borderWidth: 1,
    borderColor: colors.highlightLine,
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  confirmedTitle: {
    color: colors.highlight,
  },
  bannerDetail: {
    ...text.meta,
  },
  bannerBadge: {
    marginTop: 8,
  },
  attendee: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  attendeeName: {
    ...text.body,
    flex: 1,
  },
  empty: {
    ...text.meta,
    paddingTop: 12,
  },
});
