import { createHmac, timingSafeEqual } from 'node:crypto';
import { AppError } from '../exceptions/appError';

export type TokenType = 'access' | 'refresh';

export interface TokenPayload {
	sub: string;
	type: TokenType;
	version: number;
	iat: number;
	exp: number;
}

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface TokenService {
	createPair(userId: string, version: number): TokenPair;
	verify(token: string, expectedType: TokenType): TokenPayload;
}

export class HmacTokenService implements TokenService {
	constructor(
		private readonly accessSecret: string,
		private readonly refreshSecret: string,
		private readonly accessTtlSeconds: number,
		private readonly refreshTtlSeconds: number,
	) {}

	createPair(userId: string, version: number): TokenPair {
		return {
			accessToken: this.sign({ sub: userId, type: 'access', version }, this.accessTtlSeconds),
			refreshToken: this.sign({ sub: userId, type: 'refresh', version }, this.refreshTtlSeconds),
			expiresIn: this.accessTtlSeconds,
		};
	}

	verify(token: string, expectedType: TokenType): TokenPayload {
		try {
			const [encodedHeader, encodedPayload, signature] = token.split('.');
			if (!encodedHeader || !encodedPayload || !signature) throw new Error('Malformed token');
			const payload = JSON.parse(fromBase64Url(encodedPayload)) as Partial<TokenPayload>;
			if (payload.type !== expectedType || typeof payload.sub !== 'string') {
				throw new Error('Invalid token claims');
			}
			if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
				throw new Error('Expired token');
			}
			const secret = expectedType === 'access' ? this.accessSecret : this.refreshSecret;
			const expectedSignature = signValue(`${encodedHeader}.${encodedPayload}`, secret);
			const actual = Buffer.from(signature);
			const expected = Buffer.from(expectedSignature);
			if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
				throw new Error('Invalid token signature');
			}
			return payload as TokenPayload;
		} catch {
			throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
		}
	}

	private sign(
		claims: Pick<TokenPayload, 'sub' | 'type' | 'version'>,
		ttlSeconds: number,
	): string {
		const now = Math.floor(Date.now() / 1000);
		const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
		const payload = toBase64Url(
			JSON.stringify({ ...claims, iat: now, exp: now + ttlSeconds }),
		);
		const secret = claims.type === 'access' ? this.accessSecret : this.refreshSecret;
		return `${header}.${payload}.${signValue(`${header}.${payload}`, secret)}`;
	}
}

export const parseDuration = (value: string, fallbackSeconds: number): number => {
	const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());
	if (!match) return fallbackSeconds;
	const amount = Number(match[1]);
	const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[match[2] as 's' | 'm' | 'h' | 'd'];
	return amount * multiplier;
};

const toBase64Url = (value: string) => Buffer.from(value).toString('base64url');
const fromBase64Url = (value: string) => Buffer.from(value, 'base64url').toString('utf8');
const signValue = (value: string, secret: string) => createHmac('sha256', secret).update(value).digest('base64url');
