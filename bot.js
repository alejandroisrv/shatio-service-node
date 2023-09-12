const OpenAI = require('openai');
const { escribirArchivo, leerArchivo } = require('./utils.js');
const path = require('path');
const logger = require('./logger.js')
class ChatBot {
    constructor(bussines, clientName) {
        this.openai = new OpenAI({
            apiKey: process.env.OPEN_AI_KEY,
        });
        this.bussines = bussines;
        this.clientName = clientName;
        this.chatHistory = null;
        this.prompt = null;
        this.pathHistory = path.join('bussines_chat', bussines, 'conversations', `${clientName}.json`);
    }

    async getChatHistory() {
        this.chatHistory = await leerArchivo(this.pathHistory);
    }

    async getPrompt() {
        this.prompt = await leerArchivo(path.join('bussines_chat', this.bussines, 'prompt.txt'));
    }

    async getResponseByChatGPT(msg) {

        let messages = [];

        if (this.prompt == null) {
            console.error('Se ha producido un error al intentar obtener el prompt');
            return null
        }

        if (this.chatHistory) {
            messages = JSON.parse(this.chatHistory);
        }

        messages.unshift({ role: 'system', content: this.prompt })
        messages.push({ role: 'user', content: msg });

        try {
            const completion = await this.openai.chat.completions.create({
                messages,
                model: 'gpt-3.5-turbo',
                temperature: 0,
                max_tokens: 300,
                frequency_penalty: 0,
                presence_penalty: 0,
            });


            messages.push(completion.choices[0].message);

            escribirArchivo(this.pathHistory, JSON.stringify(messages.slice(1)));

            console.log(completion);

            return completion.choices[0].message.content;
        } catch (error) {
            logger.error("CHATGPT", error)
            return false
        }
    }
}

module.exports = ChatBot;