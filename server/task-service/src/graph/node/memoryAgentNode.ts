import {
  StateGraph,
  StateSchema,
  MessagesValue,
  ReducedValue,
  START,
  END,
  type GraphNode,
  Command,
} from "@langchain/langgraph";
import { SystemMessage } from "@langchain/core/messages";
import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { LLM } from "../../llm/LLM";
import { memoAgent } from "../../memoryAgent";
import { env } from "../../utils/env";
import type { MessagesState } from "..";
import { ChatHistoryService } from "../../services/chatHistory.service";


export const memoryAgentNode:GraphNode<typeof MessagesState>  = async(state,config:any)=>{
    const {userId, threadId} = state;
    const last = state?.messages?.filter((m:any)=>m._getType() === "human")
        .slice(-1)[0];

    const llmInstance = LLM.getInstance({});
    const chatHistoryInstance = ChatHistoryService.getInstance();
    const {streamAgent} = await memoAgent({ model:'gpt-5.5',userId })
    const { fullContext } = await streamAgent(last?.content as string, config);
    await chatHistoryInstance.insertMessage(userId,threadId,last?.content as string,"user");
    return new Command({
      update:{messages:[new AIMessage(fullContext)],nextNode:END},
      goto:END
    })
}   
