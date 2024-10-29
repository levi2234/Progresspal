
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

