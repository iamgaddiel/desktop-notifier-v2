const taskCreateForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskTable');
const delBtn = document.getElementsByClassName('delBtn');
const db = new Localbase('db');


taskCreateForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = {
        'title': this.title.value,
        'noticeTime': this.noticeTime.value,
        'noticeDate': this.noticeDate.value
    };

    db.collection('tasks')
    .get()
    .then( tasks => {
        let taskCount = tasks.length++;
        db.collection('tasks')
        .add({'id': taskCount, ...formData})
        .then( () => displayTasks())
    })
    console.log(formData);
})


function displayTasks() {
    db.collection('tasks')
    .orderBy('id', 'desc')
    .get()
    .then( tasks => {
        taskList.innerHTML = '';

        if (tasks.length > 0){
            tasks.forEach( task => {
                let taskItem = `
                    <tr class="taskItem">
                        <td>
                            <div class="notice-image">
                                <img src="../assets/images/notification.png" alt="">
                            </div>
                        </td>
                        <td>
                            <h5 class="text-light">${task.title}</h5>
                        </td>
                        <td>
                            <small class="text-dark">${task.noticeDate}</small>
                        </td>
                        <td>
                        <td>
                            <small class="text-dark">${task.noticeTime}</small>
                        </td>
                            <button data-id="${task.id}" class="delBtn><i class="fa fa-trash text-danger"></i></button>
                        </td>
                    </tr>
                `
                taskList.innerHTML += taskItem;
            })
        } else {
            let taskItem = `
            <tr class="taskItem">
                <td colspan="4" class="text-white">
                    <i class="fa fa-frown fa-2x text-center"></i> 
                    <h3 class="text-light">No tasks available</h3>
                </td>
            </tr>
        `
        taskList.innerHTML += taskItem;
        }
    })
}

(
    function (){
        displayTasks();
    }
)()

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
}, 1500);

function deleteTask(id) {
    db.collection("tasks")
        .doc({ id }).delete().then(() => displayTasks());
}
