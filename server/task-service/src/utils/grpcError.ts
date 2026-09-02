import * as grpc from '@grpc/grpc-js';


export const toGrpcError = (error: unknown, fallback: string, code: grpc.status): grpc.ServiceError => ({
    name: 'TaskServiceError',
    message: error instanceof Error ? error.message : fallback,
    code,
    details: error instanceof Error ? error.message : fallback,
    metadata: new grpc.Metadata(),
});