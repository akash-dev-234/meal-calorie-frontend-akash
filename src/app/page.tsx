import type { Metadata } from "next"
import { RootClient } from "./client"

export const metadata: Metadata = {
  title: "CalorieIQ — Meal Calorie & Macro Tracker",
  description:
    "Look up calories and macronutrients for any dish using USDA FoodData Central. Track your nutrition history.",
}

export default function RootPage() {
  return <RootClient />
}
