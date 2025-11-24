const GitHubAPI = {
    baseURL: 'https://api.github.com',
    cache: new Map(),
    cacheExpiry: 15 * 60 * 1000,

    checkCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            console.log(`Cache hit for: ${key}`);
            return cached.data;
        }
        return null;
    },

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    },

    async makeRequest(endpoint) {
        const cacheKey = endpoint;
        const cachedData = this.checkCache(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            const remaining = response.headers.get('X-RateLimit-Remaining');
            const limit = response.headers.get('X-RateLimit-Limit');
            if (remaining && limit) {
                UI.updateRateLimit(remaining, limit);
            }

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('User not found');
                } else if (response.status === 403) {
                    throw new Error('API rate limit exceeded. Please try again later.');
                }
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;

        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },

    async getUser(username) {
        return this.makeRequest(`/users/${username}`);
    },

    async getUserRepos(username, perPage = 100) {
        const repos = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const data = await this.makeRequest(`/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`);
            repos.push(...data);
            hasMore = data.length === perPage;
            page++;

            if (repos.length >= 300) break;
        }

        return repos;
    },

    async getRepoLanguages(owner, repo) {
        return this.makeRequest(`/repos/${owner}/${repo}/languages`);
    },

    async getUserEvents(username) {
        return this.makeRequest(`/users/${username}/events/public?per_page=30`);
    },

    async getAggregatedLanguages(username, repos) {
        const languageStats = {};
        const languageColors = {
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
            'Shell': '#89e051',
            'Vue': '#41b883',
            'React': '#61dafb',
            'Default': '#6b7280'
        };

        const reposWithLanguages = repos.filter(repo => repo.language);

        const topRepos = reposWithLanguages
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 30);

        for (const repo of topRepos) {
            try {
                const languages = await this.getRepoLanguages(username, repo.name);

                for (const [lang, bytes] of Object.entries(languages)) {
                    if (!languageStats[lang]) {
                        languageStats[lang] = {
                            name: lang,
                            bytes: 0,
                            color: languageColors[lang] || languageColors.Default,
                            repos: 0
                        };
                    }
                    languageStats[lang].bytes += bytes;
                    languageStats[lang].repos += 1;
                }
            } catch (error) {
                console.warn(`Failed to fetch languages for ${repo.name}:`, error);
            }
        }

        const totalBytes = Object.values(languageStats).reduce((sum, lang) => sum + lang.bytes, 0);

        for (const lang of Object.values(languageStats)) {
            lang.percentage = ((lang.bytes / totalBytes) * 100).toFixed(1);
        }

        return Object.values(languageStats)
            .sort((a, b) => b.bytes - a.bytes)
            .slice(0, 10);
    },

    calculateStats(repos) {
        const stats = {
            totalStars: 0,
            totalForks: 0,
            totalWatchers: 0,
            languages: {},
            topics: new Set(),
            mostStarred: null,
            mostForked: null,
            recentlyUpdated: []
        };

        repos.forEach(repo => {
            stats.totalStars += repo.stargazers_count;
            stats.totalForks += repo.forks_count;
            stats.totalWatchers += repo.watchers_count;

            if (repo.language) {
                stats.languages[repo.language] = (stats.languages[repo.language] || 0) + 1;
            }

            if (repo.topics) {
                repo.topics.forEach(topic => stats.topics.add(topic));
            }

            if (!stats.mostStarred || repo.stargazers_count > stats.mostStarred.stargazers_count) {
                stats.mostStarred = repo;
            }

            if (!stats.mostForked || repo.forks_count > stats.mostForked.forks_count) {
                stats.mostForked = repo;
            }
        });

        stats.avgStars = repos.length > 0 ? Math.round(stats.totalStars / repos.length) : 0;
        stats.recentlyUpdated = repos
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 5);

        return stats;
    },

    processEvents(events) {
        const processedEvents = [];
        const eventTypes = {
            'PushEvent': { icon: 'push', label: 'Pushed to' },
            'CreateEvent': { icon: 'create', label: 'Created' },
            'PullRequestEvent': { icon: 'pr', label: 'Pull request' },
            'IssuesEvent': { icon: 'issue', label: 'Issue' },
            'WatchEvent': { icon: 'star', label: 'Starred' },
            'ForkEvent': { icon: 'fork', label: 'Forked' },
            'ReleaseEvent': { icon: 'release', label: 'Released' }
        };

        events.slice(0, 10).forEach(event => {
            const eventInfo = eventTypes[event.type];
            if (eventInfo) {
                processedEvents.push({
                    type: event.type,
                    repo: event.repo.name,
                    created: new Date(event.created_at),
                    icon: eventInfo.icon,
                    label: eventInfo.label,
                    payload: event.payload
                });
            }
        });

        return processedEvents;
    },

    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }
};