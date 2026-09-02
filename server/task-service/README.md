# task-service

Task and chat functionality for the microservice application. The service uses
constructor injection and creates its object graph in one place:

```text
src/
├── models/                 Mongoose schemas
├── repositories/           database adapters and repository contracts
├── services/               business use cases
├── clients/grpc.client.ts  reusable outbound gRPC client factory
├── grpc/gRPCServer.ts      inbound gRPC adapters
└── task.dependencies.ts    composition root
```

Use `TaskDependencies` when adding code that needs a task-service dependency:

```ts
const dependencies = new TaskDependencies();
const tasks = await dependencies.taskService.getTasks();

// For an outbound client, use the shared factory once and reuse the client.
const authClient = dependencies.grpcClient.create({
  protoFile: 'auth.proto',
  packageName: 'auth',
  serviceName: 'AuthService',
  address: 'auth-service:50053',
});
```

The application entrypoint constructs `TaskDependencies` once, connects to
MongoDB, and passes the prepared gRPC handlers to the server.

## Run

```bash
bun install
bun run dev
```

Required environment variables include `OPENAI_API_KEY` and
`FIREWORKS_API_KEY`. `MONGODB_URI`, `PORT`, and `GRPC_PORT` have development
defaults.
