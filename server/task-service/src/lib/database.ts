import mongoose, { type Mongoose } from 'mongoose';
import { env } from '../utils/env';

/** Owns the task-service MongoDB connection lifecycle. */
export class Database {
	private connection: Mongoose | null = null;
	private connectionPromise: Promise<Mongoose> | null = null;

	async openConnection(uri = env.MONGODB_URI): Promise<Mongoose> {
		if (this.connection && [1, 2].includes(this.connection.connection.readyState)) {
			return this.connection;
		}
		if (this.connectionPromise) return this.connectionPromise;

		this.connectionPromise = mongoose
			.connect(uri, { serverSelectionTimeoutMS: 5_000 })
			.then((connection) => {
				this.connection = connection;
				console.info('Connected to MongoDB');
				return connection;
			})
			.finally(() => {
				this.connectionPromise = null;
			});

		return this.connectionPromise;
	}

	async closeConnection(): Promise<void> {
		if (this.connectionPromise) await this.connectionPromise.catch(() => undefined);
		if (!this.connection || this.connection.connection.readyState === 0) {
			this.connection = null;
			return;
		}

		await this.connection.disconnect();
		this.connection = null;
		console.info('MongoDB connection closed');
	}
}

export const database = new Database();
