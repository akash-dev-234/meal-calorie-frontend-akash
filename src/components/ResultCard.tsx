"use client";

import { useState } from "react";
import type { CalorieResult, MacroNutrient } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Flame,
  Info,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Props = {
  result: CalorieResult;
};

type MacroConfig = {
  key: keyof MacroNutrient;
  label: string;
  daily: number;
  color: string;
};

const MACRO_CONFIG: MacroConfig[] = [
  { key: "protein", label: "Protein", daily: 50, color: "bg-blue-500" },
  { key: "carbohydrates", label: "Carbs", daily: 275, color: "bg-amber-500" },
  { key: "total_fat", label: "Total fat", daily: 78, color: "bg-rose-500" },
  { key: "fiber", label: "Fiber", daily: 28, color: "bg-green-500" },
  { key: "sugars", label: "Sugars", daily: 50, color: "bg-yellow-500" },
  {
    key: "saturated_fat",
    label: "Saturated fat",
    daily: 20,
    color: "bg-red-700",
  },
];

function MacroBar({
  label,
  value,
  daily,
  color,
}: {
  label: string;
  value: number;
  daily: number;
  color: string;
}) {
  const pct = Math.min(Math.round((value / daily) * 100), 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-medium tabular-nums">{value}g</span>
          <span className="text-xs text-muted-foreground">/ {daily}g</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs text-muted-foreground">{pct}% DV</p>
    </div>
  );
}

function MacroGrid({ macros }: { macros: MacroNutrient }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
      {MACRO_CONFIG.filter((m) => macros[m.key] != null).map((m) => (
        <div key={m.key} className="flex justify-between py-0.5">
          <span className="text-muted-foreground">{m.label}</span>
          <span className="font-medium tabular-nums">{macros[m.key]}g</span>
        </div>
      ))}
    </div>
  );
}

export function ResultCard({ result }: Props) {
  const [macroView, setMacroView] = useState<"serving" | "total">("serving");
  const [expandedIngredients, setExpandedIngredients] = useState<Set<number>>(
    new Set(),
  );

  const activeMacros = result.macronutrients_per_serving
    ? MACRO_CONFIG.filter(
        (m) => result.macronutrients_per_serving![m.key] != null,
      )
    : [];

  const displayMacros =
    macroView === "total"
      ? result.total_macronutrients
      : result.macronutrients_per_serving;

  const hasTotalMacros = !!result.total_macronutrients && result.servings > 1;

  const matchedName = result.matched_food?.name;
  const namesDiffer =
    matchedName && matchedName.toLowerCase() !== result.dish_name.toLowerCase();

  const fdcId = result.matched_food?.fdc_id;

  const toggleIngredient = (i: number) => {
    setExpandedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next;
    });
  };

  return (
    <Card className="w-full overflow-hidden">
      <div className="h-1 w-full bg-linear-to-r from-primary/60 via-primary to-primary/60" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-xl capitalize leading-tight">
              {result.dish_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {result.servings} {result.servings === 1 ? "serving" : "servings"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0 mt-1">
            <Badge variant="secondary" className="text-xs">
              {result.source}
            </Badge>
            {fdcId && (
              <a
                href={`https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                USDA #{fdcId}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {namesDiffer && (
          <div className="flex items-start gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground mt-2">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Matched to:{" "}
              <span className="font-medium text-foreground capitalize">
                {matchedName!.toLowerCase()}
              </span>
              {result.matched_food?.data_type && (
                <span className="ml-1 opacity-60">
                  · {result.matched_food.data_type}
                </span>
              )}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-muted p-4">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <p className="text-3xl font-bold tabular-nums">
              {result.calories_per_serving}
            </p>
            <p className="text-xs text-muted-foreground">cal / serving</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-primary/10 p-4">
            <Flame className="h-5 w-5 text-primary" />
            <p className="text-3xl font-bold tabular-nums text-primary">
              {result.total_calories}
            </p>
            <p className="text-xs text-muted-foreground">total calories</p>
          </div>
        </div>

        {activeMacros.length > 0 && displayMacros && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Macronutrients</p>
                {hasTotalMacros && (
                  <div className="flex rounded-lg border text-xs overflow-hidden">
                    <button
                      onClick={() => setMacroView("serving")}
                      className={`px-2.5 py-1 transition-colors ${
                        macroView === "serving"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      Per serving
                    </button>
                    <button
                      onClick={() => setMacroView("total")}
                      className={`px-2.5 py-1 transition-colors ${
                        macroView === "total"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      Total ({result.servings}×)
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {activeMacros.map((m) => (
                  <MacroBar
                    key={m.key}
                    label={m.label}
                    value={displayMacros[m.key] as number}
                    daily={m.daily}
                    color={m.color}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                % DV based on a 2,000 calorie daily reference
              </p>
            </div>
          </>
        )}

        {result.ingredient_breakdown &&
          result.ingredient_breakdown.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-semibold">Ingredient breakdown</p>
                {result.ingredient_breakdown.map((ing, i) => {
                  const expanded = expandedIngredients.has(i);
                  const hasMacros =
                    ing.macronutrients_per_100g &&
                    Object.values(ing.macronutrients_per_100g).some(
                      (v) => v != null,
                    );

                  return (
                    <div key={i} className="rounded-lg border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => hasMacros && toggleIngredient(i)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors ${
                          hasMacros
                            ? "hover:bg-muted/50 cursor-pointer"
                            : "cursor-default"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-medium capitalize truncate">
                            {ing.name.toLowerCase()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ing.calories_per_100g} cal / 100g
                            {ing.serving_size &&
                              ` · serving: ${ing.serving_size}`}
                          </p>
                        </div>
                        {hasMacros &&
                          (expanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                          ))}
                      </button>

                      {expanded && ing.macronutrients_per_100g && (
                        <div className="border-t px-3 py-2.5 bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-2">
                            Per 100g
                          </p>
                          <MacroGrid macros={ing.macronutrients_per_100g} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
      </CardContent>
    </Card>
  );
}
