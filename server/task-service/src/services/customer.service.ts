import type {
	CustomerListResult,
	CustomerRecord,
	CustomerRepository,
	CreateCustomerInput,
	UpdateCustomerInput,
} from '../repositories/customer.repository';

export interface CustomerListResponse {
	customers: CustomerRecord[];
	page: number;
	limit: number;
	total: number;
}

export interface CustomerServiceContract {
	createCustomer(input: CreateCustomerInput): Promise<CustomerRecord>;
	getCustomerById(id: string): Promise<CustomerRecord>;
	getCustomerByUserId(userId: string): Promise<CustomerRecord>;
	getAllCustomers(page?: number, limit?: number): Promise<CustomerListResponse>;
	updateCustomer(id: string, input: UpdateCustomerInput): Promise<CustomerRecord>;
	deleteCustomer(id: string): Promise<void>;
}

export class CustomerService implements CustomerServiceContract {
	constructor(private readonly repository: CustomerRepository) {}

	createCustomer(input: CreateCustomerInput): Promise<CustomerRecord> {
		return this.repository.create(input);
	}

	async getCustomerById(id: string): Promise<CustomerRecord> {
		const customer = await this.repository.findById(id);
		if (!customer) throw new Error('Customer not found');
		return customer;
	}

	async getCustomerByUserId(userId: string): Promise<CustomerRecord> {
		const customer = await this.repository.findByUserId(userId);
		if (!customer) throw new Error('Customer not found');
		return customer;
	}

	async getAllCustomers(page = 1, limit = 10): Promise<CustomerListResponse> {
		const pagination = normalizePagination(page, limit);
		const result: CustomerListResult = await this.repository.findAll(pagination);

		return {
			customers: result.items,
			page: pagination.page,
			limit: pagination.limit,
			total: result.total,
		};
	}

	async updateCustomer(
		id: string,
		input: UpdateCustomerInput,
	): Promise<CustomerRecord> {
		const customer = await this.repository.update(id, input);
		if (!customer) throw new Error('Customer not found');
		return customer;
	}

	async deleteCustomer(id: string): Promise<void> {
		const deleted = await this.repository.delete(id);
		if (!deleted) throw new Error('Customer not found');
	}
}

const normalizePagination = (page: number, limit: number) => ({
	page: Number.isInteger(page) && page > 0 ? page : 1,
	limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10,
});
