declare module 'bcrypt' {
	const bcrypt: {
		hash(value: string, rounds: number): Promise<string>;
		compare(value: string, hash: string): Promise<boolean>;
	};
	export default bcrypt;
}

declare module 'cors' {
	import type { RequestHandler } from 'express';
	const cors: (options?: Record<string, unknown>) => RequestHandler;
	export default cors;
}
