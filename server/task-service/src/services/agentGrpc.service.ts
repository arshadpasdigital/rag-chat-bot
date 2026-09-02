import * as grpc from '@grpc/grpc-js';
import type { AgentService } from './agent.service';

export class AgentGrpcServices {
	constructor(private readonly agentService: AgentService) {}

	readonly CreateAgent: grpc.handleUnaryCall<any, any> = async (call, callback) => {
		try {
			const { name, goal, persona, userId } = call.request;
			const agent = await this.agentService.createAgent({ name, goal, persona, userId });

			callback(null, {
				message: 'Agent created successfully',
				agent: toGrpcAgent(agent),
			});
		} catch (error: unknown) {
			callback(toGrpcError(error, 'Unable to create agent'));
		}
	};

	readonly UpdateAgent: grpc.handleUnaryCall<any, any> = async (call, callback) => {
		try {
			const { agentId, userId, name, goal, persona } = call.request;
			const agent = await this.agentService.updateAgent(agentId, userId, {
				...(name !== undefined ? { name } : {}),
				...(goal !== undefined ? { goal } : {}),
				...(persona !== undefined ? { persona } : {}),
			});

			callback(null, {
				message: 'Agent updated successfully',
				agent: toGrpcAgent(agent),
			});
		} catch (error: unknown) {
			callback(toGrpcError(error, 'Unable to update agent'));
		}
	};

	readonly GetAgent: grpc.handleUnaryCall<any, any> = async (call, callback) => {
		try {
			const { agentId, userId } = call.request;
			const agent = await this.agentService.getAgentById(agentId, userId);

			callback(null, {
				message: 'Agent found successfully',
				agent: toGrpcAgent(agent),
			});
		} catch (error: unknown) {
			callback(toGrpcError(error, 'Unable to get agent'));
		}
	};

	readonly GetAgents: grpc.handleUnaryCall<any, any> = async (call, callback) => {
		try {
			const { userId, page, limit } = call.request;
			const result = await this.agentService.getAllAgents(userId, page, limit);
			const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / result.limit);

			callback(null, {
				agents: result.agents.map(toGrpcAgent),
				pagination: {
					page: result.page,
					limit: result.limit,
					total: String(result.total),
					totalPages,
					hasNext: result.page < totalPages,
					hasPrev: result.page > 1,
				},
			});
		} catch (error: unknown) {
			callback(toGrpcError(error, 'Unable to get agents'));
		}
	};

	readonly DeleteAgent: grpc.handleUnaryCall<any, any> = async (call, callback) => {
		try {
			const { agentId, userId } = call.request;
			await this.agentService.deleteAgent(agentId, userId);

			callback(null, { message: 'Agent deleted successfully' });
		} catch (error: unknown) {
			callback(toGrpcError(error, 'Unable to delete agent'));
		}
	};
}

const toGrpcAgent = (agent: {
	id: string;
	name: string;
	goal: string;
	persona: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}) => ({
	id: agent.id,
	name: agent.name,
	goal: agent.goal,
	persona: agent.persona,
	userId: agent.userId,
	createdAt: agent.createdAt.toISOString(),
	updatedAt: agent.updatedAt.toISOString(),
});

const toGrpcError = (
	error: unknown,
	fallback: string,
): grpc.ServiceError => {
	const message = error instanceof Error ? error.message : fallback;
	const code =
		error instanceof Error && error.message === 'Agent not found'
			? grpc.status.NOT_FOUND
			: error instanceof Error &&
				(error.message === 'Invalid user id' || error.name === 'ValidationError')
				? grpc.status.INVALID_ARGUMENT
				: grpc.status.INTERNAL;

	return {
		name: 'AgentServiceError',
		message,
		code,
		details: message,
		metadata: new grpc.Metadata(),
	};
};
