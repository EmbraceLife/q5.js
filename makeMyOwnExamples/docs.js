/**
 * Documentation System for Nature of Code examples
 * This file handles the main functionality of the documentation system:
 * - Navigation
 * - Content display
 * - Initialization of interactive examples
 */

// Current state tracking
let currentSectionId = '';
let miniEditors = [];

// DOM Elements
const navbar = document.getElementById('navbar');
const content = document.getElementById('content');
const toggleNavButton = document.getElementById('toggleNavButton');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const searchResultsContainer = document.getElementById('searchResultsContainer');

/**
 * Initialize the application
 */
function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Populate the navigation
    populateNavigation();
    
    // Check for hash in URL and navigate to that section
    const hash = location.hash.slice(1);
    if (hash) {
        navigateTo(findSectionFromHash(hash));
    } else {
        // Default to first section
        navigateTo(Object.keys(examples)[0]);
    }
    
    // Set initial theme based on user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
}

/**
 * Set up event listeners for various UI elements
 */
function setupEventListeners() {
    // Toggle sidebar
    toggleNavButton.addEventListener('click', () => {
        navbar.classList.toggle('navclose');
    });
    
    // Toggle theme
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
    
    // Handle URL hash changes
    window.addEventListener('hashchange', () => {
        const hash = location.hash.slice(1);
        if (hash) {
            navigateTo(findSectionFromHash(hash));
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
            navbar.classList.add('navclose');
        } else {
            navbar.classList.remove('navclose');
        }
    });
    
    // Handle search
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchInput.addEventListener('focus', () => {
        searchResultsContainer.style.display = 'block';
    });
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchResultsContainer.style.display = 'none';
        }, 200);
    });
}

/**
 * Populate the navigation sidebar with sections and subsections
 */
function populateNavigation() {
    navbar.innerHTML = '';
    
    // Create nav items for each section
    for (const [sectionId, section] of Object.entries(examples)) {
        // Create section link
        const sectionLink = document.createElement('a');
        sectionLink.textContent = section.title;
        sectionLink.href = `#${sectionId}`;
        sectionLink.classList.add('section-link');
        sectionLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(sectionId);
        });
        
        // Create toggle button for section
        const toggleButton = document.createElement('span');
        toggleButton.className = 'toggle-button';
        toggleButton.textContent = '▼';
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const subsectionsContainer = e.target.parentNode.nextElementSibling;
            if (subsectionsContainer.style.display === 'block') {
                subsectionsContainer.style.display = 'none';
                e.target.textContent = '▼';
            } else {
                subsectionsContainer.style.display = 'block';
                e.target.textContent = '▲';
            }
        });
        sectionLink.appendChild(toggleButton);
        
        // Create subsections container
        const subsectionsContainer = document.createElement('div');
        subsectionsContainer.className = 'subsections-container';
        
        // Create subsection links
        if (section.subsections) {
            for (const [subsectionId, subsection] of Object.entries(section.subsections)) {
                const subsectionLink = document.createElement('a');
                subsectionLink.textContent = subsection.title;
                subsectionLink.href = `#${subsectionId}`;
                subsectionLink.classList.add('subsection-link');
                subsectionLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigateToSubsection(sectionId, subsectionId);
                });
                subsectionsContainer.appendChild(subsectionLink);
            }
        }
        
        // Add to navbar
        navbar.appendChild(sectionLink);
        navbar.appendChild(subsectionsContainer);
    }
}

/**
 * Navigate to a specific section
 * @param {string} sectionId - The ID of the section to navigate to
 */
function navigateTo(sectionId) {
    if (!examples[sectionId]) {
        console.error('Section not found:', sectionId);
        return;
    }
    
    // Update active section in navbar
    updateActiveSection(sectionId);
    
    // Update URL hash
    history.pushState(null, null, `#${sectionId}`);
    
    // Display section content
    displayContent(sectionId);
    
    // Update the current section ID
    currentSectionId = sectionId;
}

/**
 * Navigate to a specific subsection
 * @param {string} sectionId - The ID of the parent section
 * @param {string} subsectionId - The ID of the subsection to navigate to
 */
function navigateToSubsection(sectionId, subsectionId) {
    navigateTo(sectionId);
    
    // Scroll to subsection
    setTimeout(() => {
        const element = document.getElementById(subsectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
    
    // Update URL hash
    history.pushState(null, null, `#${subsectionId}`);
}

/**
 * Find the section ID from a hash
 * @param {string} hash - The URL hash
 * @returns {string} - The section ID
 */
function findSectionFromHash(hash) {
    // If the hash directly matches a section ID, return it
    if (examples[hash]) {
        return hash;
    }
    
    // Otherwise, look for a subsection match
    for (const [sectionId, section] of Object.entries(examples)) {
        if (section.subsections && section.subsections[hash]) {
            return sectionId;
        }
    }
    
    // Default to the first section if no match is found
    return Object.keys(examples)[0];
}

/**
 * Update the active section in the navigation
 * @param {string} sectionId - The ID of the active section
 */
function updateActiveSection(sectionId) {
    // Remove active class from all section links
    document.querySelectorAll('.section-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current section link
    const sectionLink = document.querySelector(`.section-link[href="#${sectionId}"]`);
    if (sectionLink) {
        sectionLink.classList.add('active');
        
        // Show subsections
        const subsectionsContainer = sectionLink.nextElementSibling;
        if (subsectionsContainer) {
            subsectionsContainer.style.display = 'block';
            sectionLink.querySelector('.toggle-button').textContent = '▲';
        }
    }
}

/**
 * Display the content for a section
 * @param {string} sectionId - The ID of the section to display
 */
function displayContent(sectionId) {
    // Get section content
    const section = examples[sectionId];
    
    // Clear current content
    content.innerHTML = '';
    
    // Add the section content
    content.innerHTML = section.content;
    
    // Initialize all mini-editors
    initMiniEditors();
}

/**
 * Initialize all mini-editors found in the content
 */
function initMiniEditors() {
    // Clear previous editors
    miniEditors = [];
    
    // Find all script elements with type=mini
    const scriptElements = document.querySelectorAll('script[type="mini"]');
    
    // Create a mini-editor for each script element
    scriptElements.forEach(async (scriptEl) => {
        const editor = new MiniEditor(scriptEl);
        await editor.init();
        miniEditors.push(editor);
    });
}

/**
 * Handle search input
 */
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        searchResultsContainer.style.display = 'none';
        return;
    }
    
    searchResultsContainer.innerHTML = '';
    searchResultsContainer.style.display = 'block';
    
    // Search in sections and subsections
    const results = [];
    
    for (const [sectionId, section] of Object.entries(examples)) {
        // Search in section title
        if (section.title.toLowerCase().includes(query)) {
            results.push({
                id: sectionId,
                title: section.title,
                type: 'section'
            });
        }
        
        // Search in subsections
        if (section.subsections) {
            for (const [subsectionId, subsection] of Object.entries(section.subsections)) {
                if (subsection.title.toLowerCase().includes(query)) {
                    results.push({
                        id: subsectionId,
                        title: `${section.title} > ${subsection.title}`,
                        type: 'subsection',
                        parentId: sectionId
                    });
                }
            }
        }
    }
    
    // Display results
    if (results.length === 0) {
        searchResultsContainer.innerHTML = '<div class="search-result">No results found</div>';
    } else {
        results.forEach(result => {
            const resultEl = document.createElement('div');
            resultEl.className = 'search-result';
            resultEl.textContent = result.title;
            resultEl.addEventListener('click', () => {
                if (result.type === 'section') {
                    navigateTo(result.id);
                } else {
                    navigateToSubsection(result.parentId, result.id);
                }
                searchInput.value = '';
                searchResultsContainer.style.display = 'none';
            });
            searchResultsContainer.appendChild(resultEl);
        });
    }
}

/**
 * Set the theme of the application
 * @param {string} theme - The theme to set ('light' or 'dark')
 */
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
}

/**
 * Create a debounced function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 