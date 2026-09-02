import {
	END,
	Command,
	type GraphNode,
} from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import { memoAgent } from '../../memoryAgent';
import type { ChatHistoryService } from '../../services/chatHistory.service';
import { MessagesState } from '../state';

export const createMemoryAgentNode = (
	chatHistoryService: ChatHistoryService,
): GraphNode<typeof MessagesState> => async (state, config: any) => {
	const { userId, threadId } = state;
	const last = state.messages
		.filter((message: any) => message._getType() === 'human')
		.slice(-1)[0];

	const { streamAgent } = await memoAgent({ model: 'gpt-5.5', userId });
	const { fullContext } = await streamAgent(last?.content as string, config);
	await chatHistoryService.insertMessage(
		userId,
		threadId,
		last?.content as string,
		'user',
	);

	return new Command({
		update: { messages: [new AIMessage(fullContext)], nextNode: END },
		goto: END,
	});
};
