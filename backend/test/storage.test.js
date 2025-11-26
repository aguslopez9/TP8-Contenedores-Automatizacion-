const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert");
const fs = require("fs/promises");
const path = require("path");
const { TodoStore } = require("../storage");

const DATA_FILE = path.join(__dirname, "..", "data", "todos.json");

describe("TodoStore", () => {
  let store;

  beforeEach(async () => {
    // Clear data file before each test
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify({ todos: [] }), "utf-8");
    } catch (error) {
      // Create directory if it doesn't exist
      const dataDir = path.dirname(DATA_FILE);
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify({ todos: [] }), "utf-8");
    }
    
    // Create fresh store instance
    store = new TodoStore();
    await store.load();
    // Reset to ensure clean state
    store.cache = [];
    store.nextId = 1;
  });

  test("should create a todo with default values", async () => {
    const todo = await store.create({ text: "Test todo" });
    assert.strictEqual(todo.text, "Test todo");
    assert.strictEqual(todo.completed, false);
    assert.strictEqual(todo.priority, "medium");
    assert.ok(todo.createdAt);
    assert.strictEqual(todo.completedAt, null);
    assert.strictEqual(typeof todo.id, "number");
  });

  test("should create a todo with high priority", async () => {
    const todo = await store.create({ text: "Important", priority: "high" });
    assert.strictEqual(todo.priority, "high");
  });

  test("should create a todo with low priority", async () => {
    const todo = await store.create({ text: "Low priority", priority: "low" });
    assert.strictEqual(todo.priority, "low");
  });

  test("should normalize invalid priority to medium", async () => {
    const todo = await store.create({ text: "Test", priority: "invalid" });
    assert.strictEqual(todo.priority, "medium");
  });

  test("should create a completed todo with completedAt timestamp", async () => {
    const todo = await store.create({ text: "Done", completed: true });
    assert.strictEqual(todo.completed, true);
    assert.ok(todo.completedAt);
  });

  test("should list all todos", async () => {
    await store.create({ text: "Todo 1" });
    await store.create({ text: "Todo 2" });
    const todos = await store.list();
    assert.strictEqual(todos.length, 2);
    assert.strictEqual(todos[0].text, "Todo 1");
    assert.strictEqual(todos[1].text, "Todo 2");
  });

  test("should update todo text", async () => {
    const todo = await store.create({ text: "Original" });
    const updated = await store.update(todo.id, { text: "Updated" });
    assert.strictEqual(updated.text, "Updated");
    assert.strictEqual(updated.id, todo.id);
  });

  test("should update todo completed status", async () => {
    const todo = await store.create({ text: "Task", completed: false });
    const updated = await store.update(todo.id, { completed: true });
    assert.strictEqual(updated.completed, true);
    assert.ok(updated.completedAt);
  });

  test("should set completedAt to null when uncompleting", async () => {
    const todo = await store.create({ text: "Task", completed: true });
    const updated = await store.update(todo.id, { completed: false });
    assert.strictEqual(updated.completed, false);
    assert.strictEqual(updated.completedAt, null);
  });

  test("should update todo priority", async () => {
    const todo = await store.create({ text: "Task", priority: "low" });
    const updated = await store.update(todo.id, { priority: "high" });
    assert.strictEqual(updated.priority, "high");
  });

  test("should return null when updating non-existent todo", async () => {
    const result = await store.update(99999, { text: "Updated" });
    assert.strictEqual(result, null);
  });

  test("should delete a todo", async () => {
    const todo = await store.create({ text: "To delete" });
    const deleted = await store.delete(todo.id);
    assert.strictEqual(deleted, true);
    const todos = await store.list();
    assert.strictEqual(todos.length, 0);
  });

  test("should return false when deleting non-existent todo", async () => {
    const result = await store.delete(99999);
    assert.strictEqual(result, false);
  });

  test("should filter todos by completed status", async () => {
    await store.create({ text: "Pending 1", completed: false });
    await store.create({ text: "Completed 1", completed: true });
    await store.create({ text: "Pending 2", completed: false });
    
    const completed = await store.filter({ completed: true });
    assert.strictEqual(completed.length, 1);
    assert.strictEqual(completed[0].text, "Completed 1");
    
    const pending = await store.filter({ completed: false });
    assert.strictEqual(pending.length, 2);
  });

  test("should filter todos by priority", async () => {
    await store.create({ text: "High 1", priority: "high" });
    await store.create({ text: "Medium 1", priority: "medium" });
    await store.create({ text: "High 2", priority: "high" });
    
    const high = await store.filter({ priority: "high" });
    assert.strictEqual(high.length, 2);
    assert.ok(high.every(t => t.priority === "high"));
  });

  test("should filter todos by search text", async () => {
    await store.create({ text: "Buy milk" });
    await store.create({ text: "Buy bread" });
    await store.create({ text: "Clean house" });
    
    const results = await store.filter({ search: "buy" });
    assert.strictEqual(results.length, 2);
    assert.ok(results.every(t => t.text.toLowerCase().includes("buy")));
  });

  test("should combine multiple filters", async () => {
    await store.create({ text: "High priority task", priority: "high", completed: false });
    await store.create({ text: "High priority done", priority: "high", completed: true });
    await store.create({ text: "Low priority task", priority: "low", completed: false });
    
    const results = await store.filter({ priority: "high", completed: false });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].text, "High priority task");
  });

  test("should get statistics", async () => {
    await store.create({ text: "Todo 1", completed: false, priority: "high" });
    await store.create({ text: "Todo 2", completed: true, priority: "medium" });
    await store.create({ text: "Todo 3", completed: false, priority: "low" });
    await store.create({ text: "Todo 4", completed: true, priority: "high" });
    
    const stats = await store.getStats();
    assert.strictEqual(stats.total, 4);
    assert.strictEqual(stats.completed, 2);
    assert.strictEqual(stats.pending, 2);
    assert.strictEqual(stats.byPriority.high, 2);
    assert.strictEqual(stats.byPriority.medium, 1);
    assert.strictEqual(stats.byPriority.low, 1);
  });

  test("should mark all todos as completed", async () => {
    await store.create({ text: "Todo 1", completed: false });
    await store.create({ text: "Todo 2", completed: false });
    await store.create({ text: "Todo 3", completed: true });
    
    const count = await store.markAllCompleted(true);
    assert.strictEqual(count, 2); // Only 2 were changed
    
    const todos = await store.list();
    assert.ok(todos.every(t => t.completed === true));
    assert.ok(todos.every(t => t.completedAt !== null));
  });

  test("should mark all todos as pending", async () => {
    await store.create({ text: "Todo 1", completed: true });
    await store.create({ text: "Todo 2", completed: true });
    
    const count = await store.markAllCompleted(false);
    assert.strictEqual(count, 2);
    
    const todos = await store.list();
    assert.ok(todos.every(t => t.completed === false));
    assert.ok(todos.every(t => t.completedAt === null));
  });

  test("should delete all completed todos", async () => {
    await store.create({ text: "Todo 1", completed: true });
    await store.create({ text: "Todo 2", completed: false });
    await store.create({ text: "Todo 3", completed: true });
    
    const deleted = await store.deleteCompleted();
    assert.strictEqual(deleted, 2);
    
    const todos = await store.list();
    assert.strictEqual(todos.length, 1);
    assert.strictEqual(todos[0].text, "Todo 2");
    assert.strictEqual(todos[0].completed, false);
  });

  test("should trim text when creating todo", async () => {
    const todo = await store.create({ text: "  Trimmed text  " });
    assert.strictEqual(todo.text, "Trimmed text");
  });

  test("should trim text when updating todo", async () => {
    const todo = await store.create({ text: "Original" });
    const updated = await store.update(todo.id, { text: "  Updated text  " });
    assert.strictEqual(updated.text, "Updated text");
  });

  test("should not update with empty text", async () => {
    const todo = await store.create({ text: "Original" });
    const updated = await store.update(todo.id, { text: "   " });
    assert.strictEqual(updated.text, "Original"); // Should remain unchanged
  });

  test("should assign sequential IDs", async () => {
    const todo1 = await store.create({ text: "First" });
    const todo2 = await store.create({ text: "Second" });
    const todo3 = await store.create({ text: "Third" });
    
    assert.strictEqual(todo2.id, todo1.id + 1);
    assert.strictEqual(todo3.id, todo2.id + 1);
  });

  test("should preserve createdAt when updating", async () => {
    const todo = await store.create({ text: "Original" });
    const originalCreatedAt = todo.createdAt;
    
    await store.update(todo.id, { text: "Updated" });
    const updated = await store.list();
    const found = updated.find(t => t.id === todo.id);
    
    assert.strictEqual(found.createdAt, originalCreatedAt);
  });
});

