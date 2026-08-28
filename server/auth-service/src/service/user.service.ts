import { randomInt } from 'node:crypto';
import { AppError } from '../exceptions/appError';
import type { TokenPair, TokenService } from '../security/token';
import type {
	CreateUserInput,
	UpdateUserInput,
	UserListQuery,
	UserRecord,
	UserRepository,
} from '../repo/userRepo';

export interface PublicUser {
	id: string;
	name?: string;
	email: string;
	isEmailverified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface RegisterInput extends Omit<CreateUserInput, 'optCode' | 'optCodeExpiresAt'> {}
export interface UpdateProfileInput { name?: string | null }

export interface UserService {
	register(input: RegisterInput): Promise<{ user: PublicUser; verificationCode?: string }>;
	login(input: { email: string; password: string }): Promise<{ user: PublicUser; tokens: TokenPair }>;
	verifyEmail(input: { email: string; optCode: string }): Promise<PublicUser>;
	resendVerification(email: string): Promise<{ verificationCode?: string }>;
	refresh(refreshToken: string): Promise<{ user: PublicUser; tokens: TokenPair }>;
	logout(userId: string): Promise<void>;
	forgotPassword(email: string): Promise<{ verificationCode?: string }>;
	resetPassword(input: { email: string; optCode: string; password: string }): Promise<void>;
	getById(id: string): Promise<PublicUser>;
	getCurrentUser(id: string): Promise<PublicUser>;
	list(query: UserListQuery): Promise<{ users: PublicUser[]; page: number; limit: number; total: number }>;
	update(id: string, input: UpdateProfileInput): Promise<PublicUser>;
	delete(id: string): Promise<void>;
	changePassword(id: string, currentPassword: string, password: string): Promise<void>;
}

export class DefaultUserService implements UserService {
	constructor(
		private readonly repository: UserRepository,
		private readonly tokens: TokenService,
		private readonly exposeOtp = false,
		private readonly otpTtlMs = 10 * 60 * 1000,
	) {}

	async register(input: RegisterInput) {
		const email = normalizeEmail(input.email);
		if (await this.repository.findByEmail(email)) {
			throw new AppError('Email is already registered', 409, 'EMAIL_ALREADY_REGISTERED');
		}

		const verificationCode = createOtp();
		try {
			const user = await this.repository.create({
				...input,
				email,
				optCode: verificationCode,
				optCodeExpiresAt: expiresAt(this.otpTtlMs),
			});
			return {
				user: toPublicUser(user),
				...(this.exposeOtp ? { verificationCode } : {}),
			};
		} catch (error) {
			if (isDuplicateKeyError(error)) {
				throw new AppError('Email is already registered', 409, 'EMAIL_ALREADY_REGISTERED');
			}
			throw error;
		}
	}

	async login(input: { email: string; password: string }) {
		const user = await this.repository.verifyPassword(normalizeEmail(input.email), input.password);
		if (!user) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
		if (!user.isEmailverified) {
			throw new AppError('Please verify your email before logging in', 403, 'EMAIL_NOT_VERIFIED');
		}
		return { user: toPublicUser(user), tokens: this.tokens.createPair(user.id, user.tokenVersion) };
	}

	async verifyEmail(input: { email: string; optCode: string }) {
		const user = await this.repository.findByEmail(normalizeEmail(input.email), true);
		assertOtp(user, input.optCode);
		const updated = await this.repository.update(user.id, {
			isEmailverified: true,
			clearOtp: true,
		});
		if (!updated) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
		return toPublicUser(updated);
	}

	async resendVerification(email: string) {
		const user = await this.repository.findByEmail(normalizeEmail(email));
		if (!user || user.isEmailverified) return {};
		const verificationCode = createOtp();
		await this.repository.update(user.id, {
			optCode: verificationCode,
			optCodeExpiresAt: expiresAt(this.otpTtlMs),
		});
		return this.exposeOtp ? { verificationCode } : {};
	}

	async refresh(refreshToken: string) {
		const payload = this.tokens.verify(refreshToken, 'refresh');
		const user = await this.repository.findById(payload.sub);
		if (!user || user.tokenVersion !== payload.version) {
			throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
		}
		return { user: toPublicUser(user), tokens: this.tokens.createPair(user.id, user.tokenVersion) };
	}

	async logout(userId: string) {
		const user = await this.repository.incrementTokenVersion(userId);
		if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
	}

	async forgotPassword(email: string) {
		const user = await this.repository.findByEmail(normalizeEmail(email));
		if (!user) return {};
		const verificationCode = createOtp();
		await this.repository.update(user.id, {
			optCode: verificationCode,
			optCodeExpiresAt: expiresAt(this.otpTtlMs),
		});
		return this.exposeOtp ? { verificationCode } : {};
	}

	async resetPassword(input: { email: string; optCode: string; password: string }) {
		const user = await this.repository.findByEmail(normalizeEmail(input.email), true);
		assertOtp(user, input.optCode);
		const updated = await this.repository.update(user.id, { password: input.password, clearOtp: true });
		if (!updated) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
		await this.repository.incrementTokenVersion(user.id);
	}

	async getById(id: string) {
		const user = await this.repository.findById(id);
		if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
		return toPublicUser(user);
	}

	getCurrentUser(id: string) {
		return this.getById(id);
	}

	async list(query: UserListQuery) {
		const result = await this.repository.findAll(query);
		return {
			users: result.items.map(toPublicUser),
			page: query.page,
			limit: query.limit,
			total: result.total,
		};
	}

	async update(id: string, input: UpdateProfileInput) {
		const update: UpdateUserInput = {};
		if (input.name !== undefined) update.name = input.name ?? '';
		const user = await this.repository.update(id, update);
		if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
		return toPublicUser(user);
	}

	async delete(id: string) {
		if (!(await this.repository.delete(id))) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
	}

	async changePassword(id: string, currentPassword: string, password: string) {
		const user = await this.repository.findById(id);
		if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
		const verified = await this.repository.verifyPassword(user.email, currentPassword);
		if (!verified) throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
		await this.repository.update(id, { password });
		await this.repository.incrementTokenVersion(id);
	}
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const createOtp = () => randomInt(100000, 1000000).toString();
const expiresAt = (ttlMs: number) => new Date(Date.now() + ttlMs);

function assertOtp(user: UserRecord | null, code: string): asserts user is UserRecord {
	if (!user || !user.optCode || user.optCode !== code || !user.optCodeExpiresAt || user.optCodeExpiresAt.getTime() < Date.now()) {
		throw new AppError('Invalid or expired OTP code', 400, 'INVALID_OTP');
	}
}

const toPublicUser = (user: UserRecord): PublicUser => ({
	id: user.id,
	...(user.name ? { name: user.name } : {}),
	email: user.email,
	isEmailverified: user.isEmailverified,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

const isDuplicateKeyError = (error: unknown): boolean =>
	typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
