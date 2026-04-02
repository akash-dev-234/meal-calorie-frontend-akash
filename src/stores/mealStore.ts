import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CalorieResult, MealHistoryEntry } from "@/types"

interface MealState {
  lastResult: CalorieResult | null
  history: MealHistoryEntry[]
  setLastResult: (result: CalorieResult) => void
  clearResult: () => void
  addEntry: (entry: MealHistoryEntry) => void
  removeEntry: (id: string) => void
  clearHistory: () => void
}

export const useMealStore = create<MealState>()(
  persist(
    (set) => ({
      lastResult: null,
      history: [],
      setLastResult: (result) => set({ lastResult: result }),
      clearResult: () => set({ lastResult: null }),
      addEntry: (entry) =>
        set((state) => ({ history: [entry, ...state.history] })),
      removeEntry: (id) =>
        set((state) => ({ history: state.history.filter((e) => e.id !== id) })),
      clearHistory: () => set({ history: [], lastResult: null }),
    }),
    { name: "meal-store" }
  )
)
