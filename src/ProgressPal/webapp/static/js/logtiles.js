document.addEventListener('DOMContentLoaded', () => {
    initialize();
});

function initialize() {
    loadFunctionTilesHeader();
    //first clear the project-boxes div
    window.intervals = []; // or simply use var intervals = [];
    document.querySelector('.project-boxes').innerHTML = '';
    loadLogTiles();

    let updatetilesinterval = setInterval(updateLogTiles, 100);
    window.intervals = [updatetilesinterval];
};


function loadFunctionTilesHeader() {
    document.querySelector('.pagetitle').innerHTML = 'Logs';
    //populate the header with the correct elements
    document.querySelector('.in-progress-tasks-section').style.display = 'none';
    document.querySelector('.completed-tasks-section').style.display = 'none';
    document.querySelector('.total-tasks-section').style.display = 'none';
   

    //force grid view
    document.querySelector('.list-view').style.display = 'none';
    document.querySelector('.grid-view').style.display = 'none';
    document.querySelector('.grid-view').classList.add('active');
    document.querySelector('.project-boxes').classList.remove('jsListView');
    document.querySelector('.project-boxes').classList.add('jsGridView');
}


//this function updates the stats in the tiles based on their I
function updateLogTiles() {
    // Get the JSON progress data from the server
    fetch('/logs')
        .then(response => response.json())
        .then(data => {
            // Clear the existing log tiles
            const logBox = document.querySelector('.log-box');
            logBox.innerHTML = '';

            // Loop through the logs array and create a tile for each log entry
            for (let i = data.logs.length - 1; i >= 0; i--) {
                const log = data.logs[i];
                const tile = document.createElement('div');
                tile.classList.add('log-tile');
                tile.innerHTML = `
                    <div class="log-tile-container">
                        <div class="log-tile-level ${log.level}"><strong> [${log.level}]</strong> </div>
                        <div class="log-tile-timestamp"> ${log.timestamp} </div>
                        <div class="log-tile-message"> ${log.message}</div>
                        <div class="log-tile-filename-and-line"> ${log.filename}:${log.lineno}</div>
                    </div>
                `;
                logBox.appendChild(tile);
            }
        });
}


function loadLogTiles() {
    //select the project-boxes div and add a new div for the log-box
    const projectBoxes = document.querySelector('.project-boxes');
    const logBox = document.createElement('div');
    logBox.classList.add('log-box');
    logBox.id = 'log-box';
    projectBoxes.appendChild(logBox);
    
}
