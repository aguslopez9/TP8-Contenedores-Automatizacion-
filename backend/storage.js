const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "todos.json");

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ todos: [] }, null, 2), "utf-8");
  }
}

async function readData() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.todos)) {
      throw new Error("Invalid data structure");
    }
    return parsed;
  } catch {
    return { todos: [] };
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

class TodoStore {
  constructor() {
    this.cache = null;
    this.nextId = 1;
  }

  async load() {
    const data = await readData();
    this.cache = data.todos.map((todo) => ({
      id: Number(todo.id),
      text: String(todo.text),
      completed: Boolean(todo.completed),
      priority: todo.priority || 'medium',
      createdAt: todo.createdAt || new Date().toISOString(),
      completedAt: todo.completedAt || null,
    }));
    const maxId = this.cache.reduce((max, todo) => Math.max(max, todo.id || 0), 0);
    this.nextId = maxId + 1;
  }

  async ensureCache() {
    if (!this.cache) {
      await this.load();
    }
  }

  async list() {
    await this.ensureCache();
    return [...this.cache];
  }

  async create({ text, completed = false, priority = 'medium' }) {
    await this.ensureCache();
    const validPriorities = ['low', 'medium', 'high'];
    const normalizedPriority = validPriorities.includes(priority) ? priority : 'medium';
    
    const todo = {
      id: this.nextId++,
      text: text.trim(),
      completed: Boolean(completed),
      priority: normalizedPriority,
      createdAt: new Date().toISOString(),
      completedAt: Boolean(completed) ? new Date().toISOString() : null,
    };
    this.cache.push(todo);
    await writeData({ todos: this.cache });
    return todo;
  }

  async update(id, updates) {
    await this.ensureCache();
    const index = this.cache.findIndex((todo) => todo.id === id);
    if (index === -1) {
      return null;
    }

    const current = this.cache[index];
    const wasCompleted = current.completed;
    const willBeCompleted = "completed" in updates ? Boolean(updates.completed) : wasCompleted;
    
    const validPriorities = ['low', 'medium', 'high'];
    const priorityUpdate = "priority" in updates && validPriorities.includes(updates.priority)
      ? { priority: updates.priority }
      : {};

    const next = {
      ...current,
      ...("text" in updates && typeof updates.text === "string" && updates.text.trim() !== ""
        ? { text: updates.text.trim() }
        : {}),
      ...("completed" in updates ? { completed: willBeCompleted } : {}),
      ...priorityUpdate,
      completedAt: !wasCompleted && willBeCompleted
        ? new Date().toISOString()
        : wasCompleted && !willBeCompleted
        ? null
        : current.completedAt,
    };

    this.cache[index] = next;
    await writeData({ todos: this.cache });
    return next;
  }

  async delete(id) {
    await this.ensureCache();
    const index = this.cache.findIndex((todo) => todo.id === id);
    if (index === -1) {
      return false;
    }

    this.cache.splice(index, 1);
    await writeData({ todos: this.cache });
    return true;
  }

  async filter({ completed, priority, search }) {
    await this.ensureCache();
    let filtered = [...this.cache];

    if (completed !== undefined) {
      filtered = filtered.filter((todo) => todo.completed === Boolean(completed));
    }

    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      filtered = filtered.filter((todo) => todo.priority === priority);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter((todo) =>
        todo.text.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  async getStats() {
    await this.ensureCache();
    const todos = this.cache;
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;
    
    const byPriority = {
      low: todos.filter((t) => t.priority === 'low').length,
      medium: todos.filter((t) => t.priority === 'medium').length,
      high: todos.filter((t) => t.priority === 'high').length,
    };

    return {
      total,
      completed,
      pending,
      byPriority,
    };
  }

  async markAllCompleted(completed = true) {
    await this.ensureCache();
    const now = new Date().toISOString();
    let count = 0;

    this.cache = this.cache.map((todo) => {
      if (todo.completed !== completed) {
        count++;
        return {
          ...todo,
          completed: Boolean(completed),
          completedAt: completed ? now : null,
        };
      }
      return todo;
    });

    if (count > 0) {
      await writeData({ todos: this.cache });
    }

    return count;
  }

  async deleteCompleted() {
    await this.ensureCache();
    const initialLength = this.cache.length;
    this.cache = this.cache.filter((todo) => !todo.completed);
    const deleted = initialLength - this.cache.length;

    if (deleted > 0) {
      await writeData({ todos: this.cache });
    }

    return deleted;
  }
}

module.exports = {
  TodoStore,
};

