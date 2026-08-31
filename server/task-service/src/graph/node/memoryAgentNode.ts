import {
  StateGraph,
  StateSchema,
  MessagesValue,
  ReducedValue,
  START,
  END,
  type GraphNode,
} from "@langchain/langgraph";
import { SystemMessage } from "@langchain/core/messages";
import { AIMessage, ToolMessage } from "@langchain/core/messages";





export const memoryAgentNode:GraphNode<typeof MessagesState>  = async(state,config:any)=>{
    const {userId} = state;
    const last = state.messages.filter((m:any)=>m._getType() === "human")
        .slice(-1)[0];
    
}   
