
// On load CLEAR the projects section
document.querySelector(".project-boxes").innerHTML = "";
window.intervals = []; 

document.addEventListener('DOMContentLoaded', () => {
    //first clear the project-boxes div
    const projectsList = document.querySelector('.project-boxes');
    projectsList.innerHTML = '';

    
    let loadtilesinterval = setInterval(loadLoopTiles, 1000);
    let updatetilesinterval = setInterval(updateLoopTiles, 100);
    let trackerstatsinterval = setInterval(trackerstats, 100);
    window.intervals = [loadtilesinterval, updatetilesinterval, trackerstatsinterval];
    
});

function initialize() {
    const projectsList = document.querySelector('.project-boxes');
    projectsList.innerHTML = '';

}
