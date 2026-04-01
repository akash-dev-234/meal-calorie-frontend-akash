import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MealForm } from "@/components/MealForm"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (s: { token: string; clearAuth: () => void }) => unknown) =>
    selector({ token: "mock-token", clearAuth: vi.fn() }),
}))

const mealStoreMock = {
  lastResult: null,
  setLastResult: vi.fn(),
  addEntry: vi.fn(),
  history: [],
  clearHistory: vi.fn(),
}

vi.mock("@/stores/mealStore", () => ({
  useMealStore: () => mealStoreMock,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("MealForm", () => {
  it("renders dish name and servings inputs with submit button", () => {
    render(<MealForm />)

    expect(screen.getByLabelText("Dish name")).toBeInTheDocument()
    expect(screen.getByLabelText("Servings")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /get calories/i })).toBeInTheDocument()
  })

  it("shows validation error when dish name is empty", async () => {
    render(<MealForm />)

    fireEvent.click(screen.getByRole("button", { name: /get calories/i }))

    await waitFor(() => {
      expect(screen.getByText("Dish name is required")).toBeInTheDocument()
    })
  })
})
