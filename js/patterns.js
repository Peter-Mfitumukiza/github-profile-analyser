const ContributionPatterns = {
    analyzePatterns(repos, events) {
        const patterns = {
            timePatterns: this.analyzeTimePatterns(repos, events),
            commitPatterns: this.analyzeCommitPatterns(repos),
            projectLifecycle: this.analyzeProjectLifecycle(repos),
            collaborationStyle: this.analyzeCollaborationStyle(repos),
            languageEvolution: this.analyzeLanguageEvolution(repos),
            activityTrends: this.analyzeActivityTrends(repos)
        };

        return patterns;
    },

    analyzeTimePatterns(repos, events) {
        const patterns = {
            mostActiveDay: null,
            mostActiveHour: null,
            weekendActivity: 0,
            consistency: 0,
            periods: {
                morning: 0,   // 6am-12pm
                afternoon: 0, // 12pm-6pm
                evening: 0,   // 6pm-12am
                night: 0      // 12am-6am
            },
            dayDistribution: {
                Monday: 0,
                Tuesday: 0,
                Wednesday: 0,
                Thursday: 0,
                Friday: 0,
                Saturday: 0,
                Sunday: 0
            }
        };

        repos.forEach(repo => {
            const updated = new Date(repo.updated_at);
            const created = new Date(repo.created_at);

            [updated, created].forEach(date => {
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                patterns.dayDistribution[dayName]++;

                const hour = date.getHours();
                if (hour >= 6 && hour < 12) patterns.periods.morning++;
                else if (hour >= 12 && hour < 18) patterns.periods.afternoon++;
                else if (hour >= 18 && hour < 24) patterns.periods.evening++;
                else patterns.periods.night++;
            });
        });

        if (events && events.length > 0) {
            events.forEach(event => {
                const date = new Date(event.created_at);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                patterns.dayDistribution[dayName]++;
            });
        }

        const maxDay = Object.entries(patterns.dayDistribution)
            .reduce((a, b) => a[1] > b[1] ? a : b);
        patterns.mostActiveDay = maxDay[0];

        const totalActivity = Object.values(patterns.dayDistribution).reduce((a, b) => a + b, 0);
        const weekendActivity = patterns.dayDistribution.Saturday + patterns.dayDistribution.Sunday;
        patterns.weekendActivity = totalActivity > 0 ?
            Math.round((weekendActivity / totalActivity) * 100) : 0;

        const maxPeriod = Object.entries(patterns.periods)
            .reduce((a, b) => a[1] > b[1] ? a : b);
        patterns.mostActivePeriod = maxPeriod[0];

        const dailyValues = Object.values(patterns.dayDistribution);
        const avg = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
        const variance = dailyValues.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / dailyValues.length;
        const stdDev = Math.sqrt(variance);
        patterns.consistency = avg > 0 ? Math.max(0, Math.round(100 - (stdDev / avg) * 100)) : 0;

        return patterns;
    },

    analyzeCommitPatterns(repos) {
        const patterns = {
            averageRepoAge: 0,
            updateFrequency: 'unknown',
            maintenanceScore: 0,
            abandonedRepos: 0,
            activeRepos: 0
        };

        if (repos.length === 0) return patterns;

        const now = new Date();
        const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

        let totalAge = 0;
        let maintained = 0;

        repos.forEach(repo => {
            const created = new Date(repo.created_at);
            const updated = new Date(repo.updated_at);
            const age = (new Date() - created) / (365 * 24 * 60 * 60 * 1000);

            totalAge += age;

            if (updated > sixMonthsAgo) {
                patterns.activeRepos++;
                if (age > 1) maintained++;
            } else if (updated < oneYearAgo) {
                patterns.abandonedRepos++;
            }
        });

        patterns.averageRepoAge = Math.round((totalAge / repos.length) * 10) / 10;
        patterns.maintenanceScore = Math.round((maintained / Math.max(1, patterns.activeRepos)) * 100);

        const activePercent = (patterns.activeRepos / repos.length) * 100;
        if (activePercent > 70) patterns.updateFrequency = 'Very Active';
        else if (activePercent > 50) patterns.updateFrequency = 'Active';
        else if (activePercent > 30) patterns.updateFrequency = 'Moderate';
        else patterns.updateFrequency = 'Low';

        return patterns;
    },

    analyzeProjectLifecycle(repos) {
        const lifecycle = {
            averageProjectDuration: 0,
            phases: {
                exploration: 0,
                development: 0,
                mature: 0,
                archived: 0
            },
            projectTypes: {
                experimental: 0,
                personal: 0,
                professional: 0,
                educational: 0
            }
        };

        if (repos.length === 0) return lifecycle;

        const now = new Date();

        repos.forEach(repo => {
            const created = new Date(repo.created_at);
            const updated = new Date(repo.updated_at);
            const ageInDays = (now - created) / (24 * 60 * 60 * 1000);
            const lastUpdateDays = (now - updated) / (24 * 60 * 60 * 1000);

            if (lastUpdateDays > 365) {
                lifecycle.phases.archived++;
            } else if (ageInDays > 365 && lastUpdateDays < 90) {
                lifecycle.phases.mature++;
            } else if (ageInDays > 30) {
                lifecycle.phases.development++;
            } else {
                lifecycle.phases.exploration++;
            }

            if (repo.stargazers_count < 5 && !repo.description) {
                lifecycle.projectTypes.experimental++;
            } else if (repo.description && repo.description.toLowerCase().includes('learn')) {
                lifecycle.projectTypes.educational++;
            } else if (repo.stargazers_count > 10 || repo.forks_count > 2) {
                lifecycle.projectTypes.professional++;
            } else {
                lifecycle.projectTypes.personal++;
            }
        });

        const activeRepos = repos.filter(r => {
            const lastUpdate = (now - new Date(r.updated_at)) / (24 * 60 * 60 * 1000);
            return lastUpdate < 365;
        });

        if (activeRepos.length > 0) {
            const totalDuration = activeRepos.reduce((sum, repo) => {
                const created = new Date(repo.created_at);
                const updated = new Date(repo.updated_at);
                return sum + (updated - created) / (24 * 60 * 60 * 1000);
            }, 0);
            lifecycle.averageProjectDuration = Math.round(totalDuration / activeRepos.length);
        }

        return lifecycle;
    },

    analyzeCollaborationStyle(repos) {
        const collaboration = {
            style: 'Unknown',
            forkContributions: 0,
            originalProjects: 0,
            teamProjects: 0,
            soloProjects: 0,
            contributionRatio: 0,
            averageCollaborators: 0
        };

        repos.forEach(repo => {
            if (repo.fork) {
                collaboration.forkContributions++;
            } else {
                collaboration.originalProjects++;
            }

            if (repo.forks_count > 2 || repo.stargazers_count > 20) {
                collaboration.teamProjects++;
            } else {
                collaboration.soloProjects++;
            }
        });

        collaboration.contributionRatio = repos.length > 0 ?
            Math.round((collaboration.forkContributions / repos.length) * 100) : 0;

        if (collaboration.contributionRatio > 30) {
            collaboration.style = 'Active Contributor';
        } else if (collaboration.teamProjects > collaboration.soloProjects) {
            collaboration.style = 'Team Player';
        } else if (collaboration.originalProjects > repos.length * 0.8) {
            collaboration.style = 'Independent Creator';
        } else {
            collaboration.style = 'Balanced Developer';
        }

        return collaboration;
    },

    analyzeLanguageEvolution(repos) {
        const evolution = {
            timeline: [],
            currentFocus: null,
            diversificationTrend: 'stable',
            specializationLevel: 0
        };

        if (repos.length === 0) return evolution;

        const sortedRepos = [...repos].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

        const yearlyLanguages = {};
        const languageCounts = {};

        sortedRepos.forEach(repo => {
            if (!repo.language) return;

            const year = new Date(repo.created_at).getFullYear();

            if (!yearlyLanguages[year]) {
                yearlyLanguages[year] = {};
            }

            yearlyLanguages[year][repo.language] =
                (yearlyLanguages[year][repo.language] || 0) + 1;

            languageCounts[repo.language] =
                (languageCounts[repo.language] || 0) + 1;
        });

        Object.entries(yearlyLanguages).forEach(([year, languages]) => {
            const topLang = Object.entries(languages)
                .sort((a, b) => b[1] - a[1])[0];

            evolution.timeline.push({
                year: parseInt(year),
                primaryLanguage: topLang ? topLang[0] : 'None',
                languageCount: Object.keys(languages).length,
                languages: languages
            });
        });

        const recentYears = evolution.timeline.slice(-2);
        if (recentYears.length > 0) {
            const recentLanguages = {};
            recentYears.forEach(year => {
                Object.entries(year.languages).forEach(([lang, count]) => {
                    recentLanguages[lang] = (recentLanguages[lang] || 0) + count;
                });
            });

            const topRecent = Object.entries(recentLanguages)
                .sort((a, b) => b[1] - a[1])[0];
            evolution.currentFocus = topRecent ? topRecent[0] : null;
        }

        if (evolution.timeline.length >= 3) {
            const earlyDiversity = evolution.timeline.slice(0, 2)
                .reduce((sum, year) => sum + year.languageCount, 0) / 2;
            const recentDiversity = evolution.timeline.slice(-2)
                .reduce((sum, year) => sum + year.languageCount, 0) / 2;

            if (recentDiversity > earlyDiversity * 1.3) {
                evolution.diversificationTrend = 'expanding';
            } else if (recentDiversity < earlyDiversity * 0.7) {
                evolution.diversificationTrend = 'specializing';
            } else {
                evolution.diversificationTrend = 'stable';
            }
        }

        const totalRepos = sortedRepos.length;
        const topLanguage = Object.entries(languageCounts)
            .sort((a, b) => b[1] - a[1])[0];

        if (topLanguage) {
            evolution.specializationLevel =
                Math.round((topLanguage[1] / totalRepos) * 100);
        }

        return evolution;
    },

    analyzeActivityTrends(repos) {
        const trends = {
            currentStreak: 0,
            longestStreak: 0,
            averageReposPerYear: 0,
            growthRate: 'stable',
            momentum: 'maintaining',
            recentActivity: {
                lastWeek: 0,
                lastMonth: 0,
                last3Months: 0,
                last6Months: 0
            }
        };

        if (repos.length === 0) return trends;

        const now = new Date();

        repos.forEach(repo => {
            const updated = new Date(repo.updated_at);
            const daysSince = (now - updated) / (24 * 60 * 60 * 1000);

            if (daysSince <= 7) trends.recentActivity.lastWeek++;
            if (daysSince <= 30) trends.recentActivity.lastMonth++;
            if (daysSince <= 90) trends.recentActivity.last3Months++;
            if (daysSince <= 180) trends.recentActivity.last6Months++;
        });

        const accountAge = repos.length > 0 ?
            (now - new Date(repos[0].owner.created_at)) / (365 * 24 * 60 * 60 * 1000) : 1;
        trends.averageReposPerYear = Math.round((repos.length / Math.max(1, accountAge)) * 10) / 10;

        const recentPercent = (trends.recentActivity.last3Months / repos.length) * 100;
        if (recentPercent > 50) {
            trends.momentum = 'accelerating';
        } else if (recentPercent > 30) {
            trends.momentum = 'maintaining';
        } else {
            trends.momentum = 'slowing';
        }

        const midpoint = Math.floor(repos.length / 2);
        const sortedByDate = [...repos].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

        const firstHalf = sortedByDate.slice(0, midpoint);
        const secondHalf = sortedByDate.slice(midpoint);

        if (firstHalf.length > 0 && secondHalf.length > 0) {
            const firstHalfPeriod = (new Date(firstHalf[firstHalf.length - 1].created_at) -
                new Date(firstHalf[0].created_at)) / (365 * 24 * 60 * 60 * 1000);
            const secondHalfPeriod = (new Date(secondHalf[secondHalf.length - 1].created_at) -
                new Date(secondHalf[0].created_at)) / (365 * 24 * 60 * 60 * 1000);

            const firstRate = firstHalf.length / Math.max(0.1, firstHalfPeriod);
            const secondRate = secondHalf.length / Math.max(0.1, secondHalfPeriod);

            if (secondRate > firstRate * 1.2) {
                trends.growthRate = 'increasing';
            } else if (secondRate < firstRate * 0.8) {
                trends.growthRate = 'decreasing';
            } else {
                trends.growthRate = 'stable';
            }
        }

        return trends;
    },

    generatePatternInsights(patterns) {
        const insights = [];

        if (patterns.timePatterns.weekendActivity > 40) {
            insights.push({
                type: 'time',
                insight: `You code ${patterns.timePatterns.weekendActivity}% on weekends - true passion for coding!`
            });
        }

        if (patterns.timePatterns.mostActivePeriod === 'night') {
            insights.push({
                type: 'time',
                insight: 'Night owl developer - most active after midnight'
            });
        }

        if (patterns.collaborationStyle.style === 'Active Contributor') {
            insights.push({
                type: 'collaboration',
                insight: `Contributing to ${patterns.collaborationStyle.forkContributions} projects - great community involvement!`
            });
        }

        if (patterns.languageEvolution.diversificationTrend === 'expanding') {
            insights.push({
                type: 'growth',
                insight: 'Expanding skill set - learning new languages actively'
            });
        } else if (patterns.languageEvolution.specializationLevel > 70) {
            insights.push({
                type: 'specialization',
                insight: `${patterns.languageEvolution.currentFocus} specialist - ${patterns.languageEvolution.specializationLevel}% focus`
            });
        }

        if (patterns.activityTrends.momentum === 'accelerating') {
            insights.push({
                type: 'momentum',
                insight: 'Activity is accelerating - great momentum!'
            });
        }

        if (patterns.commitPatterns.maintenanceScore > 70) {
            insights.push({
                type: 'maintenance',
                insight: `${patterns.commitPatterns.maintenanceScore}% of projects actively maintained - excellent follow-through`
            });
        }

        return insights;
    }
};