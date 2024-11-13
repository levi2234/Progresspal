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

            // // Clear existing tiles
            //     projectsList.innerHTML = '';

            // Check if there are no items in the data else display a placeholder
            if (Object.keys(data).length === 0) {
                const placeholder = document.createElement('div');
                placeholder.className = 'placeholder';
            
                // Link an svg to the placeholder
                placeholder.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill=var(--main-color)   class="placeholder-image"><path d="M58.9,0c12.68,0,24.43,4.01,34.04,10.83l-3.74,3.95C80.58,8.85,70.14,5.38,58.9,5.38c-14.78,0-28.16,5.99-37.84,15.67 C11.37,30.74,5.38,44.12,5.38,58.9c0,14.78,5.99,28.16,15.67,37.84c9.68,9.68,23.06,15.67,37.84,15.67 c14.78,0,28.16-5.99,37.84-15.67c6.56-6.56,11.42-14.82,13.88-24.05c-2.44-1.41-4.08-4.05-4.08-7.08c0-3.71,2.48-6.85,5.87-7.84 c-0.24-11.63-4.19-22.34-10.72-31.01l3.75-3.96c7.58,9.76,12.16,21.97,12.35,35.24c2.99,1.22,5.09,4.15,5.09,7.57 c0,4.1-3.02,7.5-6.96,8.08c-2.67,10.32-8.07,19.55-15.38,26.86c-10.66,10.66-25.38,17.25-41.65,17.25 c-16.26,0-30.99-6.59-41.65-17.25C6.59,89.89,0,75.16,0,58.9c0-16.26,6.59-30.99,17.25-41.65C27.91,6.59,42.63,0,58.9,0L58.9,0z M58.9,48.6c1.77,0,3.44,0.45,4.9,1.24c0.07-0.1,0.15-0.19,0.23-0.27l33.74-35.49c1.02-1.07,2.72-1.12,3.79-0.09 c1.07,1.02,1.12,2.72,0.09,3.79L67.92,53.26c-0.08,0.08-0.16,0.16-0.25,0.23c0.97,1.57,1.53,3.42,1.53,5.4 c0,5.69-4.61,10.3-10.3,10.3c-5.69,0-10.3-4.61-10.3-10.3C48.6,53.21,53.21,48.6,58.9,48.6L58.9,48.6z M62.47,90.92 c3.02,0,5.66,1.64,7.08,4.08c6.11-1.8,11.57-5.11,15.96-9.49c6.81-6.81,11.02-16.22,11.02-26.61c0-7.51-2.2-14.51-5.99-20.38 l3.84-4.05c4.79,6.94,7.6,15.36,7.6,24.43c0,11.89-4.82,22.66-12.62,30.46c-5.15,5.15-11.6,9-18.81,11.02 c-0.62,3.9-3.99,6.89-8.07,6.89c-3.58,0-6.61-2.3-7.72-5.49c-10.24-0.98-19.43-5.54-26.31-12.42 c-7.79-7.79-12.62-18.56-12.62-30.46c0-9.77,3.25-18.77,8.73-26c-0.48-1.04-0.74-2.19-0.74-3.41c0-4.51,3.66-8.17,8.17-8.17 c1.47,0,2.86,0.39,4.05,1.07c6.63-4.16,14.46-6.56,22.86-6.56c8.46,0,16.34,2.44,23,6.65l-3.83,4.04 c-5.61-3.33-12.17-5.24-19.17-5.24c-7.04,0-13.64,1.94-19.28,5.3c0.35,0.91,0.54,1.89,0.54,2.92c0,4.51-3.66,8.17-8.17,8.17 c-1.28,0-2.5-0.3-3.58-0.82c-4.49,6.2-7.14,13.82-7.14,22.06c0,10.39,4.21,19.8,11.02,26.61c5.9,5.9,13.75,9.85,22.5,10.8 C55.93,93.16,58.94,90.92,62.47,90.92L62.47,90.92z M58.9,31.58c4.23,0,8.24,0.96,11.82,2.68l-3.63,3.83 c-0.12,0.12-0.23,0.25-0.34,0.38c-2.44-0.94-5.08-1.45-7.85-1.45c-6.04,0-11.51,2.45-15.47,6.41c-3.96,3.96-6.41,9.43-6.41,15.47 c0,6.04,2.45,11.51,6.41,15.47c3.96,3.96,9.43,6.41,15.47,6.41c6.04,0,11.51-2.45,15.47-6.41c3.96-3.96,6.41-9.43,6.41-15.47 c0-2.97-0.59-5.79-1.66-8.37c0.18-0.16,0.35-0.32,0.52-0.5l3.52-3.71c1.96,3.77,3.07,8.05,3.07,12.58c0,7.54-3.06,14.37-8,19.31 c-4.94,4.94-11.77,8-19.31,8c-7.54,0-14.37-3.06-19.31-8c-4.94-4.94-8-11.77-8-19.31c0-7.54,3.06-14.37,8-19.31 C44.53,34.64,51.35,31.58,58.9,31.58L58.9,31.58z"/></svg>
                    <p class="placeholder-text">No iterables to display</p>
                    `;
                // Append the placeholder to the projectsList
                projectsList.appendChild(placeholder);
                return;
            }

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
