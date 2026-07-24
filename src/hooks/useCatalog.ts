import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/api/query-keys"
import {
  categoryService,
  productService,
  reviewService,
  type ProductPayload,
  type ProductQuery,
} from "@/services/catalog.service"

/* ------------------------------ Products ------------------------------- */

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => productService.list(query),
    placeholderData: (prev) => prev,
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => productService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) => productService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: (file: File) => productService.uploadImage(file),
  })
}

/* ----------------------------- Categories ------------------------------ */

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoryService.list(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description: string }) => categoryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string; description: string } }) =>
      categoryService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

/* ------------------------------ Reviews -------------------------------- */

export function useReviews(productId: number, page = 0) {
  return useQuery({
    queryKey: queryKeys.reviews.list(productId, page),
    queryFn: () => reviewService.list(productId, page),
    enabled: productId > 0,
  })
}

export function useReviewAverage(productId: number) {
  return useQuery({
    queryKey: queryKeys.reviews.average(productId),
    queryFn: () => reviewService.average(productId),
    enabled: productId > 0,
  })
}

export function useCreateReview(productId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { reviewerName: string; rating: number; comment: string }) =>
      reviewService.create(productId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] })
      qc.invalidateQueries({ queryKey: queryKeys.reviews.average(productId) })
    },
  })
}

export function useUpdateReview(productId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: number; payload: { rating: number; comment: string } }) =>
      reviewService.update(reviewId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] })
      qc.invalidateQueries({ queryKey: queryKeys.reviews.average(productId) })
    },
  })
}

export function useDeleteReview(productId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: number) => reviewService.remove(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] })
      qc.invalidateQueries({ queryKey: queryKeys.reviews.average(productId) })
    },
  })
}
