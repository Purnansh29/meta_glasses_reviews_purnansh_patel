import React, { useState } from 'react';
import { api } from '../services/api';
import { Database, Search, Terminal, ChevronRight } from 'lucide-react';

export const AdvancedQueries = () => {
  const [activeTab, setActiveTab] = useState('compare');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    user1: '', user2: '', year: '2023', month: '10', day: '15',
    score: '5', profile: 'tech_enthusiast', device: 'Ray-Ban Meta Wayfarer',
    title: 'Great', status: 'true', rating: '5', country: 'US', count: '10'
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

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
            <button className={`btn ${activeTab === 'compare' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('compare')} style={{flex: 1}}>Compare</button>
            <button className={`btn ${activeTab === 'time' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('time')} style={{flex: 1}}>Time</button>
            <button className={`btn ${activeTab === 'attrs' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('attrs')} style={{flex: 1}}>Attributes</button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Param Configuration</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input type="text" name="year" value={params.year} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Year (2023)" />
              <input type="text" name="month" value={params.month} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Month (10)" />
              <input type="text" name="day" value={params.day} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Day (15)" />
              <input type="text" name="rating" value={params.rating} onChange={handleParamChange} className="form-input" style={{ padding: '6px' }} placeholder="Rating (5)" />
              <input type="text" name="country" value={params.country} onChange={handleParamChange} className="form-input" style={{ padding: '6px', gridColumn: 'span 2' }} placeholder="Country ID" />
            </div>
          </div>

          {activeTab === 'compare' && (
            <div>
              <h4 style={{ marginBottom: '12px' }}>Comparison Routes</h4>
              <QueryItem title="Compare Users" onClick={() => executeQuery('/compare/users')} />
              <QueryItem title="Compare Ratings" onClick={() => executeQuery('/compare/ratings')} />
              <QueryItem title="Random Fetch" onClick={() => executeQuery('/fetch/random')} />
              <QueryItem title="Trending Fetch" onClick={() => executeQuery('/fetch/trending')} />
            </div>
          )}

          {activeTab === 'time' && (
            <div>
              <h4 style={{ marginBottom: '12px' }}>Time Routes</h4>
              <QueryItem title={`Year: ${params.year}`} onClick={() => executeQuery(`/year/${params.year}`)} />
              <QueryItem title={`Month: ${params.month}`} onClick={() => executeQuery(`/month/${params.month}`)} />
              <QueryItem title={`Day: ${params.day}`} onClick={() => executeQuery(`/day/${params.day}`)} />
              <QueryItem title={`Date: ${params.year}/${params.month}/${params.day}`} onClick={() => executeQuery(`/date/${params.year}/${params.month}/${params.day}`)} />
            </div>
          )}

          {activeTab === 'attrs' && (
            <div>
              <h4 style={{ marginBottom: '12px' }}>Attribute Routes</h4>
              <QueryItem title="Positive Reviews" onClick={() => executeQuery('/positive')} />
              <QueryItem title="Negative Reviews" onClick={() => executeQuery('/negative')} />
              <QueryItem title="All Ratings Metadata" onClick={() => executeQuery('/ratings')} />
              <QueryItem title="All Verified Metadata" onClick={() => executeQuery('/verified')} />
              <QueryItem title={`Rating: ${params.rating}`} onClick={() => executeQuery(`/ratings/${params.rating}`)} />
              <QueryItem title={`Country Reviews`} onClick={() => executeQuery(`/country/${params.country}/reviews`)} />
              <QueryItem title={`Country + Rating`} onClick={() => executeQuery(`/reviews/country/${params.country}/rating/${params.rating}`)} />
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
