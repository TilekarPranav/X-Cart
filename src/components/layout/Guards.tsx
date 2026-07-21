import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Spinner } from "@/components/ui"

/** Full-screen loader shown while the auth session is being restored. */
function AuthGate() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-6 w-6 text-primary" />
    </div>
  )
}

/** Requires the user to be logged in; otherwise redirects to /login, preserving destination. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <AuthGate />
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <>{children}</>
}

/** Requires the user to be logged in AND hold ROLE_ADMIN; otherwise redirects to /admin/login. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <AuthGate />
  if (!isAuthenticated || !isAdmin) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/admin/login?next=${next}`} replace />
  }
  return <>{children}</>
}

/** Redirects an already-authenticated user away from auth pages (login/register). */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { isAuthenticated, initializing } = useAuth()
  if (initializing) return <AuthGate />
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}
