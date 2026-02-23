// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5178;
const API_KEY = process.env.NEWSAPI_KEY;

if (!API_KEY) {
  console.error('ERROR: NEWSAPI_KEY not set in .env file');
  process.exit(1);
}

// Philippine news sources to filter by
const PHILIPPINE_SOURCES = [
  'inquirer',
  'gmanetwork',
  'philstar',
  'abs-cbn',
  'rappler',
  'cnn-philippines',
  'bbc',
  'reuters',
  'ap',
];

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Proxy endpoint for news
app.get('/api/news/all', async (req, res) => {
  try {
    const { page = 1, search, categories } = req.query;

    // Try to fetch news with date range - start with 7 days ago
    let fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    let fromDateStr = fromDate.toISOString().split('T')[0];

    // Build query for NewsAPI
    const buildParams = (dateStr) => {
      const params = new URLSearchParams({
        apiKey: API_KEY,
        pageSize: '12',
        page: page,
        from: dateStr,
        sortBy: 'publishedAt',
        language: 'en',
      });

      let query;
      if (search) {
        query = `Philippines ${search}`;
      } else if (categories) {
        query = `Philippines ${categories}`;
      } else {
        query = 'Philippines';
      }
      
      params.append('q', query);
      return params;
    };

    let params = buildParams(fromDateStr);
    let apiUrl = `https://newsapi.org/v2/everything?${params.toString()}`;

    // Create a sanitized URL for logging (without token)
    let sanitizedUrl = apiUrl.replace(API_KEY, '[REDACTED]');
    console.log(`Fetching: ${sanitizedUrl}`);

    let response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'NewsReader/1.0' },
    });

    if (response.status === 429) {
      return res.status(429).json({
        error: 'Daily request limit reached. Please try again tomorrow.',
      });
    }

    if (response.status === 401 || response.status === 403) {
      console.error('Auth error from NewsAPI');
      return res.status(401).json({
        error: 'NewsAPI authentication failed. Check your API key.',
      });
    }

    if (!response.ok) {
      console.error(`NewsAPI error: ${response.status}`);
      return res.status(response.status).json({
        error: `NewsAPI error: ${response.statusText}`,
      });
    }

    let data = await response.json();

    // If no articles found in 7-day window, try 30 days ago
    if (data.articles && data.articles.length === 0 && data.totalResults === 0) {
      console.log('No articles found in 7-day window, trying 30 days...');
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      fromDateStr = fromDate.toISOString().split('T')[0];

      params = buildParams(fromDateStr);
      apiUrl = `https://newsapi.org/v2/everything?${params.toString()}`;
      sanitizedUrl = apiUrl.replace(API_KEY, '[REDACTED]');
      console.log(`Fetching: ${sanitizedUrl}`);

      response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'NewsReader/1.0' },
      });

      if (!response.ok) {
        return res.status(response.status).json({
          error: `NewsAPI error: ${response.statusText}`,
        });
      }

      data = await response.json();
    }

    // Filter articles to only include Philippine news sources
    if (data.articles) {
      const filteredArticles = data.articles.filter((article) => {
        const sourceId = article.source.id?.toLowerCase() || '';
        const sourceName = article.source.name?.toLowerCase() || '';
        
        return PHILIPPINE_SOURCES.some(source => 
          sourceId.includes(source) || sourceName.includes(source)
        );
      });

      // Update totalResults to reflect filtered count
      const originalTotal = data.totalResults;
      data.articles = filteredArticles;
      data.totalResults = filteredArticles.length;
      
      console.log(`Filtered ${originalTotal} articles to ${filteredArticles.length} from Philippine sources`);
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
