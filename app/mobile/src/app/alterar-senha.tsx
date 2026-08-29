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
import { changePasswordSchema } from "@eazybox/shared";

import { GhostButton, PrimaryButton } from "@/components/ui/buttons";
import { Field } from "@/components/ui/field";
import { colors, layout, MAX_FONT_SCALE, text } from "@/constants/theme";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AlterarSenhaScreen() {
  const router = useRouter();
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const valid =
    changePasswordSchema.safeParse({ currentPassword, password }).success &&
    password === confirmation;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await changePassword(currentPassword, password);
      router.back();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível salvar",
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
              Alterar senha
            </Text>
            <Text
              style={styles.subtitle}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              Use pelo menos 8 caracteres. Suas outras sessões expiram em até 15 minutos.
            </Text>
          </View>

          <View style={styles.form}>
            <Field
              label="Senha atual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              secureTextEntry
            />
            <Field
              label="Nova senha"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry={!revealed}
              revealed={revealed}
              onToggleReveal={() => setRevealed((current) => !current)}
            />
            <Field
              label="Confirmar nova senha"
              value={confirmation}
              onChangeText={setConfirmation}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry={!revealed}
            />
            {confirmation.length > 0 && password !== confirmation ? (
              <Text style={styles.error} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                As senhas não conferem
              </Text>
            ) : null}
            {error ? (
              <Text style={styles.error} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {error}
              </Text>
            ) : null}
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Salvar senha"
              onPress={submit}
              disabled={submitting || !valid}
            />
            <GhostButton label="Cancelar" onPress={() => router.back()} />
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
