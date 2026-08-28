import bcrypt from 'bcrypt';
import { Schema, model, type HydratedDocument } from 'mongoose';

export interface User {
	name?: string;
	email: string;
	isEmailverified: boolean;
	optCode?: string;
	optCodeExpiresAt?: Date;
	password: string;
	tokenVersion: number;
	createdAt: Date;
	updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User>(
	{
		name: { type: String, trim: true, maxlength: 100 },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		isEmailverified: { type: Boolean, default: false },
		optCode: { type: String, select: false },
		optCodeExpiresAt: { type: Date, select: false },
		password: { type: String, required: true, select: false, minlength: 8 },
		tokenVersion: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

userSchema.pre('save', async function encryptPassword(next) {
	if (!this.isModified('password')) {
		next();
		return;
	}

	this.password = await bcrypt.hash(this.password, 12);
	next();
});

export const UserModel = model<User>('User', userSchema);
