import { jwtDecode } from "jwt-decode"
import { ApiError, AuthResponse, CalorieRequest, CalorieResult, RateLimitInfo } from "@/types"
import type { User } from "@/types"
import type { RegisterInput, LoginInput } from "@/lib/validations"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface JwtPayload {
  sub?: string | number
  user_id?: number
  id?: number
  first_name?: string
  last_name?: string
  email?: string
}

export function decodeToken(token: string): Partial<User> {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    return {
      id: Number(payload.user_id ?? payload.id ?? payload.sub ?? 0),
      first_name: payload.first_name ?? "",
      last_name: payload.last_name ?? "",
      email: payload.email ?? "",
    }
  } catch (_) {
    return {}
  }
}

function parseRateLimitHeaders(headers: Headers): RateLimitInfo | undefined {
  const limit = headers.get("RateLimit-Limit")
  const remaining = headers.get("RateLimit-Remaining")
  const reset = headers.get("RateLimit-Reset")
  if (!limit || !remaining || !reset) return undefined
  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: new Date(reset),
  }
}

function secondsUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000))
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<{ data: T; rateLimit?: RateLimitInfo }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    if (res.status === 403) {
      const { useAuthStore } = await import("@/stores/authStore")
      useAuthStore.getState().clearAuth()
    }

    let message = "Something went wrong"
    let retryAfter: number | undefined

    const rateLimit = parseRateLimitHeaders(res.headers)

    try {
      const body = await res.json()
      message = body.message ?? body.error ?? message
      if (res.status === 429) {
        retryAfter = body.retryAfter ?? (rateLimit ? secondsUntil(rateLimit.reset) : undefined)
      }
    } catch (_) {
      if (res.status === 429 && rateLimit) {
        retryAfter = secondsUntil(rateLimit.reset)
      }
    }

    throw new ApiError(message, res.status, retryAfter)
  }

  const data = (await res.json()) as T
  const rateLimit = parseRateLimitHeaders(res.headers)
  return { data, rateLimit }
}

export async function register(data: RegisterInput): Promise<AuthResponse> {
  const { data: res } = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
    }),
  })
  return res
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  const { data: res } = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return res
}

export async function getCalories(
  data: CalorieRequest,
  token: string
): Promise<{ result: CalorieResult; rateLimit?: RateLimitInfo }> {
  const { data: result, rateLimit } = await request<CalorieResult>(
    "/api/get-calories",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  )
  return { result, rateLimit }
}
