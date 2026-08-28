import 'dotenv/config';
import { startServer } from './server';
import { env } from './utils/env';

if (import.meta.main) {
	startServer(env.PORT).catch((error: unknown) => {
		console.error('Unable to start auth-service', error);
		process.exit(1);
	});
}
