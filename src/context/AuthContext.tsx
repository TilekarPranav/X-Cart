import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { AuthTokens, AuthUser } from "@/types/api"
import { authService, type LoginPayload, type RegisterPayload } from "@/services/auth.service"
import { tokenStore } from "@/services/token-store"

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

  // Attempt to restore a session on mount using the persisted refresh token.
  // The mock backend keeps the session in memory, so this simply verifies state.
  useEffect(() => {
    let active = true
    async function restore() {
      if (!tokenStore.getAccessToken()) {
        setInitializing(false)
        return
      }
      try {
        const me = await authService.me()
        if (active) setUser(me)
      } catch {
        tokenStore.clear()
      } finally {
        if (active) setInitializing(false)
      }
    }
    restore()
    return () => {
      active = false
    }
  }, [])

  const applyTokens = useCallback(async (tokens: AuthTokens) => {
    tokenStore.setAccessToken(tokens.accessToken)
    tokenStore.setRefreshToken(tokens.refreshToken)
    // Fetch the full profile (with roles) after authenticating.
    try {
      const me = await authService.me()
      setUser(me)
      return me
    } catch (err) {
      // POST /auth/me failed right after login — we cannot confirm this
      // account’s roles, so we MUST NOT proceed (an admin could be silently
      // downgraded to ROLE_CUSTOMER and then blocked from the dashboard).
      // Clear the tokens we just stored and surface a real error instead.
      console.error(
        "[AuthContext] GET /auth/me failed immediately after login — " +
          "clearing tokens and aborting login to prevent silent role downgrade.",
        err,
      )
      tokenStore.clear()
      throw err
    }
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const tokens = await authService.login(payload)
      return applyTokens(tokens)
    },
    [applyTokens],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const tokens = await authService.register(payload)
      return applyTokens(tokens)
    },
    [applyTokens],
  )

  const logout = useCallback(() => {
    tokenStore.clear()
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
