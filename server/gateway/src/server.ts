import express, {
	Router,
	type Express,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import cors from 'cors';
import path from 'node:path';
import { ApiResponse } from './utils/apiResponse';
import { createServer } from 'node:http';
import { handleExpressError } from './exceptions/handleExpress';
import { apiV1 } from './routes/apiV1';
import { env } from './utils/env';

export const expressServer = (app: Express, router:Router) => {
	const server = createServer(app);
	const PORT = env.PORT

	app.use(
		cors({
			origin: process.env.FRONTEND_APP_URL,
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE'],
		}),
	);
	app.use(express.json({ limit: '10mb' }));
	app.use(express.urlencoded({ limit: '10mb', extended: true }));
	app.use('/asset', express.static(path.join(process.cwd(), 'public')));

	app.get('/health', (_req: Request, res: Response, _next: NextFunction) => {
		const health = {
			status: 'ok',
			service: 'gateway-service',
			environment: process.env.NODE_ENV,
			port: process.env.PORT,
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memory: process.memoryUsage(),
			version: process.env.npm_package_version || '1.0.0',
		};
		res.status(200).json(ApiResponse.success(health,200,'gateway-service health'));
	});

	// auth api roters
	apiV1(app,router)

	app.use(handleExpressError);
	server.listen(PORT,()=>{
		console.log(`The Gateway server is running at port => ${PORT}`)
	})

	const gracefulShutdown = async (signal: string) => {
            server.on("close", async () => {
                console.info(`${signal} received, shut down gracefully..`);
                try {
                    // service with we do shutdown
                    console.info("All connection closed, existing process");
                    process.exit(0);
                } catch (error: unknown) {
                    const err = error instanceof Error ? error : { message: "Internal server error" };
                    console.error(`Error during the gracefully shutdown `, err.message);
                    process.exit(1)
                }
            })

            setTimeout(() => {
                console.log("forcefully Shutdown")
                process.exit(1)
            }, 10000)
        }

        process.on("SIGINT", () => gracefulShutdown('SIGINT'))
        process.on('SIGTERM', () => gracefulShutdown("SIGTERM"))

        process.on("uncaughtException", (error) => {
            console.error("Uncaught Exception:", error);
            gracefulShutdown("uncaughtException");
        });
        process.on("unhandledRejection", (reason, promise) => {
            console.error("Unhandled Rejection at:", promise, "reason:", reason);
            gracefulShutdown("unhandledRejection")
        });
};
