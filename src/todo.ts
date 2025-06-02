export interface Todo {
  id?: number;
  task: string;
  completed: boolean;
  date: string;
  created_at?: Date;
}

export class TodoService {
  constructor(private db: any) {}

  async addTodo(task: string, date: string): Promise<void> {
    const query = 'INSERT INTO todos (task, completed, date) VALUES ($1, $2, $3)';
    await this.db.query(query, [task, false, date]);
  }

  async getTodosByDate(date: string): Promise<Todo[]> {
    const query = 'SELECT * FROM todos WHERE date = $1 ORDER BY created_at ASC';
    const result = await this.db.query(query, [date]);
    return result.rows;
  }

  async completeTodo(id: number): Promise<void> {
    const query = 'UPDATE todos SET completed = true WHERE id = $1';
    await this.db.query(query, [id]);
  }

  async deleteTodo(id: number): Promise<void> {
    const query = 'DELETE FROM todos WHERE id = $1';
    await this.db.query(query, [id]);
  }

  async getAllDates(): Promise<string[]> {
    const query = 'SELECT DISTINCT date FROM todos ORDER BY date DESC';
    const result = await this.db.query(query);
    return result.rows.map((row: any) => row.date);
  }
}