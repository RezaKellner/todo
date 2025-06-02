"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const readline = __importStar(require("readline"));
const database_1 = require("./database");
const todo_1 = require("./todo");
class TodoCLI {
    constructor(todoService) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.todoService = todoService;
        this.currentDate = new Date().toISOString().split('T')[0];
    }
    formatDate(date) {
        return new Date(date + 'T00:00:00').toLocaleDateString();
    }
    async showMenu() {
        console.log('\n=== Daily Todo CLI ===');
        console.log(`Current date: ${this.formatDate(this.currentDate)}`);
        console.log('1. View today\'s todos');
        console.log('2. Add new todo');
        console.log('3. Mark todo as completed');
        console.log('4. Delete todo');
        console.log('5. View past todos');
        console.log('6. Change current date');
        console.log('7. Exit');
        console.log('=====================');
    }
    async viewTodos(date) {
        const targetDate = date || this.currentDate;
        const todos = await this.todoService.getTodosByDate(targetDate);
        console.log(`\n--- Todos for ${this.formatDate(targetDate)} ---`);
        if (todos.length === 0) {
            console.log('No todos found for this date.');
            return;
        }
        todos.forEach((todo, index) => {
            const status = todo.completed ? '✓' : '○';
            console.log(`${todo.id}: [${status}] ${todo.task}`);
        });
    }
    async addTodo() {
        const task = await this.question('Enter new todo: ');
        if (task.trim()) {
            await this.todoService.addTodo(task.trim(), this.currentDate);
            console.log('Todo added successfully!');
        }
    }
    async completeTodo() {
        await this.viewTodos();
        const idStr = await this.question('Enter todo ID to mark as completed: ');
        const id = parseInt(idStr);
        if (!isNaN(id)) {
            try {
                await this.todoService.completeTodo(id);
                console.log('Todo marked as completed!');
            }
            catch (error) {
                console.log('Error: Todo not found or already completed.');
            }
        }
    }
    async deleteTodo() {
        await this.viewTodos();
        const idStr = await this.question('Enter todo ID to delete: ');
        const id = parseInt(idStr);
        if (!isNaN(id)) {
            try {
                await this.todoService.deleteTodo(id);
                console.log('Todo deleted successfully!');
            }
            catch (error) {
                console.log('Error: Todo not found.');
            }
        }
    }
    async viewPastTodos() {
        const dates = await this.todoService.getAllDates();
        if (dates.length === 0) {
            console.log('No past todos found.');
            return;
        }
        console.log('\nAvailable dates:');
        dates.forEach((date, index) => {
            console.log(`${index + 1}. ${this.formatDate(date)}`);
        });
        const choice = await this.question('Select date number (or press Enter to go back): ');
        const index = parseInt(choice) - 1;
        if (!isNaN(index) && index >= 0 && index < dates.length) {
            await this.viewTodos(dates[index]);
        }
    }
    async changeDate() {
        const newDate = await this.question('Enter new date (YYYY-MM-DD): ');
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(newDate)) {
            this.currentDate = newDate;
            console.log(`Date changed to ${this.formatDate(newDate)}`);
        }
        else {
            console.log('Invalid date format. Please use YYYY-MM-DD.');
        }
    }
    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
    async start() {
        console.log('Welcome to Daily Todo CLI!');
        while (true) {
            await this.showMenu();
            const choice = await this.question('Choose an option: ');
            switch (choice) {
                case '1':
                    await this.viewTodos();
                    break;
                case '2':
                    await this.addTodo();
                    break;
                case '3':
                    await this.completeTodo();
                    break;
                case '4':
                    await this.deleteTodo();
                    break;
                case '5':
                    await this.viewPastTodos();
                    break;
                case '6':
                    await this.changeDate();
                    break;
                case '7':
                    console.log('Goodbye!');
                    this.rl.close();
                    return;
                default:
                    console.log('Invalid option. Please try again.');
            }
        }
    }
}
async function main() {
    // Start Express server for health checks
    const app = (0, express_1.default)();
    const port = process.env.PORT || 3000;
    app.get('/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    app.listen(port, () => {
        console.log(`Health check server running on port ${port}`);
    });
    // Initialize database and CLI
    const database = new database_1.Database();
    await database.connect();
    const todoService = new todo_1.TodoService(database);
    const cli = new TodoCLI(todoService);
    await cli.start();
    await database.close();
}
main().catch(console.error);
