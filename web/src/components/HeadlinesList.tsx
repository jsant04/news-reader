// web/src/components/HeadlinesList.tsx
import React, { useState, useEffect } from 'react';
import {
  NewsArticle,
  fetchNews,
  getCachedPage,
  setCachedPage,
  clearCache,
  getCacheKey,
  saveFavorite,
  removeFavorite,
  isFavorited,
  getFavorites,
} from '../lib/newsapi';

interface HeadlinesListProps {}

const CATEGORIES = ['politics', 'business', 'tech', 'sports', 'entertainment', 'health', 'science', 'general'];

export const HeadlinesList: React.FC<HeadlinesListProps> = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('sports');
  const [totalFound, setTotalFound] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState(getFavorites());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prefetchedPages, setPrefetchedPages] = useState<Map<number, NewsArticle[]>>(new Map());

  const limit = 3;

  const loadPage = async (pageNum: number, isCached = false) => {
    if (!isCached) setLoading(true);
    setError('');

    try {
      const cacheKey = getCacheKey(pageNum, search, selectedCategory);
      const cached = getCachedPage(cacheKey);

      if (cached) {
        setArticles(cached.articles);
        setTotalFound(cached.totalResults);
        setCurrentPage(pageNum);
        setCurrentIndex(0);
      } else {
        const response = await fetchNews({
          page: pageNum,
          search: search || undefined,
          categories: search ? undefined : selectedCategory,
        });

        setArticles(response.articles);
        setTotalFound(response.totalResults);
        setCachedPage(cacheKey, response);
        setCurrentPage(pageNum);
        setCurrentIndex(0);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load articles';
      setError(message);
      setArticles([]);
    } finally {
      if (!isCached) setLoading(false);
    }
  };

  const prefetchPage = async (pageNum: number) => {
    try {
      const cacheKey = getCacheKey(pageNum, search, selectedCategory);
      const cached = getCachedPage(cacheKey);

      if (!cached && !prefetchedPages.has(pageNum)) {
        const response = await fetchNews({
          page: pageNum,
          search: search || undefined,
          categories: search ? undefined : selectedCategory,
        });
        setPrefetchedPages((prev) => new Map(prev).set(pageNum, response.articles));
        setCachedPage(cacheKey, response);
      }
    } catch (err) {
      console.error('Prefetch error:', err);
    }
  };

  useEffect(() => {
    clearCache();
    setPrefetchedPages(new Map());
    setCurrentPage(1);
    setCurrentIndex(0);
    loadPage(1);
  }, [search, selectedCategory, showFavorites]);

  useEffect(() => {
    if (showFavorites) return;

    // Prefetch next page when reaching index 1 (2nd article)
    if (currentIndex === 1 && currentPage < Math.ceil(totalFound / limit)) {
      prefetchPage(currentPage + 1);
    }

    // Prefetch previous page when at index 0 and page > 1
    if (currentIndex === 0 && currentPage > 1) {
      prefetchPage(currentPage - 1);
    }
  }, [currentIndex, currentPage, showFavorites, totalFound]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSearch('');
    setShowFavorites(false);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setShowFavorites(false);
  };

  const handleNextArticle = () => {
    if (currentIndex < articles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (currentPage < Math.ceil(totalFound / limit)) {
      loadPage(currentPage + 1);
    }
  };

  const handlePrevArticle = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  };

  const handleGoToPage = (pageNum: number) => {
    loadPage(pageNum);
  };

  const handleToggleFavorite = (article: NewsArticle) => {
    if (isFavorited(article.url)) {
      removeFavorite(article.url);
    } else {
      saveFavorite(article);
    }
    setFavorites(getFavorites());
  };

  const handleShowFavorites = () => {
    setShowFavorites(!showFavorites);
    setSidebarOpen(false);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalFound / limit);
  const firstArticleNum = (currentPage - 1) * limit + currentIndex + 1;
  const displayArticles = showFavorites
    ? favorites.map((fav) => fav.article)
    : articles;
  const currentArticle = displayArticles[currentIndex];

  // Determine which pages to show in pagination
  const getPaginationPages = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 2) {
      pages.push(1, 2, 3);
    } else if (currentPage >= totalPages - 1) {
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(currentPage - 1, currentPage, currentPage + 1);
    }
    return pages;
  };

  const paginationPages = showFavorites ? [] : getPaginationPages();

  return (
    <div className="app-container">
      {/* Mobile Filter Toggle */}
      <button
        className="filter-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle filters"
      >
        {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2 className="sidebar-header">🇵🇭 Philippines News</h2>

        <input
          type="text"
          className="search-box"
          placeholder="Search Philippine news..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Search articles"
        />

        <div className="filter-group">
          <div className="filter-group-title">Categories</div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-button ${selectedCategory === cat && !search ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className={`favorites-button ${showFavorites ? '' : 'secondary'}`}
            onClick={handleShowFavorites}
            aria-label={showFavorites ? 'Exit favorites' : 'View favorites'}
          >
            {showFavorites ? '← Back to News' : `♥ Favorites (${favorites.length})`}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {loading && <div className="loading-skeleton" aria-label="Loading articles" />}

        {error && <div className="error-message" role="alert">{error}</div>}

        {!loading && !error && displayArticles.length === 0 && (
          <div className="empty-state">
            {showFavorites
              ? 'No favorites yet. Save articles to view them here!'
              : 'No articles found. Try a different search or category.'}
          </div>
        )}

        {!loading && !error && currentArticle && (
          <>
            <article className="article-card" role="article">
              <img
                src={currentArticle.urlToImage || '/placeholder.svg'}
                alt={currentArticle.title}
                className="article-image"
              />

              <div className="article-overlay">
                <h1 className="article-title">{currentArticle.title}</h1>

                <p className="article-description">{currentArticle.description}</p>

                <p className="article-source">
                  {currentArticle.source.name} • {new Date(currentArticle.publishedAt).toLocaleDateString()}
                </p>

                <div className="article-controls">
                  <button
                    className={`favorite-button ${isFavorited(currentArticle.url) ? 'saved' : ''}`}
                    onClick={() => handleToggleFavorite(currentArticle)}
                    aria-label={isFavorited(currentArticle.url) ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    {isFavorited(currentArticle.url) ? '★ Saved' : '☆ Save'}
                  </button>
                  <a
                    href={currentArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-button"
                  >
                    View Full Article →
                  </a>
                </div>
              </div>
            </article>

            {!showFavorites && (
              <nav className="pagination" aria-label="Article pagination">
                <button
                  className="pager-button"
                  onClick={() => handleGoToPage(1)}
                  disabled={currentPage === 1}
                  title="First page"
                  aria-label="Go to first page"
                >
                  «
                </button>

                <button
                  className="pager-button"
                  onClick={handlePrevArticle}
                  disabled={currentPage === 1 && currentIndex === 0}
                  title="Previous article"
                  aria-label="Previous article"
                >
                  ‹
                </button>

                {paginationPages.map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`pager-button ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => handleGoToPage(pageNum)}
                    title={`Go to page ${pageNum}`}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={pageNum === currentPage ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="pager-button"
                  onClick={handleNextArticle}
                  disabled={currentPage === totalPages && currentIndex === articles.length - 1}
                  title="Next article"
                  aria-label="Next article"
                >
                  ›
                </button>

                <span className="sr-only">
                  Article {firstArticleNum} of {totalFound}
                </span>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default HeadlinesList;
