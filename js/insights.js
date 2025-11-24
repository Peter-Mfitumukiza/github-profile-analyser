/* ===============================================
   CAREER INSIGHTS & RECOMMENDATIONS
   =============================================== */

const CareerInsights = {
    // Technology relationships and progression paths
    techStack: {
        'JavaScript': {
            related: ['TypeScript', 'Node.js', 'React', 'Vue', 'Angular'],
            advanced: ['TypeScript', 'WebAssembly', 'Deno'],
            complementary: ['CSS', 'HTML', 'Python'],
            roles: ['Frontend Developer', 'Full Stack Developer', 'Node.js Developer']
        },
        'Python': {
            related: ['Django', 'Flask', 'FastAPI', 'NumPy', 'Pandas'],
            advanced: ['Machine Learning', 'Data Science', 'AI', 'Deep Learning'],
            complementary: ['SQL', 'R', 'Julia', 'Go'],
            roles: ['Backend Developer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer']
        },
        'Java': {
            related: ['Spring', 'Kotlin', 'Scala', 'Maven', 'Gradle'],
            advanced: ['Microservices', 'Cloud Architecture', 'Reactive Programming'],
            complementary: ['SQL', 'Python', 'Go'],
            roles: ['Backend Developer', 'Enterprise Developer', 'Android Developer']
        },
        'TypeScript': {
            related: ['JavaScript', 'React', 'Angular', 'Node.js'],
            advanced: ['Decorators', 'Generics', 'Type Systems'],
            complementary: ['GraphQL', 'Rust', 'Go'],
            roles: ['Senior Frontend Developer', 'Full Stack Developer']
        },
        'Go': {
            related: ['Docker', 'Kubernetes', 'gRPC'],
            advanced: ['Distributed Systems', 'Cloud Native', 'Microservices'],
            complementary: ['Rust', 'Python', 'C++'],
            roles: ['Backend Developer', 'Cloud Engineer', 'DevOps Engineer']
        },
        'Rust': {
            related: ['WebAssembly', 'Systems Programming'],
            advanced: ['Operating Systems', 'Embedded Systems', 'Blockchain'],
            complementary: ['C++', 'Go', 'Python'],
            roles: ['Systems Programmer', 'Blockchain Developer', 'Security Engineer']
        },
        'Swift': {
            related: ['iOS', 'macOS', 'Objective-C'],
            advanced: ['SwiftUI', 'Combine', 'Metal'],
            complementary: ['Kotlin', 'React Native', 'Flutter'],
            roles: ['iOS Developer', 'Mobile Developer', 'Apple Platform Developer']
        },
        'Kotlin': {
            related: ['Android', 'Java', 'Spring'],
            advanced: ['Coroutines', 'Multiplatform', 'Native'],
            complementary: ['Swift', 'Flutter', 'React Native'],
            roles: ['Android Developer', 'Mobile Developer', 'Backend Developer']
        }
    },

    // Market demand trends (simplified, would ideally pull from job market APIs)
    marketTrends: {
        hot: ['TypeScript', 'Python', 'Go', 'Rust', 'Kubernetes', 'React', 'Machine Learning'],
        growing: ['Flutter', 'Svelte', 'Deno', 'WebAssembly', 'GraphQL', 'Terraform'],
        stable: ['Java', 'JavaScript', 'C#', 'SQL', 'Docker', 'AWS'],
        emerging: ['Bun', 'Astro', 'Qwik', 'Tauri', 'WASM']
    },

    // Generate career insights based on profile analysis
    generateInsights(user, repos, languages, score, stats) {
        const insights = {
            strengths: this.identifyStrengths(languages, repos, score),
            recommendations: this.generateRecommendations(languages, repos, user),
            skillGaps: this.identifySkillGaps(languages, repos),
            careerPath: this.suggestCareerPath(languages, score, repos),
            learningPlan: this.createLearningPlan(languages, repos),
            marketAlignment: this.assessMarketAlignment(languages, repos)
        };

        return insights;
    },

    // Identify developer strengths
    identifyStrengths(languages, repos, score) {
        const strengths = [];

        // Language expertise
        const primaryLang = languages[0];
        if (primaryLang && primaryLang.percentage > 40) {
            strengths.push({
                type: 'expertise',
                title: `${primaryLang.name} Specialist`,
                description: `Strong expertise in ${primaryLang.name} (${primaryLang.percentage}% of codebase)`,
                icon: '🎯'
            });
        }

        // Polyglot developer
        if (languages.length >= 5) {
            strengths.push({
                type: 'versatility',
                title: 'Polyglot Developer',
                description: `Proficient in ${languages.length} programming languages`,
                icon: '🌍'
            });
        }

        // High impact
        if (score.breakdown.impact > 70) {
            strengths.push({
                type: 'impact',
                title: 'High Impact Contributor',
                description: 'Your projects have significant community impact',
                icon: '⚡'
            });
        }

        // Quality focus
        if (score.breakdown.quality > 70) {
            strengths.push({
                type: 'quality',
                title: 'Quality-Focused Developer',
                description: 'Strong emphasis on code quality and documentation',
                icon: '✨'
            });
        }

        // Consistency
        if (score.breakdown.consistency > 70) {
            strengths.push({
                type: 'consistency',
                title: 'Consistent Contributor',
                description: 'Regular activity and project maintenance',
                icon: '🔄'
            });
        }

        return strengths;
    },

    // Generate personalized recommendations
    generateRecommendations(languages, repos, user) {
        const recommendations = [];
        const primaryLang = languages[0]?.name;

        // Language progression recommendations
        if (primaryLang && this.techStack[primaryLang]) {
            const tech = this.techStack[primaryLang];

            // Recommend advanced topics
            if (tech.advanced && tech.advanced.length > 0) {
                const notLearned = tech.advanced.filter(t =>
                    !languages.some(l => l.name.toLowerCase().includes(t.toLowerCase()))
                );

                if (notLearned.length > 0) {
                    recommendations.push({
                        type: 'skill',
                        priority: 'high',
                        title: `Learn ${notLearned[0]}`,
                        description: `Based on your ${primaryLang} expertise, ${notLearned[0]} would be a natural progression`,
                        action: `Start with ${notLearned[0]} tutorials and build a practice project`,
                        icon: '📚'
                    });
                }
            }

            // Recommend complementary technologies
            if (tech.complementary && languages.length < 3) {
                const complement = tech.complementary.find(t =>
                    !languages.some(l => l.name === t)
                );

                if (complement) {
                    recommendations.push({
                        type: 'diversification',
                        priority: 'medium',
                        title: `Add ${complement} to your skillset`,
                        description: `${complement} complements ${primaryLang} well for full-stack development`,
                        action: `Create a project combining ${primaryLang} and ${complement}`,
                        icon: '🔧'
                    });
                }
            }
        }

        // Repository recommendations
        const avgStars = repos.length > 0 ?
            repos.reduce((sum, r) => sum + r.stargazers_count, 0) / repos.length : 0;

        if (avgStars < 5 && repos.length > 10) {
            recommendations.push({
                type: 'visibility',
                priority: 'medium',
                title: 'Increase project visibility',
                description: 'Your projects could benefit from better documentation and promotion',
                action: 'Add comprehensive READMEs, demos, and share on social media',
                icon: '📢'
            });
        }

        // Open source contribution
        const forkCount = repos.filter(r => r.fork).length;
        if (forkCount < repos.length * 0.1) {
            recommendations.push({
                type: 'contribution',
                priority: 'medium',
                title: 'Contribute to open source',
                description: 'Increase your visibility by contributing to popular projects',
                action: `Find ${primaryLang} projects on GitHub with "good first issue" labels`,
                icon: '🤝'
            });
        }

        // Portfolio improvement
        if (repos.filter(r => r.description).length < repos.length * 0.7) {
            recommendations.push({
                type: 'portfolio',
                priority: 'high',
                title: 'Improve repository descriptions',
                description: 'Add descriptions to make your portfolio more professional',
                action: 'Write clear, concise descriptions for all repositories',
                icon: '📝'
            });
        }

        // Hot technology recommendation
        const hotTech = this.marketTrends.hot.find(tech =>
            !languages.some(l => l.name.toLowerCase().includes(tech.toLowerCase())) &&
            !repos.some(r => r.name.toLowerCase().includes(tech.toLowerCase()))
        );

        if (hotTech) {
            recommendations.push({
                type: 'market',
                priority: 'high',
                title: `Explore ${hotTech}`,
                description: `${hotTech} is in high demand in the job market`,
                action: `Build a project using ${hotTech} to stay competitive`,
                icon: '🔥'
            });
        }

        return recommendations.slice(0, 5); // Return top 5 recommendations
    },

    // Identify skill gaps
    identifySkillGaps(languages, repos) {
        const gaps = [];
        const hasBackend = languages.some(l =>
            ['Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#'].includes(l.name)
        );
        const hasFrontend = languages.some(l =>
            ['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(l.name)
        );
        const hasDatabase = repos.some(r =>
            r.name.toLowerCase().includes('sql') ||
            r.description?.toLowerCase().includes('database')
        );
        const hasDevOps = repos.some(r =>
            r.name.toLowerCase().includes('docker') ||
            r.name.toLowerCase().includes('kubernetes') ||
            r.description?.toLowerCase().includes('ci/cd')
        );

        if (!hasBackend && hasFrontend) {
            gaps.push({
                area: 'Backend Development',
                suggestion: 'Learn a backend language like Python or Node.js',
                importance: 'high'
            });
        }

        if (!hasFrontend && hasBackend) {
            gaps.push({
                area: 'Frontend Development',
                suggestion: 'Learn modern JavaScript and a framework like React',
                importance: 'high'
            });
        }

        if (!hasDatabase) {
            gaps.push({
                area: 'Database Skills',
                suggestion: 'Learn SQL and NoSQL databases',
                importance: 'medium'
            });
        }

        if (!hasDevOps) {
            gaps.push({
                area: 'DevOps & Cloud',
                suggestion: 'Learn Docker, CI/CD, and cloud platforms',
                importance: 'medium'
            });
        }

        // Testing
        const hasTests = repos.some(r =>
            r.name.toLowerCase().includes('test') ||
            r.description?.toLowerCase().includes('test')
        );

        if (!hasTests) {
            gaps.push({
                area: 'Testing',
                suggestion: 'Add unit tests and integration tests to your projects',
                importance: 'high'
            });
        }

        return gaps;
    },

    // Suggest career path
    suggestCareerPath(languages, score, repos) {
        const paths = [];
        const primaryLang = languages[0]?.name;
        const level = score.level.name;

        if (primaryLang && this.techStack[primaryLang]) {
            const roles = this.techStack[primaryLang].roles;

            // Current position estimate
            const currentPosition = {
                level: level,
                specialization: primaryLang,
                estimatedRole: roles[0]
            };

            // Short term (6 months)
            paths.push({
                timeframe: 'Short-term (6 months)',
                goal: `Senior ${roles[0]}`,
                steps: [
                    'Master advanced ' + primaryLang + ' concepts',
                    'Contribute to 2-3 open source projects',
                    'Build a complex portfolio project'
                ]
            });

            // Medium term (1-2 years)
            paths.push({
                timeframe: 'Medium-term (1-2 years)',
                goal: roles[1] || 'Tech Lead',
                steps: [
                    'Learn system design and architecture',
                    'Gain experience with cloud platforms',
                    'Mentor junior developers'
                ]
            });

            // Long term (3-5 years)
            paths.push({
                timeframe: 'Long-term (3-5 years)',
                goal: 'Architecture/Management',
                steps: [
                    'Lead major technical initiatives',
                    'Develop business acumen',
                    'Build industry network'
                ]
            });

            return {
                current: currentPosition,
                paths: paths
            };
        }

        return {
            current: { level: level },
            paths: []
        };
    },

    // Create personalized learning plan
    createLearningPlan(languages, repos) {
        const plan = {
            immediate: [],
            shortTerm: [],
            longTerm: []
        };

        const primaryLang = languages[0]?.name;

        // Immediate (this month)
        plan.immediate = [
            {
                task: 'Improve documentation',
                description: 'Add comprehensive READMEs to top 3 repositories',
                effort: '2-3 hours'
            },
            {
                task: 'Code review',
                description: 'Review and refactor your most starred repository',
                effort: '4-5 hours'
            }
        ];

        // Short-term (3 months)
        if (primaryLang && this.techStack[primaryLang]) {
            const related = this.techStack[primaryLang].related[0];
            plan.shortTerm.push({
                task: `Learn ${related}`,
                description: `Complete a course or tutorial on ${related}`,
                effort: '20-30 hours'
            });
        }

        plan.shortTerm.push({
            task: 'Build showcase project',
            description: 'Create a complex project demonstrating your skills',
            effort: '40-50 hours'
        });

        // Long-term (6-12 months)
        plan.longTerm = [
            {
                task: 'Contribute to major OSS',
                description: 'Make significant contributions to popular open source projects',
                effort: '100+ hours'
            },
            {
                task: 'Technical writing',
                description: 'Write technical blog posts or tutorials',
                effort: '50+ hours'
            }
        ];

        return plan;
    },

    // Assess market alignment
    assessMarketAlignment(languages, repos) {
        let alignmentScore = 0;
        const insights = [];

        // Check hot technologies
        languages.forEach(lang => {
            if (this.marketTrends.hot.includes(lang.name)) {
                alignmentScore += 25;
                insights.push(`✅ ${lang.name} is in high demand`);
            } else if (this.marketTrends.growing.includes(lang.name)) {
                alignmentScore += 15;
                insights.push(`📈 ${lang.name} is growing in popularity`);
            } else if (this.marketTrends.stable.includes(lang.name)) {
                alignmentScore += 10;
                insights.push(`💪 ${lang.name} has stable demand`);
            }
        });

        // Check for emerging tech
        const hasEmerging = repos.some(r =>
            this.marketTrends.emerging.some(tech =>
                r.name.toLowerCase().includes(tech.toLowerCase())
            )
        );

        if (hasEmerging) {
            alignmentScore += 20;
            insights.push('🚀 You\'re exploring emerging technologies');
        }

        return {
            score: Math.min(100, alignmentScore),
            insights: insights,
            recommendation: alignmentScore < 50 ?
                'Consider adding more in-demand technologies to your skillset' :
                'Your skills align well with market demands'
        };
    }
};