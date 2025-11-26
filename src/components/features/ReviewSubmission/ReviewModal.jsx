import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import ReviewSubmissionForm from './ReviewSubmissionForm';
import './ReviewModal.css';

const ReviewModal = ({ 
  isOpen, 
  appointment, 
  onClose, 
  onSubmit,
  isSubmitting 
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      const focusableElements = document.querySelectorAll(
        '.review-modal button, .review-modal input, .review-modal textarea, .review-modal [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !appointment) {
    return null;
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div 
      className="review-modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="review-modal">
        <ReviewSubmissionForm
          appointment={appointment}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ReviewModal;
