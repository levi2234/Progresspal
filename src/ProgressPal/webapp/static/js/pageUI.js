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
// This function changes resources (CSS and JS) when a menu button is clicked
function changeResources(newStylesheet, newScript) {

    // Initialize window.intervals if it doesn't exist
    if (!window.intervals) {
        window.intervals = [];
    }

    // Clear all stored intervals and other loaded functions
    function terminateAllResources() {
        // Clear all stored intervals
        window.intervals.forEach(intervalId => clearInterval(intervalId));
        window.intervals = []; // Reset intervals array
    }

    // Terminate all active resources before changing scripts
    terminateAllResources();

    // Change the stylesheet
    const stylesheetLink = document.getElementById('tilesstylesheetlink');
    if (stylesheetLink) {
        stylesheetLink.href = newStylesheet;
    }

    // Remove the old script if it exists
    const existingScript = document.getElementById('tilejavascriptlink');
    if (existingScript) {
        existingScript.remove();
    }

    // Create and load the new script element
    const newScriptElement = document.createElement('script');
    newScriptElement.src = newScript;
    newScriptElement.id = 'tilejavascriptlink';

    // After loading, initialize new script intervals
    newScriptElement.onload = function() {
        if (typeof initialize === 'function') {
            initialize(); // Run the new script’s initialization
        }
    };

    document.head.appendChild(newScriptElement);
}





