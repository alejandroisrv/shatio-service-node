const { ChatOpenAI } = require('langchain/chat_models/openai');
const { ConversationSummaryMemory } = require('langchain/memory');
const { LLMChain } = require('langchain/chains');
const { PromptTemplate } = require('langchain/prompts');
const Database = require('./database');

class ChatBot {
    constructor(business) {
        this.db = new Database();
        this.business = business;
        this.sessions = new Map();
    }

    async initializeSession(userName) {
        await this.db.connect();
        logger.info(`initializeSession:  ${userName}`);
        const llm = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0, openAIApiKey: process.env.OPEN_AI_KEY, topP: 0.3 });
        const savedMemory = await this.db.loadMemory(userName);
        const memory = new ConversationSummaryMemory({ memoryKey: 'chat_history', llm, chatHistory: JSON.parse(savedMemory) });

        logger.info(`chat_history:  ${JSON.parse(savedMemory)}`);
        const promptBasic = await this.db.getPrompt(this.business);
        const prompt = PromptTemplate.fromTemplate(`${promptBasic}\nCurrent conversation:\n{chat_history}\nHuman: {input}\nAI:`);
        const chain = new LLMChain({ llm, prompt, memory });

        this.sessions.set(userName, { chain, memory });
    }

    async call(userName, input) {
        if (!this.sessions.has(userName)) {
            await this.initializeSession(userName);
        }

        const session = this.sessions.get(userName);
        const res = await session.chain.call({ input });

        // Actualizar el historial de conversación
        session.memory.setMemoryVariables({ chat_history: session.memory.getMemoryVariables().chat_history + `Human: ${input}\nAI: ${res}\n` });
        
        const memoryData = session.memory.getMemoryVariables();
        logger.info(`update chat_history:  ${JSON.stringify(memoryData)}`);
        await this.db.saveMemory(userName, JSON.stringify(memoryData));

        return res;
    }
}

module.exports = ChatBot;