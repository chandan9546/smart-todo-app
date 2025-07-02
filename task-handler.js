const API_URL = "https://dummyjson.com/todos";
let allTodos = [];
let currentPage = 1;
const todosPerPage = 5;

function toggleLoading(show) {
  document.getElementById("loading").classList.toggle("d-none", !show);
}

function showError(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = message;
  errorDiv.classList.remove("d-none");
  setTimeout(() => errorDiv.classList.add("d-none"), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchTodos();
  document.getElementById("searchInput").addEventListener("input", applyFilters);
});

async function fetchTodos() {
  try {
    toggleLoading(true);
    const res = await fetch(API_URL);
    const data = await res.json();
    allTodos = data.todos;
    renderTodos();
  } catch (err) {
    showError("Failed to load todos. Please try again.");
  } finally {
    toggleLoading(false);
  }
}

function renderTodos() {
  const filtered = applySearchAndDateFilter();
  const totalPages = Math.ceil(filtered.length / todosPerPage);
  const start = (currentPage - 1) * todosPerPage;
  const end = start + todosPerPage;

  const visibleTodos = filtered.slice(start, end);
  const list = document.getElementById("todoList");
  list.innerHTML = "";

  visibleTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = todo.todo;
    list.appendChild(li);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener("click", () => {
      currentPage = i;
      renderTodos();
    });
    pagination.appendChild(pageItem);
  }
}

function applySearchAndDateFilter() {
  let filtered = [...allTodos];
  const search = document.getElementById("searchInput").value.toLowerCase();
  const fromDate = new Date(document.getElementById("fromDate").value);
  const toDate = new Date(document.getElementById("toDate").value);

  if (search) {
    filtered = filtered.filter((todo) =>
      todo.todo.toLowerCase().includes(search)
    );
  }

  if (!isNaN(fromDate) && !isNaN(toDate)) {
    filtered = filtered.filter((todo, i) => {
      const fakeDate = new Date(2024, 0, i + 1); 
      return fakeDate >= fromDate && fakeDate <= toDate;
    });
  }

  return filtered;
}

function applyFilters() {
  currentPage = 1;
  renderTodos();
}

async function addTodo() {
  const taskInput = document.getElementById("newTask");
  const newTask = taskInput.value.trim();

  if (!newTask) {
    alert("Please enter a task.");
    return;
  }

  try {
    toggleLoading(true);
    const res = await fetch(API_URL + "/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todo: newTask,
        completed: false,
        userId: 1,
      }),
    });

    const data = await res.json();
    allTodos.unshift(data); 
    taskInput.value = "";
    renderTodos();
  } catch (err) {
    showError("Failed to add todo.");
  } finally {
    toggleLoading(false);
  }
}
