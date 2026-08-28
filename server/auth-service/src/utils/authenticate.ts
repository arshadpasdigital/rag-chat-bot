import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../exceptions/appError';
import type { TokenService } from '../security/token';
import type { UserRepository } from '../repo/userRepo';

export interface AuthenticatedRequest extends Request {
	userId: string;
	tokenVersion: number;
}

export const createAuthenticate = (tokens: TokenService, users: UserRepository): RequestHandler =>
	async (request: Request, _response: Response, next: NextFunction) => {
		const header = request.header('authorization');
		const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined;
		if (!token) {
			next(new AppError('Authentication is required', 401, 'UNAUTHENTICATED'));
			return;
		}

		try {
			const payload = tokens.verify(token, 'access');
			const user = await users.findById(payload.sub);
			if (!user || user.tokenVersion !== payload.version) {
				throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
			}
			const authenticatedRequest = request as AuthenticatedRequest;
			authenticatedRequest.userId = payload.sub;
			authenticatedRequest.tokenVersion = payload.version;
			next();
		} catch (error) {
			next(error);
		}
	};
