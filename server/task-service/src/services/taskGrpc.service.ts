import { toGrpcError } from "../utils/grpcError";
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

