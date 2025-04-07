// --- DOM Elements ---
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarNav = document.getElementById('sidebar-nav');
const menuContent = document.getElementById('menu-content');
const searchInput = document.getElementById('search-input');
const clearSearchButton = document.getElementById('clear-search');

// --- Global Variable for Menu Data ---
let menuData = {}; // Initialize as empty object

// --- Functions ---

function toggleSidebar() {
    sidebar.classList.toggle('-translate-x-full');
    sidebarOverlay.classList.toggle('hidden');
}

/**
 * Helper function to escape HTML characters
 * @param {string} str - The string to escape
 * @returns {string} - The escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    // Basic escaping, consider a more robust library for production
    return String(str).replace(/[&<>"']/g, function(match) {
        return {
            '&': '&amp;', '<': '<', '>': '>', '"': '"', "'": '&#39;'
        }[match];
    });
}

/**
 * Toggles the visibility of the details section for a menu item.
 * @param {string} detailsId - The unique ID of the details div to toggle.
 */
function toggleItemDetails(detailsId) {
    const detailsDiv = document.getElementById(detailsId);
    const itemContainer = detailsDiv ? detailsDiv.closest('.menu-item-container') : null;
    if (itemContainer) {
        itemContainer.classList.toggle('details-visible');
    }
}

/**
 * Creates HTML for a single menu item (minimalist, expandable).
 * @param {object} item - The menu item object.
 * @param {string} categoryKey - The key of the category (e.g., 'breakfast').
 * @param {number} itemIndex - The index of the item within its section.
 * @param {number} sectionIndex - The index of the section within its category.
 * @returns {string} - HTML string for the item.
 */
function createItemHtml(item, categoryKey, itemIndex, sectionIndex) {
    const detailsId = `details-${categoryKey}-${sectionIndex}-${itemIndex}`; // Unique ID for details div
    // Check if there are *any* details to warrant the expand functionality
    const hasDetails = item.description || item.tagline || item.type || item.brewery || item.producer || item.variety || item.region || item.vintage || item.tastingNotes || item.about || item.farming || (item.allergens && item.allergens !== '(None marked)' && item.allergens !== '(Not available)') || item.dietaryInfo || item.note || item.subName;

    let html = `<div class="menu-item-container border-b border-gray-200 last:border-b-0">`; // Container for item + details

    // Clickable Header Part
    // Add 'has-details' class if expandable for potential styling
    const headerClasses = `menu-item flex items-center justify-between p-3 ${hasDetails ? 'cursor-pointer hover:bg-gray-100' : ''}`;
    const clickHandler = hasDetails ? `onclick="toggleItemDetails('${detailsId}')" onkeydown="if(event.key === 'Enter' || event.key === ' ') { toggleItemDetails('${detailsId}'); event.preventDefault(); }"` : '';
    const tabIndex = hasDetails ? 'tabindex="0"' : ''; // Make it focusable only if clickable

    html += `<div role="${hasDetails ? 'button' : 'listitem'}" ${tabIndex} class="${headerClasses}" ${clickHandler}>`;
        // Left side: Name only
        html += `<div class="flex-1 mr-4">`;
            html += `<h4 class="text-md font-medium text-gray-800">${escapeHtml(item.name) || 'Unnamed Item'}</h4>`;
        html += `</div>`;

        // Right side: Price/ABV and Chevron
        html += `<div class="flex items-center flex-shrink-0">`;
            if (item.price) {
                html += `<span class="text-sm font-semibold text-gray-700 mr-3">${escapeHtml(item.price)}</span>`;
            } else if (item.abv) {
                 html += `<span class="text-xs font-medium text-gray-500 mr-3">ABV: ${escapeHtml(item.abv)}</span>`;
            }
            // Add chevron only if there are details to show
            if (hasDetails) {
                html += `<svg class="chevron-icon text-gray-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
            }
        html += `</div>`;
    html += `</div>`; // Close menu-item header

    // Hidden Details Part
    if (hasDetails) {
        html += `<div id="${detailsId}" class="item-details px-3 pb-3 text-sm text-gray-700 space-y-1">`; // Added space-y-1

        // --- ADDED SubName and Tagline here ---
        if (item.subName) html += `<p class="text-xs text-gray-500 italic mb-1">${escapeHtml(item.subName)}</p>`;
        if (item.tagline) html += `<p class="text-sm text-blue-600 font-medium mb-1">${escapeHtml(item.tagline)}</p>`;
        // --- End of moved SubName/Tagline ---

        // Add other details based on available properties
        if (item.type) html += `<p><span class="font-medium text-gray-600">Type:</span> ${escapeHtml(item.type)}</p>`;
        if (item.brewery) html += `<p><span class="font-medium text-gray-600">Brewery:</span> ${escapeHtml(item.brewery)}</p>`;
        if (item.producer) html += `<p><span class="font-medium text-gray-600">Producer:</span> ${escapeHtml(item.producer)}</p>`;
        if (item.variety) html += `<p><span class="font-medium text-gray-600">Variety:</span> ${escapeHtml(item.variety)}</p>`;
        if (item.region) html += `<p><span class="font-medium text-gray-600">Region:</span> ${escapeHtml(item.region)}</p>`;
        if (item.vintage) html += `<p><span class="font-medium text-gray-600">Vintage:</span> ${escapeHtml(item.vintage)}</p>`;

        if (item.description) html += `<p class="mt-1">${escapeHtml(item.description).replace(/\n/g, '<br>')}</p>`;
        if (item.tastingNotes) html += `<p class="mt-1"><span class="font-medium text-gray-600">Tasting Notes:</span> ${escapeHtml(item.tastingNotes)}</p>`;
        if (item.about) html += `<p class="text-xs text-gray-500 mt-1"><span class="font-medium">About:</span> ${escapeHtml(item.about)}</p>`;
        if (item.farming) html += `<p class="text-xs text-gray-500 mt-1"><span class="font-medium">Farming:</span> ${escapeHtml(item.farming)}</p>`;

        // Allergens and Dietary Info
        let infoHtml = '';
         if (item.allergens && item.allergens !== '(None marked)' && item.allergens !== '(Not available)') { // Check if allergens info is meaningful
             infoHtml += `<span class="inline-block bg-red-100 text-red-800 text-xs font-medium mr-2 mb-1 px-2.5 py-0.5 rounded-full">Allergens: ${escapeHtml(item.allergens)}</span>`;
         }
         if (item.dietaryInfo && item.dietaryInfo !== '(None marked)') { // Check if dietary info is meaningful
             infoHtml += `<span class="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 mb-1 px-2.5 py-0.5 rounded-full">Dietary: ${escapeHtml(item.dietaryInfo)}</span>`;
         }
         if (infoHtml) {
             html += `<div class="mt-2">${infoHtml}</div>`;
         }
         if (item.note) html += `<p class="text-xs text-purple-700 font-medium mt-2">Note: ${escapeHtml(item.note)}</p>`;

        html += `</div>`; // Close item-details
    }

    html += `</div>`; // Close menu-item-container
    return html;
}

/**
 * Displays the menu for a given category. Requires menuData to be loaded.
 * @param {string} categoryKey - The key of the category to display.
 */
function displayMenu(categoryKey) {
    if (!menuData || Object.keys(menuData).length === 0) {
        menuContent.innerHTML = '<p class="text-yellow-600">Menu data is loading...</p>';
        return;
    }
    const categoryData = menuData[categoryKey];
    if (!categoryData) {
        menuContent.innerHTML = '<p class="text-red-500">Error: Menu data not found for this category.</p>';
        return;
    }

    // Main title and subtitle
    let contentHtml = `<h2 class="text-2xl font-bold text-gray-800 mb-1">${escapeHtml(categoryData.title)}</h2>`;
    if (categoryData.subtitle) {
        contentHtml += `<p class="text-sm text-gray-500 mb-5">${escapeHtml(categoryData.subtitle)}</p>`;
    }

    // Sections and items
    if (categoryData.sections && categoryData.sections.length > 0) {
        categoryData.sections.forEach((section, sectionIndex) => {
            contentHtml += `<div class="mb-6">`; // Section container
            contentHtml += `<h3 class="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-300 pb-2">${escapeHtml(section.title)}</h3>`;
            if (section.items && section.items.length > 0) {
                 // Use a simple div container for list items
                contentHtml += `<div class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">`;
                section.items.forEach((item, itemIndex) => {
                    // Pass indices for unique ID generation
                    contentHtml += createItemHtml(item, categoryKey, itemIndex, sectionIndex);
                });
                contentHtml += `</div>`; // Close list container
            } else {
                contentHtml += '<p class="text-sm text-gray-500 italic">No items in this section.</p>';
            }
             contentHtml += `</div>`; // Close section container
        });
    } else {
        contentHtml += '<p class="text-sm text-gray-500 italic">No sections found for this menu.</p>';
    }

    menuContent.innerHTML = contentHtml;
    menuContent.scrollTop = 0; // Scroll to top

    // Update active state in sidebar
    document.querySelectorAll('.sidebar-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === categoryKey) {
            btn.classList.add('active');
        }
    });
}

/**
 * Filters and displays items based on the search term across all menus. Requires menuData to be loaded.
 * @param {string} searchTerm - The term to search for.
 */
function filterItems(searchTerm) {
    if (!menuData || Object.keys(menuData).length === 0) {
        menuContent.innerHTML = '<p class="text-yellow-600">Menu data is loading...</p>';
        return;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    let resultsHtml = '';
    let count = 0;

    if (!lowerCaseSearchTerm) {
        menuContent.innerHTML = '<div class="text-center text-gray-500">Select a category from the sidebar or use the search bar.</div>';
        document.querySelectorAll('.sidebar-button').forEach(btn => btn.classList.remove('active'));
        return;
    }

    // No section grouping in search results for simplicity now
    Object.keys(menuData).forEach(categoryKey => {
        const category = menuData[categoryKey];
        if (category.sections) {
            category.sections.forEach((section, sectionIndex) => {
                if (section.items) {
                    section.items.forEach((item, itemIndex) => {
                        // Check multiple fields
                        const nameMatch = item.name && item.name.toLowerCase().includes(lowerCaseSearchTerm);
                        const descMatch = item.description && item.description.toLowerCase().includes(lowerCaseSearchTerm);
                        const taglineMatch = item.tagline && item.tagline.toLowerCase().includes(lowerCaseSearchTerm);
                        const typeMatch = item.type && item.type.toLowerCase().includes(lowerCaseSearchTerm);
                        const varietyMatch = item.variety && item.variety.toLowerCase().includes(lowerCaseSearchTerm);
                        const tastingMatch = item.tastingNotes && item.tastingNotes.toLowerCase().includes(lowerCaseSearchTerm);
                        const allergenMatch = item.allergens && item.allergens.toLowerCase().includes(lowerCaseSearchTerm);
                        const dietaryMatch = item.dietaryInfo && item.dietaryInfo.toLowerCase().includes(lowerCaseSearchTerm);
                        const subNameMatch = item.subName && item.subName.toLowerCase().includes(lowerCaseSearchTerm); // Also search subName

                        if (nameMatch || descMatch || taglineMatch || typeMatch || varietyMatch || tastingMatch || allergenMatch || dietaryMatch || subNameMatch) {
                            resultsHtml += createItemHtml(item, categoryKey, itemIndex, sectionIndex);
                            count++;
                        }
                    });
                }
            });
        }
    });


    if (count > 0) {
         // Wrap results in the white container for consistency
         const resultsContainer = `<div class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">${resultsHtml}</div>`;
         menuContent.innerHTML = `<h2 class="text-xl font-bold text-gray-800 mb-4">Search Results (${count}) for "${escapeHtml(searchTerm)}"</h2>${resultsContainer}`;
    } else {
        menuContent.innerHTML = `<p class="text-center text-gray-500">No items found matching "${escapeHtml(searchTerm)}".</p>`;
    }
    menuContent.scrollTop = 0; // Scroll to top
    document.querySelectorAll('.sidebar-button').forEach(btn => btn.classList.remove('active'));
}


/**
 * Populates the sidebar navigation. Requires menuData to be loaded.
 */
function populateSidebar() {
    if (!menuData || Object.keys(menuData).length === 0) {
        console.error("Sidebar cannot be populated: Menu data not loaded yet.");
        sidebarNav.innerHTML = '<p class="text-xs text-red-500 p-2">Error loading menu categories.</p>';
        return;
    }
    const categoryMap = {
        breakfast: { name: "Breakfast", icon: "coffee" },
        dinner: { name: "Dinner", icon: "utensils-crossed" },
        beers: { name: "Beers & Ciders", icon: "beer" },
        cocktails: { name: "Cocktails", icon: "martini" },
        wines: { name: "Wines", icon: "grape" },
        ird: { name: "In-Room Dining", icon: "concierge-bell" },
        sh: { name: "Side Hustle", icon: "flame" }
    };

    let navHtml = '';
    Object.keys(menuData).forEach(key => {
         const categoryInfo = categoryMap[key] || { name: key.charAt(0).toUpperCase() + key.slice(1), icon: "book-open" };
        navHtml += `
            <button data-category="${key}" class="sidebar-button w-full text-left px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 ease-in-out flex items-center text-sm font-medium">
                 <svg class="sidebar-icon text-gray-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#${categoryInfo.icon}" /></svg>
                <span>${escapeHtml(categoryInfo.name)}</span>
            </button>
        `;
    });
    sidebarNav.innerHTML = navHtml;

    // Add event listeners for sidebar buttons
    document.querySelectorAll('.sidebar-button').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            searchInput.value = ''; // Clear search when category changes
            displayMenu(category);
            // Close sidebar on mobile after selection
            if (window.innerWidth < 768 && !sidebar.classList.contains('-translate-x-full')) {
                toggleSidebar();
            }
        });
    });
}

/**
 * Fetches menu data and initializes the application.
 */
async function initializeApp() {
    try {
        const response = await fetch('menu-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        menuData = await response.json();

        // Now that data is loaded, populate sidebar and display default menu
        populateSidebar();
        lucide.createIcons(); // Initialize Lucide icons used in sidebar
        displayMenu('ird'); // Display the In-Room Dining menu by default

        // Setup event listeners that depend on the DOM being ready
        if (menuToggle && sidebar && sidebarOverlay) {
            menuToggle.addEventListener('click', toggleSidebar);
            sidebarOverlay.addEventListener('click', toggleSidebar); // Close sidebar when overlay is clicked
        }

        searchInput.addEventListener('input', (e) => {
            filterItems(e.target.value);
        });

        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            filterItems('');
        });

    } catch (error) {
        console.error("Failed to load menu data:", error);
        menuContent.innerHTML = '<p class="text-red-600 font-bold text-center p-4">Error: Could not load menu data. Please try refreshing the page.</p>';
        sidebarNav.innerHTML = '<p class="text-xs text-red-500 p-2">Error loading categories.</p>';
    }
}

// --- Initialization ---
// Use DOMContentLoaded to ensure basic DOM elements are ready for manipulation
// The actual app logic (sidebar population, menu display) runs after data fetch
document.addEventListener('DOMContentLoaded', initializeApp);