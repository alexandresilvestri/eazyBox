import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/lib/auth";
import { HomeScreen } from "@/screens/home-screen";
import { LoginScreen } from "@/screens/login-screen";

export default function IndexScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          Carregando...
        </ThemedText>
      </ThemedView>
    );
  }

  return user ? <HomeScreen /> : <LoginScreen />;
}

const styles = StyleSheet.create({
  centered: { alignItems: "center", flex: 1, justifyContent: "center" },
});
