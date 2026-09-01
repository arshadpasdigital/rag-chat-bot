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


export const memoryAgentNode:GraphNode<typeof MessagesState>  = async(state,config:any)=>{
    const {userId} = state;
    const last = state.messages.filter((m:any)=>m._getType() === "human")
        .slice(-1)[0];

    const llmInstance = LLM.getInstance({});
    const {streamAgent} = await memoAgent({ model:'gpt-5.5',userId })
    const { fullContext } = await streamAgent(last?.content as string, config);
    
    return new Command({
      update:{messages:[new AIMessage(fullContext)],nextNode:END},
      goto:END
    })
}   
