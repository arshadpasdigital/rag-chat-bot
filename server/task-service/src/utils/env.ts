import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'test', 'production'])
		.default('development'),
	PORT: z.coerce.number().int().min(1).max(65_535).default(5051),
	GRPC_PORT: z.coerce.number().int().min(1).max(65_535).default(50051),
	FRONTEND_APP_URL: z.preprocess(
		(value) => (value === '' ? undefined : value),
		z.string().url().optional(),
	),
	OPENAI_API_KEY:z.string().describe("open ai key is required"),
	FIREWORKS_API_KEY:z.string().describe('FIREWORKS API key is required')
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
