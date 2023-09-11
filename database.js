const mysql = require('mysql2');

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
        return new Promise((resolve, reject) => {
            this.connection.query(
                'SELECT prompt FROM prompts WHERE business = ?',
                [business],
                (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        const prompt = results.length > 0 ? results[0].prompt : null;
                        resolve(prompt);
                    }
                }
            );
        });
    }

    saveMemory(userName, memory) {
        return new Promise((resolve, reject) => {
            this.connection.query(
                'INSERT INTO memories (user_name, memory) VALUES (?, ?) ON DUPLICATE KEY UPDATE memory = ?',
                [userName, JSON.stringify(memory), JSON.stringify(memory)],
                (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    loadMemory(userName) {
        return new Promise((resolve, reject) => {
            this.connection.query(
                'SELECT memory FROM memories WHERE user_name = ?',
                [userName],
                (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        const memory = results.length > 0 ? JSON.parse(results[0].memory) : null;
                        resolve(memory);
                    }
                }
            );
        });
    }
}

module.exports = Database;