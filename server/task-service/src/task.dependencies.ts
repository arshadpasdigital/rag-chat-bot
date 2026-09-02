import { createGraph } from './graph';
import { GrpcClient } from './clients/grpc.client';
import { AgentModel } from './models/agent.model';
import { TaskModel } from './models/task.model';
import { ChatHistoryModel } from './models/chatHistory.model';
import { CustomerModel } from './models/customer.model';
import { MongooseAgentRepository } from './repositories/agent.repository';
import { MongooseChatHistoryRepository } from './repositories/chat-history.repository';
import { MongooseCustomerRepository } from './repositories/customer.repository';
import { MongooseTaskRepository } from './repositories/task.repository';
import { DefaultChatHistoryService } from './services/chatHistory.service';
import { CustomerService } from './services/customer.service';
import { DefaultTaskService } from './services/task.service';
import {
	type TaskGrpcServicesBundle,
} from './grpc/gRPCServer';
import { TaskGrpcServices } from './services/taskGrpc.service';
import { ChatGrpcServices } from './services/chatGrpc.service';
import { AgentGrpcServices } from './services/agentGrpc.service';
import { DefaultAgentService } from './services/agent.service';
import { CustomerGrpcServices } from './services/customerGrpc.service';


/** The single composition root for task-service dependencies. */
export class TaskDependencies {
	readonly taskRepository: MongooseTaskRepository;
	readonly chatHistoryRepository: MongooseChatHistoryRepository;
	readonly customerRepository: MongooseCustomerRepository;
	readonly agentRepository: MongooseAgentRepository;
	readonly taskService: DefaultTaskService;
	readonly chatHistoryService: DefaultChatHistoryService;
	readonly customerService: CustomerService;
	readonly agentService: DefaultAgentService;
	readonly grpcClient: GrpcClient;
	readonly grpcServices: TaskGrpcServicesBundle;

	constructor() {
		this.taskRepository = new MongooseTaskRepository(TaskModel);
		this.agentRepository = new MongooseAgentRepository(AgentModel);
		this.chatHistoryRepository = new MongooseChatHistoryRepository(ChatHistoryModel);
		this.customerRepository = new MongooseCustomerRepository(CustomerModel);
		this.taskService = new DefaultTaskService(this.taskRepository);
		this.chatHistoryService = new DefaultChatHistoryService(this.chatHistoryRepository);
		this.customerService = new CustomerService(this.customerRepository);
		this.agentService = new DefaultAgentService(this.agentRepository)
		this.grpcClient = new GrpcClient();
		this.grpcServices = {
			tasks: new TaskGrpcServices(this.taskService),
			chat: new ChatGrpcServices(createGraph(this.chatHistoryService)),
			agent: new AgentGrpcServices(this.agentService),
			customer: new CustomerGrpcServices(this.customerService)
		};
	}

	close(): void {
		this.grpcClient.close();
	}
}
