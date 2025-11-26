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
});

