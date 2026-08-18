import { ENDPOINTS } from "@/api/endpoints"
import type { ApiResponse, AuthTokens, AuthUser, UserProfile, RawRole } from "@/types/api"
import { normalizeRoles } from "@/types/api"
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
    const raw = unwrap(data)
    // Normalise roles here — the real Spring Boot backend serialises each
    // GrantedAuthority as {authority: "ROLE_X"} (Jackson default), not a plain
    // string. .includes("ROLE_ADMIN") silently fails against an object, which
    // is what blocked correctly-provisioned admins from reaching the dashboard.
    // Normalising at this single boundary means no call-site changes needed.
    return { ...raw, roles: normalizeRoles(raw.roles as RawRole[]) }
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
