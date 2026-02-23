# Quick Vercel Deployment Summary

## TL;DR - 5 Steps to Deploy

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2. **Import Project**
- Go to [vercel.com](https://vercel.com)
- Click "Add New" → "Project"
- Import your GitHub repository

### 3. **Set Environment Variable**
In Vercel dashboard → Project Settings → Environment Variables:
```
NEWSAPI_KEY = <your-api-key-from-newsapi.org>
```

### 4. **Configure Build**
- **Build Command:** `cd web && npm run build`
- **Output Directory:** `web/dist`
- **Install Command:** `npm install && cd server && npm install && cd ../web && npm install`

### 5. **Deploy**
Click "Deploy" and wait ~2-5 minutes

---

## What's Already Set Up

✅ **vercel.json** - Deployment configuration  
✅ **api/news/all.js** - Serverless API function  
✅ **Frontend** - Already points to `/api` (works on Vercel)  
✅ **.gitignore** - Excludes build files and node_modules

## Files Structure for Vercel

```
news-reader/
├── api/news/all.js              ← Serverless function
├── web/                         ← React build outputs to web/dist
├── vercel.json                  ← Configuration
└── VERCEL_DEPLOYMENT.md         ← Full guide
```

## After Deployment

Your app will be at: `https://your-project-name.vercel.app`

- Backend API: `https://your-project-name.vercel.app/api/news/all`
- Frontend: `https://your-project-name.vercel.app`

---

## Need Help?

See **VERCEL_DEPLOYMENT.md** for full troubleshooting guide
