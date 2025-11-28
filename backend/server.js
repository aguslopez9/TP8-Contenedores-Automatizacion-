const http = require("http");
const { URL } = require("url");
const { TodoStore } = require("./storage");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST || "0.0.0.0";

const store = new TodoStore();

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function sendNoContent(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}

function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

function methodNotAllowed(res) {
  sendJson(res, 405, { error: "Method not allowed" });
}

function badRequest(res, message) {
  sendJson(res, 400, { error: message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }

      const raw = Buffer.concat(chunks).toString("utf-8");
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function handleHealth(res) {
  sendJson(res, 200, { status: "ok" });
}

async function handleGetTodos(res, url) {
  const completedParam = url.searchParams.get("completed");
  const priorityParam = url.searchParams.get("priority");
  const searchParam = url.searchParams.get("search");

  const filters = {};
  if (completedParam !== null) {
    filters.completed = completedParam === "true";
  }
  if (priorityParam) {
    filters.priority = priorityParam;
  }
  if (searchParam) {
    filters.search = searchParam;
  }

  const todos = Object.keys(filters).length > 0
    ? await store.filter(filters)
    : await store.list();
  sendJson(res, 200, { todos });
}

async function handlePostTodos(req, res) {
  let body;
  try {
    body = await parseBody(req);
  } catch {
    badRequest(res, "Invalid JSON");
    return;
  }

  if (!body || typeof body.text !== "string" || body.text.trim() === "") {
    badRequest(res, "Property 'text' is required");
    return;
  }

  const todo = await store.create({
    text: body.text,
    completed: Boolean(body.completed),
    priority: body.priority || "medium",
  });
  sendJson(res, 201, { todo });
}

async function handleTodosRoute(req, res, url) {
  if (req.method === "GET") {
    await handleGetTodos(res, url);
    return;
  }

  if (req.method === "POST") {
    await handlePostTodos(req, res);
    return;
  }

  methodNotAllowed(res);
}

async function handleStatsRoute(req, res) {
  if (req.method === "GET") {
    const stats = await store.getStats();
    sendJson(res, 200, stats);
    return;
  }
  methodNotAllowed(res);
}

async function handleBulkMarkCompleted(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(res);
    return;
  }

  let body;
  try {
    body = await parseBody(req);
  } catch {
    badRequest(res, "Invalid JSON");
    return;
  }

  const completed = body.completed !== undefined ? Boolean(body.completed) : true;
  const count = await store.markAllCompleted(completed);
  sendJson(res, 200, { count, completed });
}

async function handleBulkDeleteCompleted(req, res) {
  if (req.method !== "DELETE") {
    methodNotAllowed(res);
    return;
  }

  const count = await store.deleteCompleted();
  sendJson(res, 200, { count });
}

async function handlePatchTodo(req, res, todoId) {
  let body;
  try {
    body = await parseBody(req);
  } catch {
    badRequest(res, "Invalid JSON");
    return;
  }

  if (!body || (typeof body.completed === "undefined" && typeof body.text === "undefined" && typeof body.priority === "undefined")) {
    badRequest(res, "Nothing to update");
    return;
  }

  const updated = await store.update(todoId, {
    completed: body.completed,
    text: body.text,
    priority: body.priority,
  });

  if (!updated) {
    notFound(res);
    return;
  }

  sendJson(res, 200, { todo: updated });
}

async function handleDeleteTodo(res, todoId) {
  const deleted = await store.delete(todoId);
  if (!deleted) {
    notFound(res);
    return;
  }
  sendNoContent(res);
}

async function handleTodoByIdRoute(req, res, todoId) {
  if (req.method === "PATCH") {
    await handlePatchTodo(req, res, todoId);
    return;
  }

  if (req.method === "DELETE") {
    await handleDeleteTodo(res, todoId);
    return;
  }

  methodNotAllowed(res);
}

async function handleRequest(req, res) {
  setCorsHeaders(res);

  if (!req.url) {
    badRequest(res, "Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  if (path === "/health") {
    await handleHealth(res);
    return;
  }

  if (path === "/todos") {
    await handleTodosRoute(req, res, url);
    return;
  }

  if (path === "/todos/stats") {
    await handleStatsRoute(req, res);
    return;
  }

  if (path === "/todos/bulk/mark-completed") {
    await handleBulkMarkCompleted(req, res);
    return;
  }

  if (path === "/todos/bulk/completed") {
    await handleBulkDeleteCompleted(req, res);
    return;
  }

  const todoIdMatch = path.match(/^\/todos\/(\d+)$/);
  if (todoIdMatch) {
    const todoId = Number(todoIdMatch[1]);
    await handleTodoByIdRoute(req, res, todoId);
    return;
  }

  notFound(res);
}

const server = http.createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (error) {
    console.error("Error handling request:", error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

store
  .load()
  .then(() => {
    server.listen(PORT, HOST, () => {
      console.log(`API escuchando en http://${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize data store:", error);
    process.exit(1);
  });

// Manejar señales para shutdown graceful (permite que c8 escriba el reporte)
function gracefulShutdown(signal) {
  console.log(`Received ${signal}, closing server gracefully...`);
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
  
  // Timeout para forzar cierre si no se cierra en 5 segundos
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 5000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

