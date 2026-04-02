import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MealForm } from "@/components/MealForm"
import { ApiError } from "@/types"
import type { CalorieResult, RateLimitInfo } from "@/types"

const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}))

vi.mock("@/lib/api", () => ({
  getCalories: vi.fn(),
}))

vi.mock("@/components/DishAutocomplete", () => ({
  DishAutocomplete: ({
    onChange,
    id,
    error,
  }: {
    onChange: (v: string) => void
    id?: string
    error?: string
  }) => (
    <>
      <input id={id} onChange={(e) => onChange(e.target.value)} />
      {error && <p>{error}</p>}
    </>
  ),
}))

const mockClearAuth = vi.fn()
vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (s: { token: string; clearAuth: () => void }) => unknown) =>
    selector({ token: "mock-token", clearAuth: mockClearAuth }),
}))

const mockSetLastResult = vi.fn()
const mockAddEntry = vi.fn()
const mockClearResult = vi.fn()

const mealStoreMock = {
  lastResult: null as CalorieResult | null,
  setLastResult: mockSetLastResult,
  addEntry: mockAddEntry,
  clearResult: mockClearResult,
  history: [],
  clearHistory: vi.fn(),
}

vi.mock("@/stores/mealStore", () => ({
  useMealStore: (selector?: (s: typeof mealStoreMock) => unknown) =>
    selector ? selector(mealStoreMock) : mealStoreMock,
}))

const baseResult: CalorieResult = {
  dish_name: "chicken biryani",
  servings: 1,
  calories_per_serving: 350,
  total_calories: 350,
  source: "USDA FoodData Central",
}

function fillAndSubmit(dishName = "chicken biryani") {
  fireEvent.change(screen.getByLabelText("Dish name"), { target: { value: dishName } })
  fireEvent.click(screen.getByRole("button", { name: /get calories/i }))
}

beforeEach(() => {
  vi.resetAllMocks()
  mealStoreMock.lastResult = null
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

  it("calls setLastResult and addEntry on successful API call", async () => {
    const { getCalories } = await import("@/lib/api")
    vi.mocked(getCalories).mockResolvedValueOnce({ result: baseResult })

    render(<MealForm />)
    fillAndSubmit()

    await waitFor(() => expect(mockSetLastResult).toHaveBeenCalledWith(baseResult))
    expect(mockAddEntry).toHaveBeenCalledWith(
      expect.objectContaining({ dish_name: "chicken biryani", total_calories: 350 })
    )
  })

  it("shows result card after successful API call", async () => {
    const { getCalories } = await import("@/lib/api")
    vi.mocked(getCalories).mockResolvedValueOnce({ result: baseResult })
    mealStoreMock.lastResult = baseResult

    render(<MealForm />)
    fillAndSubmit()

    await waitFor(() => expect(mockSetLastResult).toHaveBeenCalled())
    expect(screen.getByText("chicken biryani")).toBeInTheDocument()
    expect(screen.getAllByText("350")).toHaveLength(2)
  })

  it("shows rate limit counter when API returns rate limit headers", async () => {
    const { getCalories } = await import("@/lib/api")
    const rateLimit: RateLimitInfo = {
      limit: 10,
      remaining: 7,
      reset: new Date(Date.now() + 60_000),
    }
    vi.mocked(getCalories).mockResolvedValueOnce({ result: baseResult, rateLimit })

    render(<MealForm />)
    fillAndSubmit()

    await waitFor(() => expect(screen.getByText("7")).toBeInTheDocument())
    expect(screen.getByText(/\/ 10 requests left/)).toBeInTheDocument()
  })

  it("shows 404 error message when dish is not found", async () => {
    const { getCalories } = await import("@/lib/api")
    vi.mocked(getCalories).mockRejectedValueOnce(new ApiError("Not found", 404))

    render(<MealForm />)
    fillAndSubmit()

    await waitFor(() =>
      expect(
        screen.getByText("No dish found matching that name. Try being more specific.")
      ).toBeInTheDocument()
    )
  })

  it("disables submit button and shows countdown on 429", async () => {
    const { getCalories } = await import("@/lib/api")
    vi.mocked(getCalories).mockRejectedValueOnce(new ApiError("Rate limited", 429, 30))

    render(<MealForm />)
    fillAndSubmit()

    await waitFor(() => expect(screen.getByText(/rate limit reached/i)).toBeInTheDocument())
    expect(screen.getByText("(30s)")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /get calories/i })).toBeDisabled()
  })

  it("clears auth and redirects to /login on 401", async () => {
    const { getCalories } = await import("@/lib/api")
    vi.mocked(getCalories).mockRejectedValueOnce(new ApiError("Unauthorized", 401))

    render(<MealForm />)
    fillAndSubmit()

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login"))
    expect(mockClearAuth).toHaveBeenCalled()
  })

  it("clears auth and redirects to /login on 403", async () => {
    const { getCalories } = await import("@/lib/api")
    vi.mocked(getCalories).mockRejectedValueOnce(new ApiError("Forbidden", 403))

    render(<MealForm />)
    fillAndSubmit()

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login"))
    expect(mockClearAuth).toHaveBeenCalled()
  })
})
