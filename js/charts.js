/* ===============================================
   CHARTS MODULE
   =============================================== */

const Charts = {
    languageChart: null,

    // Initialize or update language distribution chart
    createLanguageChart(languages) {
        const ctx = document.getElementById('languageChart');

        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.languageChart) {
            this.languageChart.destroy();
        }

        // Prepare data
        const labels = languages.map(lang => lang.name);
        const data = languages.map(lang => lang.bytes);
        const colors = languages.map(lang => lang.color);

        // Create chart configuration
        const config = {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[i];
                                        const total = dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);

                                        return {
                                            text: `${label} (${percentage}%)`,
                                            fillStyle: dataset.backgroundColor[i],
                                            strokeStyle: dataset.borderColor,
                                            lineWidth: dataset.borderWidth,
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                const lang = languages[context.dataIndex];

                                return [
                                    `${label}: ${percentage}%`,
                                    `Used in ${lang.repos} repos`
                                ];
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: false,
                    duration: 1000
                }
            }
        };

        // Create the chart
        this.languageChart = new Chart(ctx, config);
    },

    // Create mini sparkline charts for repository activity
    createSparkline(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, i) => i),
                datasets: [{
                    data: data,
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    },

    // Create contribution heatmap (simplified version)
    createContributionGraph(contributions) {
        // This would typically use contribution data from GitHub's GraphQL API
        // For now, we'll create a placeholder
        const container = document.createElement('div');
        container.className = 'contribution-graph glass-card';
        container.innerHTML = `
            <h3 style="margin-bottom: var(--space-md); font-size: var(--text-lg);">Recent Activity</h3>
            <p style="color: var(--text-secondary); font-size: var(--text-sm);">
                Activity visualization requires GitHub GraphQL API access.
                Use the export feature to save your current portfolio data.
            </p>
        `;
        return container;
    },

    // Create comparison chart for multiple metrics
    createComparisonChart(canvasId, metrics) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(metrics),
                datasets: [{
                    label: 'Repository Metrics',
                    data: Object.values(metrics),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // Update all charts with new data
    updateCharts(data) {
        if (data.languages && data.languages.length > 0) {
            this.createLanguageChart(data.languages);
        }

        // Additional charts can be updated here
    },

    // Destroy all charts (cleanup)
    destroyCharts() {
        if (this.languageChart) {
            this.languageChart.destroy();
            this.languageChart = null;
        }
    }
};