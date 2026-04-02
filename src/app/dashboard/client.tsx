"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Search, Trash2, UtensilsCrossed } from "lucide-react"
import { toast } from "sonner"

import { useAuthGuard } from "@/hooks/useAuthGuard"
import { useAuthStore } from "@/stores/authStore"
import { useMealStore } from "@/stores/mealStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const PAGE_SIZE = 5

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function DashboardClient() {
  const { authenticated } = useAuthGuard()
  const user = useAuthStore((s) => s.user)
  const { history, clearHistory } = useMealStore()
  const [page, setPage] = useState(1)

  if (!authenticated) return null

  const validEntries = history.filter(
    (e) => e.dish_name && Number.isFinite(e.total_calories)
  )
  const totalCalories = validEntries.reduce((sum, e) => sum + e.total_calories, 0)
  const avgCalories =
    validEntries.length > 0 ? Math.round(totalCalories / validEntries.length) : 0

  const totalPages = Math.max(1, Math.ceil(validEntries.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageEntries = validEntries.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, {user?.first_name}
        </h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription>Total searches</CardDescription>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{validEntries.length}</p>
            <p className="text-xs text-muted-foreground mt-1">dishes looked up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription>Total calories tracked</CardDescription>
            <Flame className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-primary">
              {totalCalories.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">across all searches</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription>Look up a dish</CardDescription>
            <CardTitle className="text-base">Get calorie data</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/calories">
              <Button className="gap-2 w-full sm:w-auto">
                Search <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Recent searches</h2>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={() => { clearHistory(); setPage(1); toast.success("History cleared") }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear history
            </Button>
          )}
        </div>
        <Separator />

        {validEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-14 text-center">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground/50" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No searches yet</p>
              <p className="text-xs text-muted-foreground">
                Look up a dish to start tracking your nutrition
              </p>
            </div>
            <Link href="/calories">
              <Button size="sm" variant="secondary" className="gap-1.5 mt-1">
                <Search className="h-3.5 w-3.5" />
                Look up a dish
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Dish</th>
                    <th className="px-4 py-3 font-medium">Servings</th>
                    <th className="px-4 py-3 font-medium">Cal / serving</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pageEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 capitalize font-medium">
                        {entry.dish_name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {entry.servings}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {entry.calories_per_serving}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="tabular-nums gap-1">
                          <Flame className="h-3 w-3 text-primary" />
                          {entry.total_calories}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(entry.searchedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium tabular-nums">
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, validEntries.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium tabular-nums">{validEntries.length}</span>
                {" · "}
                Avg{" "}
                <span className="font-medium">{avgCalories} cal</span>
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
