import {
	createChatMessage,
	type ChatHistoryRecord,
	type ChatHistoryRepository,
	type ChatMessageRole,
} from '../repositories/chat-history.repository';

export interface ChatHistoryService {
	createChatHistory(
		userId: string,
		threadId: string,
		message: string,
		role: ChatMessageRole,
	): Promise<ChatHistoryRecord>;
	insertMessage(
		userId: string,
		threadId: string,
		message: string,
		role: ChatMessageRole,
	): Promise<ChatHistoryRecord>;
}

export class DefaultChatHistoryService implements ChatHistoryService {
	constructor(private readonly repository: ChatHistoryRepository) {}

	createChatHistory(
		userId: string,
		threadId: string,
		message: string,
		role: ChatMessageRole,
	): Promise<ChatHistoryRecord> {
		return this.repository.create({
			userId,
			threadId,
			message: createChatMessage(userId, threadId, message, role),
		});
	}

	insertMessage(
		userId: string,
		threadId: string,
		message: string,
		role: ChatMessageRole,
	): Promise<ChatHistoryRecord> {
		return this.repository.append({
			userId,
			threadId,
			message: createChatMessage(userId, threadId, message, role),
		});
	}
}
