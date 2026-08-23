const KEY = 'eazybox-color-scheme'

export type ColorScheme = 'light' | 'dark'

export const readColorScheme = (): ColorScheme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light'

export const applyColorScheme = (scheme: ColorScheme) => {
  document.documentElement.classList.toggle('dark', scheme === 'dark')
  try {
    localStorage.setItem(KEY, scheme)
  } catch {
    return
  }
}
