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
        this.pathHistory = path.join("bussines_chat", bussines, 'conversations', `${clientName}.json`);
    }

    async getChatHistory() {
        this.chatHistory = await leerArchivo(this.pathHistory);
    }

    async getPrompt() {
        this.prompt = await leerArchivo(path.join("bussines_chat", this.bussines, 'prompt.txt'));
    }

    async getResponseByChatGPT(msg) {
        console.log(msg);

        let messages = [];
        try {
            if (this.chatHistory) {
                messages = JSON.parse(this.chatHistory);
            } else {
                await this.getPrompt();
                messages = [{ role: 'system', content: this.prompt }];
            }

            messages.push({ role: 'user', content: msg });

        } catch (error) {
            console.error("Se ha producido un error al intentar obtener el prompt")
        }

        const completion = await this.openai.chat.completions.create({
            messages,
            model: 'gpt-3.5-turbo-16k-0613',
            temperature: 0.1,
        });

        messages.push(completion.choices[0].message)

        escribirArchivo(this.pathHistory, JSON.stringify(messages))

        console.log(completion)

        return completion.choices[0].message.content;
    }
}