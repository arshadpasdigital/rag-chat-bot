import { MessagesValue, StateSchema } from '@langchain/langgraph';
import { z } from 'zod/v4';

export const MessagesState = new StateSchema({
	messages: MessagesValue,
	userId: z.string().default('').describe('userId is required'),
	threadId: z.string().default(''),
});
