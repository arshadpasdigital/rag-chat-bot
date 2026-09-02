import {
	END,
	START,
	StateGraph,
} from '@langchain/langgraph';
import type { ChatHistoryService } from '../services/chatHistory.service';
import { createMemoryAgentNode } from './node/memoryAgentNode';
import { MessagesState } from './state';

export { MessagesState } from './state';

export const createGraph = (chatHistoryService: ChatHistoryService) => {
	const workflow = new StateGraph(MessagesState)
		.addNode('memoryAgent', createMemoryAgentNode(chatHistoryService))
		.addEdge(START, 'memoryAgent')
		.addEdge('memoryAgent', END);

	return workflow.compile();
};
