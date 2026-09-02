import { isValidObjectId, type Model, Types } from 'mongoose';
import { AgentModel, type IAgent } from '../models/agent.model';

export interface CreateAgentInput {
	name: string;
	goal: string;
	persona: string;
	userId: string;
}

export interface UpdateAgentInput {
	name?: string;
	goal?: string;
	persona?: string;
}

export interface AgentRecord {
	id: string;
	name: string;
	goal: string;
	persona: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface AgentListQuery {
	userId: string;
	page: number;
	limit: number;
}

export interface AgentListResult {
	items: AgentRecord[];
	total: number;
}

export interface AgentRepository {
	create(input: CreateAgentInput): Promise<AgentRecord>;
	findById(id: string, userId: string): Promise<AgentRecord | null>;
	findAll(query: AgentListQuery): Promise<AgentListResult>;
	update(id: string, userId: string, input: UpdateAgentInput): Promise<AgentRecord | null>;
	delete(id: string, userId: string): Promise<boolean>;
}

/** Mongoose stays inside this adapter; the service depends on AgentRepository. */
export class MongooseAgentRepository implements AgentRepository {
	constructor(private readonly model: Model<IAgent> = AgentModel) {}

	async create(input: CreateAgentInput): Promise<AgentRecord> {
		const userId = toObjectId(input.userId);
		if (!userId) throw new Error('Invalid user id');

		const agent = await this.model.create({
			name: input.name,
			goal: input.goal,
			persona: input.persona,
			userId,
		});

		return toAgentRecord(agent);
	}

	async findById(id: string, userId: string): Promise<AgentRecord | null> {
		const ids = toObjectIdPair(id, userId);
		if (!ids) return null;

		const agent = await this.model
			.findOne({ _id: ids.id, userId: ids.userId })
			.lean<IAgent>();

		return agent ? toAgentRecord(agent) : null;
	}

	async findAll(query: AgentListQuery): Promise<AgentListResult> {
		const userId = toObjectId(query.userId);
		if (!userId) return { items: [], total: 0 };

		const skip = (query.page - 1) * query.limit;
		const filter = { userId };
		const [agents, total] = await Promise.all([
			this.model
				.find(filter)
				.sort({ createdAt: -1, _id: -1 })
				.skip(skip)
				.limit(query.limit)
				.lean<IAgent[]>(),
			this.model.countDocuments(filter),
		]);

		return { items: agents.map(toAgentRecord), total };
	}

	async update(
		id: string,
		userId: string,
		input: UpdateAgentInput,
	): Promise<AgentRecord | null> {
		const ids = toObjectIdPair(id, userId);
		if (!ids) return null;

		const agent = await this.model
			.findOneAndUpdate(
				{ _id: ids.id, userId: ids.userId },
				{ $set: input },
				{ new: true, runValidators: true },
			)
			.lean<IAgent>();

		return agent ? toAgentRecord(agent) : null;
	}

	async delete(id: string, userId: string): Promise<boolean> {
		const ids = toObjectIdPair(id, userId);
		if (!ids) return false;

		const result = await this.model.deleteOne({ _id: ids.id, userId: ids.userId });
		return result.deletedCount === 1;
	}
}

const toObjectId = (value: string): Types.ObjectId | null =>
	isValidObjectId(value) ? new Types.ObjectId(value) : null;

const toObjectIdPair = (id: string, userId: string) => {
	const objectId = toObjectId(id);
	const ownerId = toObjectId(userId);
	return objectId && ownerId ? { id: objectId, userId: ownerId } : null;
};

const toAgentRecord = (agent: IAgent): AgentRecord => ({
	id: String(agent._id),
	name: agent.name,
	goal: agent.goal,
	persona: agent.persona,
	userId: String(agent.userId),
	createdAt: agent.createdAt,
	updatedAt: agent.updatedAt,
});
