import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@eazybox/shared'
import { apiFetch } from '@/lib/api'

type AuthState = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

const fetchMe = () =>
  apiFetch<User>('/auth/me').catch(() => null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void fetchMe().then((me) => {
      if (!active) return
      setUser(me)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(await fetchMe())
  }, [])

  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => undefined)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
