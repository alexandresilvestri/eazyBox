import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { initials, isActive } from "@eazybox/shared";

import { Avatar } from "@/components/ui/avatar";
import { GhostButton } from "@/components/ui/buttons";
import { LockIcon, UserIcon } from "@/components/ui/icons";
import { ListRow } from "@/components/ui/list-row";
import { Screen } from "@/components/ui/screen";
import { Section, SectionLabel } from "@/components/ui/section";
import { Toggle } from "@/components/ui/toggle";
import { colors, radius, text } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { useBox } from "@/lib/box";
import { monthAndYear } from "@/lib/format";
import { usePref } from "@/lib/prefs";
import { streakOf } from "@/lib/sessions";

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const { checkins, trained } = useBox();
  const classReminder = usePref("classReminder", true);
  const boxNotices = usePref("boxNotices", false);

  const today = useMemo(() => new Date(), []);
  const total = checkins.filter(isActive).length;
  const streak = streakOf(trained, today);
  const version = Constants.expoConfig?.version;

  if (!user) return null;

  return (
    <Screen>
      <View style={styles.identity}>
        <Avatar label={initials(user.firstName, user.lastName)} size={76} />
        <View style={styles.identityText}>
          <Text style={text.heading}>{user.firstName}</Text>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <SectionLabel>Check-ins</SectionLabel>
          <Text style={text.stat}>{total}</Text>
          <Text style={text.metaSmall}>
            desde {monthAndYear(user.createdAt)}
          </Text>
        </View>
        <View style={styles.stat}>
          <SectionLabel>Sequência</SectionLabel>
          <Text style={[text.stat, styles.streak]}>{streak}</Text>
          <Text style={text.metaSmall}>dias seguidos</Text>
        </View>
      </View>

      <Section>
        <SectionLabel>Conta</SectionLabel>
        <View style={styles.group}>
          <ListRow icon={<UserIcon />} label="Editar perfil" />
          <ListRow icon={<LockIcon />} label="Alterar senha" divided />
        </View>
      </Section>

      <Section>
        <SectionLabel>Notificações</SectionLabel>
        <View style={styles.group}>
          <ListRow
            label="Lembrete de aula"
            detail="1h antes do horário"
            right={
              <Toggle
                value={classReminder.value}
                onToggle={classReminder.toggle}
              />
            }
          />
          <ListRow
            label="Avisos da box"
            detail="Comunicados gerais"
            divided
            right={
              <Toggle value={boxNotices.value} onToggle={boxNotices.toggle} />
            }
          />
        </View>
      </Section>

      <View style={styles.footer}>
        <GhostButton label="Sair da conta" onPress={() => void logout()} />
        {version ? (
          <Text style={styles.version}>EazyBox · versão {version}</Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  email: {
    ...text.meta,
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 4,
  },
  streak: {
    color: colors.highlight,
  },
  group: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    overflow: "hidden",
  },
  footer: {
    marginTop: 12,
    gap: 12,
  },
  version: {
    ...text.metaSmall,
    fontSize: 12,
    textAlign: "center",
  },
});
