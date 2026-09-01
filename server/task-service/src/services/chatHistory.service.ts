import { randomUUID } from 'node:crypto';
import type { Model } from 'mongoose';
import {
	ChatHistoryModel,
	type IChatHistory,
	type IMessage,
} from '../models/chatHistory.model';

export class ChatHistoryService {
	private static instance: ChatHistoryService | undefined;

	private constructor(
		private readonly chatHistoryModel: Model<IChatHistory>,
	) {}

	public static getInstance(
		chatHistoryModel: Model<IChatHistory> = ChatHistoryModel,
	): ChatHistoryService {
		ChatHistoryService.instance ??= new ChatHistoryService(chatHistoryModel);
		return ChatHistoryService.instance;
	}

	public async createChatHistory(
		userId: string,
		threadId: string,
		message: string,
		role: IMessage['role'],
	): Promise<IChatHistory> {
		const chatMessage: IMessage = {
			id: randomUUID(),
			role,
			userId,
			threadId,
			content: message,
		};

		return this.chatHistoryModel.create({
			userId,
			threadId,
			messages: [chatMessage],
		});
	}

	public async insertMessage(
		userId: string,
		threadId: string,
		message: string,
		role: IMessage['role'],
	): Promise<IChatHistory> {
		const chatMessage: IMessage = {
			id: randomUUID(),
			role,
			userId,
			threadId,
			content: message,
		};

		const history = await this.chatHistoryModel.findOneAndUpdate(
			{ userId, threadId },
			{
				$setOnInsert: { userId, threadId },
				$push: { messages: chatMessage },
			},
			{
				new: true,
				upsert: true,
				runValidators: true,
				setDefaultsOnInsert: true,
			},
		).exec();

		if (!history) {
			throw new Error('Failed to insert chat history message');
		}

		return history;
	}
}
