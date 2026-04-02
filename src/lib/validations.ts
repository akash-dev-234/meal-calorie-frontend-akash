import { z } from "zod"

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const mealSchema = z.object({
  dish_name: z
    .string()
    .trim()
    .min(1, "Dish name is required")
    .max(100, "Dish name is too long")
    .regex(/[a-zA-Z]/, "Dish name must contain at least one letter"),
  servings: z
    .number({ error: "Servings must be a number" })
    .positive("Servings must be greater than 0")
    .max(100, "Servings cannot exceed 100"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type MealInput = z.infer<typeof mealSchema>
