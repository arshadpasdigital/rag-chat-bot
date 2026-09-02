import {
	Schema,
	model,
	models,
	type Document,
	type Model,
} from 'mongoose';

export interface ITask extends Document {
	title: string;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
	{
		title: { type: String, required: true, trim: true },
		completed: { type: Boolean, required: true, default: false },
	},
	{ timestamps: true },
);

export const TaskModel: Model<ITask> =
	(models.Task as Model<ITask> | undefined) ?? model<ITask>('Task', taskSchema);
