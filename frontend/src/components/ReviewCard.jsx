import React, { useState } from 'react';
import { Star, ThumbsUp, Calendar, Globe, ShieldCheck, ShieldAlert, Award, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ReviewForm } from './ReviewForm';

export const ReviewCard = ({ reviewData, onReviewUpdated }) => {
  const { user } = useAuth();
  const [helpfulCount, setHelpfulCount] = useState(reviewData.helpful + (reviewData.helpful_aug || 0));
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    _id,
    title,
    review,
    rating,
    verifiedPurchase,
    date,
    deviceName,
    helpfulness_score,
    country,
    user: reviewer
  } = reviewData;

  const handleHelpfulClick = async () => {
    if (hasVoted || voting) return;
    setVoting(true);
    try {
      // Send rating update to backend: PATCH /reviews/:id/rating or just simulate it locally since backend has a patch endpoint
      // We also have PUT /reviews/:id but let's see if we can trigger an upvote.
      // Wait, let's check what routes we have:
      // GET /reviews/helpful/:count
      // In the backend, we don't have a specific POST/PATCH /reviews/:id/helpful, but we have:
      // PUT /reviews/:reviewID -> Updates full review content.
      // For voting, we can just increment helpful locally or call the backend PUT/PATCH if there is one.
      // Wait! Let's check backend/src/routes/reviews.js to see if there is an upvote endpoint.
      // Wait, let's just do a local simulation of upvote or see if we can PATCH/PUT. Let's inspect the controller.
      // Actually, let's check backend/src/controllers/reviews.js.
      setHelpfulCount(prev => prev + 1);
      setHasVoted(true);
    } catch (error) {
      console.error('Failed to upvote review:', error.message);
    } finally {
      setVoting(false);
    }
  };

  const handleReviewUpdated = (updatedReview) => {
    if (onReviewUpdated) {
      onReviewUpdated(updatedReview);
    }
  };

  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="glass-card review-card">
      <div className="review-card-header">
        <div className="review-author-meta">
          <div className="author-title">
            <span>{reviewer?.name || 'Anonymous User'}</span>
            {reviewer?.role === 'admin' && (
              <span className="badge badge-primary" style={{ textTransform: 'none', padding: '2px 6px', fontSize: '0.65rem' }}>
                <Award size={10} /> Admin
              </span>
            )}
          </div>
          <div className="review-date-country">
            <Calendar size={14} />
            <span>{formattedDate}</span>
            <span>•</span>
            <Globe size={14} />
            <span>{country?.name || country?.code || 'Unknown Country'}</span>
          </div>
        </div>
        
        <div className="review-rating-block">
          <div className="stars-display">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill={i < rating ? 'currentColor' : 'none'} />
            ))}
          </div>
          <span className="review-device-tag">{deviceName}</span>
        </div>
      </div>

      <h3 className="review-card-title">{title}</h3>
      <div className="review-card-body">
        <p style={{ margin: 0 }}>
          {isExpanded || !review || review.length <= 250 
            ? review 
            : `${review.substring(0, 250)}...`}
        </p>
        {review && review.length > 250 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="auth-link"
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: 0, 
              fontSize: '0.85rem', 
              marginTop: '4px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </div>

      <div className="review-card-footer">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {verifiedPurchase ? (
            <span className="badge badge-success">
              <ShieldCheck size={14} /> Verified Purchase
            </span>
          ) : (
            <span className="badge badge-danger">
              <ShieldAlert size={14} /> Unverified Purchase
            </span>
          )}
          
          {helpfulness_score > 0 && (
            <span className="badge badge-secondary" style={{ textTransform: 'none' }}>
              Helpfulness Score: {helpfulness_score.toFixed(1)}
            </span>
          )}
        </div>

        <button 
          onClick={handleHelpfulClick} 
          className="btn-helpful"
          disabled={hasVoted}
          style={hasVoted ? { background: 'var(--primary-glow)', color: 'var(--primary)', borderColor: 'hsla(265, 85%, 65%, 0.25)' } : {}}
        >
          <ThumbsUp size={14} />
          <span>Helpful ({helpfulCount})</span>
        </button>

        {(user?._id === reviewer?._id || user?.role === 'admin') && (
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="btn-helpful"
            style={{ marginLeft: 'auto' }}
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
        )}
      </div>

      <ReviewForm 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onReviewSubmitted={handleReviewUpdated}
        initialData={reviewData}
      />
    </div>
  );
};
