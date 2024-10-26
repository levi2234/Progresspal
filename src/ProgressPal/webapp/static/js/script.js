document.addEventListener('DOMContentLoaded', () => {
    console.log("Hello from JavaScript!");
});

function shutdown() {
    fetch('/shutdown', { method: 'GET' })
        .then(response => response.json())
        .then(data => alert(data.message));
}

const taskId = 1;

function fetchProgress() {
    fetch(`/get_progress/${taskId}`)
        .then(response => response.json())
        .then(data => {
            if (data.progress !== undefined) {
                document.getElementById("progress").innerText = `Progress: ${data.progress}%`;
            }
        });}

        document.addEventListener('DOMContentLoaded', function () {
            var modeSwitch = document.querySelector('.mode-switch');
          
            modeSwitch.addEventListener('click', function () {                     document.documentElement.classList.toggle('dark');
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
            
            document.querySelector('.messages-btn').addEventListener('click', function () {
              document.querySelector('.messages-section').classList.add('show');
            });
            
            document.querySelector('.messages-close').addEventListener('click', function() {
              document.querySelector('.messages-section').classList.remove('show');
            });
          });