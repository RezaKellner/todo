"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoService = void 0;
class TodoService {
    constructor(db) {
        this.db = db;
    }
    async addTodo(task, date) {
        const query = 'INSERT INTO todos (task, completed, date) VALUES ($1, $2, $3)';
        await this.db.query(query, [task, false, date]);
    }
    async getTodosByDate(date) {
        const query = 'SELECT * FROM todos WHERE date = $1 ORDER BY created_at ASC';
        const result = await this.db.query(query, [date]);
        return result.rows;
    }
    async completeTodo(id) {
        const query = 'UPDATE todos SET completed = true WHERE id = $1';
        await this.db.query(query, [id]);
    }
    async deleteTodo(id) {
        const query = 'DELETE FROM todos WHERE id = $1';
        await this.db.query(query, [id]);
    }
    async getAllDates() {
        const query = 'SELECT DISTINCT date FROM todos ORDER BY date DESC';
        const result = await this.db.query(query);
        return result.rows.map((row) => row.date);
    }
}
exports.TodoService = TodoService;
