"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Search, Utensils } from "lucide-react"
import { toast } from "sonner"

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
  const { lastResult, setLastResult, addEntry, clearResult } = useMealStore()
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
    switch (err.status) {
      case 400:
        setFieldError("servings", { message: err.message })
        break
      case 401:
      case 403:
        clearAuth()
        router.replace("/login")
        break
      case 404:
        setError("No dish found matching that name. Try being more specific.")
        break
      case 422:
        setError("Food found but calorie data is unavailable for this dish.")
        break
      case 429: {
        const seconds = err.retryAfter ?? 60
        setRetryAfter(seconds)
        setError(`Rate limit reached. Try again in ${seconds}s.`)
        break
      }
      default:
        setError(err.status === 500 ? "Server error. Please try again in a moment." : err.message)
    }
  }

  const onSubmit = async (values: MealInput) => {
    if (!token) return
    setError(null)
    setLoading(true)
    try {
      const { result, rateLimit: rl } = await getCalories(values, token)
      if (rl) setRateLimit(rl)
      setLastResult(result)
      addEntry({
        ...result,
        id: crypto.randomUUID(),
        searchedAt: new Date().toISOString(),
      })
      toast.success(`${result.dish_name} — ${result.total_calories} cal`, {
        description: `${result.servings} ${result.servings === 1 ? "serving" : "servings"} · added to history`,
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
            <div className="flex items-center justify-between">
              <Label htmlFor="dish_name">Dish name</Label>
              <span className="text-xs text-muted-foreground">
                Press <kbd className="rounded border px-1 py-0.5 text-xs font-mono bg-muted">/</kbd> to search
              </span>
            </div>
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

      {!loading && lastResult && (
        <ResultCard result={lastResult} onDismiss={clearResult} />
      )}

      {!loading && !lastResult && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-14 text-center">
          <Utensils className="h-8 w-8 text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium">No dish searched yet</p>
            <p className="text-xs text-muted-foreground">
              Type a dish name above and hit &ldquo;Get calories&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
