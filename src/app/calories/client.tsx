"use client"

import { useAuthGuard } from "@/hooks/useAuthGuard"
import { MealForm } from "@/components/MealForm"

export function CaloriesClient() {
  const { authenticated } = useAuthGuard()

  if (!authenticated) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="space-y-1 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Calorie lookup</h1>
        <p className="text-sm text-muted-foreground">
          Search any dish to get calories and a full macronutrient breakdown.
        </p>
      </div>
      <MealForm />
    </div>
  )
}
