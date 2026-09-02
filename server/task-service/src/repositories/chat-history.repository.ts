import { randomUUID } from 'node:crypto';
import type { Model } from 'mongoose';
import {
	ChatHistoryModel,
	type IChatHistory,
	type IMessage,
} from '../models/chatHistory.model';

export type ChatMessageRole = IMessage['role'];

export interface ChatMessageRecord {
	id: string;
	role: ChatMessageRole;
	userId: string;
	threadId: string;
	content: string;
	thinking?: string;
	hitl?: IMessage['hitl'];
}

export interface ChatHistoryRecord {
	userId: string;
	threadId: string;
	messages: ChatMessageRecord[];
	createdAt: Date;
	updatedAt: Date;
}

export interface ChatHistoryRepository {
	create(input: {
		userId: string;
		threadId: string;
		message: ChatMessageRecord;
	}): Promise<ChatHistoryRecord>;
	append(input: {
		userId: string;
		threadId: string;
		message: ChatMessageRecord;
	}): Promise<ChatHistoryRecord>;
}

export class MongooseChatHistoryRepository implements ChatHistoryRepository {
	constructor(private readonly model: Model<IChatHistory> = ChatHistoryModel) {}

	async create(input: {
		userId: string;
		threadId: string;
		message: ChatMessageRecord;
	}): Promise<ChatHistoryRecord> {
		const history = await this.model.create({
			userId: input.userId,
			threadId: input.threadId,
			messages: [input.message],
		});

		return toChatHistoryRecord(history);
	}

	async append(input: {
		userId: string;
		threadId: string;
		message: ChatMessageRecord;
	}): Promise<ChatHistoryRecord> {
		const history = await this.model
			.findOneAndUpdate(
				{ userId: input.userId, threadId: input.threadId },
				{
					$setOnInsert: { userId: input.userId, threadId: input.threadId },
					$push: { messages: input.message },
				},
				{
					new: true,
					upsert: true,
					runValidators: true,
					setDefaultsOnInsert: true,
				},
			)
			.exec();

		if (!history) throw new Error('Failed to append chat history message');
		return toChatHistoryRecord(history);
	}
}

export const createChatMessage = (
	userId: string,
	threadId: string,
	content: string,
	role: ChatMessageRole,
): ChatMessageRecord => ({
	id: randomUUID(),
	role,
	userId,
	threadId,
	content,
});

const toChatHistoryRecord = (history: IChatHistory): ChatHistoryRecord => ({
	userId: history.userId,
	threadId: history.threadId,
	messages: history.messages.map((message) => ({
		id: message.id,
		role: message.role,
		userId: message.userId,
		threadId: message.threadId,
		content: message.content,
		...(message.thinking !== undefined ? { thinking: message.thinking } : {}),
		...(message.hitl !== undefined ? { hitl: message.hitl } : {}),
	})),
	createdAt: history.createdAt,
	updatedAt: history.updatedAt,
});
