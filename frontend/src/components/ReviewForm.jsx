import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Star, Sparkles } from 'lucide-react';

export const ReviewForm = ({ isOpen, onClose, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    review: '',
    rating: 5,
    deviceName: 'Ray-Ban Meta Wayfarer',
    verifiedPurchase: true,
    countryId: '',
    profile: '',
    reviewLink: '',
    reviewImage: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch countries for dropdown on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get('/countries?limit=100');
        if (response.success && response.data?.countries) {
          setCountries(response.data.countries);
          // Set first country as default if available
          if (response.data.countries.length > 0) {
            setFormData(prev => ({ ...prev, countryId: response.data.countries[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load countries:', err.message);
      }
    };

    if (isOpen) {
      fetchCountries();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRatingChange = (newRating) => {
    setFormData(prev => ({ ...prev, rating: newRating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.review || !formData.countryId) {
      setError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const selectedCountry = countries.find(c => c._id === formData.countryId);
      const countryName = selectedCountry ? selectedCountry.name : '';
      const generatedReviewID = 'REV-' + Math.random().toString(36).substring(2, 11).toUpperCase();

      // Create new review
      // The API expects: { reviewID, user, country, rating, title, review, deviceName, verifiedPurchase }
      const payload = {
        reviewID: generatedReviewID,
        user: user ? user.name : 'Anonymous', 
        country: countryName,
        title: formData.title,
        review: formData.review,
        rating: formData.rating,
        deviceName: formData.deviceName,
        verifiedPurchase: formData.verifiedPurchase,
        profile: formData.profile,
        reviewLink: formData.reviewLink,
        reviewImage: formData.reviewImage
      };

      const response = await api.post('/reviews', payload);
      if (response.success) {
        onReviewSubmitted(response.data);
        // Reset form
        setFormData({
          title: '',
          review: '',
          rating: 5,
          deviceName: 'Ray-Ban Meta Wayfarer',
          verifiedPurchase: true,
          countryId: countries[0]?._id || '',
          profile: '',
          reviewLink: '',
          reviewImage: ''
        });
        onClose();
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content">
        <button onClick={onClose} className="modal-close">
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.6rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles className="logo-accent" size={24} />
          <span>Write a Review</span>
        </h2>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Review Title *</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange}
              placeholder="Summarize your experience..."
              className="form-input"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Review Text *</label>
            <textarea 
              name="review" 
              value={formData.review} 
              onChange={handleChange}
              placeholder="What did you like or dislike about the glasses? How is the camera quality and battery life?"
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Rating *</label>
              <div className="stars-interactive">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className={`star-btn ${star <= formData.rating ? 'active' : ''}`}
                  >
                    <Star fill={star <= formData.rating ? 'currentColor' : 'none'} size={24} />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Device model *</label>
              <select 
                name="deviceName" 
                value={formData.deviceName} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="Ray-Ban Meta Wayfarer">Ray-Ban Meta Wayfarer</option>
                <option value="Ray-Ban Meta Headliner">Ray-Ban Meta Headliner</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <select 
                name="countryId" 
                value={formData.countryId} 
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="" disabled>Select country</option>
                {countries.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ justifyContent: 'center' }}>
              <label className="checkbox-label" style={{ marginTop: '16px' }}>
                <input 
                  type="checkbox" 
                  name="verifiedPurchase" 
                  checked={formData.verifiedPurchase} 
                  onChange={handleChange}
                />
                <span>Verified Purchase</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amazon Profile ID/URL (Optional)</label>
            <input 
              type="text" 
              name="profile" 
              value={formData.profile} 
              onChange={handleChange}
              placeholder="e.g. A2P3V3..."
              className="form-input" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Review Source Link (Optional)</label>
            <input 
              type="url" 
              name="reviewLink" 
              value={formData.reviewLink} 
              onChange={handleChange}
              placeholder="Link to original review..."
              className="form-input" 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
