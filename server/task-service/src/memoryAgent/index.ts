import { createAgent, HumanMessage } from "langchain";
import { env } from "../utils/env";
import { MEMORY_BASE_SYSTEM_PROMPT } from "./prompts/memo-prompt";


const memoAgent = async ({ model = "", }) => {
    const agent = createAgent({
        model,
        tools: [],
        systemPrompt: MEMORY_BASE_SYSTEM_PROMPT,
        middleware: []
    })

    const streamAgent = async (userInput: string, config: any) => {
        let fullContext = "";
        for await (const chunk of await agent.stream(
            { messages: [{ role: "user", content: userInput }] },
            { streamMode: "updates" }
        )) {

            const update = chunk?.tools?.messages;
            const req = chunk?.model_request?.messages;

            if (req && req.length > 0) {
                const aiMessage = req[0];
                const content = aiMessage?.content ?? "";

                const hasToolCalls = (aiMessage as any)?.tools_call && (aiMessage as any)?.tools_call.length > 0;

                if (hasToolCalls) {
                    const aiThinking = `<think>` + content + `</think>`
                    fullContext += aiThinking;
                    config.write({
                        manager_name: "memoryManager",
                        content: aiThinking
                    })

                } else {
                    fullContext += content;
                    config.write({
                        manager_name: "memoryManager",
                        content: content
                    })
                }
            }

            return { fullContext }

        }
    }


    return {streamAgent}

}

