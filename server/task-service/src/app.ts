import 'dotenv/config';
import express from 'express';
import { startTaskServers } from './grpc/gRPCServer';
import { TaskDependencies } from './task.dependencies';
import { env } from './utils/env';
import { expressServer } from './server';
import { database } from './lib/database';

const dependencies = new TaskDependencies();
const app = express();

await database.openConnection();
expressServer(app, env.PORT);
startTaskServers(dependencies.grpcServices, env.GRPC_PORT);

const shutdown = async () => {
	dependencies.close();
	await database.closeConnection();
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
