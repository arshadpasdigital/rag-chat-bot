import { z } from "zod"

export const authFieldSchemas = {
  email: z.string().trim().email("Enter a valid work email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().trim().min(2, "Enter your name."),
}

export const loginSchema = z.object({
  email: authFieldSchemas.email,
  password: authFieldSchemas.password,
})

export const signupSchema = loginSchema.extend({
  name: authFieldSchemas.name,
})

export type LoginValues = z.infer<typeof loginSchema>
export type SignupValues = z.infer<typeof signupSchema>
