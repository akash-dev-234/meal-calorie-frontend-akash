"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Flame } from "lucide-react"

import { register as registerUser, login as loginUser, decodeToken } from "@/lib/api"
import {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from "@/lib/validations"
import { useAuthStore } from "@/stores/authStore"
import { ApiError } from "@/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Props = {
  mode: "login" | "register"
}

export function AuthForm({ mode }: Props) {
  const router = useRouter()
  const { setAuth, token } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (token) router.replace("/dashboard")
  }, [token, router])

  const schema = mode === "register" ? registerSchema : loginSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput | LoginInput>({
    resolver: zodResolver(schema),
  })

  const errorMessage = (status: number, message: string) => {
    if (status === 409) return "An account with this email already exists"
    if (status === 401) return "Invalid email or password"
    if (status === 429) return "Too many attempts. Please wait and try again"
    return message
  }

  const onSubmit = async (values: RegisterInput | LoginInput) => {
    setServerError(null)
    setLoading(true)
    try {
      const res =
        mode === "register"
          ? await registerUser(values as RegisterInput)
          : await loginUser(values as LoginInput)
      const user = res.user ?? decodeToken(res.token)
      setAuth(res.token, user as import("@/types").User)
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(errorMessage(err.status, err.message))
      } else {
        setServerError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <Flame className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">CalorieIQ</h1>
        <p className="text-sm text-muted-foreground">
          {mode === "register"
            ? "Create your account to get started"
            : "Sign in to your account"}
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {mode === "register" ? "Create account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {mode === "register"
              ? "Fill in your details below"
              : "Enter your credentials to continue"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {mode === "register" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    {...register("firstName")}
                  />
                  {(errors as Record<string, { message?: string }>).firstName && (
                    <p className="text-xs text-destructive">
                      {(errors as Record<string, { message?: string }>).firstName?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Smith"
                    {...register("lastName")}
                  />
                  {(errors as Record<string, { message?: string }>).lastName && (
                    <p className="text-xs text-destructive">
                      {(errors as Record<string, { message?: string }>).lastName?.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "register" ? "Min. 8 characters" : "••••••••"}
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "register" ? "Creating account…" : "Signing in…"}
                </>
              ) : mode === "register" ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              {mode === "register" ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-primary hover:underline underline-offset-4"
                  >
                    Create one
                  </Link>
                </>
              )}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
