# News Reader Server

Express proxy for NewsAPI that securely handles API requests.

## Setup

1. Copy `.env.example` to `.env` and add your NewsAPI key from https://newsapi.org/
2. Install dependencies: `npm install`
3. Run: `npm run dev`

The server listens on `http://localhost:5178`

## API Routes

- `GET /api/health` - Health check
- `GET /api/news/all` - News proxy endpoint

Query parameters:
- `page` (default: 1)
- `search` or `categories` - Query terms for news search

## Security

- The API key is stored in `.env` and never exposed to the browser
- All requests are proxied through this server
- The server logs sanitized URLs without the key
- NewsAPI enforces rate limits based on your plan
