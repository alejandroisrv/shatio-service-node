const mysql = require('mysql2/promise');
const logger = require('./logger');

class Database {
    constructor() {
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: process.env.USER_DB,
            password: process.env.USER_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        logger.info('Conexión exitosa a la base de datos');
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.connection.connect((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    async getPrompt(business) {
        try {
            const [results, fields] = await this.connection.promise().query(
                'SELECT prompt FROM prompts WHERE business = ?',
                [business]
            );
            const prompt = results.length > 0 ? results[0].prompt : null;
            return prompt;
        } catch (error) {
            throw error;
        }
    }

    async saveMemory(userName, memory) {
        try {
            await this.connection.promise().query(
                'INSERT INTO memories (user_name, memory) VALUES (?, ?) ON DUPLICATE KEY UPDATE memory = ?',
                [userName, JSON.stringify(memory), JSON.stringify(memory)]
            );
        } catch (error) {
            throw error;
        }
    }

    async loadMemory(userName) {
        try {
            const [results, fields] = await this.connection.promise().query(
                'SELECT memory FROM memories WHERE user_name = ?',
                [userName]
            );
            const memory = results.length > 0 ? JSON.parse(results[0].memory) : null;
            return memory;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Database;