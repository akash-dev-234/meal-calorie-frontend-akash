import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { ResultCard } from "@/components/ResultCard"
import type { CalorieResult } from "@/types"

const baseResult: CalorieResult = {
  dish_name: "grilled salmon",
  servings: 2,
  calories_per_serving: 280,
  total_calories: 560,
  source: "USDA FoodData Central",
}

describe("ResultCard", () => {
  it("renders dish name, servings and calorie values", () => {
    render(<ResultCard result={baseResult} />)

    expect(screen.getByText("grilled salmon")).toBeInTheDocument()
    expect(screen.getByText("2 servings")).toBeInTheDocument()
    expect(screen.getByText("280")).toBeInTheDocument()
    expect(screen.getByText("560")).toBeInTheDocument()
  })

  it("renders macronutrients when present", () => {
    const result: CalorieResult = {
      ...baseResult,
      macronutrients_per_serving: {
        protein: 39.2,
        total_fat: 12.4,
        carbohydrates: 0,
      },
    }

    render(<ResultCard result={result} />)

    expect(screen.getByText("Protein")).toBeInTheDocument()
    expect(screen.getByText("Total fat")).toBeInTheDocument()
    expect(screen.getByText("39.2g")).toBeInTheDocument()
  })

  it("does not render macros section when macros are absent", () => {
    render(<ResultCard result={baseResult} />)

    expect(screen.queryByText("Macronutrients per serving")).not.toBeInTheDocument()
  })
})
