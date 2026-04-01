import type { Metadata } from "next"
import { DashboardClient } from "./client"

export const metadata: Metadata = {
  title: "Dashboard — CalorieIQ",
  description: "View your calorie lookup history and recent nutritional searches.",
}

export default function DashboardPage() {
  return <DashboardClient />
}
