# Deploying News Reader to Vercel

## Prerequisites
1. [Vercel Account](https://vercel.com) (sign up with GitHub, GitLab, or Bitbucket)
2. [GitHub account](https://github.com) with your code pushed
3. NewsAPI key from [newsapi.org](https://newsapi.org)

## Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: news reader app"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/news-reader.git
git branch -M main
git push -u origin main
```

## Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Choose your `news-reader` repository
5. Click "Import"

## Step 3: Configure Environment Variables

In the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following:
   - **Name:** `NEWSAPI_KEY`
   - **Value:** Your NewsAPI key (get from [newsapi.org](https://newsapi.org/account/api-keys))
4. Make sure it's set for "Production", "Preview", and "Development"
5. Click "Save"

## Step 4: Update Build Settings

1. **Framework Preset:** Select "Other"
2. **Build Command:** `cd web && npm run build`
3. **Output Directory:** `web/dist`
4. **Install Command:** `npm install && cd server && npm install && cd ../web && npm install`

## Step 5: Deploy

1. Click "Deploy"
2. Wait for the deployment to complete (takes ~2-5 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

## Project Structure for Vercel

```
news-reader/
├── api/                          # Serverless functions
│   └── news/
│       └── all.js               # News API endpoint
├── web/                          # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                       # Local development only
├── package.json                  # Root package.json
└── vercel.json                   # Vercel configuration
```

## Frontend API Configuration

The frontend automatically uses the correct API endpoint:
- **Local:** `http://localhost:5178/api`
- **Production (Vercel):** `https://your-project-name.vercel.app/api`

The `newsapi.ts` file uses `/api` as the base URL, which works in both environments.

## Troubleshooting

### Build Fails
- Make sure all dependencies are in `package.json` files
- Check that the build command is correct
- Verify `NEWSAPI_KEY` is set in environment variables

### API Returns 401/403
- Check that `NEWSAPI_KEY` is correctly set in Vercel
- Verify the key is active on newsapi.org
- Check the server logs in Vercel dashboard

### Blank Page After Deploy
- Check browser console for errors
- Verify API endpoint is reachable: `https://your-project-name.vercel.app/api/health`
- Check Vercel deployment logs

### Images Not Loading
- This is normal if sources don't have images
- Check the placeholder fallback is working

## Domain Setup (Optional)

To use a custom domain:

1. In Vercel dashboard, go to project settings
2. Navigate to "Domains"
3. Add your domain
4. Follow DNS configuration instructions

## Monitoring & Logs

1. Go to Vercel dashboard
2. Click on your project
3. Navigate to "Deployments"
4. Click the deployment to see logs
5. Check "Functions" tab for API logs

## Local Development Still Works

The local setup with `npm run dev` still works and connects to your local server on port 5178.

To use the Vercel deployed API locally:
- Change `API_BASE` in `web/src/lib/newsapi.ts` to your Vercel URL
- Rebuild with `npm run build`

## Next Steps

- Set up automatic deployments (happens on every push to main)
- Configure analytics and monitoring
- Add custom domain
- Set up staging environment for previews
