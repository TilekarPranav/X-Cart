import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { AuthUser } from "@/types/api"
import { authService, type LoginPayload, type RegisterPayload } from "@/services/auth.service"

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  initializing: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [initializing, setInitializing] = useState(true)
  const queryClient = useQueryClient()

  // Attempt to restore a session on mount. Auth is cookie-based (httpOnly),
  // so there's nothing in JS to check first — the browser sends the cookie
  // automatically if one exists. A 401 here just means "not logged in,"
  // which is a normal, expected outcome, not an error.
  useEffect(() => {
    let active = true
    async function restore() {
      try {
        const me = await authService.me()
        if (active) setUser(me)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setInitializing(false)
      }
    }
    restore()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const me = await authService.login(payload)
    setUser(me)
    return me
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const me = await authService.register(payload)
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    // Fire-and-forget: clear local state immediately for a snappy UI, but
    // still tell the server to clear the httpOnly cookies — otherwise the
    // session cookie remains valid and a page refresh would silently log
    // the user back in.
    authService.logout().catch(() => {
      /* best-effort: local state is already cleared regardless */
    })
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!user?.roles?.includes("ROLE_ADMIN"),
      initializing,
      login,
      register,
      logout,
    }),
    [user, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}