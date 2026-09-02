import { toGrpcError } from "../utils/grpcError";
import type { CustomerService } from "./customer.service";
import * as grpc from '@grpc/grpc-js';

export class CustomerGrpcServices {
    constructor(private readonly customerService: CustomerService) {}

    readonly GetCustomer: grpc.handleUnaryCall<any, any> = async (_call, callback) => {
        try {
            const tasks = await this.customerService.getAllCustomers();
            callback(null, {
            });
        } catch (error: unknown) {
            callback(toGrpcError(error, 'Unable to get tasks', grpc.status.INTERNAL));
        }
    };
}
