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
                        ${Object.keys(categoryData).map(setting => `
                            <div class="settings-item">
                                <span class="settings-item-name">${setting}</span>
                                <span class="settings-item-value ${setting}">${categoryData[setting]}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                settingsBox.appendChild(categoryTile);
            });
        });
}

function updateSettings() {
    // Fetch the latest settings data from the local file
    fetch('/static/settings/settings.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Loop through the settings data and update the corresponding tiles
            Object.keys(data.settings).forEach(category => {
                const categoryData = data.settings[category];
                const categoryTiles = document.querySelectorAll('.settings-category-tile h3');
                const categoryTile = Array.from(categoryTiles).find(tile => tile.textContent.trim() === category)?.closest('.settings-category-tile');
                if (categoryTile) {
                    const categoryContent = categoryTile.querySelector('.settings-category-content');
                    Object.keys(categoryData).forEach(setting => {
                        const settingItems = categoryContent.querySelectorAll('.settings-item .settings-item-name');
                        const settingItem = Array.from(settingItems).find(item => item.textContent.trim() === setting)?.closest('.settings-item');
                        if (settingItem) {
                            const settingValue = settingItem.querySelector('.settings-item-value');
                            if (settingValue.innerHTML !== categoryData[setting]) {
                                settingValue.innerHTML = categoryData[setting];
                            }
                        }
                    });
                }
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
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