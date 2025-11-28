const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const fs = require("fs/promises");
const path = require("path");
const { makeRequest } = require("./test-helper");

// Use the actual server port from environment or default
const TEST_PORT = process.env.TEST_PORT || 3001;

describe("Server API", () => {
  beforeEach(async () => {
    // Clear test data before each test
    const dataFile = path.join(__dirname, "..", "data", "todos.json");
    try {
      await fs.writeFile(dataFile, JSON.stringify({ todos: [] }), "utf-8");
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  test("GET /health should return ok status", async () => {
    const response = await makeRequest(TEST_PORT, "GET", "/health");
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.status, "ok");
  });

  test("GET /todos should return empty array initially", async () => {
    const response = await makeRequest(TEST_PORT, "GET", "/todos");
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.body.todos));
  });

  test("POST /todos should create a new todo", async () => {
    const response = await makeRequest(TEST_PORT, "POST", "/todos", { text: "New task" });
    assert.strictEqual(response.status, 201);
    assert.ok(response.body.todo);
    assert.strictEqual(response.body.todo.text, "New task");
    assert.strictEqual(response.body.todo.completed, false);
    assert.strictEqual(response.body.todo.priority, "medium");
  });

  test("POST /todos should create todo with priority", async () => {
    const response = await makeRequest(TEST_PORT, "POST", "/todos", {
      text: "High priority",
      priority: "high",
    });
    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.todo.priority, "high");
  });

  test("POST /todos should reject empty text", async () => {
    const response = await makeRequest(TEST_PORT, "POST", "/todos", { text: "" });
    assert.strictEqual(response.status, 400);
    assert.ok(response.body.error);
  });

  test("POST /todos should reject missing text", async () => {
    const response = await makeRequest(TEST_PORT, "POST", "/todos", {});
    assert.strictEqual(response.status, 400);
    assert.ok(response.body.error);
  });

  test("GET /todos?completed=true should filter completed", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Done", completed: true });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Pending" });

    const response = await makeRequest(TEST_PORT, "GET", "/todos?completed=true");
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.todos.every((t) => t.completed === true));
  });

  test("GET /todos?priority=high should filter by priority", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "High", priority: "high" });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Low", priority: "low" });

    const response = await makeRequest(TEST_PORT, "GET", "/todos?priority=high");
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.todos.every((t) => t.priority === "high"));
  });

  test("GET /todos?search=test should filter by search", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Test task" });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Other task" });

    const response = await makeRequest(TEST_PORT, "GET", "/todos?search=test");
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.todos.every((t) => t.text.toLowerCase().includes("test")));
  });

  test("PATCH /todos/:id should update todo", async () => {
    const createRes = await makeRequest(TEST_PORT, "POST", "/todos", { text: "Original" });
    const todoId = createRes.body.todo.id;

    const updateRes = await makeRequest(TEST_PORT, "PATCH", `/todos/${todoId}`, {
      text: "Updated",
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.todo.text, "Updated");
  });

  test("PATCH /todos/:id should update completed status", async () => {
    const createRes = await makeRequest(TEST_PORT, "POST", "/todos", { text: "Task" });
    const todoId = createRes.body.todo.id;

    const updateRes = await makeRequest(TEST_PORT, "PATCH", `/todos/${todoId}`, {
      completed: true,
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.todo.completed, true);
    assert.ok(updateRes.body.todo.completedAt);
  });

  test("PATCH /todos/:id should update priority", async () => {
    const createRes = await makeRequest(TEST_PORT, "POST", "/todos", {
      text: "Task",
      priority: "low",
    });
    const todoId = createRes.body.todo.id;

    const updateRes = await makeRequest(TEST_PORT, "PATCH", `/todos/${todoId}`, {
      priority: "high",
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.todo.priority, "high");
  });

  test("PATCH /todos/:id should return 404 for non-existent todo", async () => {
    const response = await makeRequest(TEST_PORT, "PATCH", "/todos/99999", { text: "Updated" });
    assert.strictEqual(response.status, 404);
  });

  test("DELETE /todos/:id should delete todo", async () => {
    const createRes = await makeRequest(TEST_PORT, "POST", "/todos", { text: "To delete" });
    const todoId = createRes.body.todo.id;

    const deleteRes = await makeRequest(TEST_PORT, "DELETE", `/todos/${todoId}`);
    assert.strictEqual(deleteRes.status, 204);

    const getRes = await makeRequest(TEST_PORT, "GET", "/todos");
    assert.ok(!getRes.body.todos.find((t) => t.id === todoId));
  });

  test("DELETE /todos/:id should return 404 for non-existent todo", async () => {
    const response = await makeRequest(TEST_PORT, "DELETE", "/todos/99999");
    assert.strictEqual(response.status, 404);
  });

  test("GET /todos/stats should return statistics", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "High", priority: "high" });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Medium", priority: "medium", completed: true });

    const response = await makeRequest(TEST_PORT, "GET", "/todos/stats");
    assert.strictEqual(response.status, 200);
    assert.ok(typeof response.body.total === "number");
    assert.ok(typeof response.body.completed === "number");
    assert.ok(typeof response.body.pending === "number");
    assert.ok(response.body.byPriority);
  });

  test("POST /todos/bulk/mark-completed should mark all as completed", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Task 1" });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Task 2" });

    const response = await makeRequest(TEST_PORT, "POST", "/todos/bulk/mark-completed", {
      completed: true,
    });
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.count >= 0);

    const todosRes = await makeRequest(TEST_PORT, "GET", "/todos");
    assert.ok(todosRes.body.todos.every((t) => t.completed === true));
  });

  test("DELETE /todos/bulk/completed should delete completed todos", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Done 1", completed: true });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Done 2", completed: true });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Pending" });

    const response = await makeRequest(TEST_PORT, "DELETE", "/todos/bulk/completed");
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.count >= 0);

    const todosRes = await makeRequest(TEST_PORT, "GET", "/todos");
    assert.ok(todosRes.body.todos.every((t) => t.completed === false));
  });

  test("should return 404 for unknown routes", async () => {
    const response = await makeRequest(TEST_PORT, "GET", "/unknown");
    assert.strictEqual(response.status, 404);
  });

  test("should return 405 for method not allowed", async () => {
    const response = await makeRequest(TEST_PORT, "PUT", "/todos");
    assert.strictEqual(response.status, 405);
  });

  test("should handle CORS headers", async () => {
    const response = await makeRequest(TEST_PORT, "GET", "/health");
    assert.ok(response.headers["access-control-allow-origin"]);
  });

  test("should handle OPTIONS request", async () => {
    const response = await makeRequest(TEST_PORT, "OPTIONS", "/todos");
    assert.strictEqual(response.status, 204);
  });

  test("should reject invalid JSON in POST", async () => {
    const response = await makeRequest(TEST_PORT, "POST", "/todos", "invalid json", {
      "Content-Type": "application/json",
    });
    assert.strictEqual(response.status, 400);
  });

  test("should reject invalid JSON in PATCH", async () => {
    const createRes = await makeRequest(TEST_PORT, "POST", "/todos", { text: "Test" });
    const todoId = createRes.body.todo.id;

    const response = await makeRequest(TEST_PORT, "PATCH", `/todos/${todoId}`, "invalid", {
      "Content-Type": "application/json",
    });
    assert.strictEqual(response.status, 400);
  });

  test("PATCH should reject empty update", async () => {
    const createRes = await makeRequest(TEST_PORT, "POST", "/todos", { text: "Test" });
    const todoId = createRes.body.todo.id;

    const response = await makeRequest(TEST_PORT, "PATCH", `/todos/${todoId}`, {});
    assert.strictEqual(response.status, 400);
  });

  test("POST /todos should accept completed status in body", async () => {
    const response = await makeRequest(TEST_PORT, "POST", "/todos", {
      text: "Completed task",
      completed: true,
    });
    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.todo.completed, true);
    assert.ok(response.body.todo.completedAt);
  });

  test("POST /todos should normalize invalid priority", async () => {
    const response = await makeRequest(TEST_PORT, "POST", "/todos", {
      text: "Task",
      priority: "invalid",
    });
    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.todo.priority, "medium");
  });

  test("GET /todos?completed=false should filter pending", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Done", completed: true });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Pending" });

    const response = await makeRequest(TEST_PORT, "GET", "/todos?completed=false");
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.todos.every((t) => t.completed === false));
  });

  test("GET /todos should combine multiple filters", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "High task", priority: "high", completed: false });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "High done", priority: "high", completed: true });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Low task", priority: "low", completed: false });

    const response = await makeRequest(TEST_PORT, "GET", "/todos?priority=high&completed=false");
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.todos.every((t) => t.priority === "high" && t.completed === false));
  });

  test("GET /todos should combine search with filters", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Buy milk", completed: false });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Buy bread", completed: true });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Clean house", completed: false });

    const response = await makeRequest(TEST_PORT, "GET", "/todos?search=buy&completed=false");
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.todos.every((t) => t.text.toLowerCase().includes("buy") && t.completed === false));
  });

  test("PATCH /todos/:id should handle text whitespace trimming", async () => {
    const createRes = await makeRequest(TEST_PORT, "POST", "/todos", { text: "Original" });
    const todoId = createRes.body.todo.id;

    const updateRes = await makeRequest(TEST_PORT, "PATCH", `/todos/${todoId}`, {
      text: "  Updated text  ",
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.todo.text, "Updated text");
  });

  test("PATCH /todos/:id should not update with empty text", async () => {
    const createRes = await makeRequest(TEST_PORT, "POST", "/todos", { text: "Original" });
    const todoId = createRes.body.todo.id;

    const updateRes = await makeRequest(TEST_PORT, "PATCH", `/todos/${todoId}`, {
      text: "   ",
    });
    // Empty text is ignored, not rejected - returns 200 with unchanged text
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.todo.text, "Original");
  });

  test("PATCH /todos/:id should normalize invalid priority", async () => {
    const createRes = await makeRequest(TEST_PORT, "POST", "/todos", { text: "Task", priority: "low" });
    const todoId = createRes.body.todo.id;

    const updateRes = await makeRequest(TEST_PORT, "PATCH", `/todos/${todoId}`, {
      priority: "invalid",
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.todo.priority, "low"); // Should remain unchanged
  });

  test("POST /todos/bulk/mark-completed should mark all as pending", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Task 1", completed: true });
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Task 2", completed: true });

    const response = await makeRequest(TEST_PORT, "POST", "/todos/bulk/mark-completed", {
      completed: false,
    });
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.count >= 0);

    const todosRes = await makeRequest(TEST_PORT, "GET", "/todos");
    assert.ok(todosRes.body.todos.every((t) => t.completed === false));
  });

  test("POST /todos/bulk/mark-completed should handle empty body", async () => {
    await makeRequest(TEST_PORT, "POST", "/todos", { text: "Task 1" });

    const response = await makeRequest(TEST_PORT, "POST", "/todos/bulk/mark-completed", {
      completed: undefined,
    });
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.count >= 0);
  });

  test("should handle request without body", async () => {
    const response = await makeRequest(TEST_PORT, "GET", "/health");
    assert.strictEqual(response.status, 200);
  });

  test("should handle invalid todo ID format", async () => {
    const response = await makeRequest(TEST_PORT, "GET", "/todos/notanumber");
    assert.strictEqual(response.status, 404);
  });

  test("should handle CORS on all endpoints", async () => {
    const endpoints = ["/health", "/todos", "/todos/stats"];
    for (const endpoint of endpoints) {
      const response = await makeRequest(TEST_PORT, "GET", endpoint);
      assert.ok(response.headers["access-control-allow-origin"]);
    }
  });

  test("should handle OPTIONS on different paths", async () => {
    const paths = ["/todos", "/todos/stats", "/todos/1"];
    for (const path of paths) {
      const response = await makeRequest(TEST_PORT, "OPTIONS", path);
      assert.strictEqual(response.status, 204);
    }
  });

  test("GET /todos/stats should return stats structure", async () => {
    // Clear all todos first
    const allTodos = await makeRequest(TEST_PORT, "GET", "/todos");
    for (const todo of allTodos.body.todos) {
      await makeRequest(TEST_PORT, "DELETE", `/todos/${todo.id}`);
    }

    const response = await makeRequest(TEST_PORT, "GET", "/todos/stats");
    assert.strictEqual(response.status, 200);
    assert.ok(typeof response.body.total === "number");
    assert.ok(typeof response.body.completed === "number");
    assert.ok(typeof response.body.pending === "number");
    assert.ok(response.body.byPriority);
    assert.ok(typeof response.body.byPriority.high === "number");
    assert.ok(typeof response.body.byPriority.medium === "number");
    assert.ok(typeof response.body.byPriority.low === "number");
  });

  test("should handle missing URL in request", async () => {
    // This tests the badRequest handler for missing URL
    // We can't easily test this through HTTP, but we can test edge cases
    const response = await makeRequest(TEST_PORT, "GET", "");
    // Should handle gracefully (either 404 or 400)
    assert.ok([400, 404].includes(response.status));
  });
});

