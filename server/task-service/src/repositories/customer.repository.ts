import { isValidObjectId, type Model, Types } from 'mongoose';
import { CustomerModel, type ICustomer } from '../models/customer.model';

export interface CreateCustomerInput {
	firstName: string;
	lastName: string;
	email: string;
	userId: string;
}

export interface UpdateCustomerInput {
	firstName?: string;
	lastName?: string;
	email?: string;
}

export interface CustomerRecord {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CustomerListQuery {
	page: number;
	limit: number;
}

export interface CustomerListResult {
	items: CustomerRecord[];
	total: number;
}

export interface CustomerRepository {
	create(input: CreateCustomerInput): Promise<CustomerRecord>;
	findById(id: string): Promise<CustomerRecord | null>;
	findByUserId(userId: string): Promise<CustomerRecord | null>;
	findAll(query: CustomerListQuery): Promise<CustomerListResult>;
	update(id: string, input: UpdateCustomerInput): Promise<CustomerRecord | null>;
	delete(id: string): Promise<boolean>;
}

/** Mongoose stays inside this adapter; the service depends on CustomerRepository. */
export class MongooseCustomerRepository implements CustomerRepository {
	constructor(private readonly model: Model<ICustomer> = CustomerModel) {}

	async create(input: CreateCustomerInput): Promise<CustomerRecord> {
		const userId = toObjectId(input.userId);
		if (!userId) throw new Error('Invalid user id');

		const customer = await this.model.create({
			firstName: input.firstName,
			lastName: input.lastName,
			email: input.email,
			userId,
		});

		return toCustomerRecord(customer);
	}

	async findById(id: string): Promise<CustomerRecord | null> {
		const customerId = toObjectId(id);
		if (!customerId) return null;

		const customer = await this.model.findById(customerId).lean<ICustomer>();
		return customer ? toCustomerRecord(customer) : null;
	}

	async findByUserId(userId: string): Promise<CustomerRecord | null> {
		const customerUserId = toObjectId(userId);
		if (!customerUserId) return null;

		const customer = await this.model
			.findOne({ userId: customerUserId })
			.lean<ICustomer>();

		return customer ? toCustomerRecord(customer) : null;
	}

	async findAll(query: CustomerListQuery): Promise<CustomerListResult> {
		const skip = (query.page - 1) * query.limit;
		const [customers, total] = await Promise.all([
			this.model
				.find()
				.sort({ createdAt: -1, _id: -1 })
				.skip(skip)
				.limit(query.limit)
				.lean<ICustomer[]>(),
			this.model.countDocuments(),
		]);

		return {
			items: customers.map(toCustomerRecord),
			total,
		};
	}

	async update(
		id: string,
		input: UpdateCustomerInput,
	): Promise<CustomerRecord | null> {
		const customerId = toObjectId(id);
		if (!customerId) return null;

		const customer = await this.model
			.findByIdAndUpdate(
				customerId,
				{ $set: input },
				{ new: true, runValidators: true },
			)
			.lean<ICustomer>();

		return customer ? toCustomerRecord(customer) : null;
	}

	async delete(id: string): Promise<boolean> {
		const customerId = toObjectId(id);
		if (!customerId) return false;

		const result = await this.model.deleteOne({ _id: customerId });
		return result.deletedCount === 1;
	}
}

const toObjectId = (value: string): Types.ObjectId | null =>
	isValidObjectId(value) ? new Types.ObjectId(value) : null;

const toCustomerRecord = (customer: ICustomer): CustomerRecord => ({
	id: String(customer._id),
	firstName: customer.firstName,
	lastName: customer.lastName,
	email: customer.email,
	userId: String(customer.userId),
	createdAt: customer.createdAt,
	updatedAt: customer.updatedAt,
});
