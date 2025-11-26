import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import './ReviewSubmissionForm.css';

const ReviewSubmissionForm = ({ 
  appointment, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (comment.trim().length === 0) {
      newErrors.comment = 'Please provide a comment';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    } else if (comment.length > 1000) {
      newErrors.comment = 'Comment must not exceed 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        rating,
        comment: comment.trim(),
      });
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to submit review' });
    }
  };

  const handleRatingClick = (value) => {
    setRating(value);
    if (errors.rating) {
      setErrors({ ...errors, rating: null });
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
    if (errors.comment) {
      setErrors({ ...errors, comment: null });
    }
  };

  return (
    <div className="review-submission-form">
      <div className="review-form-header">
        <h3>Rate Your Appointment</h3>
        <button
          type="button"
          className="close-button"
          onClick={onCancel}
          aria-label="Close review form"
        >
          <X size={20} />
        </button>
      </div>

      {/* Appointment Context */}
      <div className="appointment-context">
        <div className="context-info">
          <p className="doctor-name">{appointment.doctorName}</p>
          <p className="appointment-date">
            {new Date(appointment.appointmentDateTime).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        {/* Rating Input */}
        <div className="form-group">
          <label htmlFor="rating" className="form-label">
            Your Rating <span className="required">*</span>
          </label>
          <div 
            className="star-rating"
            role="radiogroup"
            aria-label="Rating"
            aria-required="true"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`star-button ${value <= (hoveredRating || rating) ? 'active' : ''}`}
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                aria-label={`${value} star${value !== 1 ? 's' : ''}`}
                aria-checked={rating === value}
                role="radio"
              >
                <Star
                  size={32}
                  fill={value <= (hoveredRating || rating) ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="rating-text" aria-live="polite">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
          {errors.rating && (
            <p className="error-message" role="alert">{errors.rating}</p>
          )}
        </div>

        {/* Comment Textarea */}
        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            Your Review <span className="required">*</span>
          </label>
          <textarea
            id="comment"
            className={`form-textarea ${errors.comment ? 'error' : ''}`}
            value={comment}
            onChange={handleCommentChange}
            placeholder="Share your experience with this doctor..."
            rows={5}
            maxLength={1000}
            aria-required="true"
            aria-invalid={!!errors.comment}
            aria-describedby={errors.comment ? 'comment-error' : 'comment-hint'}
          />
          <div className="textarea-footer">
            <span id="comment-hint" className="character-count">
              {comment.length}/1000 characters
            </span>
          </div>
          {errors.comment && (
            <p id="comment-error" className="error-message" role="alert">
              {errors.comment}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="submit-error" role="alert">
            {errors.submit}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewSubmissionForm;
