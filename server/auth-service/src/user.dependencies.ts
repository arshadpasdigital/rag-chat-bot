import { env } from './utils/env';
import { UserController } from './controller/user.controller';
import { MongooseUserRepository } from './repo/userRepo';
import { DefaultUserService } from './service/user.service';
import { HmacTokenService, parseDuration } from './security/token';
import { createAuthenticate } from './utils/authenticate';
import { UserRouter } from './router/user.router';
import rabbitMq from './lib/rabbitMq';

export class UserDependencies {
	readonly router: UserRouter['router'];

	constructor() {
		const repository = new MongooseUserRepository();
		const tokens = new HmacTokenService(
			env.JWT_ACCESS_SECRET,
			env.JWT_REFRESH_SECRET,
			parseDuration(env.JWT_ACCESS_EXPIRES_IN, 900),
			parseDuration(env.JWT_REFRESH_EXPIRES_IN, 604_800),
		);
		const service = new DefaultUserService(repository,rabbitMq ,tokens, env.NODE_ENV !== 'production');
		const controller = new UserController(service);
		this.router = new UserRouter(controller, createAuthenticate(tokens, repository)).router;
	}
}
