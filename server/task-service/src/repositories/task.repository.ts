import type { Model } from 'mongoose';
import { TaskModel, type ITask } from '../models/task.model';

export interface TaskRecord {
	id: string;
	title: string;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface TaskRepository {
	findAll(): Promise<TaskRecord[]>;
}

/** Mongoose is kept inside this adapter; services only depend on TaskRepository. */
export class MongooseTaskRepository implements TaskRepository {
	constructor(private readonly model: Model<ITask> = TaskModel) {}

	async findAll(): Promise<TaskRecord[]> {
		const tasks = await this.model
			.find()
			.sort({ createdAt: -1, _id: -1 })
			.lean<ITask[]>();

		return tasks.map(toTaskRecord);
	}
}

const toTaskRecord = (task: ITask): TaskRecord => ({
	id: String(task._id),
	title: task.title,
	completed: task.completed,
	createdAt: task.createdAt,
	updatedAt: task.updatedAt,
});
