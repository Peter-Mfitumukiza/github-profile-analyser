const UI = {
    elements: {
        usernameInput: null,
        analyzeBtn: null,
        loadingState: null,
        mainContent: null,
        errorMessage: null,
        profileSection: null,
        rateLimit: null
    },

    init() {
        // Cache DOM elements
        this.elements.usernameInput = document.getElementById('usernameInput');
        this.elements.analyzeBtn = document.getElementById('analyzeBtn');
        this.elements.loadingState = document.getElementById('loadingState');
        this.elements.mainContent = document.getElementById('mainContent');
        this.elements.errorMessage = document.getElementById('errorMessage');
        this.elements.profileSection = document.getElementById('profileSection');
        this.elements.rateLimit = document.getElementById('rateLimit');
    },

    showLoading() {
        this.hideError();
        this.elements.loadingState.style.display = 'flex';
        this.elements.mainContent.style.display = 'none';
    },

    hideLoading() {
        this.elements.loadingState.style.display = 'none';
    },

    showContent() {
        this.elements.mainContent.style.display = 'block';
        this.elements.mainContent.classList.add('fade-in');
    },

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        this.hideLoading();
    },

    hideError() {
        this.elements.errorMessage.style.display = 'none';
    },

    updateRateLimit(remaining, limit) {
        const rateLimitElement = document.getElementById('rateLimitRemaining');
        const rateLimitContainer = document.getElementById('rateLimit');

        if (rateLimitElement && rateLimitContainer) {
            rateLimitElement.textContent = remaining;
            rateLimitContainer.style.display = 'block';

            // Change color based on remaining calls
            if (remaining < 10) {
                rateLimitElement.style.color = 'var(--error)';
            } else if (remaining < 30) {
                rateLimitElement.style.color = 'var(--warning)';
            } else {
                rateLimitElement.style.color = 'var(--success)';
            }
        }
    },

    displayUserProfile(user) {
        // Avatar
        const avatar = document.getElementById('userAvatar');
        avatar.src = user.avatar_url;
        avatar.alt = `${user.login}'s avatar`;

        // Basic info
        document.getElementById('userName').textContent = user.name || user.login;
        document.getElementById('userBio').textContent = user.bio || 'No bio provided';

        // Stats
        document.getElementById('publicRepos').textContent = user.public_repos;
        document.getElementById('followers').textContent = user.followers;
        document.getElementById('following').textContent = user.following;

        // Meta information
        const company = document.getElementById('userCompany');
        const location = document.getElementById('userLocation');
        const website = document.getElementById('userWebsite');

        if (user.company) {
            company.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-3"/>
                <rect x="9" y="9" width="4" height="4"/>
                <rect x="9" y="14" width="4" height="4"/>
            </svg> ${user.company}`;
        }

        if (user.location) {
            location.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg> ${user.location}`;
        }

        if (user.blog) {
            const blogUrl = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
            website.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg> <a href="${blogUrl}" target="_blank" rel="noopener">${user.blog}</a>`;
        }
    },

    displayStats(stats) {
        document.getElementById('totalStars').textContent = stats.totalStars.toLocaleString();
        document.getElementById('totalForks').textContent = stats.totalForks.toLocaleString();
        document.getElementById('totalWatchers').textContent = stats.totalWatchers.toLocaleString();
        document.getElementById('avgStars').textContent = stats.avgStars.toLocaleString();
    },

    displayRepositories(repos, languages) {
        const grid = document.getElementById('repositoriesGrid');
        grid.innerHTML = '';

        // Update language filter
        this.updateLanguageFilter(languages);

        repos.forEach(repo => {
            const card = this.createRepoCard(repo);
            grid.appendChild(card);
        });
    },

    createRepoCard(repo) {
        const card = document.createElement('div');
        card.className = 'repo-card';
        card.dataset.language = repo.language || '';
        card.dataset.stars = repo.stargazers_count;
        card.dataset.forks = repo.forks_count;
        card.dataset.updated = repo.updated_at;

        const languageColor = this.getLanguageColor(repo.language);

        card.innerHTML = `
            <div class="repo-header">
                <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-name">
                    ${repo.name}
                </a>
                ${repo.private ? '<span class="repo-visibility">Private</span>' : ''}
            </div>
            ${repo.description ? `<p class="repo-description">${this.escapeHtml(repo.description)}</p>` : ''}
            ${repo.language ? `
                <div class="repo-language">
                    <span class="repo-language-dot" style="background: ${languageColor}"></span>
                    ${repo.language}
                </div>
            ` : ''}
            <div class="repo-stats">
                <span class="repo-stat">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                    </svg>
                    ${repo.stargazers_count}
                </span>
                <span class="repo-stat">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
                    </svg>
                    ${repo.forks_count}
                </span>
                ${repo.open_issues_count > 0 ? `
                    <span class="repo-stat">
                        <svg viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
                        </svg>
                        ${repo.open_issues_count}
                    </span>
                ` : ''}
            </div>
        `;

        return card;
    },

    updateLanguageFilter(languages) {
        const filter = document.getElementById('languageFilter');
        filter.innerHTML = '<option value="all">All Languages</option>';

        Object.keys(languages).forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = `${lang} (${languages[lang]})`;
            filter.appendChild(option);
        });
    },

    displayLanguageStats(languages) {
        const container = document.getElementById('languageStats');
        container.innerHTML = '';

        languages.forEach(lang => {
            const item = document.createElement('div');
            item.className = 'language-item';
            item.innerHTML = `
                <span class="language-color" style="background: ${lang.color}"></span>
                <span class="language-name">${lang.name}</span>
                <span class="language-percent">${lang.percentage}%</span>
            `;
            container.appendChild(item);
        });
    },

    getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#3178c6',
            'Python': '#3572A5',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#555555',
            'C#': '#178600',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Go': '#00ADD8',
            'Swift': '#FA7343',
            'Kotlin': '#A97BFF',
            'Rust': '#dea584',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Shell': '#89e051'
        };
        return colors[language] || '#6b7280';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [name, value] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / value);
            if (interval >= 1) {
                return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    }
};