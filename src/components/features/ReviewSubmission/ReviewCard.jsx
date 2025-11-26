import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, MessageCircle } from 'lucide-react';
import './ReviewCard.css';

const ReviewCard = ({ 
  review, 
  onHelpful, 
  onReport,
  showDoctorResponse = true,
  isHelpfulDisabled = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const handleHelpful = () => {
    if (!hasMarkedHelpful && !isHelpfulDisabled) {
      setHasMarkedHelpful(true);
      onHelpful?.(review.id);
    }
  };

  const handleReport = () => {
    onReport?.(review.id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="star-display" role="img" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            size={16}
            fill={value <= rating ? 'currentColor' : 'none'}
            className={value <= rating ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>
    );
  };

  const shouldTruncate = review.comment && review.comment.length > 300;
  const displayComment = shouldTruncate && !isExpanded 
    ? `${review.comment.substring(0, 300)}...` 
    : review.comment;

  return (
    <article className="review-card">
      {/* Review Header */}
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.patientAvatar ? (
              <img 
                src={review.patientAvatar} 
                alt={`${review.patientName}'s avatar`}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {review.patientName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="reviewer-details">
            <h4 className="reviewer-name">{review.patientName}</h4>
            <time className="review-date" dateTime={review.createdAt}>
              {formatDate(review.createdAt)}
            </time>
          </div>
        </div>
        <div className="review-rating">
          {renderStars(review.rating)}
        </div>
      </div>

      {/* Review Content */}
      <div className="review-content">
        <p className="review-comment">{displayComment}</p>
        {shouldTruncate && (
          <button
            type="button"
            className="read-more-button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Doctor Response */}
      {showDoctorResponse && review.doctorResponse && (
        <div className="doctor-response">
          <div className="response-header">
            <MessageCircle size={16} />
            <span className="response-label">Doctor's Response</span>
            {review.respondedAt && (
              <time className="response-date" dateTime={review.respondedAt}>
                {formatDate(review.respondedAt)}
              </time>
            )}
          </div>
          <p className="response-text">{review.doctorResponse}</p>
        </div>
      )}

      {/* Review Actions */}
      <div className="review-actions">
        <button
          type="button"
          className={`action-button ${hasMarkedHelpful ? 'active' : ''}`}
          onClick={handleHelpful}
          disabled={hasMarkedHelpful || isHelpfulDisabled}
          aria-label={hasMarkedHelpful ? 'Marked as helpful' : 'Mark as helpful'}
        >
          <ThumbsUp size={16} />
          <span>
            {hasMarkedHelpful ? 'Helpful' : 'Helpful'}
            {review.helpfulCount > 0 && ` (${review.helpfulCount})`}
          </span>
        </button>
        <button
          type="button"
          className="action-button report-button"
          onClick={handleReport}
          aria-label="Report review"
        >
          <Flag size={16} />
          <span>Report</span>
        </button>
      </div>
    </article>
  );
};

export default ReviewCard;
