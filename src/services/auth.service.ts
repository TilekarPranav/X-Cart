import { ENDPOINTS } from "@/api/endpoints"
import type { ApiResponse, AuthUser, UserProfile, RawRole } from "@/types/api"
import { normalizeRoles } from "@/types/api"
import { http, invalidateCsrfToken, unwrap } from "./http"

export interface LoginPayload {
  email: string
  password: string
}
export interface RegisterPayload {
  name: string
  email: string
  password: string
}

function normalizeUser(raw: AuthUser): AuthUser {
  return { ...raw, roles: normalizeRoles(raw.roles as RawRole[]) }
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data } = await http.post<ApiResponse<AuthUser>>(ENDPOINTS.auth.login, payload)
    invalidateCsrfToken()
    return normalizeUser(unwrap(data))
  },
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data } = await http.post<ApiResponse<AuthUser>>(ENDPOINTS.auth.register, payload)
    invalidateCsrfToken()
    return normalizeUser(unwrap(data))
  },
  async me(): Promise<AuthUser> {
    const { data } = await http.get<ApiResponse<AuthUser>>(ENDPOINTS.auth.me)
    return normalizeUser(unwrap(data))
  },
  async logout(): Promise<void> {
    await http.post(ENDPOINTS.auth.logout)
    invalidateCsrfToken()
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