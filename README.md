# FinTweet Flow

X-style feed that pulls trending finance news and generates ready-to-post tweets with shareable images.

Built for **Trades & Gains**.

## Features

- 📰 Live news from Feedly (or demo mode)
- 🤖 AI-powered tweet generation via Claude (4 styles: Spicy, Pro, Degen, News)
- 🖼️ Auto-generated shareable images (1200×628 Twitter-optimized)
- 📈 Sentiment detection (bullish/bearish/neutral)
- 🔥 Heat scores for trending stories
- ⚡ Auto-refresh (configurable intervals)

## Quick Deploy to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
# In terminal, navigate to this folder
cd fintweet-flow-app

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/fintweet-flow.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `fintweet-flow` repository
4. Vercel auto-detects Vite - just click "Deploy"
5. Done! You'll get a URL like `fintweet-flow.vercel.app`

### Step 3: Custom Domain (Optional)

In Vercel dashboard → Your Project → Settings → Domains → Add your domain

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

Click the ⚙️ Settings icon in the app to configure:

### Feedly Setup

1. **Get your Feedly token:**
   - Option A: Feedly → Team Settings → API (Enterprise)
   - Option B: Open browser console on feedly.com → type `feedlyToken`

2. **Get your Stream ID:**
   - For all feeds: `user/[YOUR_USER_ID]/category/global.all`
   - For a specific category: Check the URL when viewing it in Feedly
   - For a specific feed: `feed/https://example.com/rss`

### Tweet Generation

The app uses Claude API (runs in browser via Anthropic's API). Tweet styles:
- 🌶️ **Spicy** - Hot takes, controversial
- 📊 **Pro** - Clean, analytical
- 🎰 **Degen** - Full send energy
- 📰 **News** - Just the facts

## Alternative Deployment Options

### Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. "Add new site" → "Import an existing project"
4. Select your repo
5. Build command: `npm run build`
6. Publish directory: `dist`

### Self-Hosted (VPS/Docker)

```bash
# Build
npm run build

# Serve the dist folder with any static server
npx serve dist

# Or with nginx, point root to /path/to/dist
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide Icons
- Claude API (for tweet generation)
- Feedly API (for news)
- Canvas API (for image generation)

## License

MIT - Do whatever you want with it.

---

Built for the Trades & Gains community 📈
