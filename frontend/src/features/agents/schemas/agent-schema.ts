import { z } from "zod"

export const agentBuilderSchema = z.object({
  name: z.string().trim().min(2, "Agent name must be at least 2 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Add a little more context to the description."),
  prompt: z.string().trim().min(30, "Add more guidance to the system prompt."),
  temperature: z.coerce.number().min(0).max(1),
})

export type AgentBuilderValues = z.infer<typeof agentBuilderSchema>
