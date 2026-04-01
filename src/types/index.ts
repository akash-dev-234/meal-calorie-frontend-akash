export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface CalorieRequest {
  dish_name: string
  servings: number
}

export interface MacroNutrient {
  protein?: number
  total_fat?: number
  carbohydrates?: number
  fiber?: number
  sugars?: number
  saturated_fat?: number
}

export interface IngredientBreakdown {
  name: string
  calories_per_100g: number
  serving_size?: string
  brand?: string
  data_type?: string
  fdc_id?: number
  macronutrients_per_100g?: MacroNutrient
}

export interface MatchedFood {
  name: string
  fdc_id?: number
  data_type?: string
  published_date?: string
}

export interface CalorieResult {
  dish_name: string
  servings: number
  calories_per_serving: number
  total_calories: number
  macronutrients_per_serving?: MacroNutrient
  total_macronutrients?: MacroNutrient
  source: string
  matched_food?: MatchedFood
  ingredient_breakdown?: IngredientBreakdown[]
}

export interface MealHistoryEntry {
  id: string
  searchedAt: string
  dish_name: string
  servings: number
  calories_per_serving: number
  total_calories: number
  source: string
  macronutrients_per_serving?: MacroNutrient
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date
}

export class ApiError extends Error {
  status: number
  retryAfter?: number

  constructor(message: string, status: number, retryAfter?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.retryAfter = retryAfter
  }
}
