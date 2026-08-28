import express, {
	type Express,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer, type Server } from 'node:http';
import { UserDependencies } from './user.dependencies';
import { Database } from './lib/database';
import { RabbitMq } from './lib/rabbitMq';
import { handleExpressError } from './exceptions/handleExpress';
import { ApiResponse } from './utils/apiResponse';
import { env } from './utils/env';
import { startAuthServers } from './grpc/gRPCServer';

export const createApp = (userDependencies:UserDependencies): Express => {
	const app = express();

	app.disable('x-powered-by');
	app.use(helmet());
	app.use(cors({
		origin: env.FRONTEND_APP_URL ?? true,
		credentials: true,
		methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
	}));
	app.use(express.json({ limit: '1mb' }));
	app.use(express.urlencoded({ limit: '1mb', extended: true }));

	app.get('/health', (_request: Request, response: Response, _next: NextFunction) => {
		response.status(200).json(ApiResponse.success({
			status: 'ok',
			service: 'auth-service',
			environment: env.NODE_ENV,
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		}));
	});

	app.use(['/api/v1/auth', '/api/v1/users', '/auth', '/users'], userDependencies.router);

	app.use((_request, response) => {
		response.status(404).json(ApiResponse.error(null, 404, 'Route not found'));
	});
	app.use(handleExpressError);
	return app;
};

export const startServer = async (port: number): Promise<Server> => {
	const database = Database.getInstance();
	const userDependencies = new UserDependencies();
	const rabbitMq = RabbitMq.getInstance();
	try {
		await database.openConnection(env.MONGODB_URI);
		await rabbitMq.openConnection(env.RABBITMQ_URL);
	} catch (error) {
		await Promise.allSettled([database.closeConnection(), rabbitMq.closeConnection()]);
		throw error;
	}

	startAuthServers(userDependencies.authGrpcServices);
	
	const server = createServer(createApp(userDependencies));
	server.listen(port, () => console.log(`The Auth server is running at port => ${port}`));

	const shutdown = async (signal: string) => {
		console.info(`${signal} received, shutting down gracefully`);
		server.close(async () => {
			await Promise.allSettled([database.closeConnection(), rabbitMq.closeConnection()]);
			process.exit(0);
		});
		setTimeout(() => process.exit(1), 10_000).unref();
	};

	process.once('SIGINT', () => void shutdown('SIGINT'));
	process.once('SIGTERM', () => void shutdown('SIGTERM'));
	return server;
};
