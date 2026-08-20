import { ENDPOINTS } from "@/api/endpoints"
import type { ApiResponse, AuthUser, UserProfile, RawRole } from "@/types/api"
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

function normalizeUser(raw: AuthUser): AuthUser {
  // The real Spring Boot backend serialises each GrantedAuthority as
  // {authority: "ROLE_X"} (Jackson default), not a plain string —
  // .includes("ROLE_ADMIN") silently fails against an object. Normalising at
  // this one boundary means every call site can just use plain strings.
  return { ...raw, roles: normalizeRoles(raw.roles as RawRole[]) }
}

export const authService = {
  // login/register set httpOnly auth cookies as a side effect on the backend;
  // the response body is the user's own profile, not a token to store.
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data } = await http.post<ApiResponse<AuthUser>>(ENDPOINTS.auth.login, payload)
    return normalizeUser(unwrap(data))
  },
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data } = await http.post<ApiResponse<AuthUser>>(ENDPOINTS.auth.register, payload)
    return normalizeUser(unwrap(data))
  },
  async me(): Promise<AuthUser> {
    const { data } = await http.get<ApiResponse<AuthUser>>(ENDPOINTS.auth.me)
    return normalizeUser(unwrap(data))
  },
  // httpOnly cookies can't be cleared by client-side JS — this actually ends
  // the session server-side. Safe to call even if the session already lapsed.
  async logout(): Promise<void> {
    await http.post(ENDPOINTS.auth.logout)
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