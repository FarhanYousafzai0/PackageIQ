# PackageIQ - NPM Package Intelligence Hub

A modern web application for analyzing NPM packages with real-time data from npm registry, GitHub, and Bundlephobia APIs.

![PackageIQ Screenshot](https://via.placeholder.com/800x400?text=PackageIQ)

## Features

- **Package Search**: Search any npm package and get comprehensive analytics
- **Download Statistics**: Weekly downloads with 7-day trend charts
- **Bundle Size Analysis**: Minified + gzipped size from Bundlephobia
- **GitHub Integration**: Stars, forks, open issues, last commit date
- **Health Score**: Algorithmic scoring based on popularity, maintenance, and community
- **AI Verdict**: Smart recommendations (Recommended, Use with Caution, Not Recommended)
- **Side-by-Side Comparison**: Compare two packages with visual winner indicator
- **Dark Mode UI**: Modern glassmorphism design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Component Structure

```
src/
├── components/
│   └── packageiq/
│       ├── PackageCard.jsx      # Package info card with stats
│       ├── HealthScore.jsx      # Circular health score indicator
│       ├── DownloadChart.jsx    # Area chart for download trends
│       ├── BundleSize.jsx       # Bundle size display
│       └── AIVerdict.jsx        # AI recommendation panel
├── pages/
│   ├── PackageSearch.jsx        # Main search page
│   └── CompareView.jsx          # Side-by-side comparison
├── services/
│   └── api.js                   # API integrations
├── types/
│   └── index.js                 # TypeScript definitions
├── App.jsx                      # Root with routing
└── index.css                    # Global styles
```

## API Integrations

### 1. NPM Registry API (Free - No Auth Required)
```
Base URL: https://registry.npmjs.org
Endpoints:
- GET /{package}           # Package metadata
- GET /downloads/point/last-week/{package}  # Weekly downloads
- GET /downloads/range/{start}:{end}/{package}  # Download trends
```

### 2. Bundlephobia API (Free - No Auth Required)
```
Base URL: https://bundlephobia.com/api
Endpoints:
- GET /size?package={package}  # Bundle size analysis
```

### 3. GitHub API (Free - No Auth Required for Public Repos)
```
Base URL: https://api.github.com
Endpoints:
- GET /repos/{owner}/{repo}           # Repository info
- GET /repos/{owner}/{repo}/commits   # Commit history

Rate Limits (Unauthenticated):
- 60 requests per hour

To increase to 5000/hour, create a token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. No scopes needed for public repos
4. Add to requests: headers: { Authorization: 'token YOUR_TOKEN' }
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/packageiq.git
cd packageiq

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables (Optional)

Create `.env` file for GitHub token (increases rate limit):
```
VITE_GITHUB_TOKEN=your_github_token_here
```

Then update `src/services/api.js`:
```javascript
const githubClient = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
  },
});
```

## Deployment on Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd /mnt/okcomputer/output/app
vercel --prod

# Follow prompts:
# - Set up and deploy? [Y/n] → Y
# - Link to existing project? [y/N] → N
# - What's your project name? → packageiq
# - In which directory is your code located? → ./
```

### Option 2: Vercel Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com/new
3. Import your repository
4. Framework Preset: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click Deploy

### Option 3: Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import Git Repository or upload files
4. Configure:
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
5. Deploy

## Health Score Algorithm

The health score (0-100) is calculated based on:

| Factor | Weight | Criteria |
|--------|--------|----------|
| Downloads | 25 pts | >1M=25, >100K=20, >10K=15, >1K=10, >0=5 |
| GitHub Presence | 15 pts | Has GitHub repo = 15 |
| Stars | 15 pts | >10K=15, >5K=12, >1K=9, >500=6, >100=3 |
| Activity | 15 pts | <7 days=15, <30d=12, <90d=9, <180d=6, <365d=3 |
| Issues | 10 pts | <10=10, <50=7, <100=4, <500=2 |
| TypeScript | 10 pts | Has types = 10 |

## AI Verdict Logic

```
Score >= 80: "Excellent choice - highly recommended"
Score >= 60: "Good package - suitable for most use cases"
Score >= 40: "Adequate package - evaluate alternatives"
Score < 40:  "Consider more popular/maintained alternatives"
```

Additional verdicts based on:
- Download count (popularity)
- Last update date (maintenance)
- GitHub stars (community)
- Bundle size (performance)

## Customization

### Changing Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#6366f1',
        dark: '#4f46e5',
      },
    },
  },
}
```

### Adding New Metrics

1. Add API call in `src/services/api.js`
2. Update `PackageData` type in `src/types/index.js`
3. Display in `PackageCard.jsx` or create new component

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use for personal or commercial projects.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

For issues or feature requests, please open an issue on GitHub.

---

Built with ❤️ using React, Tailwind CSS, and free public APIs.
