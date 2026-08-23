import {
  createContext,
  useContext,
  useEffect,
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

  async function login(email: string, password: string) {
    await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(await fetchMe())
  }

  async function logout() {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => undefined)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
