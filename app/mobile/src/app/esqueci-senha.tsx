import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { GhostButton, PrimaryButton } from "@/components/ui/buttons";
import { Field } from "@/components/ui/field";
import { colors, layout, MAX_FONT_SCALE, text } from "@/constants/theme";
import { ApiError, apiFetch } from "@/lib/api";

export default function EsqueciSenhaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/mobile/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível enviar",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.fill}
      >
        <View style={styles.content}>
          <View>
            <Text style={text.heading} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Esqueci a senha
            </Text>
            <Text
              style={styles.subtitle}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {sent
                ? "Se existe uma conta com esse e-mail, enviamos um link para criar uma senha nova. Ele vale por 30 minutos."
                : "Informe o e-mail cadastrado na sua box e enviamos um link para criar uma senha nova."}
            </Text>
          </View>

          {sent ? null : (
            <View style={styles.form}>
              <Field
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                inputMode="email"
              />
              {error ? (
                <Text
                  style={styles.error}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {error}
                </Text>
              ) : null}
            </View>
          )}

          <View style={styles.actions}>
            {sent ? null : (
              <PrimaryButton
                label="Enviar link"
                onPress={submit}
                disabled={submitting || email.trim().length === 0}
              />
            )}
            <GhostButton label="Voltar" onPress={() => router.back()} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  fill: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: layout.loginGutter,
    paddingBottom: 40,
    gap: 32,
  },
  subtitle: { ...text.body, color: colors.ink2, marginTop: 10 },
  form: { gap: 12 },
  error: { ...text.meta, color: colors.accent },
  actions: { gap: 12 },
});
