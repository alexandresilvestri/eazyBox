import { StyleSheet, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CalendarIcon,
  CheckinIcon,
  HomeIcon,
  ProfileIcon,
  WodIcon,
} from "@/components/ui/icons";
import { TabItem } from "@/components/ui/tab-item";
import { colors, layout } from "@/constants/theme";

const TABS = [
  { href: "/", label: "Início", Icon: HomeIcon },
  { href: "/checkin", label: "Check-in", Icon: CheckinIcon },
  { href: "/wod", label: "WOD", Icon: WodIcon },
  { href: "/agenda", label: "Agenda", Icon: CalendarIcon },
  { href: "/perfil", label: "Perfil", Icon: ProfileIcon },
] as const;

export function AppTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {TABS.map(({ href, label, Icon }) => (
        <TabItem
          key={href}
          label={label}
          active={pathname === href}
          icon={(color) => <Icon color={color} size={layout.icon} />}
          onPress={() => router.navigate(href)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: layout.tabBar,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
});
