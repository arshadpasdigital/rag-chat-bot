import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../exceptions/appError';

const email = z.string().trim().toLowerCase().email('A valid email is required');
const password = z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password is too long');
const otpCode = z.string().regex(/^\d{6}$/, 'OTP code must contain exactly 6 digits');

export const registerSchema = z.object({
	name: z.string().trim().min(1).max(100).optional(),
	email,
	password,
	passwordConfirmation: password,
}).refine((input) => input.password === input.passwordConfirmation, {
	path: ['passwordConfirmation'], message: 'Passwords do not match',
});

export const loginSchema = z.object({ email, password: z.string().min(1) });
export const verifyEmailSchema = z.object({ email, optCode: otpCode });
export const resendVerificationSchema = z.object({ email });
export const refreshTokenSchema = z.object({ refreshToken: z.string().min(1) });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({
	email,
	optCode: otpCode,
	password,
	passwordConfirmation: password,
}).refine((input) => input.password === input.passwordConfirmation, {
	path: ['passwordConfirmation'], message: 'Passwords do not match',
});
export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	password,
	passwordConfirmation: password,
}).refine((input) => input.password === input.passwordConfirmation, {
	path: ['passwordConfirmation'], message: 'Passwords do not match',
});
export const updateProfileSchema = z.object({
	name: z.string().trim().min(1).max(100).nullable().optional(),
});
export const updateUserSchema = updateProfileSchema;
export const userIdSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user id') });
export const userListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	search: z.string().trim().max(100).optional(),
});

type RequestPart = 'body' | 'query' | 'params';

export const validate = (schema: z.ZodType, part: RequestPart = 'body'): RequestHandler =>
	(request: Request, _response: Response, next: NextFunction) => {
		const result = schema.safeParse(request[part]);
		if (!result.success) {
			const issues = result.error.issues.map((issue) => ({
				path: issue.path.join('.') || part,
				message: issue.message,
			}));
			next(new AppError('Request validation failed', 400, 'VALIDATION_ERROR', issues));
			return;
		}
		(request as Request & Record<RequestPart, unknown>)[part] = result.data;
		next();
	};
