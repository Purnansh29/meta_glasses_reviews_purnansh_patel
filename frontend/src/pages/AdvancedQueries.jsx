import React, { useState } from 'react';
import { api } from '../services/api';
import { Database, Search, Terminal, ChevronRight } from 'lucide-react';

export const AdvancedQueries = () => {
  const [activeTab, setActiveTab] = useState('compare');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
            <Terminal size={18} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Query Results JSON Payload</h3>
          </div>
          <div style={{ flex: 1 }}>
            {renderResult()}
          </div>
        </div>
      </div>
    </div>
  );
};
