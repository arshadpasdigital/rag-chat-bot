class ApiResponse {
	static success<T>(
		data: T = null as T,
		statusCode: number = 200,
		message: string = 'Success',
	) {
		return {
			success: true,
			data,
			message,
			statusCode,
			timestamp: new Date().toISOString(),
		};
	}

	static error(
		error: unknown = null,
		statusCode: number = 400,
		message: string = 'Error',
		details?: unknown,
	) {
		return {
			success: false,
			message,
			statusCode,
			error: error instanceof Error ? { name: error.name, message: error.message } : error,
			...(details === undefined ? {} : { details }),
			timestamp: new Date().toISOString(),
		};
	}

	static validationError(error: unknown = null, details?: unknown) {
		return {
			success: false,
			message: 'Validation Failed',
			error: error instanceof Error ? { name: error.name, message: error.message } : error,
			...(details === undefined ? {} : { details }),
			statusCode: 400,
			timestamp: new Date().toISOString(),
		};
	}

	static paginated(
		data: unknown = null,
		page: number,
		limit: number,
		total: number,
	) {
		return {
			success: true,
			data,
			pagination: {
				page,
				limit,
				total,
				totalPage: Math.ceil(total / limit),
			},
			statusCode: 200,
			timestamp: new Date().toISOString(),
		};
	}
}

export { ApiResponse };
