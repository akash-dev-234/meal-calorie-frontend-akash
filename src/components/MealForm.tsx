"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Search } from "lucide-react"

import { getCalories } from "@/lib/api"
import { mealSchema, type MealInput } from "@/lib/validations"
import { useAuthStore } from "@/stores/authStore"
import { useMealStore } from "@/stores/mealStore"
import { ApiError, type RateLimitInfo } from "@/types"
import { ResultCard } from "@/components/ResultCard"
import { DishAutocomplete } from "@/components/DishAutocomplete"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MealForm() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const { lastResult, setLastResult, addEntry } = useMealStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<MealInput>({ resolver: zodResolver(mealSchema) })

  useEffect(() => {
    if (!retryAfter || retryAfter <= 0) return
    const id = setInterval(() => {
      setRetryAfter((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(id)
          setError(null)
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [retryAfter])

  const handleError = (err: ApiError) => {
    if (err.status === 400) {
      setFieldError("servings", { message: err.message })
      return
    }
    if (err.status === 401 || err.status === 403) {
      clearAuth()
      router.replace("/login")
      return
    }
    if (err.status === 404) {
      setError("No dish found matching that name. Try being more specific.")
      return
    }
    if (err.status === 422) {
      setError("Food found but calorie data is unavailable for this dish.")
      return
    }
    if (err.status === 429) {
      const seconds = err.retryAfter ?? 60
      setRetryAfter(seconds)
      setError(`Rate limit reached. Try again in ${seconds}s.`)
      return
    }
    setError(err.status === 500 ? "Server error. Please try again in a moment." : err.message)
  }

  const onSubmit = async (values: MealInput) => {
    if (!token) return
    setError(null)
    setLoading(true)
    try {
      const { result, rateLimit: rl } = await getCalories(
        { dish_name: values.dish_name, servings: values.servings },
        token
      )
      if (rl) setRateLimit(rl)
      setLastResult(result)
      addEntry({
        ...result,
        id: crypto.randomUUID(),
        searchedAt: new Date().toISOString(),
      })
    } catch (err) {
      if (err instanceof ApiError) handleError(err)
      else setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isRateLimited = retryAfter !== null && retryAfter > 0

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              {isRateLimited && (
                <span className="ml-1 font-medium">({retryAfter}s)</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dish_name">Dish name</Label>
            <Controller
              name="dish_name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <DishAutocomplete
                  id="dish_name"
                  value={field.value}
                  onChange={field.onChange}
                  onEnter={handleSubmit(onSubmit)}
                  error={errors.dish_name?.message}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              type="number"
              step="any"
              placeholder="1"
              defaultValue={1}
              {...register("servings", { valueAsNumber: true })}
            />
            {errors.servings && (
              <p className="text-xs text-destructive">{errors.servings.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={loading || isRateLimited}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Looking up…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Get calories
              </>
            )}
          </Button>

          {rateLimit && !isRateLimited && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {rateLimit.remaining}{" "}
              <span className="text-muted-foreground/60">/ {rateLimit.limit} requests left</span>
            </p>
          )}
        </div>
      </form>

      {!loading && lastResult && <ResultCard result={lastResult} />}
    </div>
  )
}
