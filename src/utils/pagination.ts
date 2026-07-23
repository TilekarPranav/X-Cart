import type { Page } from "@/types/api"

/**
 * Normalizes pagination metadata from a Page<T>, regardless of which shape
 * the backend actually sent (flat PageImpl or nested VIA_DTO `page: {...}`).
 *
 * Always read totals/page-number through this helper instead of touching
 * `page.totalElements` or `page.page.totalElements` directly anywhere else -
 * this backend has switched shape before and may again, and this is the
 * one place that needs to change if it does.
 */
export interface PageMeta {
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export function getPageMeta<T>(page: Page<T> | undefined | null): PageMeta {
  if (!page) {
    return { totalElements: 0, totalPages: 0, number: 0, size: 0 }
  }

  // Nested VIA_DTO shape takes precedence if present.
  if (page.page) {
    return {
      totalElements: page.page.totalElements ?? 0,
      totalPages: page.page.totalPages ?? 0,
      number: page.page.number ?? 0,
      size: page.page.size ?? 0,
    }
  }

  // Fall back to the flat PageImpl shape.
  return {
    totalElements: page.totalElements ?? page.content?.length ?? 0,
    totalPages: page.totalPages ?? 0,
    number: page.number ?? 0,
    size: page.size ?? page.content?.length ?? 0,
  }
}