import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LoginScreen } from "@/screens/login-screen";

SplashScreen.preventAutoHideAsync();

function Gate() {
  const { user, loading } = useAuth();

  if (loading) return null;
  return user ? <AppTabs /> : <LoginScreen />;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Anton-Regular": require("@/assets/fonts/Anton-Regular.ttf"),
    "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-Bold": require("@/assets/fonts/Inter-Bold.ttf"),
    "JetBrainsMono-Regular": require("@/assets/fonts/JetBrainsMono-Regular.ttf"),
  });

  if (!loaded && !error) return null;

  return (
    <AuthProvider>
      <AnimatedSplashOverlay />
      <Gate />
    </AuthProvider>
  );
}
