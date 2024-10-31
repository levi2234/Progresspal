document.addEventListener('DOMContentLoaded', () => {
    //first clear the project-boxes div
    const projectsList = document.querySelector('.project-boxes');
    projectsList.innerHTML = '';

    let loadtilesinterval = setInterval(loadFunctionTiles, 1000);
    let updatetilesinterval = setInterval(updateFunctionTiles, 100);
    let trackerstatsinterval = setInterval(trackerstats, 100);
    window.intervals = [loadtilesinterval, updatetilesinterval, trackerstatsinterval];
    
});

function initialize() {
    //Set the page title
    document.querySelector('.pagetitle').innerHTML = 'Function Tracker';

    //first clear the project-boxes div
    const projectsList = document.querySelector('.project-boxes');
    projectsList.innerHTML = '';

}


function loadFunctionTiles() {


}

function updateFunctionTiles() {

}

function trackerstats() {

}