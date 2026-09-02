import type { TaskService } from "./task.service";
import * as grpc from '@grpc/grpc-js';

export class TaskGrpcServices {
    constructor(private readonly taskService: TaskService) {}

    readonly GetTasks: grpc.handleUnaryCall<any, any> = async (_call, callback) => {
        try {
            const tasks = await this.taskService.getTasks();
            callback(null, {
                tasks: tasks.map(({ id, title, completed }) => ({ id, title, completed })),
            });
        } catch (error: unknown) {
            callback(toGrpcError(error, 'Unable to get tasks', grpc.status.INTERNAL));
        }
    };
}

const toGrpcError = (error: unknown, fallback: string, code: grpc.status): grpc.ServiceError => ({
	name: 'TaskServiceError',
	message: error instanceof Error ? error.message : fallback,
	code,
	details: error instanceof Error ? error.message : fallback,
	metadata: new grpc.Metadata(),
});
