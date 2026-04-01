import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CalorieResult, MealHistoryEntry } from "@/types"

interface MealState {
  lastResult: CalorieResult | null
  history: MealHistoryEntry[]
  setLastResult: (result: CalorieResult) => void
  addEntry: (entry: MealHistoryEntry) => void
  clearHistory: () => void
}

export const useMealStore = create<MealState>()(
  persist(
    (set) => ({
      lastResult: null,
      history: [],
      setLastResult: (result) => set({ lastResult: result }),
      addEntry: (entry) =>
        set((state) => ({ history: [entry, ...state.history] })),
      clearHistory: () => set({ history: [], lastResult: null }),
    }),
    { name: "meal-store" }
  )
)
