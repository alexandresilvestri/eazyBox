import { design } from "@eazybox/shared";

import { useColorScheme } from "@/hooks/use-color-scheme";

const themes = {
  light: design.theme("light"),
  dark: design.theme("dark"),
};

export function useTheme() {
  const scheme = useColorScheme();
  return themes[scheme === "dark" ? "dark" : "light"];
}
