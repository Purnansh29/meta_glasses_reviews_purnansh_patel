import React, { useState } from 'react';
import { api } from '../services/api';
import { Database, Search, Terminal, ChevronRight, Star, ThumbsUp, ShieldCheck } from 'lucide-react';
import { ReviewCard } from '../components/ReviewCard';

export const AdvancedQueries = () => {
  const [activeTab, setActiveTab] = useState('compare');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showVisual, setShowVisual] = useState(true);
  const [params, setParams] = useState({
    user1: 'HebeZ',
    user2: 'Karla silva',
    rating1: '5',
    rating2: '1',
    year: '2025',
    month: '3',
    day: '9',
    rating: '5',
    country: 'United States',
    score: '0.8',
    profile: 'amazon',
    device: 'Ray-Ban Meta Wayfarer',
    title: 'Great',
    status: 'true',
    count: '5'
  });

  const handleParamChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const executeQuery = async (endpoint) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await api.get(endpoint);
      setResults(response);
    } catch (err) {
      setError(err.message || 'API request failed');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (loading) return <div className="loader-container"><div className="loader"></div></div>;
    if (error) return <div className="error-banner">{error}</div>;
    if (!results) return <div style={{ color: 'var(--text-muted)' }}>Select a query on the left to view results here.</div>;
    
    if (!showVisual) {
      return (
        <div style={{ background: 'hsla(0,0%,0%,0.3)', padding: '16px', borderRadius: '8px', overflowX: 'auto' }}>
          <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      );
    }

    const dataObj = results.data || {};
    
    // Case 1: User Comparison
    if (dataObj.user1 && dataObj.user2) {
      const { user1, user2 } = dataObj;
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[user1, user2].map((usr, i) => (
            <div key={usr.name} className="glass-card" style={{ padding: '20px', border: `1px solid ${i === 0 ? 'var(--primary)' : 'var(--secondary)'}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle, ${i === 0 ? 'var(--primary)' : 'var(--secondary)'} 0%, transparent 70%)`, opacity: 0.15, pointerEvents: 'none' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${i === 0 ? 'var(--primary)' : 'var(--secondary)'}, var(--border-glass))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>
                  {usr.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{usr.name}</h4>
                  {usr.profile && (
                    <a href={usr.profile} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', display: 'inline-block', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      View Amazon Profile
                    </a>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Average Rating</span>
                  <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                    <Star size={14} fill="var(--warning)" color="var(--warning)" /> {usr.averageRating.toFixed(1)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Reviews</span>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{usr.totalReviews}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Helpful Votes</span>
                  <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                    <ThumbsUp size={14} color="var(--primary)" /> {usr.totalHelpful}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verified Purchase Rate</span>
                  <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--success)' }}>
                    <ShieldCheck size={14} /> {usr.verifiedPercentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Case 2: Rating Comparison
    if (dataObj.rating1 && dataObj.rating2) {
      const { rating1, rating2 } = dataObj;
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[rating1, rating2].map((rt, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px', border: `1px solid ${i === 0 ? 'var(--primary)' : 'var(--secondary)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--warning), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>
                  {rt.rating}★
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Rating {rt.rating} Star Group</h4>
                  <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>API Metric Comparison</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Reviews</span>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{rt.totalReviews}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Average Helpfulness</span>
                  <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                    <ThumbsUp size={14} color="var(--primary)" /> {rt.averageHelpful.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verified Purchase Rate</span>
                  <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--success)' }}>
                    <ShieldCheck size={14} /> {rt.verifiedPercentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Case 3: Reviews list
    const reviews = dataObj.reviews || dataObj.trendingReviews || dataObj.randomReviews || results.reviews;
    if (Array.isArray(reviews)) {
      if (reviews.length === 0) {
        return <div style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>No reviews found matching this query.</div>;
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '8px' }}>
          {reviews.map((rev, i) => (
            <ReviewCard key={rev._id || i} reviewData={rev} />
          ))}
        </div>
      );
    }

    // Case 4: Statistics matrices
    if (Array.isArray(dataObj.ratingsMetrics)) {
      return (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ marginBottom: '16px' }}>Ratings Distribution Metadata</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dataObj.ratingsMetrics.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-glass)' }}>
                <span>{item.rating} Star</span>
                <span>Count: <strong>{item.totalReviews}</strong></span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (Array.isArray(dataObj.verifiedMetrics)) {
      return (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ marginBottom: '16px' }}>Verified Purchase Metadata</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dataObj.verifiedMetrics.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-glass)' }}>
                <span>{item.verifiedPurchase ? 'Verified Purchase' : 'Unverified Purchase'}</span>
                <span>Count: <strong>{item.totalReviews}</strong></span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Case 5: Single entity objects
    if (typeof dataObj === 'object' && Object.keys(dataObj).length > 0) {
      const keys = Object.keys(dataObj);
      if (keys.length > 0 && typeof dataObj[keys[0]] !== 'object') {
        return (
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {keys.map((k) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{String(dataObj[k])}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }

    return (
      <div style={{ background: 'hsla(0,0%,0%,0.3)', padding: '16px', borderRadius: '8px', overflowX: 'auto' }}>
        <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    );
  };

  const QueryItem = ({ title, endpoint, onClick }) => (
    <button onClick={() => onClick()} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
      <ChevronRight size={14} style={{ flexShrink: 0 }} />
    </button>
  );

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title"><span className="gradient-text">Advanced Analytics</span></h1>
        <p className="section-subtitle">Raw API access to advanced analytical and parametric queries.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
            <button className={`btn ${activeTab === 'compare' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('compare')} style={{flex: 1}}>Compare</button>
            <button className={`btn ${activeTab === 'time' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('time')} style={{flex: 1}}>Time</button>
            <button className={`btn ${activeTab === 'attrs' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('attrs')} style={{flex: 1}}>Attributes</button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Param Configuration</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeTab === 'compare' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>User 1</span>
                      <input type="text" name="user1" value={params.user1} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="User 1" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>User 2</span>
                      <input type="text" name="user2" value={params.user2} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="User 2" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rating 1</span>
                      <input type="text" name="rating1" value={params.rating1} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Rating 1" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rating 2</span>
                      <input type="text" name="rating2" value={params.rating2} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Rating 2" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Limit/Count</span>
                    <input type="text" name="count" value={params.count} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Limit" />
                  </div>
                </>
              )}

              {activeTab === 'time' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Year</span>
                    <input type="text" name="year" value={params.year} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Year" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Month</span>
                    <input type="text" name="month" value={params.month} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Month" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Day</span>
                    <input type="text" name="day" value={params.day} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Day" />
                  </div>
                </div>
              )}

              {activeTab === 'attrs' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rating</span>
                      <input type="text" name="rating" value={params.rating} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Rating" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Country</span>
                      <input type="text" name="country" value={params.country} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Country" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Min Helpful Score</span>
                      <input type="text" name="score" value={params.score} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Score" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>User Profile</span>
                      <input type="text" name="profile" value={params.profile} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Profile" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Device Name</span>
                      <input type="text" name="device" value={params.device} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Device" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified Status (true/false)</span>
                      <input type="text" name="status" value={params.status} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Status" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Title Contains</span>
                      <input type="text" name="title" value={params.title} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Title" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Count/Limit</span>
                      <input type="text" name="count" value={params.count} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Count" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {activeTab === 'compare' && (
            <div>
              <h4 style={{ marginBottom: '12px' }}>Comparison Routes</h4>
              <QueryItem title={`Compare Users: ${params.user1} vs ${params.user2}`} onClick={() => executeQuery(`/reviews/compare/users?user1=${params.user1}&user2=${params.user2}`)} />
              <QueryItem title={`Compare Ratings: ${params.rating1} vs ${params.rating2}`} onClick={() => executeQuery(`/reviews/compare/ratings?rating1=${params.rating1}&rating2=${params.rating2}`)} />
              <QueryItem title={`Random Fetch (Limit: ${params.count})`} onClick={() => executeQuery(`/reviews/fetch/random?limit=${params.count}`)} />
              <QueryItem title={`Trending Fetch (Limit: ${params.count})`} onClick={() => executeQuery(`/reviews/fetch/trending?limit=${params.count}`)} />
            </div>
          )}

          {activeTab === 'time' && (
            <div>
              <h4 style={{ marginBottom: '12px' }}>Time Routes</h4>
              <QueryItem title={`Year: ${params.year}`} onClick={() => executeQuery(`/reviews/year/${params.year}`)} />
              <QueryItem title={`Month: ${params.month}`} onClick={() => executeQuery(`/reviews/month/${params.month}`)} />
              <QueryItem title={`Day: ${params.day}`} onClick={() => executeQuery(`/reviews/day/${params.day}`)} />
              <QueryItem title={`Date: ${params.year}/${params.month}/${params.day}`} onClick={() => executeQuery(`/reviews/date/${params.year}/${params.month}/${params.day}`)} />
            </div>
          )}

          {activeTab === 'attrs' && (
            <div>
              <h4 style={{ marginBottom: '12px' }}>Attribute Routes</h4>
              <QueryItem title="Positive Reviews" onClick={() => executeQuery('/reviews/positive')} />
              <QueryItem title="Negative Reviews" onClick={() => executeQuery('/reviews/negative')} />
              <QueryItem title="All Ratings Metadata" onClick={() => executeQuery('/ratings')} />
              <QueryItem title="All Verified Metadata" onClick={() => executeQuery('/verified')} />
              <QueryItem title={`Rating: ${params.rating}`} onClick={() => executeQuery(`/ratings/${params.rating}`)} />
              <QueryItem title={`Country: ${params.country}`} onClick={() => executeQuery(`/country/${params.country}/reviews`)} />
              <QueryItem title={`Country + Rating`} onClick={() => executeQuery(`/reviews/country/${params.country}/rating/${params.rating}`)} />
              <QueryItem title={`Helpful Score >= ${params.score}`} onClick={() => executeQuery(`/reviews/helpful-score/${params.score}`)} />
              <QueryItem title={`Profile Contains: ${params.profile}`} onClick={() => executeQuery(`/reviews/profile/${params.profile}`)} />
              <QueryItem title={`Device Name: ${params.device}`} onClick={() => executeQuery(`/reviews/device/${params.device}`)} />
              <QueryItem title={`User: ${params.user1} Reviews`} onClick={() => executeQuery(`/users/${params.user1}/reviews`)} />
              <QueryItem title={`Verified Status: ${params.status}`} onClick={() => executeQuery(`/verified/${params.status}`)} />
              <QueryItem title={`User + Rating`} onClick={() => executeQuery(`/reviews/user/${params.user1}/rating/${params.rating}`)} />
              <QueryItem title={`Country + Verified`} onClick={() => executeQuery(`/reviews/country/${params.country}/verified/${params.status}`)} />
              <QueryItem title={`Title Contains: ${params.title}`} onClick={() => executeQuery(`/reviews/title/${params.title}`)} />
              <QueryItem title={`Min Helpful Count: ${params.count}`} onClick={() => executeQuery(`/reviews/helpful/${params.count}`)} />
              <QueryItem title={`Is Positive Status: ${params.status}`} onClick={() => executeQuery(`/reviews/positive/${params.status}`)} />
            </div>
          )}
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>Query Results</h3>
            </div>
            {results && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`btn btn-sm ${showVisual ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setShowVisual(true)}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Visual Board
                </button>
                <button 
                  className={`btn btn-sm ${!showVisual ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setShowVisual(false)}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Raw JSON
                </button>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {renderResult()}
          </div>
        </div>
      </div>
    </div>
  );
};
