document.addEventListener('DOMContentLoaded', () => {
    
    setInterval(loadLoopTiles, 1000);
    setInterval(updateLoopTiles, 100);
    setInterval(trackerstats, 100);
});

function shutdown() {
    fetch('/shutdown', { method: 'GET' })
        .then(response => response.json())
        .then(data => alert(data.message));
}


//this function updates the stats in the tiles based on their I
function updateLoopTiles() {
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
                tile.querySelector('.loop-tile-progress').style.width = `${item.progress}%`;
                tile.querySelector('.loop-tile-progress-percentage').innerHTML = `${item.iteration}/${item.total} - ${(item.iteration / item.total * 100).toFixed(2)}%`;
                tile.querySelector('.time-left').innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s Left`;

                //convert seconds per iteration to iterations per second if neccessary
                if (item.iterations_per_second < 1) {
                    item.iterations_per_second = 1 / item.iterations_per_second;
                    tile.querySelector('.iterations-per-second').innerHTML = `${item.iterations_per_second.toFixed(2)} s/It`;

                } else {
                    tile.querySelector('.iterations-per-second').innerHTML = `${item.iterations_per_second.toFixed(2)} It/s`;
                }
       
                // Add an existing svg image to the class loop-tile-content-header-right depending on the category
                if (item.category === 'builtins') {
                    tile.querySelector('.loop-tile-content-header-right').innerHTML = `<img src="/static/media/modulelogos/python.svg" alt="Training" class="loop-type-icon">`;
                }

                if (item.category === 'numpy') { 
                    tile.querySelector('.loop-tile-content-header-right').innerHTML = `<img src="/static/media/modulelogos/numpy.svg" alt="Numpy" class="loop-type-icon">`;
                }

                if (item.category.includes('pandas')) {
                    tile.querySelector('.loop-tile-content-header-right').innerHTML = `<img src="/static/media/modulelogos/pandas.svg" alt="Pandas" class="loop-type-icon">`;
                }

                if (item.category.includes("polars")) {
                    tile.querySelector('.loop-tile-content-header-right').innerHTML = `<img src="/static/media/modulelogos/polars.svg" alt="Polars" class="loop-type-icon">`;
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

function loadLoopTiles() {
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



                tile.classList.add('tile-wrapper');
                tile.innerHTML = `
                    <div class="loop-tile" ID="${key}">

                        <div class="loop-tile-content-header">
                            <div class="loop-tile-content-header-left">
                                <p class="loop-tile-content-header-text tile-text-color">${key}</p>
                                <p class="loop-tile-content-subheader-text tile-text-color ">Category: ${item.category}</p>
                            </div>
                            <div class="loop-tile-content-header-right">


                                <!-- <span class = "tile-text-color">${item.start_time}</span> -->
                            </div>
                        </div>
                        <div class="loop-tile-progress-wrapper">
                            <p class="loop-tile-progress-header tile-text-color">Progress</p>
                            <div class="loop-tile-progress-bar">
                                <span class="loop-tile-progress tile-text" style="width: ${item.progress}%; background-color: #4f3ff0"></span>
                            </div>
                            <p class="loop-tile-progress-percentage tile-text-color ">${item.iteration}/${item.total} (${(item.iteration / item.total * 100).toFixed(2)}%)</p>
                        </div>
                        <div class="loop-tile-footer">
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
