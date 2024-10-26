document.addEventListener('DOMContentLoaded', () => {
    console.log("Hello from JavaScript!");
    setInterval(loadTiles, 1000);
    setInterval(updateTiles, 100);
    setInterval(trackerstats, 100);
});

function shutdown() {
    fetch('/shutdown', { method: 'GET' })
        .then(response => response.json())
        .then(data => alert(data.message));
}



//this function updates the stats in the tiles based on their I
function updateTiles() {

    // get the json progress data from the server
    fetch('/progress')
        .then(response => response.json())
        .then(data => {
            console.log(data);

            // loop through the data and create a tile for each item
            Object.keys(data).forEach(key => {
                const item = data[key];
                // convert time_remaining to correct time format days:hours:minutes:seconds from seconds
                const days = Math.floor(item.time_remaining / 86400);
                const hours = Math.floor((item.time_remaining % 86400) / 3600);
                const minutes = Math.floor(((item.time_remaining % 86400) % 3600) / 60);
                const seconds = Math.floor(((item.time_remaining % 86400) % 3600) % 60);

                // update the html elements with the new values
                const tile = document.getElementById(key);
                tile.querySelector('.box-progress').style.width = `${item.progress}%`;
                tile.querySelector('.box-progress-percentage').innerHTML = `${item.progress}%`;
                tile.querySelector('.days-left').innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s Left`;
            });
        });

}
    
function trackerstats() {
    // Your trackerstats function implementation here
}

function shutdown() {
    fetch('/shutdown', { method: 'GET' })
        .then(response => response.json())
        .then(data => alert(data.message));
}

function loadTiles() {
    // use the json data to create tiles in the html under the class "project-boxes"

    fetch('/progress')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const projectsList = document.querySelector('.project-boxes'); // get the project-boxes div

            // loop through the data and create a tile for each item
            Object.keys(data).forEach(key => {
                const item = data[key];
                
                // Check if a div with the same ID already exists
                if (document.getElementById(key)) {
                    return; // Skip this item if the ID already exists
                }

                // convert time_remaining to correct time format days:hours:minutes:seconds from seconds
                const days = Math.floor(item.time_remaining / 86400);
                const hours = Math.floor((item.time_remaining % 86400) / 3600);
                const minutes = Math.floor(((item.time_remaining % 86400) % 3600) / 60);
                const seconds = Math.floor(((item.time_remaining % 86400) % 3600) % 60);
                const tile = document.createElement('div');
                tile.classList.add('project-box-wrapper');
                tile.innerHTML = `
                    <div class="project-box" ID="${key}" style="background-color: #e9e7fd;">
                        <div class="project-box-header">
                            <span>${item.start_time}</span>
                            <div class="more-wrapper">
                                <button class="project-btn-more">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical">
                                        <circle cx="12" cy="12" r="1" />
                                        <circle cx="12" cy="5" r="1" />
                                        <circle cx="12" cy="19" r="1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="project-box-content-header">
                            <p class="box-content-header">${key}</p>
                            <p class="box-content-subheader">Category: ${item.category}</p>
                        </div>
                        <div class="box-progress-wrapper">
                            <p class="box-progress-header">Progress</p>
                            <div class="box-progress-bar">
                                <span class="box-progress" style="width: ${item.progress}%; background-color: #4f3ff0"></span>
                            </div>
                            <p class="box-progress-percentage">${item.progress}%</p>
                        </div>
                        <div class="project-box-footer">
                            <div class="days-left" style="color: #4f3ff0;">
                                ${days}d ${hours}h ${minutes}m ${seconds}s Left
                            </div>
                        </div>
                    </div>
                `;
                projectsList.appendChild(tile);
            });
        });
}

//this function updates the total tasks, active tasks and completed tasks
function trackerstats() {

    // get the json progress data from the server
    
    fetch('/progress')
        .then(response => response.json())
        .then(data => {
            console.log(data);

            
            // find the total number of tasks
            const totalTasks = Object.keys(data).length;
            // find the number of active tasks (progress < 100)
            let activeTasks = 0;
            // find the number of completed tasks (progress = 100)
            let completedTasks = 0;
            
            // loop through the data and create a tile for each item
            Object.keys(data).forEach(key => {
                const item = data[key];
                
                if (item.progress < 100) {
                  activeTasks++;
                } else {
                  completedTasks++;
                }
              });

              console.log(`Active Tasks: ${activeTasks}`);
              console.log(`Completed Tasks: ${completedTasks}`);
                

                // update the html elements with the new values (class in-progress-number)
                document.querySelector('.total-tasks-number').innerHTML = totalTasks; // total tasks
                document.querySelector('.in-progress-tasks-number').innerHTML = activeTasks; // active tasks
                document.querySelector('.completed-tasks-number').innerHTML = completedTasks; // completed tasks
            });
}


document.addEventListener('DOMContentLoaded', function () {
            var modeSwitch = document.querySelector('.mode-switch');
          
            modeSwitch.addEventListener('click', function () {                     document.documentElement.classList.toggle('dark');
              modeSwitch.classList.toggle('active');
            });
            
            var listView = document.querySelector('.list-view');
            var gridView = document.querySelector('.grid-view');
            var projectsList = document.querySelector('.project-boxes');
            
            listView.addEventListener('click', function () {
              gridView.classList.remove('active');
              listView.classList.add('active');
              projectsList.classList.remove('jsGridView');
              projectsList.classList.add('jsListView');
            });
            
            gridView.addEventListener('click', function () {
              gridView.classList.add('active');
              listView.classList.remove('active');
              projectsList.classList.remove('jsListView');
              projectsList.classList.add('jsGridView');
            });



          });

