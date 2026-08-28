import { Router as ExpressRouter, type RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
	changePasswordSchema,
	forgotPasswordSchema,
	loginSchema,
	refreshTokenSchema,
	registerSchema,
	resendVerificationSchema,
	resetPasswordSchema,
	updateProfileSchema,
	userIdSchema,
	userListQuerySchema,
	verifyEmailSchema,
	validate,
} from '../validation/user.validate';
import type { UserController } from '../controller/user.controller';

export class UserRouter {
	readonly router = ExpressRouter();

	constructor(
		private readonly controller: UserController,
		private readonly authenticate: RequestHandler,
	) {
		this.router.post('/register', validate(registerSchema), asyncHandler(controller.register));
		this.router.post('/login', validate(loginSchema), asyncHandler(controller.login));
		this.router.post('/verify-email', validate(verifyEmailSchema), asyncHandler(controller.verifyEmail));
		this.router.post('/resend-verification', validate(resendVerificationSchema), asyncHandler(controller.resendVerification));
		this.router.post('/refresh-token', validate(refreshTokenSchema), asyncHandler(controller.refreshToken));
		this.router.post('/logout', authenticate, asyncHandler(controller.logout));
		this.router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(controller.forgotPassword));
		this.router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(controller.resetPassword));
		this.router.get('/me', authenticate, asyncHandler(controller.me));
		this.router.patch('/me', authenticate, validate(updateProfileSchema), asyncHandler(controller.updateMe));
		this.router.patch('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(controller.changePassword));

		this.router.get('/', authenticate, validate(userListQuerySchema, 'query'), asyncHandler(controller.list));
		this.router.get('/:id', authenticate, validate(userIdSchema, 'params'), asyncHandler(controller.getById));
		this.router.patch('/:id', authenticate, validate(userIdSchema, 'params'), validate(updateProfileSchema), asyncHandler(controller.update));
		this.router.delete('/:id', authenticate, validate(userIdSchema, 'params'), asyncHandler(controller.delete));
	}
}
