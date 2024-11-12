// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    initialize();
});

// This function initializes the search bar functionality
function startSearchbar() {
    // Implement search bar functionality if needed
}

// This function initializes the settings page
function initialize() {
    loadSettingsHeader();
    // Clear the project-boxes div
    document.querySelector('.project-boxes').innerHTML = '';
    loadSettings();
    // Initialize an empty array for intervals
    window.intervals = [];
    startSearchbar();
}

// This function loads the settings header
function loadSettingsHeader() {
    document.querySelector('.pagetitle').innerHTML = 'Settings';
    // Hide unnecessary sections
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

// This function loads the settings from the server or local storage
function loadSettings() {
    fetch('/settings')
        .then(response => response.json())
        .then(data => {
            // Clear the existing settings tiles
            const settingsBox = document.querySelector('.project-boxes');
            settingsBox.innerHTML = '';

            // Loop through the settings data and create a tile for each setting
            Object.keys(data.settings).forEach(category => {
                const categoryData = data.settings[category];
                const categoryTile = document.createElement('div');
                categoryTile.classList.add("settings-category-tile");
                categoryTile.setAttribute('data-category', `${category}`);
                categoryTile.innerHTML = `
                    <div class="settings-category-header">
                        <h1>${category}</h1>
                    </div>
                    <div class="settings-category-content">
                        ${Object.keys(categoryData).map(setting => {
                            const settingData = categoryData[setting];
                            const value = settingData.value;
                            const type = settingData.type;
                            const fieldtext = settingData.fieldtext;
                            console.log('Setting:', setting, 'Value:', value, 'Type:', type, 'Fieldtext:', fieldtext);
                            
                            // Render different input types based on the setting type
                            if (type === 'bool') {
                                return `
                                    <div class="settings-item">
                                        <span class="settings-item-name" id="${setting}">${fieldtext}</span>
                                        <input type="checkbox" class="settings-item-value checkbox" ${value ? 'checked' : ''}>
                                    </div>
                                `;
                            } else if (type === 'list') {
                                return `
                                    <div class="settings-item">
                                        <span class="settings-item-name" id="${setting}">${fieldtext}</span>
                                        <select class="settings-item-value select-input">
                                            ${settingData.options.map(option => `
                                                <option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div class="settings-item">
                                        <span class="settings-item-name" id="${setting}">${fieldtext}</span>
                                        <input type="text" class="settings-item-value text-input" value="${value}">
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

// This function detects changes in the settings inputs and updates the server
function detectChanges() {
    // Select all checkbox inputs
    const checkboxes = document.querySelectorAll('input[type="checkbox"].settings-item-value');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            // Fetch the settings and update the value of the checkbox
            fetch('/settings')
                .then(response => response.json())
                .then(data => {
                    const category = checkbox.closest('.settings-category-tile').getAttribute('data-category');
                    const setting = checkbox.previousElementSibling.id;
                    console.log('Category:', category, 'Setting:', setting, 'Value:', checkbox.checked);
                    data.settings[category][setting].value = checkbox.checked;
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
            // Fetch the settings and update the value of the text input
            fetch('/settings')
                .then(response => response.json())
                .then(data => {
                    const category = textInput.closest('.settings-category-tile').getAttribute('data-category');
                    const setting = textInput.previousElementSibling.id;
                    console.log('Category:', category, 'Setting:', setting, 'Value:', textInput.value);

                    // Typecast the value to an integer
                    const typedValue = parseInt(textInput.value, 10);

                    data.settings[category][setting].value = typedValue;
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

    // Select all select inputs
    const selectInputs = document.querySelectorAll('.settings-item-value.select-input');
    selectInputs.forEach(selectInput => {
        selectInput.addEventListener('change', (event) => {
            // Fetch the settings and update the value of the select input
            fetch('/settings')
                .then(response => response.json())
                .then(data => {
                    const category = selectInput.closest('.settings-category-tile').getAttribute('data-category');
                    const setting = selectInput.previousElementSibling.id;
                    data.settings[category][setting].value = selectInput.value;
                    console.log('Category:', category, 'Setting:', setting, 'Value:', selectInput.value);
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