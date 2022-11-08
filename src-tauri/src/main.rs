#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;

use serde::Serialize;

#[derive(Default, Clone, Serialize)]
pub struct Task {
    pub id: usize,
    pub label: String,
    pub done: bool,
}
impl Task {
    pub fn new(id: usize, label: String, done: bool) -> Self {
        Self { id, label, done }
    }
    pub fn done(&mut self) {
        self.done = !self.done;
    }
}

#[derive(Default)]
pub struct TodoLists(Mutex<Vec<Task>>);



#[tauri::command]
fn create_task(name: &str, todolist: tauri::State<TodoLists>) -> String {
    let mut nt = todolist.0.lock().unwrap();
    let id = nt.len();
    nt.push(Task {
        id,
        label: name.to_string(),
        done: false,
    });
    name.to_string()
}
/// Clear the list of completed tasks
/// Returns the number of tasks removed
/// # Returns
/// * `usize` - The number of tasks removed
/// # Example
/// ```
/// let mut list = TodoList::new();
/// list.add("Task 1".to_string());
/// list.add("Task 2".to_string());
/// list.todos.toggle(0);
/// let rest = list.clear();
/// assert_eq!(rest, 1);
/// ```
#[tauri::command]
fn clear_done(todolist: tauri::State<TodoLists>) -> usize {
    let mut nt = todolist.0.lock().unwrap();
    nt.retain(|task| !task.done);
    nt.len()
}
/// Toggle the done status of a task
/// # Arguments
/// * `id` - The id of the task to toggle
/// # Returns
/// * `Option<&mut Task>` - The task that was toggled
/// # Example
/// ```
/// let mut list = TodoList::new();
/// list.add("Task 1".to_string());
/// list.add("Task 2".to_string());
/// list.toggle(0);
/// assert_eq!(list.todos[0].done, true);
/// ```
#[tauri::command]
fn toggle_task(id: usize, todolist: tauri::State<TodoLists>) -> Option<usize> {
    let mut nt = todolist.0.lock().unwrap();
    nt.iter_mut().find(|task| task.id == id).map(|task| {
        task.done = !task.done;
        task.id
    })
}
#[tauri::command]
fn get_tasks(todolist: tauri::State<TodoLists>) -> Vec<Task> {
    todolist.0.lock().unwrap().clone()
}

fn main() {
    tauri::Builder::default()
        .manage(TodoLists(Default::default()))
        .invoke_handler(tauri::generate_handler![create_task, clear_done, toggle_task, get_tasks])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
