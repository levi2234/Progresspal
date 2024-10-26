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