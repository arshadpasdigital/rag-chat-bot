
import * as grpc from '@grpc/grpc-js';
import { toGrpcError } from '../utils/grpcError';

type Graph = {
	stream(input: unknown, options: unknown): Promise<AsyncIterable<unknown>>;
};

export class ChatGrpcServices {
	constructor(private readonly graph: Graph) {}

	readonly Chat = async (call: grpc.ServerWritableStream<any, any>) => {
		try {
			const { userId, message, threadId } = call.request;
			const graphStream = await this.graph.stream(
				{
					messages: [{ role: 'user', content: message }],
					userId,
					threadId,
				},
				{
					streamMode: 'custom',
					subgraphs: true,
					recursionLimit: 400,
					configurable: { userId },
				},
			);

			let isThinking = false;
			for await (const item of graphStream) {
				const chunk = Array.isArray(item) ? item[1] : item;
				const content = (chunk as any)?.content;
				if (!content) continue;

				for (const part of content.split(/(<think>|<\/think>)/)) {
					if (part === '<think>') {
						isThinking = true;
						continue;
					}
					if (part === '</think>') {
						isThinking = false;
						continue;
					}
					if (part) call.write({ type: isThinking ? 'THINKING' : 'CONTENT', content: part });
				}
			}

			call.write({ type: 'DONE', content: '' });
			call.end();
		} catch (error: unknown) {
			call.destroy(toGrpcError(error, 'Chat stream failed', grpc.status.INTERNAL));
		}
	};
}