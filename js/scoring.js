const DeveloperScoring = {
    benchmarks: {
        avgStarsPerRepo: 5,
        avgFollowers: 50,
        avgRepos: 30,
        avgLanguages: 4,
        avgAccountAge: 3,
        topPercentileStars: 1000,
        topPercentileForks: 500
    },

    calculateScore(user, repos, stats, languages, events) {
        const scores = {
            impact: this.calculateImpactScore(stats, repos),
            expertise: this.calculateExpertiseScore(user, languages, repos),
            consistency: this.calculateConsistencyScore(user, repos, events),
            quality: this.calculateQualityScore(repos, stats),
            growth: this.calculateGrowthScore(repos, user)
        };

        const weights = {
            impact: 0.3,
            expertise: 0.25,
            consistency: 0.15,
            quality: 0.2,
            growth: 0.1
        };

        let overallScore = 0;
        for (const [key, value] of Object.entries(scores)) {
            overallScore += value * weights[key];
        }

        const percentile = this.calculatePercentile(stats.totalStars, user.followers);

        return {
            overall: Math.round(overallScore),
            breakdown: scores,
            percentile: percentile,
            level: this.getDeveloperLevel(overallScore),
            badges: this.generateBadges(user, repos, stats, languages)
        };
    },

    calculateImpactScore(stats, repos) {
        const starScore = Math.min(100, (stats.totalStars / this.benchmarks.topPercentileStars) * 100);
        const forkScore = Math.min(100, (stats.totalForks / this.benchmarks.topPercentileForks) * 100);
        const watcherScore = Math.min(100, (stats.totalWatchers / 500) * 100);
        const viralBonus = repos.some(r => r.stargazers_count > 100) ? 10 : 0;

        const score = (starScore * 0.5 + forkScore * 0.3 + watcherScore * 0.2) + viralBonus;
        return Math.min(100, Math.round(score));
    },

    calculateExpertiseScore(user, languages, repos) {
        const accountAge = (new Date() - new Date(user.created_at)) / (365 * 24 * 60 * 60 * 1000);
        const ageScore = Math.min(100, (accountAge / 10) * 100);

        const languageDiversity = Math.min(100, (languages.length / 8) * 100);
        const specializationBonus = languages[0]?.percentage > 50 ? 15 : 0;

        const frameworks = this.detectFrameworks(repos);
        const frameworkScore = Math.min(100, (frameworks.length / 10) * 100);

        const score = (ageScore * 0.3 + languageDiversity * 0.35 + frameworkScore * 0.35) + specializationBonus;
        return Math.min(100, Math.round(score));
    },

    calculateConsistencyScore(user, repos, events) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const activeRepos = repos.filter(r => new Date(r.updated_at) > sixMonthsAgo);
        const activityScore = Math.min(100, (activeRepos.length / repos.length) * 150);

        const eventScore = events ? Math.min(100, (events.length / 30) * 100) : activityScore;

        const maintainedRepos = repos.filter(r => {
            const age = (new Date() - new Date(r.created_at)) / (365 * 24 * 60 * 60 * 1000);
            const recentlyUpdated = new Date(r.updated_at) > sixMonthsAgo;
            return age > 1 && recentlyUpdated;
        });
        const maintenanceScore = Math.min(100, (maintainedRepos.length / Math.max(5, repos.length * 0.3)) * 100);

        const score = activityScore * 0.4 + eventScore * 0.3 + maintenanceScore * 0.3;
        return Math.round(score);
    },

    calculateQualityScore(repos, stats) {
        const documentedRepos = repos.filter(r => r.description && r.description.length > 20);
        const docScore = (documentedRepos.length / repos.length) * 100;

        const avgStars = stats.avgStars || 0;
        const qualityRatio = Math.min(100, (avgStars / this.benchmarks.avgStarsPerRepo) * 50);

        const forkRatio = stats.totalStars > 0 ? (stats.totalForks / stats.totalStars) : 0;
        const usefulnessScore = Math.min(100, forkRatio * 200);

        const reposWithIssues = repos.filter(r => r.open_issues_count > 0);
        const engagementScore = Math.min(100, (reposWithIssues.length / Math.max(1, repos.length * 0.3)) * 100);

        const score = docScore * 0.35 + qualityRatio * 0.35 + usefulnessScore * 0.2 + engagementScore * 0.1;
        return Math.round(score);
    },

    calculateGrowthScore(repos, user) {
        if (repos.length === 0) return 0;

        const sortedRepos = [...repos].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        const earlyRepos = sortedRepos.slice(0, Math.ceil(repos.length * 0.3));
        const recentRepos = sortedRepos.slice(-Math.ceil(repos.length * 0.3));

        const earlyAvgStars = earlyRepos.reduce((sum, r) => sum + r.stargazers_count, 0) / earlyRepos.length;
        const recentAvgStars = recentRepos.reduce((sum, r) => sum + r.stargazers_count, 0) / recentRepos.length;

        const growthRate = recentAvgStars > earlyAvgStars ?
            Math.min(100, ((recentAvgStars - earlyAvgStars) / Math.max(1, earlyAvgStars)) * 100) : 50;

        const accountAge = (new Date() - new Date(user.created_at)) / (365 * 24 * 60 * 60 * 1000);
        const followerRate = user.followers / Math.max(1, accountAge);
        const followerScore = Math.min(100, (followerRate / 20) * 100);

        const score = growthRate * 0.6 + followerScore * 0.4;
        return Math.round(score);
    },

    calculatePercentile(totalStars, followers) {
        if (totalStars > 1000 || followers > 500) return 95;
        if (totalStars > 500 || followers > 200) return 90;
        if (totalStars > 200 || followers > 100) return 80;
        if (totalStars > 100 || followers > 50) return 70;
        if (totalStars > 50 || followers > 25) return 60;
        if (totalStars > 20 || followers > 10) return 50;
        if (totalStars > 10 || followers > 5) return 40;
        return 30;
    },

    getDeveloperLevel(score) {
        if (score >= 90) return { name: 'Expert', color: '#6366f1' };
        if (score >= 75) return { name: 'Senior', color: '#6366f1' };
        if (score >= 60) return { name: 'Intermediate', color: '#6366f1' };
        if (score >= 40) return { name: 'Junior', color: '#6366f1' };
        return { name: 'Beginner', color: '#6366f1' };
    },

    generateBadges(user, repos, stats, languages) {
        const badges = [];

        if (stats.totalStars > 1000) badges.push({ name: 'Superstar', description: '1000+ total stars' });
        else if (stats.totalStars > 500) badges.push({ name: 'Rising Star', description: '500+ total stars' });
        else if (stats.totalStars > 100) badges.push({ name: 'Popular', description: '100+ total stars' });

        if (repos.length > 100) badges.push({ name: 'Prolific', description: '100+ repositories' });
        else if (repos.length > 50) badges.push({ name: 'Active Builder', description: '50+ repositories' });

        if (languages.length >= 8) badges.push({ name: 'Polyglot', description: '8+ languages' });
        else if (languages.length >= 5) badges.push({ name: 'Multilingual', description: '5+ languages' });

        if (languages[0]?.percentage > 60) {
            badges.push({ name: `${languages[0].name} Expert`, description: `60%+ ${languages[0].name}` });
        }

        if (user.followers > 1000) badges.push({ name: 'Influencer', description: '1000+ followers' });
        else if (user.followers > 100) badges.push({ name: 'Community Leader', description: '100+ followers' });

        const accountAge = (new Date() - new Date(user.created_at)) / (365 * 24 * 60 * 60 * 1000);
        if (accountAge > 5) badges.push({ name: 'Veteran', description: '5+ years on GitHub' });

        if (stats.totalForks > 500) badges.push({ name: 'Fork Master', description: '500+ total forks' });

        return badges.slice(0, 6);
    },

    detectFrameworks(repos) {
        const frameworks = new Set();
        const patterns = {
            'React': /react|jsx|next\.js|nextjs|gatsby/i,
            'Vue': /vue|nuxt/i,
            'Angular': /angular/i,
            'Node.js': /node|express|fastify|koa/i,
            'Django': /django/i,
            'Flask': /flask/i,
            'Rails': /rails|ruby on rails/i,
            'Spring': /spring/i,
            'Laravel': /laravel/i,
            'Docker': /docker|container/i,
            'Kubernetes': /kubernetes|k8s/i,
            'AWS': /aws|amazon|lambda/i,
            'Machine Learning': /tensorflow|pytorch|scikit|ml|machine learning|ai/i,
            'Mobile': /android|ios|flutter|react native|swift/i,
            'Database': /sql|postgres|mysql|mongodb|redis/i
        };

        repos.forEach(repo => {
            const searchText = `${repo.name} ${repo.description || ''}`.toLowerCase();

            for (const [framework, pattern] of Object.entries(patterns)) {
                if (pattern.test(searchText)) {
                    frameworks.add(framework);
                }
            }

            if (repo.topics) {
                repo.topics.forEach(topic => {
                    for (const [framework, pattern] of Object.entries(patterns)) {
                        if (pattern.test(topic)) {
                            frameworks.add(framework);
                        }
                    }
                });
            }
        });

        return Array.from(frameworks);
    }
};