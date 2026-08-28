import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/buttons";
import { Field } from "@/components/ui/field";
import { colors, layout, text } from "@/constants/theme";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const mark = require("@/assets/images/eazybox-mark.png");

export default function LoginScreen() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Redirect href="/" />;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível entrar",
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
          <View style={styles.intro}>
            <View style={styles.logo}>
              <Image source={mark} style={styles.mark} resizeMode="contain" />
            </View>
            <View>
              <Text style={text.heading}>Bora treinar</Text>
              <Text style={styles.subtitle}>
                Entre com o e-mail cadastrado na sua box.
              </Text>
            </View>
          </View>

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
            <Field
              label="Senha"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              secureTextEntry={!revealed}
              revealed={revealed}
              onToggleReveal={() => setRevealed((current) => !current)}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Entrar"
              onPress={submit}
              disabled={
                submitting || email.length === 0 || password.length === 0
              }
            />
            <Text style={styles.footerNote}>
              Sua conta é criada pela box. Esqueceu a senha? Fale com seu coach.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: layout.loginGutter,
    paddingBottom: 40,
    gap: 32,
  },
  intro: {
    alignItems: "flex-start",
    gap: 22,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  mark: {
    width: "100%",
    height: "100%",
  },
  subtitle: {
    ...text.body,
    color: colors.ink2,
    marginTop: 10,
  },
  form: {
    gap: 12,
  },
  error: {
    ...text.meta,
    color: colors.accent,
  },
  actions: {
    gap: 18,
  },
  footerNote: {
    ...text.meta,
    color: colors.ink3,
  },
});
