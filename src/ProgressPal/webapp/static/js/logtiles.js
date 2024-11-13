// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Clear the content of the project boxes container
    document.querySelector('.project-boxes').innerHTML = '';
    // Initialize the application
    initialize();
});

// This function initializes the search bar functionality
function startSearchbar() {
    console.log('startSearchbar LOGS');

    // Get the search input element
    const searchBox = document.getElementById('search-input');
    console.log('Search box:', searchBox);
    if (searchBox) {
        // Add an event listener to the search input for the 'input' event
        searchBox.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            console.log('Search text:', searchText);
            // Get all log tile containers
            const tiles = document.querySelectorAll('.log-tile-container');
            console.log('Log tiles:', tiles);

            // Filter log tiles based on the search text
            tiles.forEach(tile => {
                const content = tile.textContent.toLowerCase();
                console.log('Tile content:', content);
                if (!searchText || (content && content.includes(searchText))) {
                    tile.classList.remove('hidden');
                } else {
                    tile.classList.add('hidden');
                }
            });
        });
    } else {
        console.error('Search box not found');
    }
}

// This function initializes the application
function initialize() {
    // Load settings from the server
    fetch('/settings').then(response => response.json()).then(data => {
        const settings = data.settings;

        // Get log settings from the loaded settings
        const logSettings = settings.Logs;
        logTrackerupdateRate = logSettings.Tickrate.value;
        window.logTrackerDownloadFormat = logSettings.LogDownloadFormat.value;

        // Set intervals for updating log tiles
        window.intervals = []; 
        window.intervals = [setInterval(updateLogTiles, logTrackerupdateRate)];
    });

    // Clear the content of the project boxes container
    document.querySelector('.project-boxes').innerHTML = '';
    // Load log tiles header and log tiles
    loadLogTilesHeader();
    loadLogTiles();
    // Start the search bar functionality
    startSearchbar();
}

// This function loads the log tiles header
function loadLogTilesHeader() {
    // Set the page title to 'Logs'
    document.querySelector('.pagetitle').innerHTML = 'Logs';
    // Hide unnecessary sections
    document.querySelector('.in-progress-tasks-section').style.display = 'none';
    document.querySelector('.completed-tasks-section').style.display = 'none';
    document.querySelector('.total-tasks-section').style.display = 'none';

    // Show the export logs button
    document.querySelector('.export-logs-button').style.display = 'block';

    // Force grid view
    document.querySelector('.list-view').style.display = 'none';
    document.querySelector('.grid-view').style.display = 'none';
    document.querySelector('.grid-view').classList.add('active');
    document.querySelector('.project-boxes').classList.remove('jsListView');
    document.querySelector('.project-boxes').classList.add('jsGridView');
}

// This function updates the log tiles with new log entries from the server
function updateLogTiles() {
    // Get the JSON progress data from the server
    fetch('/logs')
        .then(response => response.json())
        .then(data => {

            // Clear the existing log tiles if no logs have been loaded yet
            const logBox = document.querySelector('.log-box');
            const projectBoxes = document.querySelector('.project-boxes');



            // ADD PLACEHOLDER IF NO LOGS ARE AVAILABLE
            if (projectBoxes && projectBoxes.children.length === 1 && (!logBox || logBox.children.length === 0)) {
                const placeholder = document.createElement('div');
                placeholder.className = 'placeholder';
                // Link an svg to the placeholder
                placeholder.innerHTML = `
                     <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 128 128" fill="var(--main-color)"  stroke-linecap="round" stroke-linejoin="round" class="placeholder-image"><path d="M25.38,57h64.88V37.34H69.59c-2.17,0-5.19-1.17-6.62-2.6c-1.43-1.43-2.3-4.01-2.3-6.17V7.64l0,0H8.15 c-0.18,0-0.32,0.09-0.41,0.18C7.59,7.92,7.55,8.05,7.55,8.24v106.45c0,0.14,0.09,0.32,0.18,0.41c0.09,0.14,0.28,0.18,0.41,0.18 c22.78,0,58.09,0,81.51,0c0.18,0,0.17-0.09,0.27-0.18c0.14-0.09,0.33-0.28,0.33-0.41v-11.16H25.38c-4.14,0-7.56-3.4-7.56-7.56 V64.55C17.82,60.4,21.22,57,25.38,57L25.38,57z M29.49,68.38h7.43v18.15h11.63v5.92H29.49V68.38L29.49,68.38z M49.89,80.43 c0-3.93,1.09-6.99,3.28-9.17c2.19-2.19,5.24-3.28,9.15-3.28c4.01,0,7.09,1.08,9.26,3.22c2.17,2.15,3.25,5.16,3.25,9.04 c0,2.81-0.47,5.11-1.42,6.91c-0.95,1.8-2.32,3.2-4.11,4.2c-1.79,1-4.02,1.5-6.69,1.5c-2.71,0-4.96-0.43-6.74-1.29 c-1.78-0.87-3.22-2.23-4.32-4.11C50.44,85.58,49.89,83.24,49.89,80.43L49.89,80.43z M57.31,80.44c0,2.43,0.45,4.17,1.36,5.23 c0.91,1.06,2.14,1.59,3.7,1.59c1.6,0,2.84-0.52,3.71-1.56c0.88-1.04,1.32-2.9,1.32-5.6c0-2.26-0.46-3.92-1.37-4.96 c-0.92-1.05-2.16-1.57-3.73-1.57c-1.5,0-2.71,0.53-3.62,1.59C57.77,76.24,57.31,77.99,57.31,80.44L57.31,80.44z M90.42,83.74v-5.01 h11.49v10.23c-2.2,1.5-4.15,2.53-5.83,3.07c-1.69,0.54-3.7,0.81-6.02,0.81c-2.86,0-5.19-0.49-6.99-1.46 c-1.8-0.97-3.19-2.42-4.18-4.35c-0.99-1.92-1.48-4.13-1.48-6.63c0-2.63,0.54-4.91,1.62-6.85c1.08-1.94,2.67-3.41,4.76-4.42 c1.63-0.78,3.83-1.17,6.58-1.17c2.66,0,4.64,0.24,5.96,0.72c1.32,0.48,2.41,1.23,3.28,2.24c0.87,1.01,1.52,2.3,1.96,3.85 l-7.16,1.29c-0.3-0.91-0.8-1.61-1.5-2.09c-0.71-0.49-1.6-0.73-2.7-0.73c-1.62,0-2.92,0.57-3.89,1.7c-0.97,1.13-1.45,2.92-1.45,5.37 c0,2.6,0.49,4.46,1.47,5.57c0.97,1.11,2.34,1.68,4.09,1.68c0.83,0,1.62-0.12,2.37-0.36c0.75-0.24,1.61-0.65,2.59-1.22v-2.25H90.42 L90.42,83.74z M97.79,57h9.93c4.16,0,7.56,3.41,7.56,7.56v31.42c0,4.15-3.41,7.56-7.56,7.56h-9.93v13.55c0,1.61-0.65,3.04-1.7,4.1 c-1.06,1.06-2.49,1.7-4.1,1.7c-29.44,0-56.59,0-86.18,0c-1.61,0-3.04-0.64-4.1-1.7c-1.06-1.06-1.7-2.49-1.7-4.1V5.85 c0-1.61,0.65-3.04,1.7-4.1c1.06-1.06,2.53-1.7,4.1-1.7h58.72C64.66,0,64.8,0,64.94,0c0.64,0,1.29,0.28,1.75,0.69h0.09 c0.09,0.05,0.14,0.09,0.23,0.18l29.99,30.36c0.51,0.51,0.88,1.2,0.88,1.98c0,0.23-0.05,0.41-0.09,0.65V57L97.79,57z M67.52,27.97 V8.94l21.43,21.7H70.19c-0.74,0-1.38-0.32-1.89-0.78C67.84,29.4,67.52,28.71,67.52,27.97L67.52,27.97z"/></svg>
                    <p class="placeholder-text">No logs to display</p>
                `;
                // Append the placeholder to the logBox
                projectBoxes.appendChild(placeholder);
                return;
            }
            // Clear the placeholder if the logs have been loaded
            const placeholder = document.querySelector('.placeholder');
            if (placeholder && logBox.children.length > 0) {
                placeholder.remove();
            }


            if (!window.latestTimestamp) {
                logBox.innerHTML = '';
            }

            // Filter logs to only include new logs
            const newLogs = data.logs.filter(log => !window.latestTimestamp || new Date(log.timestamp) > new Date(window.latestTimestamp));

            // Loop through the new logs array and create a tile for each log entry
            newLogs.forEach(log => {
                const tile = document.createElement('div');
                tile.classList.add('log-tile');
                tile.innerHTML = `
                    <div class="log-tile-container">
                        <div class="log-tile-level ${log.level}"><strong> [${log.level}]</strong> </div>
                        <div class="log-tile-timestamp"> ${log.timestamp} </div>
                        <div class="log-tile-filename-and-line"> ${log.filename}:${log.lineno}</div>
                        <div class="log-tile-message"> ${log.message}</div>
                    </div>
                `;
                // Prepend the new log tile to the top
                logBox.prepend(tile);
            });

            // Update the latest timestamp
            if (newLogs.length > 0) {
                window.latestTimestamp = newLogs[newLogs.length - 1].timestamp;
            }
        });
}
// This function loads the log tiles container
function loadLogTiles() {
    // Clear the content of the project boxes container
    document.querySelector('.project-boxes').innerHTML = '';
    // Create a new div for the log box and append it to the project boxes container
    const projectBoxes = document.querySelector('.project-boxes');
    const logBox = document.createElement('div');
    logBox.classList.add('log-box');
    logBox.id = 'log-box';
    projectBoxes.appendChild(logBox);

    //load all the log tiles
    fetch('/logs')
        .then(response => response.json())
        .then(data => {
            const logs = data.logs.reverse();
            logs.forEach(log => {
                const tile = document.createElement('div');
                tile.classList.add('log-tile');
                tile.innerHTML = `
                    <div class="log-tile-container">
                        <div class="log-tile-level ${log.level}"><strong> [${log.level}]</strong> </div>
                        <div class="log-tile-timestamp"> ${log.timestamp} </div>
                        <div class="log-tile-filename-and-line"> ${log.filename}:${log.lineno}</div>
                        <div class="log-tile-message"> ${log.message}</div>
                    </div>
                `;
                logBox.appendChild(tile);
            });
        });
    
}

// Functionality for the download logs button
document.querySelector('.export-logs-button').addEventListener('click', async function() {
    try {
        // Fetch logs from the server
        const response = await fetch('/logs');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        switch (window.logTrackerDownloadFormat) {
            case 'json': 
                const data = await response.json();
                // Format JSON data
                const formattedData = JSON.stringify(data, null, 2);
                // Create a blob from the formatted data and create a download link
                const blob = new Blob([formattedData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'logs.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                break;

            case 'csv':
                const logs = await response.json();
                // Format CSV data
                const csv = logs.logs.map(log => `${log.timestamp},${log.level},${log.filename},${log.lineno},${log.message}`).join('\n');
                const csvBlob = new Blob([csv], { type: 'text/csv' });
                const csvUrl = URL.createObjectURL(csvBlob);
                const csvLink = document.createElement('a');
                csvLink.href = csvUrl;
                csvLink.download = 'logs.csv';
                document.body.appendChild(csvLink);
                csvLink.click();
                document.body.removeChild(csvLink);
                URL.revokeObjectURL(csvUrl);
                break;

            case 'txt':
                const logsTxt = data.Logs;
                let formattedTxt = '';

                if (Array.isArray(logsTxt)) {
                    logsTxt.forEach(log => {
                        formattedTxt += Object.entries(log).map(([key, value]) => `${key}: ${value}`).join('\n');
                        formattedTxt += '\n\n'; // Add a blank line between log entries
                    });
                } else if (typeof logsTxt === 'object') {
                    formattedTxt = Object.entries(logsTxt).map(([key, value]) => `${key}: ${value}`).join('\n');
                } else {
                    formattedTxt = logsTxt.toString();
                }

                const txtBlob = new Blob([formattedTxt], { type: 'text/plain' });
                const txtUrl = URL.createObjectURL(txtBlob);
                const txtLink = document.createElement('a');
                txtLink.href = txtUrl;
                txtLink.download = 'logs.txt';
                document.body.appendChild(txtLink);
                txtLink.click();
                document.body.removeChild(txtLink);
                URL.revokeObjectURL(txtUrl);
                break;
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
});