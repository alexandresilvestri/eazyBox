import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "./themed-text";

import { MaxContentWidth, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <TabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>Hoje</TabButton>
          </TabTrigger>
          <TabTrigger name="checkin" href="/checkin" asChild>
            <TabButton>Check-in</TabButton>
          </TabTrigger>
          <TabTrigger name="perfil" href="/perfil" asChild>
            <TabButton>Perfil</TabButton>
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const theme = useTheme();

  return (
    <Pressable {...props} style={styles.trigger}>
      <View
        style={[
          styles.triggerInner,
          isFocused && { backgroundColor: theme.accentFill },
        ]}
      >
        <ThemedText
          variant="eyebrow"
          themeColor={isFocused ? "accentText" : "ink3"}
        >
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function TabBar(props: TabListProps) {
  const theme = useTheme();

  return (
    <View
      {...props}
      style={[
        styles.bar,
        { backgroundColor: theme.surface, borderTopColor: theme.hairline },
      ]}
    >
      <View style={styles.barInner}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    bottom: 0,
    paddingVertical: Spacing.two,
    position: "absolute",
    width: "100%",
  },
  barInner: {
    alignSelf: "center",
    flexDirection: "row",
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    width: "100%",
  },
  slot: { height: "100%" },
  trigger: { flex: 1 },
  triggerInner: {
    alignItems: "center",
    borderRadius: Radius.control,
    paddingVertical: Spacing.two,
  },
});
