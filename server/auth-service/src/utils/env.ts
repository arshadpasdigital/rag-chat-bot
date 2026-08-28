import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'test', 'production'])
		.default('development'),
	PORT: z.coerce.number().int().min(1).max(65_535).default(5053),
	GRPC_PORT: z.coerce.number().int().min(1).max(65_535).default(50053),
	MONGODB_URI: z.string().default('mongodb://root:example@localhost:27017/sale-agent-db?authSource=admin'),
	RABBITMQ_URL: z.string().default('amqp://appuser:appsecret@localhost:5672/'),
	JWT_ACCESS_SECRET: z.string().min(16).default('development-access-secret-change-me'),
	JWT_REFRESH_SECRET: z.string().min(16).default('development-refresh-secret-change-me'),
	JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
	JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
	FRONTEND_APP_URL: z.preprocess(
		(value) => (value === '' ? undefined : value),
		z.string().url().optional(),
	),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (
	values: Record<string, unknown> = process.env,
): Env => {
	const result = envSchema.safeParse(values);

	if (!result.success) {
		const issues = result.error.issues
			.map(({ path, message }) => `${path.join('.') || 'environment'}: ${message}`)
			.join('\n');

		throw new Error(`Invalid environment variables:\n${issues}`);
	}

	return result.data;
};

export const env = validateEnv();
