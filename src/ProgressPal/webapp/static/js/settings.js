document.addEventListener('DOMContentLoaded', () => {
    initialize();
});

// This function initializes the searchbar functionality
function startSearchbar() {
    // Implement search bar functionality if needed
}

function initialize() {
    loadSettingsHeader();
    // First clear the project-boxes div
    document.querySelector('.project-boxes').innerHTML = '';
    loadSettings();
    // Set intervals for updating settings if needed
    // let loadSettingsInterval = setInterval(loadSettings, 1000);
    // let updateSettingsInterval = setInterval(updateSettings, 100);
    window.intervals = [];
    startSearchbar();
}

function loadSettingsHeader() {
    document.querySelector('.pagetitle').innerHTML = 'Settings';
    // Populate the header with the correct elements
    document.querySelector('.in-progress-tasks-section').style.display = 'none';
    document.querySelector('.completed-tasks-section').style.display = 'none';
    document.querySelector('.total-tasks-section').style.display = 'none';

    document.querySelector('.export-logs-button').style.display = 'none';

    // Force grid view
    document.querySelector('.list-view').style.display = 'none';
    document.querySelector('.grid-view').style.display = 'none';
    document.querySelector('.grid-view').classList.add('active');
    document.querySelector('.project-boxes').classList.remove('jsListView');
    document.querySelector('.project-boxes').classList.add('jsGridView');
}

function loadSettings() {
    // Load settings from the server or local storage
    fetch('/static/settings/settings.json')
        .then(response => response.json())
        .then(data => {
            // Clear the existing settings tiles
            const settingsBox = document.querySelector('.project-boxes');
            settingsBox.innerHTML = '';

            // Loop through the settings data and create a tile for each setting
            Object.keys(data.settings).forEach(category => {
                const categoryData = data.settings[category];
                const categoryTile = document.createElement('div');
                categoryTile.classList.add('settings-category-tile');
                categoryTile.innerHTML = `
                    <div class="settings-category-header">
                        <h1>${category}</h1>
                    </div>
                    <div class="settings-category-content">
                        ${Object.keys(categoryData).map(setting => {
                            const value = categoryData[setting];
                            if (typeof value === 'boolean') {
                                return `
                                    <div class="settings-item">
                                        <span class="settings-item-name">${setting}</span>
                                        <input type="checkbox" class="settings-item-value ${setting} checkbox" ${value ? 'checked' : ''}>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div class="settings-item">
                                        <span class="settings-item-name">${setting}</span>
                                        <input type="text" class="settings-item-value ${setting} text-input" value="${value}">
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>
                `;
                settingsBox.appendChild(categoryTile);
            });

            // Call the function to start detecting changes after settings are loaded
            detectChanges();
        });
}

// Helper function to check if an element is in the viewport
function isElementInViewport(el, margin = 700) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 - margin &&
        rect.left >= 0 - margin &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + margin &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + margin
    );
}

// Check setting updates
function detectChanges() {
    // Select all checkbox inputs
    const checkboxes = document.querySelectorAll('input[type="checkbox"].settings-item-value');
    console.log('Checkboxes:', checkboxes);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            // Open the json settings file and update the value of the checkbox
            fetch('/static/settings/settings.json')
                .then(response => response.json())
                .then(data => {
                    const category = checkbox.parentElement.parentElement.parentElement.querySelector('.settings-category-header h1').innerHTML;
                    const setting = checkbox.previousElementSibling.innerHTML;
                    data.settings[category][setting] = checkbox.checked;
                    console.log('Updated settings:', data.settings);
                    // Save the updated settings to the server
                    fetch('/update_settings', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });
                });
        });
    });

    // Select all text inputs
    const textInputs = document.querySelectorAll('.settings-item-value.text-input');
    textInputs.forEach(textInput => {
        textInput.addEventListener('input', (event) => {
            console.log(`Text input ${event.target.classList[1]} changed to ${event.target.value}`);
            // Open the json settings file and update the value of the text input
            fetch('/static/settings/settings.json')
                .then(response => response.json())
                .then(data => {
                    const category = textInput.parentElement.parentElement.parentElement.querySelector('.settings-category-header h1').innerHTML;
                    const setting = textInput.previousElementSibling.innerHTML;
                    data.settings[category][setting] = textInput.value;
                    console.log('Updated settings:', data.settings);
                    // Save the updated settings to the server
                    fetch('/update_settings', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });
                });
        });
    });
}