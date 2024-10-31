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

/**
 * Dynamically loads a CSS stylesheet into the document.
 * Used to load the css for when we switch to another page.
 * @param {string} filename - The path to the CSS file to be loaded.
 */
function loadStyleSheet(filename) {
    const head = document.head;
    const link = document.createElement('link');

    link.type = 'text/css';
    link.rel = 'stylesheet';
}

function loadScript(filename) {
    const script = document.createElement("script");
    script.src = filename;
    document.head.appendChild(script);
  }

function unloadResource(filename, type) {
    const elements = document.querySelectorAll(type === 'css' ? "link" : "script");
    elements.forEach(element => {
      if (element.href === filename || element.src === filename) {
        element.remove();
      }
    });
  }

function loadResourcesForMenu(menuItem) {
    // Clear existing conditional resources
    console.log('Unloading resources...');
    unloadResource("{{ url_for('static', filename='css/looptilestyle.css') }}", 'css');
    unloadResource("{{ url_for('static', filename='js/looptiles.js') }}", 'js');
    unloadResource("{{ url_for('static', filename='css/funtiontilestyle.css') }}", 'css');
    unloadResource("{{ url_for('static', filename='js/funtiontiles.js') }}", 'js');

    // // Load based on menu item selection
    // if (menuItem === 'looptracker') {
    //     loadStyleSheet("{{ url_for('static', filename='css/looptilestyle.css') }}");
    //     loadScript("{{ url_for('static', filename='js/looptiles.js') }}");
    // } else if (menuItem === 'functiontracker') {
    //     loadStyleSheet("{{ url_for('static', filename='css/looptilestyle.css') }}");
    //     loadScript("{{ url_for('static', filename='js/looptiles.js') }}");
    // }
}
