import bcrypt from 'bcrypt';
import { isValidObjectId } from 'mongoose';
import { UserModel, type User, type UserDocument } from '../model/user.model';
import type { BasicRepository } from './basicRepo';

export interface CreateUserInput {
	name?: string;
	email: string;
	password: string;
	optCode?: string;
	optCodeExpiresAt?: Date;
}

export interface UpdateUserInput {
	name?: string;
	password?: string;
	isEmailverified?: boolean;
	optCode?: string;
	optCodeExpiresAt?: Date;
	clearOtp?: boolean;
}

export interface UserListQuery {
	page: number;
	limit: number;
	search?: string;
}

export interface UserRecord extends Omit<User, 'password'> {
	id: string;
	password?: string;
}

export interface UserRepository
	extends BasicRepository<UserRecord, CreateUserInput, UpdateUserInput, UserListQuery> {
	findByEmail(email: string, includePassword?: boolean): Promise<UserRecord | null>;
	verifyPassword(email: string, password: string): Promise<UserRecord | null>;
	incrementTokenVersion(id: string): Promise<UserRecord | null>;
}

// Kept as a concrete adapter so all Mongoose details remain in the repository layer.
export class MongooseUserRepository implements UserRepository {
	async create(input: CreateUserInput): Promise<UserRecord> {
		const user = await UserModel.create({ ...input, email: normalizeEmail(input.email) });
		return toRecord(user);
	}

	async findById(id: string): Promise<UserRecord | null> {
		if (!isValidObjectId(id)) return null;
		const user = await UserModel.findById(id).lean<User>();
		return user ? toRecord(user) : null;
	}

	async findByEmail(email: string, includePassword = false): Promise<UserRecord | null> {
		const query = UserModel.findOne({ email: normalizeEmail(email) });
		if (includePassword) query.select('+password +optCode +optCodeExpiresAt');
		const user = await query.lean<User & { _id: string }>();
		return user ? toRecord(user) : null;
	}

	async findAll(query: UserListQuery): Promise<{ items: UserRecord[]; total: number }> {
		const filter = query.search
			? {
				$or: [
					{ name: { $regex: escapeRegex(query.search), $options: 'i' } },
					{ email: { $regex: escapeRegex(query.search), $options: 'i' } },
				],
			}
			: {};
		const skip = (query.page - 1) * query.limit;
		const [users, total] = await Promise.all([
			UserModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(query.limit).lean<User[]>(),
			UserModel.countDocuments(filter),
		]);
		return { items: users.map(toRecord), total };
	}

	async update(id: string, input: UpdateUserInput): Promise<UserRecord | null> {
		if (!isValidObjectId(id)) return null;
		const user = await UserModel.findById(id).select('+password +optCode +optCodeExpiresAt');
		if (!user) return null;

		if (input.name !== undefined) user.name = input.name;
		if (input.password !== undefined) user.password = input.password;
		if (input.isEmailverified !== undefined) user.isEmailverified = input.isEmailverified;
		if (input.optCode !== undefined) user.optCode = input.optCode;
		if (input.optCodeExpiresAt !== undefined) user.optCodeExpiresAt = input.optCodeExpiresAt;
		if (input.clearOtp) {
			user.optCode = undefined;
			user.optCodeExpiresAt = undefined;
		}

		await user.save();
		return toRecord(user);
	}

	async delete(id: string): Promise<boolean> {
		if (!isValidObjectId(id)) return false;
		const result = await UserModel.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}

	async verifyPassword(email: string, password: string): Promise<UserRecord | null> {
		const user = await this.findByEmail(email, true);
		if (!user?.password) return null;
		const isValid = await bcrypt.compare(password, user.password);
		return isValid ? user : null;
	}

	async incrementTokenVersion(id: string): Promise<UserRecord | null> {
		if (!isValidObjectId(id)) return null;
		const user = await UserModel.findByIdAndUpdate(
			id,
			{ $inc: { tokenVersion: 1 } },
			{ new: true },
		).lean<User>();
		return user ? toRecord(user) : null;
	}
}

export { MongooseUserRepository as UserRepo };

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toRecord = (user: UserDocument | (User & { _id?: unknown })): UserRecord => {
	const source = user as User & { _id?: unknown };
	return {
		id: String(source._id ?? ''),
		name: source.name,
		email: source.email,
		isEmailverified: source.isEmailverified,
		optCode: source.optCode,
		optCodeExpiresAt: source.optCodeExpiresAt,
		password: source.password,
		tokenVersion: source.tokenVersion,
		createdAt: source.createdAt,
		updatedAt: source.updatedAt,
	};
};
