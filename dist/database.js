"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const pg_1 = require("pg");
class Database {
    constructor() {
        this.pool = new pg_1.Pool({
            host: process.env.DB_HOST || 'postgres',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'todoapp',
            user: process.env.DB_USER || 'todouser',
            password: process.env.DB_PASSWORD || 'todopass',
        });
    }
    async connect() {
        try {
            await this.pool.connect();
            console.log('Connected to PostgreSQL database');
            await this.createTables();
        }
        catch (error) {
            console.error('Database connection error:', error);
            process.exit(1);
        }
    }
    async createTables() {
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        date VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await this.pool.query(createTableQuery);
    }
    async query(text, params) {
        return this.pool.query(text, params);
    }
    async close() {
        await this.pool.end();
    }
}
exports.Database = Database;
