import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'node:path';
import { resolveProtoDirectory } from '../clients/grpc.client';
import type { TaskGrpcServices } from '../services/taskGrpc.service';
import type { ChatGrpcServices } from '../services/chatGrpc.service';
import type { AgentGrpcServices } from '../services/agentGrpc.service';

export const PROTO_DIR = resolveProtoDirectory();

const packageDefinition = protoLoader.loadSync(
	[
		path.join(PROTO_DIR, 'task.proto'),
		path.join(PROTO_DIR, 'chat.proto'),
		path.join(PROTO_DIR, 'agent.proto'),
	],
	{
		keepCase: true,
		longs: String,
		enums: String,
		defaults: true,
		oneofs: true,
	},
);

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const tasksProto = proto.tasks;
const chatProto = proto.chat;
const agentProto = proto.agents;

export interface TaskGrpcServicesBundle {
	tasks: TaskGrpcServices;
	chat: ChatGrpcServices;
	agent: AgentGrpcServices;
}

export const startTaskServers = (
	services: TaskGrpcServicesBundle,
	port: number,
) => {
	const server = new grpc.Server();
	server.addService(tasksProto.TaskService.service, {
		GetTasks: services.tasks.GetTasks,
	});
	server.addService(chatProto.ChatService.service, {
		Chat: services.chat.Chat,
	});
	server.addService(agentProto.AgentService.service, {
		CreateAgent: services.agent.CreateAgent,
		UpdateAgent: services.agent.UpdateAgent,
		GetAgent: services.agent.GetAgent,
		GetAgents: services.agent.GetAgents,
		DeleteAgent: services.agent.DeleteAgent,
	});


	server.bindAsync(
		`0.0.0.0:${port}`,
		grpc.ServerCredentials.createInsecure(),
		(error, boundPort) => {
			if (error) {
				console.error(`Server failed to bind: ${error.message}`);
				return;
			}
			console.log(`Task Service running on port: ${boundPort}`);
		},
	);

	return server;
};
