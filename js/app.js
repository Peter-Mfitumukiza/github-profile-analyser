/* ===============================================
   MAIN APPLICATION
   =============================================== */

const App = {
    currentUser: null,
    currentRepos: null,
    currentStats: null,
    currentLanguages: null,

    init() {
        console.log('Initializing GitHub Portfolio Analyzer...');

        // Initialize UI
        UI.init();

        // Set up event listeners
        this.setupEventListeners();

        // Check for URL parameter
        this.checkURLParameter();
    },

    setupEventListeners() {
        // Analyze button click
        UI.elements.analyzeBtn.addEventListener('click', () => this.analyzeProfile());

        // Enter key in input
        UI.elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.analyzeProfile();
            }
        });

        // Sort select change
        const sortSelect = document.getElementById('sortSelect');
        sortSelect.addEventListener('change', (e) => {
            this.sortRepositories(e.target.value);
        });

        // Language filter change
        const languageFilter = document.getElementById('languageFilter');
        languageFilter.addEventListener('change', (e) => {
            this.filterRepositories(e.target.value);
        });

        // Export buttons
        document.getElementById('exportJson').addEventListener('click', () => {
            Export.exportAsJSON();
        });

        document.getElementById('exportPdf').addEventListener('click', () => {
            Export.exportAsPDF();
        });
    },

    checkURLParameter() {
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('user');

        if (username) {
            UI.elements.usernameInput.value = username;
            this.analyzeProfile();
        }
    },

    async analyzeProfile() {
        const username = UI.elements.usernameInput.value.trim();

        if (!username) {
            UI.showError('Please enter a GitHub username');
            return;
        }

        // Reset previous data
        this.resetData();

        // Show loading state
        UI.showLoading();

        try {
            // Fetch user data
            console.log(`Fetching data for user: ${username}`);
            this.currentUser = await GitHubAPI.getUser(username);

            // Fetch repositories
            this.currentRepos = await GitHubAPI.getUserRepos(username);

            // Calculate statistics
            this.currentStats = GitHubAPI.calculateStats(this.currentRepos);

            // Fetch language statistics
            this.currentLanguages = await GitHubAPI.getAggregatedLanguages(username, this.currentRepos);

            // Display all data
            this.displayData();

            // Store data for export
            Export.setData({
                user: this.currentUser,
                repos: this.currentRepos,
                stats: this.currentStats,
                languages: this.currentLanguages
            });

            // Update URL
            this.updateURL(username);

            // Hide loading and show content
            UI.hideLoading();
            UI.showContent();

        } catch (error) {
            console.error('Error analyzing profile:', error);
            UI.showError(error.message || 'Failed to analyze profile. Please try again.');
        }
    },

    displayData() {
        // Display user profile
        UI.displayUserProfile(this.currentUser);

        // Display statistics
        UI.displayStats(this.currentStats);

        // Display repositories
        UI.displayRepositories(this.currentRepos, this.currentStats.languages);

        // Display language chart
        if (this.currentLanguages.length > 0) {
            Charts.createLanguageChart(this.currentLanguages);
            UI.displayLanguageStats(this.currentLanguages);
        }
    },

    sortRepositories(sortBy) {
        let sorted = [...this.currentRepos];

        switch (sortBy) {
            case 'stars':
                sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
                break;
            case 'forks':
                sorted.sort((a, b) => b.forks_count - a.forks_count);
                break;
            case 'updated':
                sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                break;
            case 'created':
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        const grid = document.getElementById('repositoriesGrid');
        grid.innerHTML = '';
        sorted.forEach(repo => {
            const card = UI.createRepoCard(repo);
            grid.appendChild(card);
        });

        // Apply current filter
        const languageFilter = document.getElementById('languageFilter').value;
        if (languageFilter !== 'all') {
            this.filterRepositories(languageFilter);
        }
    },

    filterRepositories(language) {
        const cards = document.querySelectorAll('.repo-card');

        cards.forEach(card => {
            if (language === 'all') {
                card.style.display = 'flex';
            } else {
                const cardLanguage = card.dataset.language;
                card.style.display = cardLanguage === language ? 'flex' : 'none';
            }
        });
    },

    updateURL(username) {
        const url = new URL(window.location);
        url.searchParams.set('user', username);
        window.history.pushState({}, '', url);
    },

    resetData() {
        this.currentUser = null;
        this.currentRepos = null;
        this.currentStats = null;
        this.currentLanguages = null;
        Charts.destroyCharts();
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }

    .export-toast {
        animation: slideIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);