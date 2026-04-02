"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"

export function RootClient() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s._hasHydrated)

  useEffect(() => {
    if (!hydrated) return
    router.replace(token ? "/dashboard" : "/login")
  }, [hydrated, token, router])

  return null
}
