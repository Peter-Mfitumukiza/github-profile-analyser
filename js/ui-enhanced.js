const UIEnhanced = {
    displayDeveloperScore(score) {
        const section = document.getElementById('developerScoreSection');
        if (!section) return;

        section.style.display = 'block';

        // Animate score circle
        const scoreValue = document.getElementById('scoreValue');
        const scoreLevel = document.getElementById('scoreLevel');
        const scorePercentile = document.getElementById('scorePercentile');
        const scoreProgress = document.getElementById('scoreProgress');

        // Update values
        scoreValue.textContent = score.overall;
        scoreLevel.textContent = score.level.name;
        scoreLevel.style.color = score.level.color;
        scorePercentile.textContent = 100 - score.percentile;

        // Animate circle progress
        const offset = 565 - (565 * score.overall) / 100;
        setTimeout(() => {
            scoreProgress.style.strokeDashoffset = offset;
            scoreProgress.style.stroke = score.level.color;
        }, 100);

        // Display breakdown
        this.displayScoreBreakdown(score.breakdown);

        // Display badges
        this.displayBadges(score.badges);
    },

    displayScoreBreakdown(breakdown) {
        Object.entries(breakdown).forEach(([key, value]) => {
            const bar = document.getElementById(`${key}Bar`);
            const score = document.getElementById(`${key}Score`);

            if (bar && score) {
                setTimeout(() => {
                    bar.style.width = `${value}%`;
                }, 200);
                score.textContent = value;
            }
        });
    },

    displayBadges(badges) {
        const container = document.getElementById('badgesList');
        if (!container) return;

        container.innerHTML = '';

        badges.forEach(badge => {
            const item = document.createElement('div');
            item.className = 'badge-item';
            item.innerHTML = `
                <div class="badge-content">
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-description">${badge.description}</div>
                </div>
            `;
            container.appendChild(item);
        });
    },

    displayCareerInsights(insights) {
        const section = document.getElementById('careerInsightsSection');
        if (!section) return;

        section.style.display = 'block';

        this.displayStrengths(insights.strengths);

        this.displayRecommendations(insights.recommendations);

        this.displaySkillGaps(insights.skillGaps);

        this.displayLearningPlan(insights.learningPlan);

        this.displayCareerPath(insights.careerPath);

        this.displayMarketAlignment(insights.marketAlignment);
    },

    displayStrengths(strengths) {
        const container = document.getElementById('strengthsList');
        if (!container) return;

        container.innerHTML = '';

        strengths.forEach(strength => {
            const item = document.createElement('div');
            item.className = 'strength-item';
            item.innerHTML = `
                <div class="strength-title">${strength.title}</div>
                <div class="strength-description">${strength.description}</div>
            `;
            container.appendChild(item);
        });
    },

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendationsList');
        if (!container) return;

        container.innerHTML = '';

        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-description">${rec.description}</div>
                ${rec.action ? `<div class="recommendation-action">Action: ${rec.action}</div>` : ''}
            `;
            container.appendChild(item);
        });
    },

    displaySkillGaps(gaps) {
        const container = document.getElementById('skillGapsList');
        if (!container) return;

        container.innerHTML = '';

        if (gaps.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-size: var(--text-sm);">No major skill gaps identified! Keep learning and growing.</p>';
            return;
        }

        gaps.forEach(gap => {
            const item = document.createElement('div');
            item.className = 'gap-item';
            item.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 4px;">${gap.area}</div>
                <div style="font-size: var(--text-sm); color: var(--text-secondary);">${gap.suggestion}</div>
            `;
            container.appendChild(item);
        });
    },

    displayLearningPlan(plan) {
        const container = document.getElementById('learningPlan');
        if (!container) return;

        container.innerHTML = '';

        const sections = [
            { key: 'immediate', title: 'This Month' },
            { key: 'shortTerm', title: 'Next 3 Months' },
            { key: 'longTerm', title: '6-12 Months' }
        ];

        sections.forEach(section => {
            if (!plan[section.key] || plan[section.key].length === 0) return;

            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'plan-section';
            sectionDiv.innerHTML = `<div class="plan-section-title">${section.title}</div>`;

            plan[section.key].forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'plan-item';
                itemDiv.innerHTML = `
                    <strong>${item.task}</strong><br>
                    <small style="color: var(--text-secondary)">${item.description}</small><br>
                    <small style="color: var(--primary)">Time: ${item.effort}</small>
                `;
                sectionDiv.appendChild(itemDiv);
            });

            container.appendChild(sectionDiv);
        });
    },

    displayCareerPath(careerPath) {
        const container = document.getElementById('careerPath');
        if (!container) return;

        container.innerHTML = '';

        if (!careerPath || !careerPath.paths) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Career path analysis requires more data.</p>';
            return;
        }

        // Display current position
        if (careerPath.current) {
            const currentDiv = document.createElement('div');
            currentDiv.style.marginBottom = 'var(--space-lg)';
            currentDiv.innerHTML = `
                <strong>Current Position:</strong> ${careerPath.current.level}
                ${careerPath.current.specialization ? `- ${careerPath.current.specialization} Developer` : ''}
            `;
            container.appendChild(currentDiv);
        }

        // Display paths
        const pathContainer = document.createElement('div');
        pathContainer.className = 'career-path';

        careerPath.paths.forEach(path => {
            const pathDiv = document.createElement('div');
            pathDiv.className = 'path-item';
            pathDiv.innerHTML = `
                <div class="path-timeframe">${path.timeframe}</div>
                <div class="path-goal">${path.goal}</div>
                <ul class="path-steps">
                    ${path.steps.map(step => `<li>${step}</li>`).join('')}
                </ul>
            `;
            pathContainer.appendChild(pathDiv);
        });

        container.appendChild(pathContainer);
    },

    displayMarketAlignment(alignment) {
        const container = document.getElementById('marketAlignment');
        if (!container) return;

        container.innerHTML = '';

        // Display alignment score
        const scoreDiv = document.createElement('div');
        scoreDiv.innerHTML = `
            <div class="alignment-score">${alignment.score}%</div>
            <div style="margin: var(--space-sm) 0; color: var(--text-secondary);">${alignment.recommendation}</div>
        `;
        container.appendChild(scoreDiv);

        // Display insights
        if (alignment.insights && alignment.insights.length > 0) {
            const insightsDiv = document.createElement('div');
            insightsDiv.className = 'alignment-insights';

            alignment.insights.forEach(insight => {
                const item = document.createElement('div');
                item.className = 'alignment-insight';
                item.textContent = insight;
                insightsDiv.appendChild(item);
            });

            container.appendChild(insightsDiv);
        }
    },

    displayContributionPatterns(patterns) {
        const section = document.getElementById('contributionPatternsSection');
        if (!section) return;

        section.style.display = 'block';

        this.displayActivityTimeline(patterns.activityTrends);

        this.displayCodingSchedule(patterns.timePatterns);

        this.displayLanguageEvolution(patterns.languageEvolution);

        this.displayCollaborationStyle(patterns.collaborationStyle);

        const insights = ContributionPatterns.generatePatternInsights(patterns);
        this.displayPatternInsights(insights);
    },

    displayActivityTimeline(trends) {
        const container = document.getElementById('activityTimeline');
        if (!container) return;

        container.innerHTML = '';

        const items = [
            { label: 'Last Week', value: trends.recentActivity.lastWeek, color: '#6366f1' },
            { label: 'Last Month', value: trends.recentActivity.lastMonth, color: '#6366f1' },
            { label: 'Last 3 Months', value: trends.recentActivity.last3Months, color: '#6366f1' },
            { label: 'Last 6 Months', value: trends.recentActivity.last6Months, color: '#6366f1' }
        ];

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <span style="min-width: 100px; font-size: var(--text-sm);">${item.label}:</span>
                <div style="flex: 1; height: 8px; background: var(--surface-2); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${Math.min(100, item.value * 10)}%; background: ${item.color}; border-radius: 4px;"></div>
                </div>
                <span style="min-width: 30px; text-align: right; font-weight: 600; color: ${item.color};">${item.value}</span>
            `;
            container.appendChild(div);
        });

        // Add momentum indicator
        const momentumDiv = document.createElement('div');
        momentumDiv.style.marginTop = 'var(--space-md)';
        momentumDiv.style.padding = 'var(--space-sm)';
        momentumDiv.style.background = 'var(--surface)';
        momentumDiv.style.borderRadius = '8px';

        const momentumColors = {
            accelerating: '#6366f1',
            maintaining: '#6366f1',
            slowing: '#6366f1'
        };

        momentumDiv.innerHTML = `
            <strong>Momentum:</strong>
            <span style="color: ${momentumColors[trends.momentum]}">
                ${trends.momentum.charAt(0).toUpperCase() + trends.momentum.slice(1)}
            </span>
            <br>
            <small style="color: var(--text-secondary)">
                Average: ${trends.averageReposPerYear} repos/year
            </small>
        `;

        container.appendChild(momentumDiv);
    },

    displayCodingSchedule(patterns) {
        const container = document.getElementById('codingSchedule');
        if (!container) return;

        container.innerHTML = '';

        // Display day distribution
        const scheduleGrid = document.createElement('div');
        scheduleGrid.className = 'schedule-grid';

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        days.forEach((day, index) => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'schedule-day';
            const activity = patterns.dayDistribution[dayNames[index]] || 0;
            const maxActivity = Math.max(...Object.values(patterns.dayDistribution));

            if (activity === maxActivity && activity > 0) {
                dayDiv.classList.add('active');
            }

            dayDiv.style.opacity = 0.3 + (activity / Math.max(1, maxActivity)) * 0.7;
            dayDiv.innerHTML = `
                <div>${day}</div>
                <div style="font-size: 10px;">${activity}</div>
            `;
            scheduleGrid.appendChild(dayDiv);
        });

        container.appendChild(scheduleGrid);

        // Add insights
        const insightsDiv = document.createElement('div');
        insightsDiv.style.marginTop = 'var(--space-md)';
        insightsDiv.innerHTML = `
            <div style="margin-bottom: var(--space-sm);">
                <strong>Most Active:</strong> ${patterns.mostActiveDay || 'N/A'}
            </div>
            <div style="margin-bottom: var(--space-sm);">
                <strong>Peak Time:</strong> ${patterns.mostActivePeriod || 'N/A'}
            </div>
            <div style="margin-bottom: var(--space-sm);">
                <strong>Weekend Activity:</strong> ${patterns.weekendActivity}%
            </div>
            <div>
                <strong>Consistency:</strong>
                <span style="color: var(--text-secondary); font-weight: 600;">
                    ${patterns.consistency}%
                </span>
            </div>
        `;

        container.appendChild(insightsDiv);
    },

    displayLanguageEvolution(evolution) {
        const container = document.getElementById('languageEvolution');
        if (!container) return;

        container.innerHTML = '';

        if (!evolution.timeline || evolution.timeline.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-size: var(--text-sm);">Not enough data for evolution analysis.</p>';
            return;
        }

        // Create timeline chart
        const chartDiv = document.createElement('div');
        chartDiv.className = 'evolution-chart';

        evolution.timeline.forEach(year => {
            const yearDiv = document.createElement('div');
            yearDiv.className = 'evolution-year';
            yearDiv.innerHTML = `
                <div class="evolution-year-label">${year.year}</div>
                <div class="evolution-languages">
                    ${year.primaryLanguage ? `<div class="evolution-lang">${year.primaryLanguage}</div>` : ''}
                    <small style="color: var(--text-secondary)">${year.languageCount} langs</small>
                </div>
            `;
            chartDiv.appendChild(yearDiv);
        });

        container.appendChild(chartDiv);

        // Add summary
        const summaryDiv = document.createElement('div');
        summaryDiv.style.marginTop = 'var(--space-md)';
        summaryDiv.innerHTML = `
            <div><strong>Current Focus:</strong> ${evolution.currentFocus || 'Diverse'}</div>
            <div><strong>Trend:</strong> ${evolution.diversificationTrend}</div>
            <div><strong>Specialization:</strong> ${evolution.specializationLevel}%</div>
        `;

        container.appendChild(summaryDiv);
    },

    displayCollaborationStyle(collaboration) {
        const container = document.getElementById('collaborationStyle');
        if (!container) return;

        container.innerHTML = '';

        const stats = [
            { label: 'Style', value: collaboration.style },
            { label: 'Original Projects', value: `${collaboration.originalProjects}` },
            { label: 'Fork Contributions', value: `${collaboration.forkContributions}` },
            { label: 'Contribution Ratio', value: `${collaboration.contributionRatio}%` }
        ];

        stats.forEach(stat => {
            const div = document.createElement('div');
            div.style.marginBottom = 'var(--space-sm)';
            div.innerHTML = `
                <strong>${stat.label}:</strong> ${stat.value}
            `;
            container.appendChild(div);
        });

        // Add collaboration breakdown
        const breakdownDiv = document.createElement('div');
        breakdownDiv.style.marginTop = 'var(--space-lg)';
        breakdownDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                <span>Solo Projects</span>
                <strong>${collaboration.soloProjects}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Team Projects</span>
                <strong>${collaboration.teamProjects}</strong>
            </div>
        `;

        container.appendChild(breakdownDiv);
    },

    displayPatternInsights(insights) {
        const container = document.getElementById('patternInsights');
        if (!container) return;

        container.innerHTML = '';

        if (insights.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Analyzing patterns...</p>';
            return;
        }

        insights.forEach(insight => {
            const div = document.createElement('div');
            div.className = 'pattern-insight-item';
            div.innerHTML = `
                <span class="pattern-insight-text">${insight.insight}</span>
            `;
            container.appendChild(div);
        });
    }
};