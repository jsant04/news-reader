// web/src/lib/newsapi.ts

const API_BASE = '/api';

export interface NewsArticle {
  title: string;
  description: string;
  urlToImage: string | null;
  url: string;
  author: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  content: string | null;
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
  status: string;
}

export interface FetchOptions {
  page: number;
  search?: string;
  categories?: string;
}

export async function fetchNews(options: FetchOptions): Promise<NewsResponse> {
  const { page, search, categories } = options;

  const params = new URLSearchParams({
    page: String(page),
  });

  if (search && search.trim()) {
    params.append('search', search);
  } else if (categories && categories.trim()) {
    params.append('categories', categories);
  }

  const url = `${API_BASE}/news/all?${params.toString()}`;
  console.log(`Fetching: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to fetch news: ${response.statusText}`);
  }

  return response.json();
}

// Page cache
const pageCache = new Map<string, NewsResponse>();

export function getCachedPage(cacheKey: string): NewsResponse | null {
  return pageCache.get(cacheKey) || null;
}

export function setCachedPage(cacheKey: string, data: NewsResponse): void {
  pageCache.set(cacheKey, data);
}

export function clearCache(): void {
  pageCache.clear();
}

export function getCacheKey(page: number, search: string, categories: string): string {
  return `${search || categories}_page${page}`;
}

// Favorites management
const FAVORITES_KEY = 'news_reader_favorites';

export interface Favorite {
  url: string;
  article: NewsArticle;
  savedAt: number;
}

export function getFavorites(): Favorite[] {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveFavorite(article: NewsArticle): void {
  const favorites = getFavorites();
  const exists = favorites.some((fav) => fav.url === article.url);

  if (!exists) {
    favorites.push({
      url: article.url,
      article,
      savedAt: Date.now(),
    });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(url: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter((fav) => fav.url !== url);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

export function isFavorited(url: string): boolean {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.url === url);
}
