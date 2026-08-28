# Auth service

User authentication service built with Bun, TypeScript, Express, Mongoose 8, Zod, and bcrypt.

To install dependencies:

```bash
bun install
```

To type-check:

```bash
bun run typecheck
```

To run (MongoDB must be available):

```bash
bun run src/app.ts
```

The root Compose file is configured for development with source mounts and watch mode:

```bash
docker compose -f ../docker-compose.yml up --build
```

For production, provide the required secrets and use the production override:

```bash
docker compose -f ../docker-compose.yml -f ../docker-compose.prod.yml up --build -d
```

## Configuration

The service reads `MONGODB_URI`, `RABBITMQ_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `PORT`, `GRPC_PORT`, and `FRONTEND_APP_URL`. Development defaults are provided by `src/utils/env.ts`; use strong secrets in production. HTTP uses `PORT` (5053 by default) and gRPC uses `GRPC_PORT` (50053 by default).

`RabbitMq.getInstance()` provides `publish()` through a publisher-confirm channel and `consume()` through a dedicated consumer channel. Consumer handlers must call `ack(message, channel)` after successful processing; rejected handlers are automatically nacked without requeue so a configured dead-letter policy can process them.

## Endpoints

The routes are available under `/api/v1/auth` and `/api/v1/users` (also `/auth` and `/users` for direct-service compatibility).

- `POST /register` — create a user and issue an email verification OTP.
- `POST /verify-email` and `POST /resend-verification` — verify or resend the email OTP.
- `POST /login` — authenticate a verified user and return access/refresh tokens.
- `POST /refresh-token` and `POST /logout` — rotate tokens or invalidate the current token version.
- `POST /forgot-password` and `POST /reset-password` — password recovery using a time-limited OTP.
- `GET /me`, `PATCH /me`, and `PATCH /change-password` — authenticated profile/password operations.
- `GET /`, `GET /:id`, `PATCH /:id`, and `DELETE /:id` — authenticated user listing and CRUD operations. Listing supports `page`, `limit`, and `search` query parameters.

In development and test environments, the generated OTP is included in the register/resend/recovery response because no email provider is configured yet. It is never included in production responses.
