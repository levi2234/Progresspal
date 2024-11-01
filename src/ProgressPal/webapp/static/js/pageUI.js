document.addEventListener('DOMContentLoaded', function () {
    var modeSwitch = document.querySelector('.mode-switch');
  
    modeSwitch.addEventListener('click', function () {                     
        document.documentElement.classList.toggle('dark');
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

    let is24HourFormat = true; // Initial format is 24-hour

    const clockElement = document.getElementById('clock');
    clockElement.addEventListener('click', function () {
        is24HourFormat = !is24HourFormat; // Toggle format
        updateClock(is24HourFormat); // Update clock immediately
    });

    setInterval(() => updateClock(is24HourFormat), 1000);
    updateClock(is24HourFormat); // Initial call to display clock immediately

    const resources = {"looptracker": {"stylesheet": "/static/css/looptilestyle.css", "script": "/static/js/looptiles.js"},
                       "functiontracker": {"stylesheet": "/static/css/functiontilestyle.css", "script": "/static/js/functiontiles.js"},
                       "logtracker": {"stylesheet": "/static/css/logtilestyle.css", "script": "/static/js/logtiles.js"},
                       "settings": {"stylesheet": "/static/css/settingstilestyle.css", "script": "/static/js/settings.js"}};

    // Initialize the searchbar functionality
    startSearchbar();

    //detect menu button press and change resources
    const menuButtons = document.querySelectorAll('.app-sidebar-link');
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const resourceKey = button.dataset.resource;
            changeResources(resources[resourceKey].stylesheet, resources[resourceKey].script);
            //set the active class
            menuButtons.forEach(menuButton => menuButton.classList.remove('active'));
            button.classList.add('active');
        });
    });
});



function shutdown() {
    fetch('/shutdown', { method: 'GET' })
        .then(response => response.json())
        .then(data => alert(data.message));
}

function shutdown() {
    fetch('/shutdown', { method: 'GET' })
        .then(response => response.json())
        .then(data => alert(data.message));
}

function updateClock(is24HourFormat = true) {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    let period = '';

    if (!is24HourFormat) {
        period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert to 12-hour format
    }

    hours = hours.toString().padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds} ${period}`;
}


// This handles the changing of resources (CSS and JS) when a menu button is clicked
function changeResources(newStylesheet, newScript) {

    //clear intervals loaded on domload
    function terminateAllIntervals() {
        intervals.forEach(intervalId => {
            clearInterval(intervalId);
        });
        // Clear the intervals array if needed
        intervals = [];
    }

    // Clear all intervals to make sure the new script starts fresh
    terminateAllIntervals();

    // Change the stylesheet
    const stylesheetLink = document.getElementById('tilesstylesheetlink');
    stylesheetLink.href = newStylesheet;

    // Change the JavaScript script
    const existingScript = document.getElementById('tilejavascriptlink');
    existingScript.src = newScript;

    // Create a new script element to load the new script
    const newScriptElement = document.createElement('script');
    newScriptElement.src = newScript;
    newScriptElement.id = 'tilejavascriptlink'; // Optional: set an ID for the new script

    // Optional: Remove the old script after loading the new one
    newScriptElement.onload = function() {
        existingScript.remove(); // Remove the old script

    initialize(); // Initialize the new script (it doesnt do this based on DOMContentLoaded)
        

    };

    document.head.appendChild(newScriptElement);
}

// This function initializes the searchbar functionality
function startSearchbar() {

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
