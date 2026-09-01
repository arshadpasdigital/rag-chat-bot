import {
  StateGraph,
  StateSchema,
  MessagesValue,
  ReducedValue,
  START,
  END,
} from "@langchain/langgraph";
import { z } from "zod/v4";
import { memoryAgentNode } from "./node/memoryAgentNode";

export const MessagesState = new StateSchema({
  messages: MessagesValue,
  userId:z.string().default("").describe("userId is requried")
});

const workflow = new StateGraph(MessagesState)
  .addNode("memoryAgent", memoryAgentNode)
  .addEdge(START, "memoryAgent")
  .addEdge("memoryAgent",END);

export const graph = workflow.compile()