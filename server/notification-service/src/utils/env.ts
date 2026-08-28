import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'test', 'production'])
		.default('development'),
	PORT: z.coerce.number().int().min(1).max(65_535).default(5052),
	GRPC_PORT: z.coerce.number().int().min(1).max(65_535).default(50052),
	FRONTEND_APP_URL: z.preprocess(
		(value) => (value === '' ? undefined : value),
		z.string().url().optional(),
	),
	RABBITMQ_URL:z.url(),
	SMTP_HOST:z.string().describe("SMTP_HOST is required"),
	SMTP_PORT:z.coerce.number().int().describe("SMTP_PORT is required"),
	SMTP_USERNAME:z.string().describe("SMTP_USERNAME is required"),
	SMTP_USER_PASSWORD:z.string().describe("SMTP_USER_PASSWORD is required")
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
