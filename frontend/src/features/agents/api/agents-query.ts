import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { agentsApi } from "@/features/agents/api/agents-api"
import type { AgentBuilderValues } from "@/features/agents/schemas/agent-schema"

export const agentKeys = {
  all: ["agents"] as const,
  detail: (agentId: string) => ["agents", agentId] as const,
}

export function useAgentsQuery() {
  return useQuery({ queryKey: agentKeys.all, queryFn: agentsApi.list })
}

export function useAgentQuery(agentId: string) {
  return useQuery({
    queryKey: agentKeys.detail(agentId),
    queryFn: () => agentsApi.get(agentId),
    enabled: Boolean(agentId),
  })
}

export function useCreateAgentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: AgentBuilderValues) => agentsApi.create(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agentKeys.all }),
  })
}

export function usePublishAgentMutation(agentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => agentsApi.publish(agentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) }),
  })
}
