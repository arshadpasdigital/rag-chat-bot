import { httpClient } from "@/shared/api/http-client"
import type { AgentBuilderValues } from "@/features/agents/schemas/agent-schema"

export type Agent = {
  id: string
  name: string
  status: "live" | "draft" | "paused"
  updatedAt: string
}

export const agentsApi = {
  list: async () => (await httpClient.get<Agent[]>("/agents")).data,
  get: async (agentId: string) =>
    (await httpClient.get<Agent>(`/agents/${agentId}`)).data,
  create: async (values: AgentBuilderValues) =>
    (await httpClient.post<Agent>("/agents", values)).data,
  update: async (agentId: string, values: Partial<AgentBuilderValues>) =>
    (await httpClient.patch<Agent>(`/agents/${agentId}`, values)).data,
  publish: async (agentId: string) =>
    (await httpClient.post<Agent>(`/agents/${agentId}/publish`)).data,
}
