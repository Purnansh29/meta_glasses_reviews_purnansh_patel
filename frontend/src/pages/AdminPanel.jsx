import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, RefreshCw, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const AdminPanel = () => {
  const [metrics, setMetrics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, reviewsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/reviews')
      ]);

      if (dashboardRes.success) {
        setMetrics(dashboardRes.data);
      }
      if (reviewsRes.success) {
        setReviews(reviewsRes.data.reviews || reviewsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin moderation dashboard:', err);
      setError('Unauthorized access or connection issue. Make sure you are logged in as Admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSoftDelete = async (reviewID) => {
    try {
      const response = await api.delete(`/reviews/${reviewID}`);
      if (response.success) {
        // Refresh local reviews state
        setReviews(prev => 
          prev.map(r => r.reviewID === reviewID ? { ...r, isDeleted: true } : r)
        );
        // Refresh metrics
        fetchAdminData();
      }
    } catch (err) {
      alert(`Soft Delete failed: ${err.message}`);
    }
  };

  const handleRestore = async (reviewID) => {
    try {
      const response = await api.put(`/admin/reviews/${reviewID}/restore`, {});
      if (response.success) {
        // Refresh local reviews state
        setReviews(prev => 
          prev.map(r => r.reviewID === reviewID ? { ...r, isDeleted: false } : r)
        );
        // Refresh metrics
        fetchAdminData();
      }
    } catch (err) {
      alert(`Restoration failed: ${err.message}`);
    }
  };

  const handleHardDelete = async (reviewID) => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to PERMANENTLY delete this review from the database? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/reviews/${reviewID}/hard`);
      if (response.success) {
        // Remove from local reviews state
        setReviews(prev => prev.filter(r => r.reviewID !== reviewID));
        // Refresh metrics
        fetchAdminData();
      }
    } catch (err) {
      alert(`Hard Delete failed: ${err.message}`);
    }
  };

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
        <AlertTriangle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 className="section-title">
            <span className="gradient-text" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={32} /> Administration Control
            </span>
          </h1>
          <p className="section-subtitle">Audit logs, soft-delete restoration, and database permanent wipeout options.</p>
        </div>
        <button onClick={fetchAdminData} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh Audit
        </button>
      </div>

      {/* Admin Stats summary */}
      <div className="admin-stats-summary">
        <div className="glass-card stat-card">
          <div className="stat-info">
            <span className="stat-value">{metrics?.activeReviewsCount ?? 0}</span>
            <span className="stat-label">Active Reviews</span>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderColor: 'var(--danger-glow)' }}>
          <div className="stat-info">
            <span className="stat-value" style={{ color: 'var(--danger)' }}>{metrics?.deletedReviewsCount ?? 0}</span>
            <span className="stat-label">Soft-Deleted Reviews</span>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderColor: 'var(--primary-glow)' }}>
          <div className="stat-info">
            <span className="stat-value" style={{ color: 'var(--primary)' }}>{metrics?.totalUsersCount ?? 0}</span>
            <span className="stat-label">Registered Accounts</span>
          </div>
        </div>
      </div>

      {/* Moderation Audit Feed Table */}
      <div className="admin-grid">
        <div className="glass-card moderation-table-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Reviews Moderation Feed</h3>
          
          <table className="moderation-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Device</th>
                <th>Rating</th>
                <th>Title & Content</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => {
                const formattedRating = (
                  <span style={{ color: 'var(--warning)', fontWeight: '600' }}>
                    {review.rating} ★
                  </span>
                );

                return (
                  <tr key={review._id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{review.user?.name || 'Anonymous'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {review.country?.name || 'Unknown'}
                      </div>
                    </td>
                    <td>{review.deviceName}</td>
                    <td>{formattedRating}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{review.title}</div>
                      <div className="table-review-text" title={review.review}>
                        {review.review}
                      </div>
                    </td>
                    <td>
                      {review.isDeleted ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <XCircle size={12} /> Deleted
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <CheckCircle size={12} /> Active
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        {review.isDeleted ? (
                          <button 
                            onClick={() => handleRestore(review.reviewID)} 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--success)' }}
                          >
                            Restore
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSoftDelete(review.reviewID)} 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--danger)' }}
                          >
                            Soft Delete
                          </button>
                        )}
                        <button 
                          onClick={() => handleHardDelete(review.reviewID)} 
                          className="btn btn-danger" 
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {reviews.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No reviews in database log files.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
