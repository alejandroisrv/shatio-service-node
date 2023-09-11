const { ChatOpenAI } = require('langchain/chat_models/openai');
const { ConversationSummaryMemory } = require('langchain/memory');
const { LLMChain } = require('langchain/chains');
const { PromptTemplate } = require('langchain/prompts');
const Database = require('./database');

class ChatBot {
    constructor(bussines) {
        this.db = new Database();
        this.bussines = bussines;
        this.sessions = new Map();
    }

    async initializeSession(userName) {
        await this.db.connect();

        const llm = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0, openAIApiKey: process.env.OPEN_AI_KEY, topP: 0.3 });
        const memory = new ConversationSummaryMemory({ memoryKey: 'chat_history', llm });
        const promptBasic = this.db.getPrompt(this.bussines);
        const prompt = PromptTemplate.fromTemplate(`${promptBasic}\nCurrent conversation:\n{chat_history}\nHuman: {input}\nAI:`);
        const chain = new LLMChain({ llm, prompt, memory });

        const savedMemory = await this.db.loadMemory(userName);
        if (savedMemory) {
            memory.loadMemoryVariables(savedMemory);
        }

        this.sessions.set(userName, { chain, memory });
    }

    async call(userName, input) {
        if (!this.sessions.has(userName)) {
            await this.initializeSession(userName);
        }

        const session = this.sessions.get(userName);
        const res = await session.chain.call({ input });
        const memoryData = await session.memory.loadMemoryVariables({});
        await this.db.saveMemory(userName, memoryData);

        return res;
    }
}

module.exports = ChatBot;