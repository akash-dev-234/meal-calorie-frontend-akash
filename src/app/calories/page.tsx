import type { Metadata } from "next"
import { CaloriesClient } from "./client"

export const metadata: Metadata = {
  title: "Calorie Lookup — CalorieIQ",
  description: "Look up calories and macronutrients for any dish using USDA FoodData Central.",
}

export default function CaloriesPage() {
  return <CaloriesClient />
}
