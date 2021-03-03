const electron = require("electron");
const path = require('path');
const { ipcRenderer } = electron;
const db = new Localbase("db");
const createTaskBtn = document.getElementById("createTaskBtn");
const clearTaskBtn = document.getElementById("clearTaskBtn");
const taskDisplay = document.getElementById("taskDisplay");
const taskCreateForm = document.getElementById("taskForm");
// const taskDeleteBtn = document.querySelectorAll('.task-delete');


//  if elements not null
if (!!taskDisplay) {
    displayTasks();
}
if (!!taskCreateForm) {
    taskCreateForm.addEventListener("submit", taskCreate);
}
if (!!createTaskBtn) {
    createTaskBtn.addEventListener("click", createTask);
}
if (!!clearTaskBtn) {
    clearTaskBtn.addEventListener("click", clearTask);
}
// if (!!taskDeleteBtn) {
//     taskDeleteBtn.addEventListener("click", deleteTask);
// }


// get task details
function taskCreate(e) {
    e.preventDefault();
    console.log("Fell");
    const task = {
        "title": document.getElementById("title").value,
        "time": document.getElementById("time").value,
        "date": document.getElementById("date").value
    }
    ipcRenderer.send("create-task", (event, task));
}

// create task add window
function createTask(e) {
    e.preventDefault();
    ipcRenderer.send("open-task-create");
}

// clear tasks
function clearTask(e) {
    e.preventDefault();
    db.collection("tasks").delete().then(() => {
        displayTasks();
    })
}

// delete single task
function deleteTask(id) {
    db.collection("tasks")
        .doc({ id }).delete().then(() => displayTasks());
}

// display task details
function displayTasks() {
    db.collection("tasks")
        .orderBy("id", "desc").get()
        .then(tasks => {

            if (tasks.length > 0) {
                taskDisplay.innerHTML = '';
                tasks.forEach(task => {
                    const taskBlock = `
                    <div class="block mt-3 text-muted col-lg-3 col-md-12 mr-3 ml-3">
                        <div class="d-flex justify-content-between">
                        <div>
                            <h4>${task.title}</h4>
                            <span>${task.date} ${task.time}</span>
                        </div>
                        <div>
                            <button class="task-delete" onclick="deleteTask(${task.id})"><i class="fa fa-trash text-danger"></i></button>
                        </div>
                        </div>
                    </div>
                    `
                    // taskDisplay.innerHTML = "";
                    taskDisplay.innerHTML += taskBlock;
                })

            } else {
                taskDisplay.innerHTML = `
                <h3 class="text-muted"> No task found </h3>
                `
            }
        })
}

// show notification 
setInterval(() => {
    const now = `${new Date().getHours()}:${new Date().getMinutes()}`;

    db.collection("tasks").orderBy("id", "desc").get()
        .then(tasks => {
            tasks.forEach(task => {
                if (task.time == now) {
                    new Notification("Joy's Notification", {
                        body: `${task.title}`,
                        icon: path.join(__dirname, '../assets/fontawesome/svgs/regular/bell.svg')
                    });
                }
            })
        })
        .catch(err => console.error("Notification ERR", err));
}, 15000);

ipcRenderer.on('create-task', (event, task) => {
    db.collection("tasks")
        .get()
        .then(tasks => {
            const id = tasks.length++;
            db.collection("tasks")
                .add({ "id": id, ...task })
                .then(() => displayTasks());
        })
})
