document.addEventListener('DOMContentLoaded', () => {
    initialize();
});

    // Listen for changes in the checkbox state
// This function initializes the searchbar functionality
function startSearchbar() {
    console.log('startSearchbar LOOP');

    const searchBox = document.getElementById('search-input');
    console.log(searchBox);
    if (searchBox) {
        searchBox.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            const tiles = document.querySelectorAll('.tile-wrapper');

            tiles.forEach(tile => {
                const content = tile.textContent.toLowerCase();
                if (!searchText || (content && content.toLowerCase().includes(searchText))) {
                    tile.classList.remove('hidden');
                } else {
                    tile.classList.add('hidden');
                }
            });
        });
    }

};

function initialize() {
    //LOAD SETTINGS
    
    fetch('/settings').then(response => response.json()).then(data => {
        const settings = data.settings;

        //GENERAL SETTINGS from json
        const iterableSettings = settings.Iterables;
        iterableTrackerRefetchInterval = iterableSettings.RefetchInterval.value;
        iterableTrackerupdateRate = iterableSettings.Tickrate.value;
        iterableTrackerRemoveOnCompletion = iterableSettings.RemoveOnCompletion.value;
        

        // SET INTERVALS
        console.log('iterableTrackerRefetchInterval:', iterableTrackerRefetchInterval);
        // Set intervals after settings are loaded
        window.intervals = []; 
        let loadtilesinterval = setInterval(loadLoopTiles, iterableTrackerRefetchInterval);
        let updatetilesinterval = setInterval(updateLoopTiles, iterableTrackerupdateRate);
        let trackerstatsinterval = setInterval(trackerstats, iterableTrackerupdateRate);
    
        window.intervals = [loadtilesinterval, updatetilesinterval, trackerstatsinterval];
    
        // Remove completed tiles if the setting is enabled
        if (Boolean(iterableTrackerRemoveOnCompletion)) {
            console.log('RemoveOnCompletionInterval LOOP');
            RemoveOnCompletionInterval = setInterval(removeCompletedIterables, iterableTrackerRefetchInterval); 
            window.intervals.push(RemoveOnCompletionInterval);
        }
    });


    //INITIALIZE PAGE ELEMENTS
    loadLoopTilesHeader();
    document.querySelector('.project-boxes').innerHTML = '';


    //Start searchbar activation
    startSearchbar();
};



function loadLoopTilesHeader() {
    document.querySelector('.pagetitle').innerHTML = 'Iterable Tracker';
    //populate the header with the correct elements
    document.querySelector('.in-progress-tasks-section').style.display = 'block';
    document.querySelector('.completed-tasks-section').style.display = 'block';
    document.querySelector('.total-tasks-section').style.display = 'block';

    document.querySelector('.export-logs-button').style.display = 'none';

    document.querySelector('.list-view').style.display = 'flex';
    document.querySelector('.grid-view').style.display = 'flex';

    //force the grid view to be active
    document.querySelector('.grid-view').classList.add('active');
    document.querySelector('.list-view').classList.remove('active');
    


}



//this function updates the stats in the tiles based on their I
function updateLoopTiles() {


    // get the json progress data from the server
    fetch('/progress')
        .then(response => response.json())
        .then(data => {
            // loop through the data and create a tile for each item
            Object.keys(data).forEach(key => {
                const item = data[key];
                const tile = document.getElementById(key);

                // Check if the tile is visible in the viewport
                if (tile && isElementInViewport(tile)) {
                    // convert time_remaining to correct time format days:hours:minutes:seconds from seconds
                    const days = Math.floor(item.time_remaining / 86400);
                    const hours = Math.floor((item.time_remaining % 86400) / 3600);
                    const minutes = Math.floor(((item.time_remaining % 86400) % 3600) / 60);
                    const seconds = Math.floor(((item.time_remaining % 86400) % 3600) % 60);
                    const overhead_percentage = (item.track_overhead / item.exec_time_stats.mean * 100).toFixed(3);

                    // update the html elements with the new values
                    tile.querySelector('.loop-tile-progress').style.width = `${item.progress}%`;
                    tile.querySelector('.loop-tile-progress-percentage').innerHTML = `${item.iteration}/${item.total} - ${(item.iteration / item.total * 100).toFixed(2)}%`;
                    tile.querySelector('.time-left').innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s Left`;

                    // convert seconds per iteration to iterations per second if necessary
                    if (item.iterations_per_second < 1) {
                        item.iterations_per_second = 1 / item.iterations_per_second;
                        tile.querySelector('.iterations-per-second').innerHTML = `${item.iterations_per_second.toFixed(2)} s/It`;
                    } else {
                        tile.querySelector('.iterations-per-second').innerHTML = `${item.iterations_per_second.toFixed(2)} It/s`;
                    }

                    // Add an existing svg image to the class loop-tile-content-header-right depending on the category
                    if (item.category === 'builtins' || item.category.includes('collections') || item.category.includes('itertools')) {
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

                    // log overhead percentage
                    tile.querySelector('.overhead-percentage').innerHTML = `${overhead_percentage}% OH`;

                    // Add or remove outline based on progress
                    if (item.progress === 100) {
                        tile.classList.add('tile-completed');
                        tile.classList.remove('tile-in-progress');
                    } else {
                        tile.classList.add('tile-in-progress');
                        tile.classList.remove('tile-completed');
                    }

                    // CANVAS SELECTION AND UPDATING
                    // Select all canvas elements
                    plotGaussian(`gaussianCanvas-${key}`, item.exec_time_stats.mean, item.exec_time_stats.std, item.execution_duration);
                
                }
                
            });
        });
}

// Helper function to check if an element is in the viewport
// Helper function to check if an element is in the viewport with a margin
function isElementInViewport(el, margin = 700) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= -margin &&
        rect.left >= -margin &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + margin &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + margin
    );
}
function loadLoopTiles() {
    // use the json data to create tiles in the html under the class "project-boxes"

    fetch('/progress')
        .then(response => response.json())
        .then(data => {
            
            const projectsList = document.querySelector('.project-boxes'); // get the project-boxes div
            const existingTiles = projectsList.querySelectorAll('.loop-tile');
            const dataKeys = new Set(Object.keys(data));

            // Remove tiles that do not exist in the fetched data
            existingTiles.forEach(tile => {
                const tileId = tile.getAttribute('ID');
                if (!dataKeys.has(tileId)) {
                    tile.parentElement.parentElement.removeChild(tile.parentElement);
                }
            });

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
                                <div class="overhead-percentage tile-badge">
                                -% Overhead
                                </div>
                            </div>
                            <div class="loop-tile-content-header-center">
                                <canvas class="loop-tile-content-header-canvas" id="gaussianCanvas-${key}"></canvas>
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
                            <div class="time-left tile-badge">
                                ${days}d ${hours}h ${minutes}m ${seconds}s Left
                            </div>
                            <div class="iterations-per-second tile-badge">
                                It/s: ${item.iterations_per_second}
                            </div>
                        </div>
                    </div>
                `;
                projectsList.appendChild(tile);
            });
            
        });
}

function removeCompletedIterables() {
    fetch('/remove_completed_iterables', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    
}

//this function updates the total tasks, active tasks and completed tasks
function trackerstats() {

    // get the json progress data from the server
    
    fetch('/progress')
        .then(response => response.json())
        .then(data => {
            

            
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

                // update the html elements with the new values (class in-progress-number)
                document.querySelector('.total-tasks-number').innerHTML = totalTasks; // total tasks
                document.querySelector('.in-progress-tasks-number').innerHTML = activeTasks; // active tasks
                document.querySelector('.completed-tasks-number').innerHTML = completedTasks; // completed tasks
            });
}

function identify_largest_time_unit(ns) {
    // identify whether the highest time unit from the gaussian is in seconds, minutes, hours or days from ns
    let time_unit = 'ns';
    let time_unit_value = 1;

    if (ns > 1e3) {
        time_unit = 'µs';
        time_unit_value = 1e-3;
    } if (ns > 1e6) {
        time_unit = 'ms';
        time_unit_value = 1e-6;
    } if (ns > 1e9) {
        time_unit = 's';
        time_unit_value = 1e-9;
    } if (ns > 60e9) {
        time_unit = 'm';
        time_unit_value = 1e-9 * 60;
    } if (ns > 3600e9) {
        time_unit = 'h';
        time_unit_value = 1e-9 * 3600;
    } if (ns > 86400e9) {
        time_unit = 'd';
        time_unit_value = 1e-9 * 86400;
    }

    let time = ns * time_unit_value;
    return {
        time: parseFloat(time),
        time_unit: time_unit
    };
}

function plotGaussian(canvasId, mean, std, latest_execution_time) {
    
    //set background to known css color variable
    document.getElementById(canvasId).style.backgroundColor = 'var(--background-color)';
    //get the css variables to reuse in the canvas
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--main-color');

    //convert mean type to float
    mean = parseFloat(mean);
    std = parseFloat(std);


    
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    //invert the y axis
    if (!canvas.transformed) {
        ctx.transform(1, 0, 0, -1, 0, canvas.height);
        canvas.transformed = true;
    }

    //transfrom origin to the middle of the canvas  just once
    const xaxis_offset = 0.2 * canvas.height;
    const xaxis_offset_inv = 0.80 * canvas.height;
    if (!canvas.translated) {
        ctx.translate(0, xaxis_offset);
        canvas.translated = true;
    }
    
    const width = canvas.width;
    const height = canvas.height;
    const sigma = std
    
    //clear the canvas
    ctx.clearRect(0, - xaxis_offset, width, height);

    // Draw X axis
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(width, 0);
    ctx.strokeStyle = textColor;
    ctx.strokeopacity = 0.5;
    ctx.stroke();

    // Draw Y axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.strokeStyle = textColor;
    ctx.stroke();
    
    //draw gridlines x axis
    for (let i = -5; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * height / 5);
        ctx.lineTo(width, i * height / 5);
        ctx.strokeStyle = textColor;
        ctx.globalAlpha = 0.2;
        ctx.stroke();
        ctx.globalAlpha = 1.0; // Reset opacity to default
    }

    //draw gridlines y axis
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(i * width / 8, 0);
        ctx.lineTo(i * width / 8, height);
        ctx.strokeStyle = textColor;
        ctx.globalAlpha = 0.2;
        ctx.stroke();
        ctx.globalAlpha = 1.0; // Reset opacity to default
    }




    // DRAW GAUSSIAN FUNCTION
    const x_min = mean - 4*sigma;
    const x_max = mean + 4*sigma;


    function gaussian(x, mean, sigma) {
        return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(sigma, 2)));
    }



    //precalculate the gaussian values
    const gaussianValues = [];
    for (let x = x_min; x < x_max; x += 0.01 * sigma) {
        gaussianValues.push(gaussian(x, mean, sigma));
    }

    const maxGaussian = Math.max(...gaussianValues);
    const minGaussian = 0;
    // Draw the Gaussian function with mean in the middle and x axis reaching 4 sigma in both directions


    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let i = 0; i < gaussianValues.length; i++) {
        const x = i * width / gaussianValues.length;
        const y = (gaussianValues[i] - minGaussian) / (maxGaussian - minGaussian) * (xaxis_offset_inv - 0.1 * height);
        ctx.lineTo(x, y);
    }

    //fill the gaussian curve
    ctx.fillStyle = 'rgba(79, 63, 240, 0.3)';
    ctx.fill();

    // identify wether the highest time unit from the gaussian is in seconds, minutes, hours or days from ns
    let mean_stats = identify_largest_time_unit(mean);
    let sigma_stats = identify_largest_time_unit(sigma);
    
    // Draw a vertical line at the latest execution time
    if (latest_execution_time >= x_min && latest_execution_time <= x_max) {
        ctx.beginPath();
        const x = (latest_execution_time - x_min) / (x_max - x_min) * width;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = 'red'; // Set the line color to red
        ctx.setLineDash([5, 5]); // Set the line to be dashed
        ctx.stroke();
        ctx.setLineDash([]); // Reset the line dash to solid for future drawings
    }

    // Draw the mean and sigma values under the gaussian curve
    const fontSize = Math.max(10, Math.min(20, canvas.width / 20));
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.save();
    ctx.scale(1, -1); // Flip the text back to normal
    ctx.fillText(`μ: ${mean_stats.time.toFixed(2)} ${mean_stats.time_unit}`, 10, -90);
    ctx.fillText(`σ: ${sigma_stats.time.toFixed(2)} ${sigma_stats.time_unit}`, 10, -70);

    //draw the sigma text below the x axis at all sigma points

    for (let i = -4; i < 5; i++) {
        ctx.fillText(`${i}σ`, width / 2 + i * width / 8 - 10, 20);
    }

    ctx.restore();
    ctx.stroke();
}
