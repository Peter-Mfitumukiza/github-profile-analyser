# GitHub Portfolio Analyzer

A web application that analyzes GitHub profiles and generates professional portfolio insights. Built with vanilla JavaScript, HTML, and CSS.

## Features

### Core Functionality
- **Profile Analysis**: Comprehensive analysis of any public GitHub profile
- **Repository Statistics**: Total stars, forks, watchers, and average metrics
- **Language Distribution**: Visual breakdown of programming languages used
- **Interactive Repository Browser**: Sort and filter repositories by various criteria
- **Export Options**: Download your portfolio data as JSON or PDF
- **Smart Caching**: Reduces API calls with intelligent 15-minute cache
- **Rate Limit Display**: Shows remaining GitHub API calls

### User Interface
- **Minimal Design**: Clean, professional interface with glassmorphism effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Subtle transitions and loading states
- **Dark Mode Ready**: Color scheme designed for future dark mode implementation

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for GitHub API access
- No server or backend setup required!

### Installation

1. Clone or download this repository:
```bash
git clone https://github.com/yourusername/portfolio-analyzer.git
cd portfolio-analyzer
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

## API Information

### GitHub API Usage
- Uses GitHub REST API v3 (no authentication required for public data)
- Rate Limit: 60 requests per hour for unauthenticated users
- Caching: 15-minute cache to minimize API calls

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
│   ├── charts.js         # Chart.js visualizations
│   ├── export.js         # Export functionality (JSON/PDF)
│   └── app.js            # Main application logic
└── README.md             # This file
```

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

1. **Upload files** to your web server:
```bash
scp -r portfolio-analyzer/ user@web01:/var/www/html/
scp -r portfolio-analyzer/ user@web02:/var/www/html/
```

2. **Configure Nginx** (example configuration):
```nginx
server {
    listen 80;
    server_name your-domain.com;
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

3. **Load Balancer Configuration** (for Lb01):
```nginx
upstream portfolio_app {
    server web01:80;
    server web02:80;
}

server {
    listen 80;
    server_name load-balancer.com;

    location / {
        proxy_pass http://portfolio_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### GitHub Pages Deployment

1. Push to GitHub repository
2. Go to Settings > Pages
3. Select source branch (main/master)
4. Access at: `https://yourusername.github.io/portfolio-analyzer/`

## Features Roadmap

- [ ] GitHub OAuth integration for higher rate limits
- [ ] Dark mode toggle
- [ ] Contribution activity heatmap
- [ ] Code quality metrics
- [ ] Repository comparison tool
- [ ] Team/organization analysis
- [ ] CSV export option
- [ ] Progressive Web App (PWA) support

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