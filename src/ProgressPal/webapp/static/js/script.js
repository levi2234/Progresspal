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



                //UPDATING HTML ELEMENTS

                // update the html elements with the new values
                const tile = document.getElementById(key);
                tile.querySelector('.box-progress').style.width = `${item.progress}%`;
                tile.querySelector('.box-progress-percentage').innerHTML = `${item.progress}%`;
                tile.querySelector('.time-left').innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s Left`;

                //convert seconds per iteration to iterations per second if neccessary
                if (item.iterations_per_second < 1) {
                    item.iterations_per_second = 1 / item.iterations_per_second;
                    tile.querySelector('.iterations-per-second').innerHTML = `${item.iterations_per_second.toFixed(2)} s/It`;

                } else {
                    tile.querySelector('.iterations-per-second').innerHTML = `${item.iterations_per_second.toFixed(2)} It/s`;
                }
       



                // Add or remove outline based on progress
                if (item.progress === 100) {
                    tile.classList.add('tile-completed');
                    tile.classList.remove('tile-in-progress');
                } else {
                    tile.classList.add('tile-in-progress');
                    tile.classList.remove('tile-completed');
                }
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
                    <div class="project-box" ID="${key}">
                        <div class="project-box-header">
                            <span class = "tile-text">${item.start_time}</span>
                           
                        </div>
                        <div class="project-box-content-header">
                            <p class="box-content-header tile-text-color">${key}</p>
                            <p class="box-content-subheader tile-text-color ">Category: ${item.category}</p>
                        </div>
                        <div class="box-progress-wrapper">
                            <p class="box-progress-header tile-text-color">Progress</p>
                            <div class="box-progress-bar">
                                <span class="box-progress tile-text" style="width: ${item.progress}%; background-color: #4f3ff0"></span>
                            </div>
                            <p class="box-progress-percentage tile-text-color ">${item.progress}%</p>
                        </div>
                        <div class="project-box-footer">
                            <div class="time-left tile-badge" ">
                                ${days}d ${hours}h ${minutes}m ${seconds}s Left
                            </div>
                            <div class="iterations-per-second tile-badge" ">
                                It/s: ${item.iterations_per_second}
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

