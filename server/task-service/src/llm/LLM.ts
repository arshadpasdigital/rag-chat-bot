import { ChatOpenAI } from "@langchain/openai"

interface LLMInstanceType{
    model?:string,
    temperature?:number
}

export class LLM {
    constructor() { }
    public static getInstance({model="gpt-5.5",temperature=0}:LLMInstanceType) {
        const llm = new ChatOpenAI({
            model,
            temperature,
        })
        return llm;
    }
}

