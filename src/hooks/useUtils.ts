import { useCallback, useEffect, useState } from "react"
import { STORAGE_KEYS } from "@/constants/app"

/** Debounce a rapidly-changing value (e.g. search input). */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/** True once the window has scrolled past `threshold` px. */
export function useScrollThreshold(threshold = 400): boolean {
  const [passed, setPassed] = useState(false)
  useEffect(() => {
    const onScroll = () => setPassed(window.scrollY > threshold)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])
  return passed
}

/** Media query matcher. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [query])
  return matches
}

/** Recent searches persisted to localStorage. */
export function useRecentSearches(max = 6) {
  const [searches, setSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.recentSearches)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })

  const persist = useCallback((next: string[]) => {
    setSearches(next)
    try {
      localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const add = useCallback(
    (term: string) => {
      const clean = term.trim()
      if (!clean) return
      setSearches((prev) => {
        const next = [clean, ...prev.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, max)
        try {
          localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [max],
  )

  const clear = useCallback(() => persist([]), [persist])

  return { searches, add, clear }
}

/** Countdown to a target timestamp, returned as h/m/s parts. */
export function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000)
    return () => clearInterval(id)
  }, [target])
  const totalSeconds = Math.floor(remaining / 1000)
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: remaining <= 0,
  }
}
