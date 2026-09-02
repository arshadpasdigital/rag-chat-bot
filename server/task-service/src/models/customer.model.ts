import {
	Schema,
	Types,
	model,
	models,
	type Document,
	type Model,
} from 'mongoose';

export interface ICustomer extends Document {
	firstName: string;
	lastName: string;
	email: string;
    userId:Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
	{
		firstName: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
		},
        userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			index: true,
			lowercase: true,
			trim: true,
		},
	},
	{ timestamps: true },
);

export const CustomerModel: Model<ICustomer> =
	(models.Customer as Model<ICustomer> | undefined) ??
	model<ICustomer>('Customer', customerSchema);
