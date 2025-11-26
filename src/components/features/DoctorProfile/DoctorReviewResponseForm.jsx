import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import './DoctorReviewResponseForm.css';

const DoctorReviewResponseForm = ({ review, onSubmit, onCancel }) => {
  const [response, setResponse] = useState(review?.doctorResponse || '');
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  const MAX_CHARS = 1000;
  const MIN_CHARS = 10;

  useEffect(() => {
    setCharCount(response.length);
  }, [response]);

  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Handle response change
  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setResponse(value);
    }
  };

  // Format text with basic formatting
  const applyFormatting = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = response.substring(start, end);

    if (!selectedText) {
      toast('Please select text to format');
      return;
    }

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      default:
        formattedText = selectedText;
    }

    const newResponse = response.substring(0, start) + formattedText + response.substring(end);
    if (newResponse.length <= MAX_CHARS) {
      setResponse(newResponse);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
      }, 0);
    }
  };

  // Insert template
  const insertTemplate = (template) => {
    const templates = {
      thankYou: "Thank you for taking the time to share your feedback. ",
      appreciate: "I appreciate your kind words and am glad I could help. ",
      sorry: "I'm sorry to hear about your experience. ",
      improve: "Your feedback helps me improve my practice. ",
      contact: "Please feel free to contact my office if you have any concerns. "
    };

    const templateText = templates[template] || '';
    const newResponse = response + templateText;
    
    if (newResponse.length <= MAX_CHARS) {
      setResponse(newResponse);
      textareaRef.current?.focus();
    }
  };

  // Validate response
  const validateResponse = () => {
    if (response.trim().length < MIN_CHARS) {
      return { valid: false, message: `Response must be at least ${MIN_CHARS} characters` };
    }
    if (response.trim().length > MAX_CHARS) {
      return { valid: false, message: `Response cannot exceed ${MAX_CHARS} characters` };
    }
    return { valid: true };
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateResponse();
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    try {
      setSubmitting(true);
      
      await api.post(`/doctors/reviews/${review.id}/respond`, {
        response: response.trim()
      });

      toast.success('Response submitted successfully');
      
      if (onSubmit) {
        onSubmit(response.trim());
      }
    } catch (error) {
      console.error('Submit response error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="doctor-review-response-form">
      {/* Review Context */}
      <div className="review-context">
        <h4>Review from {review.patientName}</h4>
        <div className="review-meta">
          {renderStars(review.rating)}
          <span className="review-date">{formatDate(review.createdAt)}</span>
        </div>
        
        {review.comment && (
          <div className="review-comment">
            <p>{review.comment}</p>
          </div>
        )}

        {review.appointmentDate && (
          <div className="appointment-info">
            <span className="info-label">Appointment:</span>
            <span className="info-value">{formatDate(review.appointmentDate)}</span>
          </div>
        )}
      </div>

      {/* Response Form */}
      <form onSubmit={handleSubmit} className="response-form">
        <div className="form-header">
          <h4>Your Response</h4>
          <div className="formatting-toolbar">
            <button
              type="button"
              className="format-btn"
              onClick={() => applyFormatting('bold')}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="format-btn"
              onClick={() => applyFormatting('italic')}
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="format-btn"
              onClick={() => applyFormatting('underline')}
              title="Underline"
            >
              <u>U</u>
            </button>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="quick-templates">
          <span className="templates-label">Quick phrases:</span>
          <button
            type="button"
            className="template-btn"
            onClick={() => insertTemplate('thankYou')}
          >
            Thank you
          </button>
          <button
            type="button"
            className="template-btn"
            onClick={() => insertTemplate('appreciate')}
          >
            Appreciate
          </button>
          <button
            type="button"
            className="template-btn"
            onClick={() => insertTemplate('sorry')}
          >
            Apologize
          </button>
          <button
            type="button"
            className="template-btn"
            onClick={() => insertTemplate('improve')}
          >
            Improve
          </button>
          <button
            type="button"
            className="template-btn"
            onClick={() => insertTemplate('contact')}
          >
            Contact
          </button>
        </div>

        {/* Text Area */}
        <div className="form-group">
          <textarea
            ref={textareaRef}
            value={response}
            onChange={handleChange}
            placeholder="Write a professional response to this review..."
            rows="8"
            className={charCount < MIN_CHARS ? 'warning' : ''}
          />
          <div className="textarea-footer">
            <span className={`char-count ${charCount > MAX_CHARS * 0.9 ? 'warning' : ''}`}>
              {charCount} / {MAX_CHARS}
            </span>
            {charCount < MIN_CHARS && (
              <span className="min-chars-hint">
                Minimum {MIN_CHARS} characters required
              </span>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <div className="response-guidelines">
          <h5>Response Guidelines:</h5>
          <ul>
            <li>Be professional and courteous</li>
            <li>Thank the patient for their feedback</li>
            <li>Address specific concerns if mentioned</li>
            <li>Keep responses concise and relevant</li>
            <li>Avoid sharing private medical information</li>
          </ul>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || charCount < MIN_CHARS || charCount > MAX_CHARS}
          >
            {submitting ? 'Submitting...' : review.doctorResponse ? 'Update Response' : 'Submit Response'}
          </button>
        </div>
      </form>

      {/* Existing Response Preview */}
      {review.doctorResponse && (
        <div className="existing-response">
          <h5>Current Response:</h5>
          <div className="response-preview">
            <p>{review.doctorResponse}</p>
            <span className="response-date">
              Responded on {formatDate(review.respondedAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorReviewResponseForm;
