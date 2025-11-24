/* ===============================================
   DEVELOPER SCORING SYSTEM
   =============================================== */

const DeveloperScoring = {
    // GitHub averages for comparison (based on typical profiles)
    benchmarks: {
        avgStarsPerRepo: 5,
        avgFollowers: 50,
        avgRepos: 30,
        avgLanguages: 4,
        avgAccountAge: 3, // years
        topPercentileStars: 1000,
        topPercentileForks: 500
    },

    // Calculate comprehensive developer score
    calculateScore(user, repos, stats, languages, events) {
        const scores = {
            impact: this.calculateImpactScore(stats, repos),
            expertise: this.calculateExpertiseScore(user, languages, repos),
            consistency: this.calculateConsistencyScore(user, repos, events),
            quality: this.calculateQualityScore(repos, stats),
            growth: this.calculateGrowthScore(repos, user)
        };

        // Calculate overall score (weighted average)
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

        // Calculate percentile ranking
        const percentile = this.calculatePercentile(stats.totalStars, user.followers);

        return {
            overall: Math.round(overallScore),
            breakdown: scores,
            percentile: percentile,
            level: this.getDeveloperLevel(overallScore),
            badges: this.generateBadges(user, repos, stats, languages)
        };
    },

    // Impact Score: Based on stars, forks, and community reach
    calculateImpactScore(stats, repos) {
        const starScore = Math.min(100, (stats.totalStars / this.benchmarks.topPercentileStars) * 100);
        const forkScore = Math.min(100, (stats.totalForks / this.benchmarks.topPercentileForks) * 100);
        const watcherScore = Math.min(100, (stats.totalWatchers / 500) * 100);

        // Bonus for viral repos (repos with exceptionally high stars)
        const viralBonus = repos.some(r => r.stargazers_count > 100) ? 10 : 0;

        const score = (starScore * 0.5 + forkScore * 0.3 + watcherScore * 0.2) + viralBonus;
        return Math.min(100, Math.round(score));
    },

    // Expertise Score: Languages, technologies, and depth
    calculateExpertiseScore(user, languages, repos) {
        const accountAge = (new Date() - new Date(user.created_at)) / (365 * 24 * 60 * 60 * 1000);
        const ageScore = Math.min(100, (accountAge / 10) * 100); // Max at 10 years

        const languageDiversity = Math.min(100, (languages.length / 8) * 100);

        // Check for specialization (dominant language > 50%)
        const specializationBonus = languages[0]?.percentage > 50 ? 15 : 0;

        // Framework/tool detection from repo names and descriptions
        const frameworks = this.detectFrameworks(repos);
        const frameworkScore = Math.min(100, (frameworks.length / 10) * 100);

        const score = (ageScore * 0.3 + languageDiversity * 0.35 + frameworkScore * 0.35) + specializationBonus;
        return Math.min(100, Math.round(score));
    },

    // Consistency Score: Regular activity and maintenance
    calculateConsistencyScore(user, repos, events) {
        // Calculate repos updated in last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const activeRepos = repos.filter(r => new Date(r.updated_at) > sixMonthsAgo);
        const activityScore = Math.min(100, (activeRepos.length / repos.length) * 150);

        // Event frequency (if events available)
        const eventScore = events ? Math.min(100, (events.length / 30) * 100) : activityScore;

        // Long-term maintenance (repos > 1 year old still updated)
        const maintainedRepos = repos.filter(r => {
            const age = (new Date() - new Date(r.created_at)) / (365 * 24 * 60 * 60 * 1000);
            const recentlyUpdated = new Date(r.updated_at) > sixMonthsAgo;
            return age > 1 && recentlyUpdated;
        });
        const maintenanceScore = Math.min(100, (maintainedRepos.length / Math.max(5, repos.length * 0.3)) * 100);

        const score = activityScore * 0.4 + eventScore * 0.3 + maintenanceScore * 0.3;
        return Math.round(score);
    },

    // Quality Score: Code quality indicators
    calculateQualityScore(repos, stats) {
        // Documentation (repos with descriptions)
        const documentedRepos = repos.filter(r => r.description && r.description.length > 20);
        const docScore = (documentedRepos.length / repos.length) * 100;

        // Stars to repo ratio (quality over quantity)
        const avgStars = stats.avgStars || 0;
        const qualityRatio = Math.min(100, (avgStars / this.benchmarks.avgStarsPerRepo) * 50);

        // Fork to star ratio (indicates useful code)
        const forkRatio = stats.totalStars > 0 ? (stats.totalForks / stats.totalStars) : 0;
        const usefulnessScore = Math.min(100, forkRatio * 200); // 0.5 ratio = 100 score

        // Issues engagement (active maintenance)
        const reposWithIssues = repos.filter(r => r.open_issues_count > 0);
        const engagementScore = Math.min(100, (reposWithIssues.length / Math.max(1, repos.length * 0.3)) * 100);

        const score = docScore * 0.35 + qualityRatio * 0.35 + usefulnessScore * 0.2 + engagementScore * 0.1;
        return Math.round(score);
    },

    // Growth Score: Improvement over time
    calculateGrowthScore(repos, user) {
        if (repos.length === 0) return 0;

        // Sort repos by creation date
        const sortedRepos = [...repos].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        // Compare early repos vs recent repos (stars)
        const earlyRepos = sortedRepos.slice(0, Math.ceil(repos.length * 0.3));
        const recentRepos = sortedRepos.slice(-Math.ceil(repos.length * 0.3));

        const earlyAvgStars = earlyRepos.reduce((sum, r) => sum + r.stargazers_count, 0) / earlyRepos.length;
        const recentAvgStars = recentRepos.reduce((sum, r) => sum + r.stargazers_count, 0) / recentRepos.length;

        const growthRate = recentAvgStars > earlyAvgStars ?
            Math.min(100, ((recentAvgStars - earlyAvgStars) / Math.max(1, earlyAvgStars)) * 100) : 50;

        // Follower growth estimation (based on account age)
        const accountAge = (new Date() - new Date(user.created_at)) / (365 * 24 * 60 * 60 * 1000);
        const followerRate = user.followers / Math.max(1, accountAge);
        const followerScore = Math.min(100, (followerRate / 20) * 100); // 20 followers/year = 100

        const score = growthRate * 0.6 + followerScore * 0.4;
        return Math.round(score);
    },

    // Calculate percentile ranking
    calculatePercentile(totalStars, followers) {
        // Simplified percentile based on stars and followers
        if (totalStars > 1000 || followers > 500) return 95;
        if (totalStars > 500 || followers > 200) return 90;
        if (totalStars > 200 || followers > 100) return 80;
        if (totalStars > 100 || followers > 50) return 70;
        if (totalStars > 50 || followers > 25) return 60;
        if (totalStars > 20 || followers > 10) return 50;
        if (totalStars > 10 || followers > 5) return 40;
        return 30;
    },

    // Get developer level based on score
    getDeveloperLevel(score) {
        if (score >= 90) return { name: 'Expert', color: '#10b981', icon: '🏆' };
        if (score >= 75) return { name: 'Senior', color: '#3b82f6', icon: '⭐' };
        if (score >= 60) return { name: 'Intermediate', color: '#8b5cf6', icon: '📈' };
        if (score >= 40) return { name: 'Junior', color: '#f59e0b', icon: '🎯' };
        return { name: 'Beginner', color: '#6b7280', icon: '🌱' };
    },

    // Generate achievement badges
    generateBadges(user, repos, stats, languages) {
        const badges = [];

        // Star achievements
        if (stats.totalStars > 1000) badges.push({ name: 'Superstar', icon: '🌟', description: '1000+ total stars' });
        else if (stats.totalStars > 500) badges.push({ name: 'Rising Star', icon: '⭐', description: '500+ total stars' });
        else if (stats.totalStars > 100) badges.push({ name: 'Popular', icon: '✨', description: '100+ total stars' });

        // Repository achievements
        if (repos.length > 100) badges.push({ name: 'Prolific', icon: '🏗️', description: '100+ repositories' });
        else if (repos.length > 50) badges.push({ name: 'Active Builder', icon: '🔨', description: '50+ repositories' });

        // Language achievements
        if (languages.length >= 8) badges.push({ name: 'Polyglot', icon: '🌍', description: '8+ languages' });
        else if (languages.length >= 5) badges.push({ name: 'Multilingual', icon: '🗣️', description: '5+ languages' });

        // Specialization badges
        if (languages[0]?.percentage > 60) {
            badges.push({ name: `${languages[0].name} Expert`, icon: '🎯', description: `60%+ ${languages[0].name}` });
        }

        // Community achievements
        if (user.followers > 1000) badges.push({ name: 'Influencer', icon: '👥', description: '1000+ followers' });
        else if (user.followers > 100) badges.push({ name: 'Community Leader', icon: '🎭', description: '100+ followers' });

        // Veteran badge
        const accountAge = (new Date() - new Date(user.created_at)) / (365 * 24 * 60 * 60 * 1000);
        if (accountAge > 5) badges.push({ name: 'Veteran', icon: '🎖️', description: '5+ years on GitHub' });

        // Fork achievement
        if (stats.totalForks > 500) badges.push({ name: 'Fork Master', icon: '🔀', description: '500+ total forks' });

        return badges.slice(0, 6); // Return top 6 badges
    },

    // Detect frameworks and tools from repositories
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

            // Check topics
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