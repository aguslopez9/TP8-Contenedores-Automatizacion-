const API_URL = window.__APP_CONFIG?.apiBaseUrl ?? "http://localhost:3001";

const state = {
  todos: [],
  filter: "all",
  search: "",
  stats: null,
};

function getFilteredTodos() {
  let filtered = [...state.todos];

  if (state.filter === "pending") {
    filtered = filtered.filter((todo) => !todo.completed);
  } else if (state.filter === "completed") {
    filtered = filtered.filter((todo) => todo.completed);
  }

  if (state.search.trim() !== "") {
    const searchLower = state.search.toLowerCase();
    filtered = filtered.filter((todo) =>
      todo.text.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

function getPriorityClass(priority) {
  return `priority-${priority}`;
}

function getPriorityLabel(priority) {
  const labels = { low: "Baja", medium: "Media", high: "Alta" };
  return labels[priority] || "Media";
}

function render() {
  const list = document.querySelector("#todo-list");
  const emptyState = document.querySelector("#empty-state");
  const filteredTodos = getFilteredTodos();

  list.innerHTML = "";

  if (filteredTodos.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent =
      state.search.trim() !== ""
        ? "No se encontraron tareas con ese criterio."
        : "No hay tareas todavía.";
    return;
  }

  emptyState.hidden = true;

  filteredTodos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""} ${getPriorityClass(todo.priority)}`;
    item.dataset.id = String(todo.id);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const label = document.createElement("label");
    label.textContent = todo.text;

    const priorityBadge = document.createElement("span");
    priorityBadge.className = "priority-badge";
    priorityBadge.textContent = getPriorityLabel(todo.priority);
    priorityBadge.title = `Prioridad: ${getPriorityLabel(todo.priority)}`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Eliminar";
    removeBtn.addEventListener("click", () => removeTodo(todo.id));

    item.append(checkbox, label, priorityBadge, removeBtn);
    list.appendChild(item);
  });
}

async function renderStats() {
  try {
    const stats = await request("/todos/stats");
    state.stats = stats;
    const statsBar = document.querySelector("#stats-bar");
    if (statsBar) {
      const byPriority = stats.byPriority || { high: 0, medium: 0, low: 0 };
      statsBar.innerHTML = `
        <span>Total: ${stats.total || 0}</span>
        <span>Pendientes: ${stats.pending || 0}</span>
        <span>Completados: ${stats.completed || 0}</span>
        <span>Alta: ${byPriority.high || 0} | Media: ${byPriority.medium || 0} | Baja: ${byPriority.low || 0}</span>
      `;
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const isJson = response.headers.get("Content-Type")?.includes("application/json");
  let data = null;

  if (response.status !== 204) {
    data = isJson ? await response.json() : await response.text();
  }

  if (!response.ok) {
    const message = data && data.error ? data.error : response.statusText;
    throw new Error(message || "Error en la solicitud");
  }

  return data;
}

async function loadTodos() {
  try {
    const params = new URLSearchParams();
    if (state.filter === "pending") {
      params.append("completed", "false");
    } else if (state.filter === "completed") {
      params.append("completed", "true");
    }
    if (state.search.trim() !== "") {
      params.append("search", state.search);
    }

    const url = params.toString() ? `/todos?${params.toString()}` : "/todos";
    const data = await request(url);
    const todos = Array.isArray(data?.todos) ? data.todos : [];
    state.todos = todos;
    render();
    await renderStats();
    return true;
  } catch (error) {
    console.error(error);
    alert(`No se pudieron cargar las tareas: ${error.message}`);
    render();
    return false;
  }
}

async function addTodo(text, priority = "medium") {
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const data = await request("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed, priority }),
    });

    if (data?.todo) {
      state.todos.push(data.todo);
      render();
      await renderStats();
    } else {
      await loadTodos();
    }

    return true;
  } catch (error) {
    console.error(error);
    alert(`No se pudo agregar la tarea: ${error.message}`);
    return false;
  }
}

async function toggleTodo(id) {
  const todo = state.todos.find((item) => item.id === id);
  if (!todo) {
    return false;
  }

  try {
    const data = await request(`/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });

    if (data?.todo) {
      const index = state.todos.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.todos[index] = data.todo;
        render();
        await renderStats();
      } else {
        await loadTodos();
      }
    } else {
      await loadTodos();
    }

    return true;
  } catch (error) {
    console.error(error);
    alert(`No se pudo actualizar la tarea: ${error.message}`);
    return false;
  }
}

async function removeTodo(id) {
  try {
    await request(`/todos/${id}`, { method: "DELETE" });
    state.todos = state.todos.filter((todo) => todo.id !== id);
    render();
    await renderStats();
    return true;
  } catch (error) {
    console.error(error);
    alert(`No se pudo eliminar la tarea: ${error.message}`);
    return false;
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  const input = document.querySelector("#todo-input");
  const prioritySelect = document.querySelector("#priority-select");
  const value = input.value;
  const priority = prioritySelect.value;
  const success = await addTodo(value, priority);
  if (success) {
    input.value = "";
    prioritySelect.value = "medium";
  }
  input.focus();
}

async function handleFilterClick(event) {
  const filter = event.target.dataset.filter;
  if (!filter) return;

  state.filter = filter;
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  await loadTodos();
}

function handleSearchInput(event) {
  state.search = event.target.value;
  render();
}

async function handleMarkAllCompleted() {
  try {
    await request("/todos/bulk/mark-completed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    await loadTodos();
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
  }
}

async function handleDeleteCompleted() {
  if (!confirm("¿Eliminar todas las tareas completadas?")) {
    return;
  }
  try {
    await request("/todos/bulk/completed", {
      method: "DELETE",
    });
    await loadTodos();
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
  }
}

async function init() {
  const form = document.querySelector("#todo-form");
  form.addEventListener("submit", handleSubmit);

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", handleFilterClick);
  });

  const searchInput = document.querySelector("#search-input");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }

  const markAllBtn = document.querySelector("#mark-all-completed");
  if (markAllBtn) {
    markAllBtn.addEventListener("click", handleMarkAllCompleted);
  }

  const deleteCompletedBtn = document.querySelector("#delete-completed");
  if (deleteCompletedBtn) {
    deleteCompletedBtn.addEventListener("click", handleDeleteCompleted);
  }

  await loadTodos();
}

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    console.error(error);
    alert("No se pudo iniciar la aplicación.");
  });
});

