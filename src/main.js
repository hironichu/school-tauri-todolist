// deno-lint-ignore-file
const { tauri, dialog } = window.__TAURI__;
const { invoke } = tauri;
// window.localStorage.setItem("todos", JSON.stringify([]));
let newtaskInputEl;
let tasksListEl;
let addTaskEl;
let clearDoneEl;
async function get_todos() {
  const todos = await invoke("get_tasks");
  if (todos) {
    return todos;
  } else {
    throw new Error("No todos found");
  }
}
const renderTodos = async (todos) => {
  tasksListEl.innerHTML = "";
  [...todos].map(todo => {
    console.log(todo);
    const LI = document.createElement("li");
    const LABEL = document.createElement("label");
    const INPUT = document.createElement("input");
    const SPAN = document.createElement("span");
    INPUT.type = "checkbox";
    INPUT.className = "task__done";
    INPUT.id = "toggleTask";
    INPUT.dataset.id = todo.id;
    INPUT.checked = todo.done;
    SPAN.className = "task__text";
    SPAN.innerText = todo.label;
    LABEL.className = "task__label";
    LABEL.insertAdjacentElement("afterbegin", INPUT);
    LABEL.insertAdjacentElement("afterbegin", SPAN);
    LI.className = "task__item";
    LI.insertAdjacentElement("afterbegin", LABEL);
    tasksListEl.insertAdjacentElement("afterbegin", LI);
  });
};
//use localstorage to store the todos, init the todos
const clearDone = async (e) => {
  const clearDone = await invoke("clear_done");
  const todos = await get_todos();
  renderTodos(todos);
};
const addTask = async (e) => {
  const name = newtaskInputEl.value;
  if (name) {
    const addTask = await invoke("create_task", { name });
    if (addTask) {
      const todos = await get_todos();
      renderTodos(todos);
      newtaskInputEl.value = "";
    }
  }
};
const toggle = async (id) => {
  id = parseInt(id);
  console.log(id);
  const toggle = await invoke("toggle_task", { id });
  console.debug('toggle', toggle);
};

window.addEventListener("DOMContentLoaded", async () => {
  try {
    newtaskInputEl = document.getElementById("newtaskInput");
    tasksListEl = document.getElementById("tasksList");
    addTaskEl = document.getElementById("addTask");
    clearDoneEl = document.getElementById("clearDone");
    clearDoneEl.addEventListener("click", clearDone);
    addTaskEl.addEventListener("click", addTask);
    tasksListEl.addEventListener("click", (e) => {
      if (e.target.id === "toggleTask") {
        toggle(e.target.dataset.id);
      } else {
        e.preventDefault();
      }
    });
    //get todos from localstorage
    if (newtaskInputEl && tasksListEl) {
      const todos = await get_todos();
      renderTodos(todos);
    } else {
      throw "Error: missing elements";
    }
  } catch (e) {
    dialog.message(e , {title: "Error", type: "error"});
  }
  
});
