import OpenAI from 'openai';
import { escribirArchivo, leerArchivo } from './utils.js';
import path from 'path'

export default class ChatBot {
    constructor(bussines, clientName) {
        this.openai = new OpenAI({
            apiKey: process.env.OPEN_AI_KEY,
        });
        this.bussines = bussines;
        this.clientName = clientName
        this.chatHistory = null;
        this.prompt = null;
        this.pathHistory = path.join(bussines, 'conversations', `${clientName}.json`);
    }

    async getChatHistory() {
        this.chatHistory = await leerArchivo(this.pathHistory);
    }

    async getPrompt() {
        this.prompt = await leerArchivo(path.join("./", this.bussines, 'prompt.txt'));
    }

    async sendMessageUser(msg) {
        let messages = [];
        if (this.chatHistory) {
            messages = JSON.parse(this.chatHistory);
        } else {
            await this.getPrompt();
            messages = [{ role: 'system', content: this.prompt }];
        }

        messages.push({ role: 'user', content: msg });

        const completion = await this.openai.chat.completions.create({
            messages,
            model: 'gpt-3.5-turbo',
        });

        messages.push(completion.choices[0].message)

        escribirArchivo(this.pathHistory, JSON.stringify(messages))

        console.log(completion)

        return completion.choices[0].message.content;
    }
}