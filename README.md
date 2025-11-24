# GitHub Portfolio Analyzer

A professional web application that analyzes GitHub profiles and provides quantified developer insights, career recommendations, and contribution patterns. Built with vanilla JavaScript, HTML, and CSS.

## Features

### Core Functionality
- **Developer Score (0-100)**: Quantified expertise level with breakdown by Impact, Expertise, Consistency, Quality, and Growth
- **Career Insights**: Personalized recommendations, skill gap analysis, and learning plans
- **Contribution Patterns**: Analysis of coding schedule, collaboration style, and language evolution
- **Profile Analysis**: Comprehensive analysis of any public GitHub profile
- **Repository Statistics**: Total stars, forks, watchers, and average metrics
- **Language Distribution**: Visual breakdown with Chart.js visualizations
- **Interactive Repository Browser**: Sort and filter repositories by various criteria
- **Export Options**: Download your portfolio data as JSON or PDF
- **Smart Caching**: Reduces API calls with intelligent 15-minute cache
- **Rate Limit Display**: Shows remaining GitHub API calls

### Enhanced Features (What GitHub Doesn't Provide)
- **Quantified Developer Score**: Single metric for resume/portfolio use
- **Career Path Projection**: Shows progression for next 6 months, 1-2 years, and 3-5 years
- **Market Alignment Analysis**: How well your skills match current job market demands
- **Achievements System**: Earned badges based on repository metrics
- **Work Pattern Insights**: Identifies when you code most (days/hours)
- **Professional PDF Export**: Includes score, insights, and recommendations

### User Interface
- **Clean, Professional Design**: Minimal UI
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Subtle transitions and loading states
- **Single Accent Color**: Consistent indigo theme throughout

## Demo

Watch the application in action:

**[Video Demo on YouTube](https://www.youtube.com/watch?v=EEfYxlajgqA)**

See how the analyzer processes GitHub profiles, generates developer scores, provides career insights, and creates professional portfolio exports.

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for GitHub API access
- No server or backend setup required!

### Installation

1. Clone or download this repository:
```bash
git clone https://github.com/Peter-Mfitumukiza/github-profile-analyser.git
cd github-profile-analyser
```

2. Open `index.html` in your web browser:
   - Double-click the `index.html` file, OR
   - Use a local web server (recommended for best performance):
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000` in your browser

### Usage

1. **Analyze a Profile**:
   - Enter any GitHub username in the search box
   - Click "Analyze Profile" or press Enter
   - Wait for the analysis to complete

2. **Explore Data**:
   - View profile statistics and metrics
   - Browse repositories with sorting options (stars, forks, recent updates)
   - Filter repositories by programming language
   - Examine language distribution chart

3. **Export Your Portfolio**:
   - **JSON Export**: Download raw data for further analysis
   - **PDF Export**: Generate a professional portfolio document

## Why Use This Over GitHub's Profile?

### Real Value for Developers
1. **Quantified Expertise**: Get a single score (0-100) to put on your resume
2. **Career Guidance**: Actionable recommendations based on your profile analysis
3. **Professional Export**: Generate PDF portfolios for job applications
4. **Skill Gap Analysis**: Identify what to learn next for career growth
5. **Market Intelligence**: See how your skills align with job market demands

### Perfect For
- **Job Seekers**: Professional portfolio document with developer score
- **Recruiters**: Quick assessment without navigating GitHub's interface
- **Developers**: Self-assessment and career planning tool
- **Teams**: Evaluate potential collaborators or team members

## API Information

### GitHub API Rate Limits

**Without Authentication (Default):**
- 60 requests per hour per IP address
- ~1-2 complete profile analyses per hour
- With caching: 2-3 different profiles per hour

**With Personal Access Token (Optional):**
- 5,000 requests per hour
- Unlimited profile analyses
- See "API Key (Optional)" section below for setup

### API Endpoints Used
- User Profile: `GET /users/{username}`
- User Repositories: `GET /users/{username}/repos`
- Repository Languages: `GET /repos/{owner}/{repo}/languages`

### API Key (Optional)
For higher rate limits (5000 requests/hour), you can add a personal access token:
1. Generate a token at https://github.com/settings/tokens
2. Modify `js/api.js` to include your token in the headers
3. **Important**: Never commit your token to a public repository!

## Project Structure

```
portfolio-analyzer/
├── index.html              # Main HTML file
├── css/
│   ├── style.css          # Core styles and design system
│   └── components.css     # Component-specific styles
├── js/
│   ├── api.js            # GitHub API integration
│   ├── ui.js             # DOM manipulation and UI updates
│   ├── ui-enhanced.js    # Enhanced UI for new features
│   ├── scoring.js        # Developer scoring algorithms
│   ├── insights.js       # Career insights and recommendations
│   ├── patterns.js       # Contribution pattern analysis
│   ├── charts.js         # Chart.js visualizations
│   ├── export.js         # Export functionality (JSON/PDF)
│   └── app.js            # Main application logic
├── .gitignore            # Git ignore file
└── README.md             # This file
```

## Developer Score Methodology

The developer score (0-100) is calculated using five weighted categories:

### Score Breakdown
- **Impact (30%)**: Total stars, forks, and community reach
- **Expertise (25%)**: Account age, language diversity, framework detection
- **Quality (20%)**: Documentation quality, star-to-repo ratio, code usefulness
- **Consistency (15%)**: Regular activity, project maintenance, update frequency
- **Growth (10%)**: Improvement over time, follower growth rate

### Score Levels
- **90-100**: Expert Developer
- **75-89**: Senior Developer
- **60-74**: Intermediate Developer
- **40-59**: Junior Developer
- **0-39**: Beginner Developer

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **JavaScript (ES6+)**: Async/await, modules, arrow functions
- **Chart.js**: Beautiful data visualizations
- **jsPDF**: PDF generation
- **html2canvas**: Screenshot capture for PDFs

## Deployment

### Web Server Deployment

To deploy on Web01 and Web02 servers:

1. **Upload files**:
```bash
scp -r portfolio-analyzer/ ubuntu@18.207.214.35:/var/www/html/
scp -r portfolio-analyzer/ ubuntu@3.86.236.240:/var/www/html/
```

2. **Configure Nginx**:
```nginx
server {
    listen 80;
    server_name 18.207.214.35;
    root /var/www/html/portfolio-analyzer;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Enable CORS for GitHub API
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **Load Balancer Configuration** :

```haproxy
global
    daemon
    maxconn 256

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend web_frontend
    bind *:80
    default_backend web_servers

backend web_servers
    balance roundrobin
    server web01 18.207.214.35:80 check
    server web02 3.86.236.240:80 check
```

## Troubleshooting

### Common Issues

1. **"User not found" error**:
   - Check the username spelling
   - Ensure the profile is public

2. **"API rate limit exceeded"**:
   - Wait for rate limit reset (usually within an hour)
   - Consider using a personal access token

3. **Charts not displaying**:
   - Ensure Chart.js CDN is accessible
   - Check browser console for errors

4. **PDF export not working**:
   - Allow pop-ups for the site
   - Ensure jsPDF library is loaded

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

- GitHub API: https://docs.github.com/en/rest
- Chart.js: https://www.chartjs.org/
- jsPDF: https://github.com/parallax/jsPDF
- Inter Font: https://fonts.google.com/specimen/Inter

## License

This project is open source and available under the MIT License.

## Author

Created as part of a web infrastructure assignment to demonstrate API integration, deployment, and load balancing skills.

---

**Note**: This application is not affiliated with GitHub, Inc.
