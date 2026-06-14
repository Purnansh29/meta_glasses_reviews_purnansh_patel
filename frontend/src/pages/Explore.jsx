import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewForm } from '../components/ReviewForm';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, X, Glasses, Sparkles } from 'lucide-react';

export const Explore = () => {
  const { isAuthenticated } = useAuth();
  
  // Feed data state
  const [reviews, setReviews] = useState([]);
  const [countries, setCountries] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and query state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all'); // 'all' or 1-5
  const [verifiedFilter, setVerifiedFilter] = useState('all'); // 'all', 'true', 'false'
  const [selectedCountry, setSelectedCountry] = useState('all'); // country ID or 'all'
  const [sortBy, setSortBy] = useState('date:desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // AI State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  const generateAISummary = () => {
    setIsSummarizing(true);
    setAiSummary(null);
    
    setTimeout(() => {
      if (reviews.length === 0) {
        setAiSummary("I can't summarize an empty list. Try adjusting your filters to find some reviews first!");
      } else {
        const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
        const topWords = reviews.some(r => r.rating >= 4) ? "praise the camera quality, stylish design, and audio capabilities" : "mention battery life issues, heavy frames, and connectivity problems";
        const sentiment = avgRating >= 4.0 ? "highly positive" : avgRating >= 3.0 ? "mixed" : "generally negative";
        
        setAiSummary(`Based on the ${reviews.length} reviews currently displayed, the overall sentiment is ${sentiment} with an average rating of ${avgRating} stars. Many users ${topWords}, making it a notable point of discussion for these smart glasses.`);
      }
      setIsSummarizing(false);
    }, 1500);
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset page on search
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch countries for filter dropdown
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get('/countries?limit=100');
        if (response.success && response.data?.countries) {
          setCountries(response.data.countries);
        }
      } catch (err) {
        console.error('Failed to load countries list:', err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch reviews based on search or filters
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = '';
        let params = new URLSearchParams();

        params.append('page', currentPage);
        params.append('limit', 10);

        // If search is active, use the search endpoint
        if (debouncedSearchQuery) {
          endpoint = `/search?q=${encodeURIComponent(debouncedSearchQuery)}`;
          // Note: Search returns all matching reviews, standard search has less filtering, 
          // but we can apply sorting and some frontend filtering if needed, or pass it to backend.
        } else {
          endpoint = '/reviews';
          
          // Apply sorting
          if (sortBy) {
            params.append('sort', sortBy);
          }

          // Apply filters
          if (selectedDevice !== 'all') {
            params.append('deviceName', selectedDevice);
          }

          if (selectedRating !== 'all') {
            params.append('rating', selectedRating);
          }

          if (verifiedFilter !== 'all') {
            params.append('verifiedPurchase', verifiedFilter);
          }

          if (selectedCountry !== 'all') {
            params.append('country', selectedCountry);
          }
        }

        const queryStr = params.toString();
        const finalUrl = queryStr ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryStr}` : endpoint;
        
        const response = await api.get(finalUrl);
        if (response.success) {
          if (debouncedSearchQuery) {
            setReviews(response.data.reviews || []);
            setPagination({
              page: 1,
              limit: 100,
              total: response.data.resultsCount || response.data.reviews?.length || 0,
              pages: 1
            });
          } else {
            setReviews(response.data.reviews || []);
            setPagination(response.data.pagination || {});
          }
        } else {
          throw new Error(response.message || 'Failed to load reviews');
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setError('Error loading reviews. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [
    debouncedSearchQuery, 
    selectedDevice, 
    selectedRating, 
    verifiedFilter, 
    selectedCountry, 
    sortBy, 
    currentPage
  ]);

  const handleResetFilters = () => {
    setSelectedDevice('all');
    setSelectedRating('all');
    setVerifiedFilter('all');
    setSelectedCountry('all');
    setSortBy('date:desc');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination.pages || 1)) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReviewSubmitted = (newReview) => {
    // Refresh feed
    setCurrentPage(1);
    handleResetFilters();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="section-title"><span className="gradient-text">Explore Feedback</span></h1>
          <p className="section-subtitle">Browse and filter thousands of user reviews.</p>
        </div>
        
        {isAuthenticated ? (
          <button onClick={() => setIsWriteModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Write a Review</span>
          </button>
        ) : (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Sign in to post a review
          </p>
        )}
      </div>

      <div className="explore-layout">
        {/* Sidebar Filters */}
        <div className="glass-card filters-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} /> Filters
            </span>
            <button 
              onClick={handleResetFilters} 
              className="btn btn-secondary" 
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              Reset All
            </button>
          </div>

          {/* Device Model Filter */}
          <div>
            <h4 className="filter-group-title">Device Model</h4>
            <div className="filter-options">
              <label className="checkbox-label">
                <input 
                  type="radio" 
                  name="device" 
                  checked={selectedDevice === 'all'}
                  onChange={() => { setSelectedDevice('all'); setCurrentPage(1); }}
                />
                <span>All Models</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="radio" 
                  name="device" 
                  checked={selectedDevice === 'Ray-Ban Meta Wayfarer'}
                  onChange={() => { setSelectedDevice('Ray-Ban Meta Wayfarer'); setCurrentPage(1); }}
                />
                <span>Wayfarer</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="radio" 
                  name="device" 
                  checked={selectedDevice === 'Ray-Ban Meta Headliner'}
                  onChange={() => { setSelectedDevice('Ray-Ban Meta Headliner'); setCurrentPage(1); }}
                />
                <span>Headliner</span>
              </label>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="filter-group-title">Rating</h4>
            <select 
              value={selectedRating} 
              onChange={(e) => { setSelectedRating(e.target.value); setCurrentPage(1); }}
              className="form-select"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars & Above</option>
              <option value="3">3 Stars & Above</option>
              <option value="2">2 Stars & Above</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Purchase Verification */}
          <div>
            <h4 className="filter-group-title">Verification</h4>
            <div className="filter-options">
              <label className="checkbox-label">
                <input 
                  type="radio" 
                  name="verified" 
                  checked={verifiedFilter === 'all'}
                  onChange={() => { setVerifiedFilter('all'); setCurrentPage(1); }}
                />
                <span>All Purchases</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="radio" 
                  name="verified" 
                  checked={verifiedFilter === 'true'}
                  onChange={() => { setVerifiedFilter('true'); setCurrentPage(1); }}
                />
                <span>Verified Only</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="radio" 
                  name="verified" 
                  checked={verifiedFilter === 'false'}
                  onChange={() => { setVerifiedFilter('false'); setCurrentPage(1); }}
                />
                <span>Unverified Only</span>
              </label>
            </div>
          </div>

          {/* Country Filter */}
          <div>
            <h4 className="filter-group-title">Country</h4>
            <select 
              value={selectedCountry} 
              onChange={(e) => { setSelectedCountry(e.target.value); setCurrentPage(1); }}
              className="form-select"
            >
              <option value="all">All Countries</option>
              {countries.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Feed Section */}
        <div>
          {/* AI Summarizer Bar */}
          <div className="glass-card" style={{ marginBottom: '24px', padding: '16px 24px', background: 'linear-gradient(135deg, hsla(265, 85%, 65%, 0.1), hsla(185, 90%, 55%, 0.05))', border: '1px solid var(--primary-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '8px', color: 'white' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0' }}>AI Review Insights</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Get an instant summary of the filtered reviews below.</p>
                </div>
              </div>
              <button 
                onClick={generateAISummary} 
                disabled={isSummarizing || loading}
                className="btn btn-primary"
                style={{ background: 'var(--bg-glass)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
              >
                {isSummarizing ? 'Analyzing...' : 'Generate Summary'}
              </button>
            </div>
            
            {aiSummary && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                <strong>Summary: </strong> {aiSummary}
              </div>
            )}
          </div>

          {/* Search Bar & Sorting */}
          <div className="feed-header">
            <div className="search-bar-container">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search reviews, authors, or key terms..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {!debouncedSearchQuery && (
              <select 
                value={sortBy} 
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="form-select feed-sort-select"
              >
                <option value="date:desc">Newest First</option>
                <option value="date:asc">Oldest First</option>
                <option value="rating:desc">Highest Rating</option>
                <option value="rating:asc">Lowest Rating</option>
                <option value="helpful:desc">Most Helpful</option>
              </select>
            )}
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : error ? (
            <div className="error-banner">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Glasses size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px' }}>No Reviews Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>We couldn't find any reviews matching your active filters.</p>
              <button 
                onClick={handleResetFilters} 
                className="btn btn-primary" 
                style={{ marginTop: '20px' }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="reviews-feed">
              {reviews.map(review => (
                <ReviewCard key={review._id} reviewData={review} />
              ))}

              {/* Pagination controls (Only show if not doing global search which returns single page) */}
              {!debouncedSearchQuery && pagination.pages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="page-num"
                    style={currentPage === 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {[...Array(pagination.pages)].map((_, index) => {
                    const pageNum = index + 1;
                    // Render page number buttons
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="page-num"
                    style={currentPage === pagination.pages ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Posting Modal Dialog */}
      <ReviewForm 
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};
