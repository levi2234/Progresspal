document.addEventListener('DOMContentLoaded', function () {
    // Load Settings
    fetch('/settings')
        .then(response => response.json())
        .then(data => {
            const settings = data.settings;

            // GENERAL SETTINGS from json
            const UIsettings = settings.UI;
            const UIDefaultTheme = UIsettings.DefaultTheme.value; // Declare UIDefaultTheme with const
            console.log(UIDefaultTheme);

            // Empty the classlist from the <html> element dynamically
            const htmlElement = document.documentElement;
            htmlElement.className = ''; // Clear all classes

            // Optionally, you can add the default theme class if needed
            htmlElement.classList.add(UIDefaultTheme);
        })
        .catch(error => {
            console.error('Error fetching settings:', error);
        });

    // Select the list view and grid view buttons
    var listView = document.querySelector('.list-view');
    var gridView = document.querySelector('.grid-view');
    var projectsList = document.querySelector('.project-boxes');

    // Add event listener for list view button
    listView.addEventListener('click', function () {
        gridView.classList.remove('active');
        listView.classList.add('active');
        projectsList.classList.remove('jsGridView');
        projectsList.classList.add('jsListView');
    });

    // Add event listener for grid view button
    gridView.addEventListener('click', function () {
        gridView.classList.add('active');
        listView.classList.remove('active');
        projectsList.classList.remove('jsListView');
        projectsList.classList.add('jsGridView');
    });

    // Initialize clock format to 24-hour
    let is24HourFormat = true;

    // Select the clock element and add click event listener to toggle format
    const clockElement = document.getElementById('clock');
    clockElement.addEventListener('click', function () {
        is24HourFormat = !is24HourFormat; // Toggle format
        updateClock(is24HourFormat); // Update clock immediately
    });

    // Update the clock every second
    setInterval(() => updateClock(is24HourFormat), 1000);
    updateClock(is24HourFormat); // Initial call to display clock immediately

    // Define resources for different trackers
    const resources = {
        "looptracker": { "stylesheet": "/static/css/looptilestyle.css", "script": "/static/js/looptiles.js" },
        "functiontracker": { "stylesheet": "/static/css/functiontilestyle.css", "script": "/static/js/functiontiles.js" },
        "logtracker": { "stylesheet": "/static/css/logtilestyle.css", "script": "/static/js/logtiles.js" },
        "settings": { "stylesheet": "/static/css/settingsstyle.css", "script": "/static/js/settings.js" }
    };

    // Detect menu button press and change resources
    const menuButtons = document.querySelectorAll('.app-sidebar-link');
    menuButtons.forEach(button => {
        button.addEventListener('click', function () {
            const resourceKey = button.dataset.resource;
            changeResources(resources[resourceKey].stylesheet, resources[resourceKey].script);
            // Set the active class
            menuButtons.forEach(menuButton => menuButton.classList.remove('active'));
            button.classList.add('active');
        });
    });
});

// Function to update the clock display
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

// Function to change resources (CSS and JS) when a menu button is clicked
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
    newScriptElement.onload = function () {
        if (typeof initialize === 'function') {
            initialize(); // Run the new script’s initialization
        }
    };

    document.head.appendChild(newScriptElement);
}