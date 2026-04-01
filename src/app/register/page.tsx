import type { Metadata } from "next"
import { AuthForm } from "@/components/AuthForm"

export const metadata: Metadata = {
  title: "Create account — CalorieIQ",
  description: "Create a free CalorieIQ account to start looking up calories and nutritional data for any dish.",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <AuthForm mode="register" />
    </div>
  )
}
