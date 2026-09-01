import {
	Schema,
	model,
	models,
	type Document,
	type Model,
} from 'mongoose';

export interface IWorkingMemoryEntry {
	id: string;
	time: string;
	role: 'user' | 'ai';
	content: string;
}

export interface IWorkingMemory extends Document {
	userId: string;
	threadId: string;
	data: string;
	entries: IWorkingMemoryEntry[];
	createdAt: Date;
	updatedAt: Date;
}

const workingMemoryEntrySchema = new Schema<IWorkingMemoryEntry>(
	{
		id: { type: String, required: true },
		time: { type: String, required: true },
		role: { type: String, enum: ['user', 'ai'], required: true },
		content: { type: String, required: true },
	},
	{ _id: false },
);

const workingMemorySchema = new Schema<IWorkingMemory>(
	{
		userId: { type: String, required: true },
		threadId: { type: String, required: true },
		data: { type: String, required: true },
		entries: { type: [workingMemoryEntrySchema], required: true },
	},
	{ timestamps: true },
);

workingMemorySchema.index({ userId: 1, threadId: 1 }, { unique: true });

export const WorkingMemoryModel: Model<IWorkingMemory> =
	(models.WorkingMemory as Model<IWorkingMemory> | undefined) ??
	model<IWorkingMemory>('WorkingMemory', workingMemorySchema);
