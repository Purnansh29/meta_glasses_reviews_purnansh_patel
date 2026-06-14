import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, Star, ShieldCheck, ThumbsUp, Glasses, 
  Flag, Award, Globe, TrendingUp, Sparkles 
} from 'lucide-react';
import { ReviewCard } from '../components/ReviewCard';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [verified, setVerified] = useState([]);
  const [countries, setCountries] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          ratingsRes,
          devicesRes,
          verifiedRes,
          countriesRes,
          reviewersRes,
          trendingRes
        ] = await Promise.all([
          api.get('/reviews/stats/ratings'),
          api.get('/reviews/stats/devices'),
          api.get('/reviews/stats/verified'),
          api.get('/reviews/stats/countries'),
          api.get('/reviews/stats/reviewers'),
          api.get('/reviews/fetch/trending?limit=3')
        ]);

        if (ratingsRes.success) setStats(ratingsRes.data);
        if (devicesRes.success) setDevices(devicesRes.data.devices);
        if (verifiedRes.success) setVerified(verifiedRes.data.verifiedMetrics);
        if (countriesRes.success) setCountries(countriesRes.data.countries);
        if (reviewersRes.success) setReviewers(reviewersRes.data.topReviewers);
        if (trendingRes.success) setTrending(trendingRes.data.reviews || trendingRes.data.trendingReviews || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard metrics. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner" style={{ marginTop: '24px' }}>
        {error}
      </div>
    );
  }

  // Calculate Verified Purchase Percentage
  const verifiedCount = verified.find(v => v.verifiedPurchase === true)?.totalReviews || 0;
  const totalReviewsCount = stats?.overall?.totalReviews || 0;
  const verifiedPercentage = totalReviewsCount > 0 
    ? ((verifiedCount / totalReviewsCount) * 100).toFixed(1) 
    : 0;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title"><span className="gradient-text">Analytics Dashboard</span></h1>
        <p className="section-subtitle">Real-time Ray-Ban Meta Glasses review metrics and community insights.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon">
            <Glasses size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalReviewsCount.toLocaleString()}</span>
            <span className="stat-label">Total Reviews</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ color: 'var(--warning)' }}>
            <Star size={28} fill="currentColor" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.overall?.averageRating?.toFixed(2) || '0.00'}</span>
            <span className="stat-label">Average Rating</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ color: 'var(--success)' }}>
            <ShieldCheck size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{verifiedPercentage}%</span>
            <span className="stat-label">Verified Purchase</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ color: 'var(--secondary)' }}>
            <ThumbsUp size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{(stats?.overall?.totalHelpful || 0).toLocaleString()}</span>
            <span className="stat-label">Helpful Votes</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Block */}
      <div className="analytics-grid">
        {/* Ratings Pie Chart */}
        <div className="glass-card chart-container">
          <h3 className="chart-title">
            <span>Rating Distribution</span>
            <span className="badge badge-primary">Percentage</span>
          </h3>
          
          <div style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.distribution?.map(d => ({ name: `${d.rating} Star`, value: d.percentage, count: d.count })).reverse() || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  itemStyle={{ color: 'white' }}
                  formatter={(value, name, props) => [`${value.toFixed(1)}% (${props.payload.count} reviews)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Bar Chart */}
        <div className="glass-card">
          <h3 className="chart-title">
            <span>Device Performance</span>
            <span className="badge badge-secondary">Comparison</span>
          </h3>

          <div style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={devices.map(d => ({ name: d.deviceName.split(' ')[0], reviews: d.totalReviews, rating: d.averageRating }))}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)'}} />
                <YAxis yAxisId="left" orientation="left" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)'}} />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)'}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar yAxisId="left" dataKey="reviews" name="Total Reviews" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="rating" name="Avg Rating" fill="var(--warning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Country volume & leaderboard grid */}
      <div className="analytics-grid">
        {/* Country review volume */}
        <div className="glass-card">
          <h3 className="chart-title">
            <span>Geographical Volume</span>
            <Globe size={18} className="logo-accent" />
          </h3>
          
          <div className="leaderboard-list">
            {countries.slice(0, 5).map((country, index) => (
              <div key={country.countryName} className="leaderboard-item">
                <span className="reviewer-name">{index + 1}. {country.countryName} ({country.countryCode})</span>
                <span className="reviewer-score">
                  <span>{country.totalReviews} reviews</span>
                  <span>•</span>
                  <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Star size={12} fill="currentColor" /> {country.averageRating}
                  </span>
                </span>
              </div>
            ))}
            {countries.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>No geographical data available.</p>
            )}
          </div>
        </div>

        {/* Top Active Reviewers */}
        <div className="glass-card">
          <h3 className="chart-title">
            <span>Helpful Leaderboard</span>
            <Award size={18} style={{ color: 'var(--primary)' }} />
          </h3>

          <div className="leaderboard-list">
            {reviewers.slice(0, 5).map((reviewer, index) => (
              <div key={reviewer.userName} className="leaderboard-item">
                <span className="reviewer-name">{index + 1}. {reviewer.userName}</span>
                <span className="reviewer-score">
                  <ThumbsUp size={12} /> {reviewer.totalHelpful} upvotes
                </span>
              </div>
            ))}
            {reviewers.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>No reviewer statistics available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Trending Reviews Section */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={24} style={{ color: 'var(--primary)' }} />
          <span>Trending Feedback</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '12px' }}>
            Highly voted community reviews
          </span>
        </h2>

        <div className="reviews-feed">
          {trending.map(review => (
            <ReviewCard key={review._id} reviewData={review} />
          ))}
          {trending.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }} className="glass-card">
              No trending reviews found at this time.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
