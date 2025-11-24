/* ===============================================
   EXPORT MODULE
   =============================================== */

const Export = {
    currentData: null,

    // Store data for export
    setData(data) {
        this.currentData = data;
    },

    // Export data as JSON
    exportAsJSON() {
        if (!this.currentData) {
            alert('No data to export. Please analyze a profile first.');
            return;
        }

        const exportData = {
            metadata: {
                exported_at: new Date().toISOString(),
                version: '2.0.0',
                source: 'GitHub Portfolio Analyzer - Enhanced Edition'
            },
            profile: {
                username: this.currentData.user.login,
                name: this.currentData.user.name,
                bio: this.currentData.user.bio,
                avatar_url: this.currentData.user.avatar_url,
                profile_url: this.currentData.user.html_url,
                company: this.currentData.user.company,
                location: this.currentData.user.location,
                website: this.currentData.user.blog,
                created_at: this.currentData.user.created_at,
                followers: this.currentData.user.followers,
                following: this.currentData.user.following,
                public_repos: this.currentData.user.public_repos,
                public_gists: this.currentData.user.public_gists
            },
            // NEW: Developer Score
            developer_score: this.currentData.score ? {
                overall: this.currentData.score.overall,
                level: this.currentData.score.level,
                percentile: this.currentData.score.percentile,
                breakdown: this.currentData.score.breakdown,
                badges: this.currentData.score.badges
            } : null,
            // NEW: Career Insights
            career_insights: this.currentData.insights ? {
                strengths: this.currentData.insights.strengths,
                recommendations: this.currentData.insights.recommendations,
                skill_gaps: this.currentData.insights.skillGaps,
                career_path: this.currentData.insights.careerPath,
                market_alignment: this.currentData.insights.marketAlignment
            } : null,
            // NEW: Contribution Patterns
            contribution_patterns: this.currentData.patterns ? {
                time_patterns: this.currentData.patterns.timePatterns,
                commit_patterns: this.currentData.patterns.commitPatterns,
                collaboration_style: this.currentData.patterns.collaborationStyle,
                language_evolution: this.currentData.patterns.languageEvolution,
                activity_trends: this.currentData.patterns.activityTrends
            } : null,
            statistics: {
                total_stars: this.currentData.stats.totalStars,
                total_forks: this.currentData.stats.totalForks,
                total_watchers: this.currentData.stats.totalWatchers,
                average_stars: this.currentData.stats.avgStars,
                most_starred_repo: this.currentData.stats.mostStarred ? {
                    name: this.currentData.stats.mostStarred.name,
                    stars: this.currentData.stats.mostStarred.stargazers_count,
                    url: this.currentData.stats.mostStarred.html_url
                } : null,
                most_forked_repo: this.currentData.stats.mostForked ? {
                    name: this.currentData.stats.mostForked.name,
                    forks: this.currentData.stats.mostForked.forks_count,
                    url: this.currentData.stats.mostForked.html_url
                } : null
            },
            languages: this.currentData.languages.map(lang => ({
                name: lang.name,
                percentage: parseFloat(lang.percentage),
                bytes: lang.bytes,
                repos_count: lang.repos
            })),
            repositories: this.currentData.repos.map(repo => ({
                name: repo.name,
                description: repo.description,
                url: repo.html_url,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                watchers: repo.watchers_count,
                open_issues: repo.open_issues_count,
                created_at: repo.created_at,
                updated_at: repo.updated_at,
                topics: repo.topics,
                is_private: repo.private,
                is_fork: repo.fork,
                default_branch: repo.default_branch,
                size: repo.size
            }))
        };

        // Create and download JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `github-portfolio-${this.currentData.user.login}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show success message
        this.showExportSuccess('JSON file exported successfully!');
    },

    // Export as PDF
    async exportAsPDF() {
        if (!this.currentData) {
            alert('No data to export. Please analyze a profile first.');
            return;
        }

        try {
            // Create a temporary container for PDF content
            const pdfContent = this.createPDFContent();
            document.body.appendChild(pdfContent);

            // Use html2canvas to capture the content
            const canvas = await html2canvas(pdfContent, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            // Remove temporary content
            document.body.removeChild(pdfContent);

            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add image to PDF, handling multiple pages if needed
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save PDF
            pdf.save(`github-portfolio-${this.currentData.user.login}-${Date.now()}.pdf`);

            // Show success message
            this.showExportSuccess('PDF exported successfully!');

        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Failed to export PDF. Please try again.');
        }
    },

    // Create PDF content
    createPDFContent() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 800px;
            background: white;
            padding: 40px;
            font-family: 'Inter', sans-serif;
        `;

        const user = this.currentData.user;
        const stats = this.currentData.stats;
        const languages = this.currentData.languages;
        const topRepos = this.currentData.repos.slice(0, 10);
        const score = this.currentData.score;
        const insights = this.currentData.insights;
        const patterns = this.currentData.patterns;

        container.innerHTML = `
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif; }
                h1 { color: #111827; margin-bottom: 10px; font-size: 32px; }
                h2 { color: #111827; margin: 30px 0 15px; font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
                h3 { color: #374151; margin: 15px 0 10px; font-size: 18px; }
                p { color: #6b7280; line-height: 1.6; margin-bottom: 10px; }
                .header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
                .avatar { width: 100px; height: 100px; border-radius: 50%; }
                .info { flex: 1; }
                .score-section { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .score-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .score-big { font-size: 48px; font-weight: bold; color: #6366f1; }
                .score-level { font-size: 18px; color: #6b7280; }
                .score-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; }
                .score-item { text-align: center; }
                .score-label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
                .score-value { font-size: 20px; font-weight: bold; color: #111827; }
                .badge-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
                .badge { padding: 5px 10px; background: #e0e7ff; border-radius: 5px; font-size: 12px; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
                .stat-box { background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; }
                .stat-value { font-size: 24px; font-weight: bold; color: #6366f1; }
                .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
                .insights-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f59e0b; }
                .recommendation-box { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #3b82f6; }
                .pattern-box { background: #ede9fe; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #8b5cf6; }
                .language-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; }
                .language-item { display: flex; align-items: center; gap: 10px; padding: 8px; background: #f9fafb; border-radius: 6px; }
                .language-dot { width: 12px; height: 12px; border-radius: 50%; }
                .repo-list { margin: 20px 0; }
                .repo-item { padding: 15px; margin-bottom: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
                .repo-name { font-weight: 600; color: #6366f1; margin-bottom: 5px; }
                .repo-stats { display: flex; gap: 20px; margin-top: 10px; font-size: 14px; color: #6b7280; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
            </style>

            <div class="header">
                <img src="${user.avatar_url}" alt="Avatar" class="avatar" />
                <div class="info">
                    <h1>${user.name || user.login}</h1>
                    <p>${user.bio || 'No bio provided'}</p>
                    <p style="margin-top: 10px;">
                        ${user.location ? `📍 ${user.location}` : ''}
                        ${user.company ? ` • 🏢 ${user.company}` : ''}
                        ${user.blog ? ` • 🔗 ${user.blog}` : ''}
                    </p>
                </div>
            </div>

            ${score ? `
                <h2>Developer Score</h2>
                <div class="score-section">
                    <div class="score-header">
                        <div>
                            <div class="score-big">${score.overall}/100</div>
                            <div class="score-level">${score.level.name} Developer</div>
                        </div>
                        <div>
                            <p><strong>Top ${100 - score.percentile}%</strong> of developers</p>
                        </div>
                    </div>
                    <div class="score-grid">
                        <div class="score-item">
                            <div class="score-label">Impact</div>
                            <div class="score-value">${score.breakdown.impact}</div>
                        </div>
                        <div class="score-item">
                            <div class="score-label">Expertise</div>
                            <div class="score-value">${score.breakdown.expertise}</div>
                        </div>
                        <div class="score-item">
                            <div class="score-label">Consistency</div>
                            <div class="score-value">${score.breakdown.consistency}</div>
                        </div>
                        <div class="score-item">
                            <div class="score-label">Quality</div>
                            <div class="score-value">${score.breakdown.quality}</div>
                        </div>
                        <div class="score-item">
                            <div class="score-label">Growth</div>
                            <div class="score-value">${score.breakdown.growth}</div>
                        </div>
                    </div>
                    ${score.badges && score.badges.length > 0 ? `
                        <div class="badge-list">
                            ${score.badges.map(badge => `
                                <div class="badge">${badge.icon} ${badge.name}</div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            ${insights && insights.strengths && insights.strengths.length > 0 ? `
                <h2>Key Strengths</h2>
                ${insights.strengths.slice(0, 3).map(strength => `
                    <div class="insights-box">
                        <strong>${strength.title}</strong><br>
                        <small>${strength.description}</small>
                    </div>
                `).join('')}
            ` : ''}

            ${insights && insights.recommendations && insights.recommendations.length > 0 ? `
                <h2>Career Recommendations</h2>
                ${insights.recommendations.slice(0, 3).map(rec => `
                    <div class="recommendation-box">
                        <strong>${rec.title}</strong><br>
                        <small>${rec.description}</small>
                    </div>
                `).join('')}
            ` : ''}

            ${patterns && patterns.collaborationStyle ? `
                <h2>Work Patterns</h2>
                <div class="pattern-box">
                    <p><strong>Collaboration Style:</strong> ${patterns.collaborationStyle.style}</p>
                    <p><strong>Most Active Day:</strong> ${patterns.timePatterns?.mostActiveDay || 'N/A'}</p>
                    <p><strong>Peak Coding Time:</strong> ${patterns.timePatterns?.mostActivePeriod || 'N/A'}</p>
                    <p><strong>Weekend Activity:</strong> ${patterns.timePatterns?.weekendActivity || 0}%</p>
                </div>
            ` : ''}

            <h2>Portfolio Statistics</h2>
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-value">${stats.totalStars.toLocaleString()}</div>
                    <div class="stat-label">Total Stars</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${stats.totalForks.toLocaleString()}</div>
                    <div class="stat-label">Total Forks</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${user.public_repos}</div>
                    <div class="stat-label">Repositories</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${user.followers.toLocaleString()}</div>
                    <div class="stat-label">Followers</div>
                </div>
            </div>

            <h2>Language Distribution</h2>
            <div class="language-list">
                ${languages.slice(0, 8).map(lang => `
                    <div class="language-item">
                        <span class="language-dot" style="background: ${lang.color}"></span>
                        <span>${lang.name}</span>
                        <span style="margin-left: auto; color: #9ca3af;">${lang.percentage}%</span>
                    </div>
                `).join('')}
            </div>

            <h2>Top Repositories</h2>
            <div class="repo-list">
                ${topRepos.slice(0, 6).map(repo => `
                    <div class="repo-item">
                        <div class="repo-name">${repo.name}</div>
                        <p>${repo.description || 'No description'}</p>
                        <div class="repo-stats">
                            <span>⭐ ${repo.stargazers_count} stars</span>
                            <span>🔀 ${repo.forks_count} forks</span>
                            ${repo.language ? `<span>💻 ${repo.language}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="footer">
                <p>Generated by GitHub Portfolio Analyzer Enhanced • ${new Date().toLocaleDateString()}</p>
                <p>Developer Score: ${score ? score.overall : 'N/A'}/100 • github.com/${user.login}</p>
            </div>
        `;

        return container;
    },

    // Show export success message
    showExportSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'export-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            background: #10b981;
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
};