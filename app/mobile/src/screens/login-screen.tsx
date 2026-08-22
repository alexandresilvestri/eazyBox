import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/lib/auth";

export function LoginScreen() {
  const { login } = useAuth();
  const palette = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  const field = [
    styles.input,
    { color: palette.text, backgroundColor: palette.backgroundElement },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">EazyBox</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Entre para fazer seu check-in
        </ThemedText>

        <TextInput
          style={field}
          placeholder="E-mail"
          placeholderTextColor={palette.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={field}
          placeholder="Senha"
          placeholderTextColor={palette.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? (
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
        ) : null}

        <Pressable
          style={[styles.button, { backgroundColor: palette.backgroundSelected }]}
          disabled={submitting}
          onPress={() => void handleSubmit()}
        >
          <ThemedText type="smallBold">
            {submitting ? "Entrando..." : "Entrar"}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  button: {
    alignItems: "center",
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
