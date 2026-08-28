import { Redirect, Tabs } from "expo-router";

import { AppTabBar } from "@/components/app-tab-bar";
import { colors } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { BoxProvider } from "@/lib/box";

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <BoxProvider>
      <Tabs
        tabBar={() => <AppTabBar />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.surface },
        }}
      />
    </BoxProvider>
  );
}
