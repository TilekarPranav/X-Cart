import { ENDPOINTS } from "@/api/endpoints"
import type { ApiResponse, AuthTokens, AuthUser, UserProfile } from "@/types/api"
import { http, unwrap } from "./http"

export interface LoginPayload {
  email: string
  password: string
}
export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await http.post<ApiResponse<AuthTokens>>(ENDPOINTS.auth.login, payload)
    return unwrap(data)
  },
  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const { data } = await http.post<ApiResponse<AuthTokens>>(ENDPOINTS.auth.register, payload)
    return unwrap(data)
  },
  async me(): Promise<AuthUser> {
    const { data } = await http.get<ApiResponse<AuthUser>>(ENDPOINTS.auth.me)
    return unwrap(data)
  },
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const { data } = await http.get<ApiResponse<UserProfile>>(ENDPOINTS.users.profile)
    return unwrap(data)
  },
  async updateProfile(payload: { name: string }): Promise<UserProfile> {
    const { data } = await http.put<ApiResponse<UserProfile>>(ENDPOINTS.users.profile, payload)
    return unwrap(data)
  },
  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<string> {
    const { data } = await http.put<ApiResponse<never>>(ENDPOINTS.users.changePassword, payload)
    return data.message
  },
}
