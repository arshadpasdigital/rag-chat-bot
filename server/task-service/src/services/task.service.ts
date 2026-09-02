import type { TaskRecord, TaskRepository } from '../repositories/task.repository';

export interface TaskService {
	getTasks(): Promise<TaskRecord[]>;
}

export class DefaultTaskService implements TaskService {
	constructor(private readonly repository: TaskRepository) {}

	getTasks(): Promise<TaskRecord[]> {
		return this.repository.findAll();
	}
}
