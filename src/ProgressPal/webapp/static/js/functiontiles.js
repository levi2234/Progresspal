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

