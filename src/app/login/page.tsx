import type { Metadata } from "next"
import { AuthForm } from "@/components/AuthForm"

export const metadata: Metadata = {
  title: "Sign in — CalorieIQ",
  description: "Sign in to your CalorieIQ account to look up calories and macros for any dish.",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <AuthForm mode="login" />
    </div>
  )
}
