import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/lib/auth";

export function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();
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
    {
      color: theme.ink1,
      backgroundColor: theme.fieldFill,
      borderColor: theme.fieldBorder,
    },
  ];

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.brand}>
          <ThemedText variant="hero">EAZYBOX</ThemedText>
          <ThemedText variant="eyebrow" themeColor="ink3">
            Treine, marque presença
          </ThemedText>
        </View>

        <View style={styles.form}>
          <TextInput
            style={field}
            placeholder="E-mail"
            placeholderTextColor={theme.ink3}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={field}
            placeholder="Senha"
            placeholderTextColor={theme.ink3}
            autoComplete="current-password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? (
            <ThemedText variant="label" themeColor="errorInk">
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={() => void handleSubmit()}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.accentSolid,
                opacity: submitting ? 0.5 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <ThemedText variant="bodyBold" themeColor="accentInk">
              {submitting ? "Entrando..." : "Entrar"}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  brand: { gap: Spacing.two },
  button: {
    alignItems: "center",
    borderRadius: Radius.control,
    paddingVertical: Spacing.three,
  },
  form: { gap: Spacing.three },
  input: {
    borderRadius: Radius.control,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  safeArea: {
    flex: 1,
    gap: Spacing.six,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  screen: { flex: 1 },
});
