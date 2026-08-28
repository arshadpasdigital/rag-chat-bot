class ApiResponse {
	static success(
		data: Record<any, any> | null = null,
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
		error: Error | null = null,
		statusCode: number = 400,
		message: string = 'Error',
	) {
		return {
			success: false,
			message,
			statusCode,
			error,
			timestamp: new Date().toISOString(),
		};
	}

	static validationError(error: Error | null = null) {
		return {
			success: false,
			message: 'Validation Failed',
			error,
			statusCode: 400,
			timestamp: new Date().toISOString(),
		};
	}

	static paginated(
		data: Record<any, any> | null = null,
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
