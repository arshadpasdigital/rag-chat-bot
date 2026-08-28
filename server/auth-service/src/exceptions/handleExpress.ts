import type { ErrorRequestHandler } from 'express';
import { AppError } from './appError';
import { ApiResponse } from '../utils/apiResponse';

export const handleExpressError: ErrorRequestHandler = (error, _request, response, next) => {
	if (response.headersSent) {
		next(error);
		return;
	}
	const appError = error instanceof AppError ? error : undefined;
	const statusCode = appError?.statusCode ?? 500;
	const message = appError?.message ?? 'Internal server error';
	const code = appError?.code ?? 'INTERNAL_SERVER_ERROR';
	response.status(statusCode).json(ApiResponse.error({ code, message }, statusCode, message, appError?.details));
};
