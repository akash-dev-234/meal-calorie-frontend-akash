"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"

export function useAuthGuard() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s._hasHydrated)

  useEffect(() => {
    if (!hydrated) return
    if (!token) router.replace("/login")
  }, [hydrated, token, router])

  return { authenticated: hydrated && token !== null }
}
