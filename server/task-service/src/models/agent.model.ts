import {
	Schema,
	model,
	models,
	type Document,
	type Model,
	Types,
} from 'mongoose';

export interface IAgent extends Document {
	name: string;
	goal: string;
	persona: string;
	userId: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const agentSchema = new Schema<IAgent>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
		},
		goal: {
			type: String,
			required: true,
			trim: true,
		},
		persona: {
			type: String,
			required: true,
			trim: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
	},
	{ timestamps: true },
);

agentSchema.index({ userId: 1, createdAt: -1 });

export const AgentModel: Model<IAgent> =
	(models.Agent as Model<IAgent> | undefined) ?? model<IAgent>('Agent', agentSchema);
