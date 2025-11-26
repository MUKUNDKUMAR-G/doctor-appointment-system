import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import './ReviewPrompt.css';

const ReviewPrompt = ({ 
  appointment, 
  onReviewClick, 
  onDismiss,
  autoShow = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if review prompt was already dismissed for this appointment
    const dismissedKey = `review-dismissed-${appointment.id}`;
    const wasDismissed = localStorage.getItem(dismissedKey);
    
    if (!wasDismissed && autoShow) {
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [appointment.id, autoShow]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    // Store dismissal in localStorage
    const dismissedKey = `review-dismissed-${appointment.id}`;
    localStorage.setItem(dismissedKey, 'true');
    
    onDismiss?.();
  };

  const handleReviewClick = () => {
    setIsVisible(false);
    onReviewClick(appointment);
  };

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className={`review-prompt ${isVisible ? 'visible' : ''}`} role="dialog" aria-labelledby="review-prompt-title">
      <div className="review-prompt-content">
        <button
          type="button"
          className="review-prompt-close"
          onClick={handleDismiss}
          aria-label="Dismiss review prompt"
        >
          <X size={18} />
        </button>
        
        <div className="review-prompt-icon">
          <Star size={32} fill="currentColor" />
        </div>
        
        <h3 id="review-prompt-title" className="review-prompt-title">
          How was your appointment?
        </h3>
        
        <p className="review-prompt-description">
          Share your experience with Dr. {appointment.doctorName}
        </p>
        
        <button
          type="button"
          className="review-prompt-button"
          onClick={handleReviewClick}
        >
          Write a Review
        </button>
      </div>
    </div>
  );
};

export default ReviewPrompt;
