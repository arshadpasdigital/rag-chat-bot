import {
	Schema,
	model,
	models,
	type Document,
	type Model,
} from 'mongoose';

export interface IHitlAction {
	id?: string;
	interruptId?: string;
	tool_name?: string;
	tool_description?: string;
	args?: any;
}

export interface IHitl {
	status: boolean;
	action?: IHitlAction;
}

export interface IMessage {
	id: string;
	role: 'user' | 'ai';
	userId: string;
	threadId: string;
	content: string;
	thinking?: string;
	hitl?: IHitl;
}

export interface IChatHistory extends Document {
	userId: string;
	threadId: string;
	messages: IMessage[];
	createdAt: Date;
	updatedAt: Date;
}

const hitlActionSchema = new Schema<IHitlAction>(
	{
		id: { type: String },
		interruptId: { type: String },
		tool_name: { type: String },
		tool_description: { type: String },
		args: { type: Schema.Types.Mixed },
	},
	{ _id: false },
);

const hitlSchema = new Schema<IHitl>(
	{
		status: { type: Boolean, required: true },
		action: { type: hitlActionSchema },
	},
	{ _id: false },
);

const messageSchema = new Schema<IMessage>(
	{
		id: { type: String, required: true },
		role: { type: String, enum: ['user', 'ai'], required: true },
		userId: { type: String, required: true },
		threadId: { type: String, required: true },
		content: { type: String, required: true },
		thinking: { type: String },
		hitl: { type: hitlSchema },
	},
	{ _id: false },
);

const chatHistorySchema = new Schema<IChatHistory>(
	{
		userId: { type: String, required: true },
		threadId: { type: String, required: true },
		messages: { type: [messageSchema], required: true },
	},
	{ timestamps: true },
);

chatHistorySchema.index({ userId: 1, threadId: 1 }, { unique: true });

export const ChatHistoryModel: Model<IChatHistory> =
	(models.ChatHistory as Model<IChatHistory> | undefined) ??
	model<IChatHistory>('ChatHistory', chatHistorySchema);
