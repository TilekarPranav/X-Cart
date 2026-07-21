import { ENDPOINTS } from "@/api/endpoints"
import type { ApiResponse, Category, Page, Product, Review } from "@/types/api"
import { http, unwrap } from "./http"

export interface ProductQuery {
  name?: string
  categoryId?: number
  page?: number
  size?: number
}

export interface ProductPayload {
  name: string
  description: string
  price: number
  imageUrl: string
  categoryId: number
}

export const productService = {
  async list(query: ProductQuery = {}): Promise<Page<Product>> {
    const { data } = await http.get<ApiResponse<Page<Product>>>(ENDPOINTS.products.search, {
      params: {
        name: query.name || undefined,
        categoryId: query.categoryId,
        page: query.page ?? 0,
        size: query.size ?? 12,
      },
    })
    return unwrap(data)
  },
  async getById(id: number): Promise<Product> {
    const { data } = await http.get<ApiResponse<Product>>(ENDPOINTS.products.byId(id))
    return unwrap(data)
  },
  async create(payload: ProductPayload): Promise<Product> {
    const { data } = await http.post<ApiResponse<Product>>(ENDPOINTS.products.base, payload)
    return unwrap(data)
  },
  async update(id: number, payload: ProductPayload): Promise<Product> {
    const { data } = await http.put<ApiResponse<Product>>(ENDPOINTS.products.byId(id), payload)
    return unwrap(data)
  },
  async remove(id: number): Promise<string> {
    const { data } = await http.delete<ApiResponse<never>>(ENDPOINTS.products.byId(id))
    return data.message
  },
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    const { data } = await http.post<ApiResponse<string>>("/products/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return unwrap(data)
  },
}

export const categoryService = {
  async list(): Promise<Category[]> {
    const { data } = await http.get<ApiResponse<Category[]>>(ENDPOINTS.categories.base)
    return unwrap(data)
  },
  async create(payload: { name: string; description: string }): Promise<Category> {
    const { data } = await http.post<ApiResponse<Category>>(ENDPOINTS.categories.base, payload)
    return unwrap(data)
  },
  async update(id: number, payload: { name: string; description: string }): Promise<Category> {
    const { data } = await http.put<ApiResponse<Category>>(ENDPOINTS.categories.byId(id), payload)
    return unwrap(data)
  },
  async remove(id: number): Promise<string> {
    const { data } = await http.delete<ApiResponse<never>>(ENDPOINTS.categories.byId(id))
    return data.message
  },
}

export const reviewService = {
  async list(productId: number, page = 0, size = 10): Promise<Page<Review>> {
    const { data } = await http.get<ApiResponse<Page<Review>>>(ENDPOINTS.products.reviews(productId), {
      params: { page, size },
    })
    return unwrap(data)
  },
  async average(productId: number): Promise<number> {
    const { data } = await http.get<ApiResponse<number>>(ENDPOINTS.products.reviewsAverage(productId))
    return unwrap(data)
  },
  async create(productId: number, payload: { reviewerName: string; rating: number; comment: string }): Promise<Review> {
    const { data } = await http.post<ApiResponse<Review>>(ENDPOINTS.products.reviews(productId), payload)
    return unwrap(data)
  },
  async update(reviewId: number, payload: { rating: number; comment: string }): Promise<Review> {
    const { data } = await http.put<ApiResponse<Review>>(ENDPOINTS.reviews.byId(reviewId), payload)
    return unwrap(data)
  },
  async remove(reviewId: number): Promise<string> {
    const { data } = await http.delete<ApiResponse<never>>(ENDPOINTS.reviews.byId(reviewId))
    return data.message
  },
}
