import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { STORAGE_KEYS } from "@/constants/app"

/**
 * Wishlist is stored client-side. TODO: backend endpoint pending — the API
 * contract does not yet define a wishlist resource, so we persist product ids
 * in localStorage and hydrate product details from the products cache.
 */

interface WishlistContextValue {
  ids: number[]
  count: number
  has: (id: number) => boolean
  toggle: (id: number) => void
  remove: (id: number) => void
  clear: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

function read(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.wishlist)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(read)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(ids))
    } catch {
      /* ignore */
    }
  }, [ids])

  const toggle = useCallback((id: number) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const remove = useCallback((id: number) => setIds((prev) => prev.filter((x) => x !== id)), [])
  const clear = useCallback(() => setIds([]), [])

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      count: ids.length,
      has: (id: number) => ids.includes(id),
      toggle,
      remove,
      clear,
    }),
    [ids, toggle, remove, clear],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider")
  return ctx
}
