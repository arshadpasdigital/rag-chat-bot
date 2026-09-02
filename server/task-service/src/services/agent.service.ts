import type {
	AgentRepository,
	AgentRecord,
	CreateAgentInput,
	UpdateAgentInput,
} from '../repositories/agent.repository';

export interface AgentListResponse {
	agents: AgentRecord[];
	page: number;
	limit: number;
	total: number;
}

export interface AgentService {
	createAgent(input: CreateAgentInput): Promise<AgentRecord>;
	getAgentById(id: string, userId: string): Promise<AgentRecord>;
	getAllAgents(userId: string, page?: number, limit?: number): Promise<AgentListResponse>;
	updateAgent(id: string, userId: string, input: UpdateAgentInput): Promise<AgentRecord>;
	deleteAgent(id: string, userId: string): Promise<void>;
}

export class DefaultAgentService implements AgentService {
	constructor(private readonly repository: AgentRepository) {}

	createAgent(input: CreateAgentInput): Promise<AgentRecord> {
		return this.repository.create(input);
	}

	async getAgentById(id: string, userId: string): Promise<AgentRecord> {
		const agent = await this.repository.findById(id, userId);
		if (!agent) throw new Error('Agent not found');
		return agent;
	}

	async getAllAgents(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<AgentListResponse> {
		const pagination = normalizePagination(page, limit);
		const result = await this.repository.findAll({ userId, ...pagination });

		return {
			agents: result.items,
			page: pagination.page,
			limit: pagination.limit,
			total: result.total,
		};
	}

	async updateAgent(
		id: string,
		userId: string,
		input: UpdateAgentInput,
	): Promise<AgentRecord> {
		const agent = await this.repository.update(id, userId, input);
		if (!agent) throw new Error('Agent not found');
		return agent;
	}

	async deleteAgent(id: string, userId: string): Promise<void> {
		const deleted = await this.repository.delete(id, userId);
		if (!deleted) throw new Error('Agent not found');
	}
}

const normalizePagination = (page: number, limit: number) => ({
	page: Number.isInteger(page) && page > 0 ? page : 1,
	limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10,
});
