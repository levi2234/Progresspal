document.addEventListener('DOMContentLoaded', () => {
    initialize();
    
});

// This function initializes the searchbar functionality
function startSearchbar() {
    console.log('startSearchbar FUNC');

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
        const functionSettings = settings.Functions;
        FunctionTrackerRefetchInterval = functionSettings.RefetchInterval.value;
        FunctionTrackerupdateRate = functionSettings.Tickrate.value;

        //SETTING INTERVALS
        window.intervals = []; 
        let loadtilesinterval = setInterval(loadFunctionTiles, FunctionTrackerRefetchInterval);
        let updatetilesinterval = setInterval(updateFunctionTiles, FunctionTrackerupdateRate);
        let trackerstatsinterval = setInterval(trackerstats, FunctionTrackerupdateRate);
        window.intervals = [loadtilesinterval, updatetilesinterval, trackerstatsinterval];


    });

    // INTIALIZE PAGE ELEMENTS
    loadFunctionTilesHeader();
    document.querySelector('.project-boxes').innerHTML = '';

    //LOAD SEARCHBAR
    startSearchbar();
};



function loadFunctionTilesHeader() {
    document.querySelector('.pagetitle').innerHTML = 'Function Tracker';
    //populate the header with the correct elements
    document.querySelector('.in-progress-tasks-section').style.display = 'none';
    document.querySelector('.completed-tasks-section').style.display = 'none';
    document.querySelector('.total-tasks-section').style.display = 'block';

    document.querySelector('.export-logs-button').style.display = 'none';
   

    //force grid view
    document.querySelector('.list-view').style.display = 'none';
    document.querySelector('.grid-view').style.display = 'flex';
    document.querySelector('.grid-view').classList.add('active');
    document.querySelector('.project-boxes').classList.remove('jsListView');
    document.querySelector('.project-boxes').classList.add('jsGridView');
}

//this function updates the stats in the tiles based on their I
function updateFunctionTiles() {
    // get the JSON progress data from the server
    fetch('/function_status')
        .then(response => response.json())
        .then(data => {
            




            // loop through the data and create a tile for each item
            Object.keys(data).forEach(key => {
                const item = data[key];
                const tile = document.getElementById(key);

                // Check if the tile is visible in the viewport
                if (tile && isElementInViewport(tile)) {

                    // Convert seconds per iteration to iterations per second if necessary
                    const callsPerSecondElement = tile.querySelector('.calls_per_second_value');
                    const callsPerSecondTextElement = tile.querySelector('.calls_per_second_text');
                    if (item.calls_per_second < 1) {
                        item.calls_per_second = 1 / item.calls_per_second;
                        callsPerSecondElement.textContent = item.calls_per_second.toFixed(2);
                        callsPerSecondTextElement.textContent = "s/Call";
                    } else {
                        callsPerSecondElement.textContent = item.calls_per_second.toFixed(2);
                        callsPerSecondTextElement.textContent = "Calls/s";
                    }

                    tile.querySelector('.call_count_value').textContent = `${item.call_count}`;
                    tile.querySelector('.error_count_value').textContent = `${item.error_count}`;

                    // Log overhead percentage
                    const overheadPercentageElement = tile.querySelector('.overhead-percentage');
                    overheadPercentageElement.textContent = item.overhead_percentage !== undefined 
                        ? `${item.overhead_percentage}% OH` 
                        : '- % OH';

                    // Plot Gaussian using a safe plot function
                    plotExecutionTimeline(`gaussianCanvas-${key}`, item.exec_hist);

                    // Check if the error count is greater than 0 and change the color of the tile
                    if (item.error_count === 1) {
                        tile.style.backgroundColor = 'orange';
                    } else if (item.error_count > 1) {
                        tile.style.backgroundColor = 'red';
                    } else {
                        tile.style.backgroundColor = 'var(--tile-color)';
                    }
                }
            });
        })
        .catch(error => console.error("Error updating function tiles:", error));
}


function loadFunctionTiles() {
    // use the json data to create tiles in the html under the class "project-boxes"

    fetch('/function_status')
        .then(response => response.json())
        .then(data => {
            
            const projectsList = document.querySelector('.project-boxes'); // get the project-boxes div


            // ADD A PLACEHOLDER IF THERE ARE NO LOGS
            if (Object.keys(data).length === 0 && projectsList.children.length === 0) {
                const placeholder = document.createElement('div');
                placeholder.className = 'placeholder';
            
                // Link an svg to the placeholder
                placeholder.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-4 -4 128 128" fill=var(--main-color)  stroke-linecap="round" stroke-linejoin="round"  class="placeholder-image"><defs /><path d="M27.61,34.37l-4.07,4.6l0.4,1.74h10.48c-2.14,12.38-3.74,23.54-6.81,40.74c-3.67,21.94-5.78,27.33-7.03,29.3 c-1.1,1.95-2.68,2.96-4.82,2.96c-2.35,0-6.6-1.86-8.88-3.97c-0.82-0.56-1.79-0.42-2.82,0.26C2,111.74,0,114.42,0,116.82 c-0.12,3.24,4.21,6.06,8.34,6.06c3.64,0,9-2.28,14.64-7.64c7.71-7.31,13.48-17.34,18.3-39.02c3.1-13.84,4.56-22.84,6.74-35.5 l13.02-1.18l2.82-5.17H49.2C52.99,10.53,55.95,7,59.59,7c2.42,0,5.24,1.86,8.48,5.52c0.96,1.32,2.4,1.18,3.5,0.28 c1.85-1.1,4.13-3.92,4.28-6.48C75.96,3.5,72.6,0,66.82,0C61.58,0,53.55,3.5,46.8,10.38c-5.92,6.27-9.02,14.1-11.16,23.99H27.61 L27.61,34.37z M69.27,50.33c4.04-5.38,6.46-7.17,7.71-7.17c1.29,0,2.32,1.27,4.53,8.41l3.78,12.19 c-7.31,11.18-12.66,17.41-15.91,17.41c-1.08,0-2.17-0.34-2.94-1.1c-0.76-0.76-1.6-1.39-2.42-1.39c-2.68,0-6,3.25-6.06,7.28 c-0.06,4.11,2.82,7.05,6.6,7.05c6.49,0,11.98-6.37,22.58-23.26l3.1,10.45c2.66,8.98,5.78,12.81,9.68,12.81 c4.82,0,11.3-4.11,18.37-15.22l-2.96-3.38c-4.25,5.12-7.07,7.52-8.74,7.52c-1.86,0-3.49-2.84-5.64-9.82l-4.53-14.73 c2.68-3.95,5.32-7.27,7.64-9.92c2.76-3.15,4.89-4.49,6.34-4.49c1.22,0,2.28,0.52,2.94,1.25c0.87,0.96,1.39,1.41,2.42,1.41 c2.33,0,5.93-2.96,6.06-6.88c0.12-3.64-2.14-6.74-6.06-6.74c-5.92,0-11.14,5.1-21.19,20.04l-2.07-6.41 c-2.9-9-4.82-13.63-8.86-13.63c-4.7,0-11.16,5.78-17.48,14.94L69.27,50.33L69.27,50.33z"/></svg>                    
                <p class="placeholder-text">No Functions to display</p>
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

                const tile = document.createElement('div');

                tile.classList.add('tile-wrapper');
                tile.innerHTML = `
                    <div class="function-tile" ID="${key}">

                        <div class="function-tile-content-header">

                            <div class="function-tile-content-header-left">
                                <p class="function-tile-content-header-text tile-text-color">${key}</p>
                            </div>
                            <div class="function-tile-content-header-center">
                            </div>
                            <div class="function-tile-content-header-right">
                                <p class="function-tile-content-header-text tile-text-color">${item.filename}</p>
                            </div>


                        </div>

                        <div class="function-tile-content-subheader"
                            <p class="function-tile-content-subheader-text tile-text-color ">Category: ${item.category}</p>
                            <p class="overhead-percentage tile-text-color" > -% Overhead </p>
                        </div>

                        <div class="function-tile-content">

                                <div class="call_count tile-stats-box" ">
                                    <div class="call_count_value"> ${item.call_count}</div>
                                    <div class ="call_count_text"> Calls</div>
                                </div>

                                <div class="error_count tile-stats-box" ">
                                    <div class="error_count_value">${item.error_count}</div>
                                    <div class="error_count_text"> Errors</div>
                                </div>

                                <div class="calls_per_second tile-stats-box" ">
                                    <div class="calls_per_second_value"> ${item.calls_per_second.toFixed(2)} </div>
                                    <div class="calls_per_second_text"> Calls/s </div>
                                </div>
                        </div>

                        <div class="function-tile-footer">
                            <p class="canvas-title">Latest execution duration:                            ${ identify_largest_time_unit(item.exec_hist[item.exec_hist.length - 1]).time.toFixed(4) } ${ identify_largest_time_unit(item.exec_hist[item.exec_hist.length - 1]).time_unit } </p>
                             <canvas class="function-tile-content-header-canvas" id = "gaussianCanvas-${key}"></canvas>

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
    
    fetch('/function_status')
        .then(response => response.json())
        .then(data => {
            

            
            // find the total number of tasks
        const totalTasks = Object.keys(data).length;

            // update the html elements with the new values (class in-progress-number)
            document.querySelector('.total-tasks-number').innerHTML = totalTasks; // total tasks

        });
}

function plotExecutionTimeline(canvasId, executionDurations) {
    // Set up the canvas dimensions
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 100;

    // Get the CSS variables for colors
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--main-color');

    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw Y axis
    ctx.beginPath();
    ctx.moveTo(85, 0); // Moved to the right
    ctx.lineTo(85, canvas.height); // Moved to the right
    ctx.strokeStyle = textColor;
    ctx.stroke();

    // Calculate the mean and standard deviation
    const { mean, std } = CalcuMeanStd(executionDurations);

    // Calculate the scaling factors within 4 sigma range
    const maxDuration = Math.min(Math.max(...executionDurations), mean + 4 * std);
    const minDuration = Math.max(Math.min(...executionDurations), mean - 4 * std);
    const xScale = (canvas.width - 85) / (executionDurations.length - 1);
    const yScale = (canvas.height - 40) / (maxDuration - minDuration);

    // Plot the execution durations
    ctx.beginPath();
    ctx.moveTo(85, canvas.height - 20 - (executionDurations[0] - minDuration) * yScale);
    for (let i = 1; i < executionDurations.length; i++) {
        const x = 85 + i * xScale;
        const y = canvas.height - 20 - (executionDurations[i] - minDuration) * yScale;
        ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(79, 63, 240, 0.8)';
    ctx.stroke();

    // Optionally, add grid lines and labels
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 10; i++) {
        const y = i * (canvas.height / 9);
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = textColor;
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Add labels for the Y axis
    ctx.strokeStyle = textColor;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    const values = [
        mean,
        mean + 2 * std,
        mean - 2 * std
    ];

    const converted_vals_mean = identify_largest_time_unit(mean);
    const converted_vals_std = identify_largest_time_unit(std);
    const labels = [
        `${converted_vals_mean.time.toFixed(2)} ${converted_vals_mean.time_unit}`,
        `+${2 * converted_vals_std.time.toFixed(2)} ${converted_vals_std.time_unit}`,
        `-${2 * converted_vals_std.time.toFixed(2)} ${converted_vals_std.time_unit}`
    ];

    values.forEach((value, index) => {
        const y = canvas.height - 20 - (value - minDuration) * (canvas.height - 40) / (maxDuration - minDuration);
        const label = labels[index];
    
        // Set the font size
        ctx.font = "14px Arial";
        ctx.fillStyle = textColor;
    
        // Measure the width of the text
        const textWidth = ctx.measureText(label).width;
    
        // Adjust the x-coordinate so the right side of the text is at x=75
        const x = 75 - textWidth;
    
        ctx.fillText(label, x, y + 3);
    
        // Draw ticks on the y-axis
        ctx.beginPath();
        ctx.moveTo(85, y);
        ctx.lineTo(90, y);
        ctx.strokeStyle = textColor;
        ctx.stroke();
    });
}

// Helper function to check if an element is in the viewport
function isElementInViewport(el, margin = 700) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= -margin &&
        rect.left >= -margin &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + margin &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + margin
    );
}

function CalcuMeanStd(exec_hist) {
    // Calculate the mean and standard deviation of the execution history
    const n = exec_hist.length;
    const mean = exec_hist.reduce((acc, val) => acc + val, 0) / n;
    const std = Math.sqrt(exec_hist.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n);
    return { mean, std };
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

