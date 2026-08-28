import amqp, {
	type Channel,
	type ChannelModel,
	type ConsumeMessage,
	type ConfirmChannel,
	type Options,
	type Replies,
} from 'amqplib';
import { env } from '../utils/env';

/** Owns one RabbitMQ connection plus dedicated publisher and consumer channels. */
export type RabbitMessageHandler = (
	message: ConsumeMessage,
	channel: Channel,
) => Promise<void> | void;

export class RabbitMq {
	private static instance: RabbitMq | undefined;
	private connection: ChannelModel | null = null;
	private publishChannel: ConfirmChannel | null = null;
	private consumerChannel: Channel | null = null;
	private connectionPromise: Promise<ChannelModel> | null = null;
	private publishChannelPromise: Promise<ConfirmChannel> | null = null;
	private consumerChannelPromise: Promise<Channel> | null = null;

	private constructor() {}

	static getInstance(): RabbitMq {
		RabbitMq.instance ??= new RabbitMq();
		return RabbitMq.instance;
	}

	async openConnection(url = env.RABBITMQ_URL): Promise<ChannelModel> {
		if (this.connection) return this.connection;
		if (this.connectionPromise) return this.connectionPromise;

		this.connectionPromise = amqp
			.connect(url)
			.then((connection) => {
				this.connection = connection;
				connection.on('error', (error) => console.error('RabbitMQ connection error', error));
				connection.on('close', () => {
					this.connection = null;
					this.publishChannel = null;
					this.consumerChannel = null;
				});
				console.info('Connected to RabbitMQ');
				return connection;
			})
			.finally(() => {
				this.connectionPromise = null;
			});

		return this.connectionPromise;
	}

	getConnection(): ChannelModel | null {
		return this.connection;
	}

	async getPublishChannel(): Promise<ConfirmChannel> {
		if (this.publishChannel) return this.publishChannel;
		if (this.publishChannelPromise) return this.publishChannelPromise;

		const connection = await this.openConnection();
		this.publishChannelPromise = connection
			.createConfirmChannel()
			.then((channel) => {
				this.publishChannel = channel;
				channel.on('error', (error) => console.error('RabbitMQ channel error', error));
				channel.on('close', () => {
					this.publishChannel = null;
				});
				return channel;
			})
			.finally(() => {
				this.publishChannelPromise = null;
			});

		return this.publishChannelPromise;
	}

	async getConsumerChannel(): Promise<Channel> {
		if (this.consumerChannel) return this.consumerChannel;
		if (this.consumerChannelPromise) return this.consumerChannelPromise;

		const connection = await this.openConnection();
		this.consumerChannelPromise = connection
			.createChannel()
			.then((channel) => {
				this.consumerChannel = channel;
				channel.on('error', (error) => console.error('RabbitMQ channel error', error));
				channel.on('close', () => {
					this.consumerChannel = null;
				});
				return channel;
			})
			.finally(() => {
				this.consumerChannelPromise = null;
			});

		return this.consumerChannelPromise;
	}

	// Kept as a compatibility alias for consumers that need the default consumer channel.
	getChannel(): Promise<Channel> {
		return this.getConsumerChannel();
	}

	async publish(
		exchange: string,
		routingKey: string,
		payload: unknown,
		options: Options.Publish = {},
	): Promise<void> {
		const channel = await this.getPublishChannel();
		const content = toMessageBuffer(payload);
		channel.publish(exchange, routingKey, content, {
			persistent: true,
			contentType: 'application/json',
			...options,
		});
		await channel.waitForConfirms();
	}

	/**
	 * Registers a consumer. Successful handlers must call ack() themselves;
	 * rejected handlers are nacked without requeue so a dead-letter policy can handle them.
	 */
	async consume(
		queue: string,
		handler: RabbitMessageHandler,
		options: Options.Consume = { noAck: false },
	): Promise<Replies.Consume> {
		const channel = await this.getConsumerChannel();
		return channel.consume(queue, (message) => {
			if (!message) return;
			void Promise.resolve()
				.then(() => handler(message, channel))
				.catch((error: unknown) => {
					console.error(`RabbitMQ consumer failed for queue ${queue}`, error);
					if (options.noAck !== true) {
						try {
							this.nack(message, false, false, channel);
						} catch (nackError: unknown) {
							console.error(`RabbitMQ nack failed for queue ${queue}`, nackError);
						}
					}
				});
		}, options);
	}

	ack(message: ConsumeMessage, allUpTo = false, channel?: Channel): void {
		this.getOpenConsumerChannel(channel).ack(message, allUpTo);
	}

	nack(message: ConsumeMessage, allUpTo = false, requeue = false, channel?: Channel): void {
		this.getOpenConsumerChannel(channel).nack(message, allUpTo, requeue);
	}

	async closeConnection(): Promise<void> {
		if (this.publishChannelPromise) await this.publishChannelPromise.catch(() => undefined);
		if (this.consumerChannelPromise) await this.consumerChannelPromise.catch(() => undefined);
		if (this.publishChannel) {
			await this.publishChannel.close().catch(() => undefined);
			this.publishChannel = null;
		}
		if (this.consumerChannel) {
			await this.consumerChannel.close().catch(() => undefined);
			this.consumerChannel = null;
		}
		if (this.connectionPromise) await this.connectionPromise.catch(() => undefined);
		if (this.connection) {
			await this.connection.close().catch(() => undefined);
			this.connection = null;
		}
		console.info('RabbitMQ connection closed');
	}

	close(): Promise<void> {
		return this.closeConnection();
	}

	private getOpenConsumerChannel(channel?: Channel): Channel {
		const openChannel = channel ?? this.consumerChannel;
		if (!openChannel) throw new Error('RabbitMQ consumer channel is not open');
		return openChannel;
	}
}

const toMessageBuffer = (payload: unknown): Buffer => {
	if (Buffer.isBuffer(payload)) return payload;
	if (typeof payload === 'string') return Buffer.from(payload);
	return Buffer.from(JSON.stringify(payload) ?? 'null');
};

export { RabbitMq as RabbitMQ };
export const rabbitMq = RabbitMq.getInstance();
export default rabbitMq;
