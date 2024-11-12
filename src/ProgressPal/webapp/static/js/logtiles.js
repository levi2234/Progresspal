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