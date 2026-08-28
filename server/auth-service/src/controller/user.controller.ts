import type { RequestHandler } from 'express';
import { AppError } from '../exceptions/appError';
import { ApiResponse } from '../utils/apiResponse';
import type { AuthenticatedRequest } from '../utils/authenticate';
import type { UserService } from '../service/user.service';
import type { UserListQuery } from '../repo/userRepo';

export class UserController {
	constructor(private readonly service: UserService) {}

	readonly register: RequestHandler = async (request, response) => {
		const result = await this.service.register(request.body);
		response.status(201).json(ApiResponse.success(result, 201, 'Registration successful. Verify your email to continue.'));
	};

	readonly login: RequestHandler = async (request, response) => {
		const result = await this.service.login(request.body);
		response.status(200).json(ApiResponse.success(result, 200, 'Login successful'));
	};

	readonly verifyEmail: RequestHandler = async (request, response) => {
		const user = await this.service.verifyEmail(request.body);
		response.status(200).json(ApiResponse.success({ user }, 200, 'Email verified successfully'));
	};

	readonly resendVerification: RequestHandler = async (request, response) => {
		const result = await this.service.resendVerification(request.body.email);
		response.status(200).json(ApiResponse.success(result, 200, 'If the account exists, a verification code was sent'));
	};

	readonly refreshToken: RequestHandler = async (request, response) => {
		const result = await this.service.refresh(request.body.refreshToken);
		response.status(200).json(ApiResponse.success(result, 200, 'Token refreshed successfully'));
	};

	readonly logout: RequestHandler = async (request, response) => {
		await this.service.logout(authenticated(request).userId);
		response.status(200).json(ApiResponse.success(null, 200, 'Logged out successfully'));
	};

	readonly forgotPassword: RequestHandler = async (request, response) => {
		const result = await this.service.forgotPassword(request.body.email);
		response.status(200).json(ApiResponse.success(result, 200, 'If the account exists, a password reset code was sent'));
	};

	readonly resetPassword: RequestHandler = async (request, response) => {
		await this.service.resetPassword(request.body);
		response.status(200).json(ApiResponse.success(null, 200, 'Password reset successfully'));
	};

	readonly me: RequestHandler = async (request, response) => {
		const user = await this.service.getCurrentUser(authenticated(request).userId);
		response.status(200).json(ApiResponse.success({ user }, 200, 'Current user'));
	};

	readonly updateMe: RequestHandler = async (request, response) => {
		const user = await this.service.update(authenticated(request).userId, request.body);
		response.status(200).json(ApiResponse.success({ user }, 200, 'Profile updated successfully'));
	};

	readonly list: RequestHandler = async (request, response) => {
		const result = await this.service.list(request.query as unknown as UserListQuery);
		response.status(200).json(ApiResponse.paginated(result.users, result.page, result.limit, result.total));
	};

	readonly getById: RequestHandler = async (request, response) => {
		const user = await this.service.getById(requiredParam(request.params.id));
		response.status(200).json(ApiResponse.success({ user }, 200, 'User details'));
	};

	readonly update: RequestHandler = async (request, response) => {
		const user = await this.service.update(requiredParam(request.params.id), request.body);
		response.status(200).json(ApiResponse.success({ user }, 200, 'User updated successfully'));
	};

	readonly delete: RequestHandler = async (request, response) => {
		await this.service.delete(requiredParam(request.params.id));
		response.status(200).json(ApiResponse.success(null, 200, 'User deleted successfully'));
	};

	readonly changePassword: RequestHandler = async (request, response) => {
		await this.service.changePassword(
			authenticated(request).userId,
			request.body.currentPassword,
			request.body.password,
		);
		response.status(200).json(ApiResponse.success(null, 200, 'Password changed successfully'));
	};
}

const authenticated = (request: Parameters<RequestHandler>[0]): AuthenticatedRequest => {
	if (!('userId' in request) || typeof request.userId !== 'string') {
		throw new AppError('Authentication is required', 401, 'UNAUTHENTICATED');
	}
	return request as AuthenticatedRequest;
};

const requiredParam = (value: string | string[] | undefined): string => {
	if (typeof value !== 'string') throw new AppError('Invalid route parameter', 400, 'INVALID_PARAMETER');
	return value;
};
