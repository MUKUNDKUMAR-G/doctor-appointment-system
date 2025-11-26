import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import './DoctorProfileEditForm.css';

const DoctorProfileEditForm = ({ doctorProfile, onSave, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(doctorProfile?.avatarUrl || null);
  const autoSaveTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: doctorProfile?.firstName || '',
    lastName: doctorProfile?.lastName || '',
    email: doctorProfile?.email || '',
    phone: doctorProfile?.phone || '',
    specialty: doctorProfile?.specialty || '',
    bio: doctorProfile?.bio || '',
    experienceYears: doctorProfile?.experienceYears || 0,
    consultationFee: doctorProfile?.consultationFee || 0,
    followUpFee: doctorProfile?.followUpFee || 0,
    emergencyFee: doctorProfile?.emergencyFee || 0,
    consultationDuration: doctorProfile?.consultationDuration || 30,
    licenseNumber: doctorProfile?.licenseNumber || '',
    location: doctorProfile?.location || '',
    languagesSpoken: doctorProfile?.languagesSpoken || [],
    education: doctorProfile?.education || [],
    awards: doctorProfile?.awards || [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Update form data when profile changes
  useEffect(() => {
    if (doctorProfile) {
      setFormData({
        firstName: doctorProfile.firstName || '',
        lastName: doctorProfile.lastName || '',
        email: doctorProfile.email || '',
        phone: doctorProfile.phone || '',
        specialty: doctorProfile.specialty || '',
        bio: doctorProfile.bio || '',
        experienceYears: doctorProfile.experienceYears || 0,
        consultationFee: doctorProfile.consultationFee || 0,
        followUpFee: doctorProfile.followUpFee || 0,
        emergencyFee: doctorProfile.emergencyFee || 0,
        consultationDuration: doctorProfile.consultationDuration || 30,
        licenseNumber: doctorProfile.licenseNumber || '',
        location: doctorProfile.location || '',
        languagesSpoken: doctorProfile.languagesSpoken || [],
        education: doctorProfile.education || [],
        awards: doctorProfile.awards || [],
      });
      setAvatarPreview(doctorProfile.avatarUrl || null);
    }
  }, [doctorProfile]);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim().length < 2 ? 'Must be at least 2 characters' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address' : '';
      case 'phone':
        return value && !/^\+?[\d\s-()]+$/.test(value) ? 'Invalid phone number' : '';
      case 'specialty':
        return !value.trim() ? 'Specialty is required' : '';
      case 'bio':
        return value.length > 1000 ? 'Bio cannot exceed 1000 characters' : '';
      case 'experienceYears':
        return value < 0 || value > 70 ? 'Experience must be between 0 and 70 years' : '';
      case 'consultationFee':
      case 'followUpFee':
      case 'emergencyFee':
        return value < 0 ? 'Fee cannot be negative' : '';
      case 'consultationDuration':
        return value < 15 || value > 120 ? 'Duration must be between 15 and 120 minutes' : '';
      case 'licenseNumber':
        return value && value.length < 5 ? 'License number must be at least 5 characters' : '';
      default:
        return '';
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    setIsDirty(true);
    
    // Validate field
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }

    // Auto-save after 2 seconds of inactivity
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);
  };

  // Handle blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Handle array field changes (languages, education, awards)
  const handleArrayFieldChange = (fieldName, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[fieldName]];
      newArray[index] = value;
      return {
        ...prev,
        [fieldName]: newArray
      };
    });
    setIsDirty(true);
  };

  const handleAddArrayField = (fieldName, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], defaultValue]
    }));
    setIsDirty(true);
  };

  const handleRemoveArrayField = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  // Handle education changes
  const handleEducationChange = (index, field, value) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value
      };
      return {
        ...prev,
        education: newEducation
      };
    });
    setIsDirty(true);
  };

  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: new Date().getFullYear() }]
    }));
    setIsDirty(true);
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/doctors/profile/${doctorProfile.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile photo updated successfully');
      if (onSave) {
        onSave({ ...doctorProfile, avatarUrl: response.data.avatarUrl });
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile photo');
      setAvatarPreview(doctorProfile?.avatarUrl || null);
    } finally {
      setUploading(false);
    }
  };

  // Auto-save functionality
  const handleAutoSave = useCallback(async () => {
    if (!isDirty) return;

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      return; // Don't auto-save if there are errors
    }

    try {
      await api.put(`/doctors/profile/${doctorProfile.id}`, formData);
      setIsDirty(false);
      // Silent save - no toast notification for auto-save
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [formData, isDirty, doctorProfile?.id]);

  // Handle manual save
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    const newTouched = {};
    Object.keys(formData).forEach(key => {
      newTouched[key] = true;
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/doctors/profile/${doctorProfile.id}`, formData);
      toast.success('Profile updated successfully');
      setIsDirty(false);
      if (onSave) {
        onSave(response.data);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form className="doctor-profile-edit-form" onSubmit={handleSubmit}>
      {/* Avatar Upload Section */}
      <div className="form-section avatar-section">
        <h3>Profile Photo</h3>
        <div className="avatar-upload-container">
          <div className="avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {formData.firstName?.[0]}{formData.lastName?.[0]}
              </div>
            )}
            {uploading && <div className="avatar-loading">Uploading...</div>}
          </div>
          <div className="avatar-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Change Photo'}
            </button>
            <p className="avatar-hint">JPEG, PNG, or WebP. Max 5MB. Min 200x200px.</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName">
              First Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.firstName && touched.firstName ? 'error' : ''}
              required
            />
            {errors.firstName && touched.firstName && (
              <span className="error-message">{errors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">
              Last Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.lastName && touched.lastName ? 'error' : ''}
              required
            />
            {errors.lastName && touched.lastName && (
              <span className="error-message">{errors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email && touched.email ? 'error' : ''}
              required
            />
            {errors.email && touched.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.phone && touched.phone ? 'error' : ''}
            />
            {errors.phone && touched.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="specialty">
              Specialty <span className="required">*</span>
            </label>
            <input
              type="text"
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.specialty && touched.specialty ? 'error' : ''}
              required
            />
            {errors.specialty && touched.specialty && (
              <span className="error-message">{errors.specialty}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          <div className="form-group">
            <label htmlFor="experienceYears">Years of Experience</label>
            <input
              type="number"
              id="experienceYears"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              max="70"
              className={errors.experienceYears && touched.experienceYears ? 'error' : ''}
            />
            {errors.experienceYears && touched.experienceYears && (
              <span className="error-message">{errors.experienceYears}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="licenseNumber">License Number</label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.licenseNumber && touched.licenseNumber ? 'error' : ''}
            />
            {errors.licenseNumber && touched.licenseNumber && (
              <span className="error-message">{errors.licenseNumber}</span>
            )}
          </div>
        </div>
      </div>

      {/* Professional Bio */}
      <div className="form-section">
        <h3>Professional Biography</h3>
        <div className="form-group">
          <label htmlFor="bio">
            Bio
            <span className="char-count">
              {formData.bio.length} / 1000
            </span>
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            onBlur={handleBlur}
            rows="6"
            maxLength="1000"
            className={errors.bio && touched.bio ? 'error' : ''}
            placeholder="Tell patients about your background, expertise, and approach to healthcare..."
          />
          {errors.bio && touched.bio && (
            <span className="error-message">{errors.bio}</span>
          )}
        </div>
      </div>

      {/* Consultation Fees */}
      <div className="form-section">
        <h3>Consultation Fees</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="consultationFee">Base Consultation Fee ($)</label>
            <input
              type="number"
              id="consultationFee"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              step="0.01"
              className={errors.consultationFee && touched.consultationFee ? 'error' : ''}
            />
            {errors.consultationFee && touched.consultationFee && (
              <span className="error-message">{errors.consultationFee}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="followUpFee">Follow-up Fee ($)</label>
            <input
              type="number"
              id="followUpFee"
              name="followUpFee"
              value={formData.followUpFee}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              step="0.01"
              className={errors.followUpFee && touched.followUpFee ? 'error' : ''}
            />
            {errors.followUpFee && touched.followUpFee && (
              <span className="error-message">{errors.followUpFee}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="emergencyFee">Emergency Consultation Fee ($)</label>
            <input
              type="number"
              id="emergencyFee"
              name="emergencyFee"
              value={formData.emergencyFee}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              step="0.01"
              className={errors.emergencyFee && touched.emergencyFee ? 'error' : ''}
            />
            {errors.emergencyFee && touched.emergencyFee && (
              <span className="error-message">{errors.emergencyFee}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="consultationDuration">Consultation Duration (minutes)</label>
            <input
              type="number"
              id="consultationDuration"
              name="consultationDuration"
              value={formData.consultationDuration}
              onChange={handleChange}
              onBlur={handleBlur}
              min="15"
              max="120"
              step="5"
              className={errors.consultationDuration && touched.consultationDuration ? 'error' : ''}
            />
            {errors.consultationDuration && touched.consultationDuration && (
              <span className="error-message">{errors.consultationDuration}</span>
            )}
          </div>
        </div>
      </div>

      {/* Languages Spoken */}
      <div className="form-section">
        <h3>Languages Spoken</h3>
        <div className="array-field-container">
          {formData.languagesSpoken.map((language, index) => (
            <div key={index} className="array-field-item">
              <input
                type="text"
                value={language}
                onChange={(e) => handleArrayFieldChange('languagesSpoken', index, e.target.value)}
                placeholder="e.g., English, Spanish"
              />
              <button
                type="button"
                className="btn-icon btn-remove"
                onClick={() => handleRemoveArrayField('languagesSpoken', index)}
                aria-label="Remove language"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary btn-add"
            onClick={() => handleAddArrayField('languagesSpoken', '')}
          >
            + Add Language
          </button>
        </div>
      </div>

      {/* Education */}
      <div className="form-section">
        <h3>Education</h3>
        <div className="education-container">
          {formData.education.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="form-grid">
                <div className="form-group">
                  <label>Degree</label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    placeholder="e.g., MD, MBBS"
                  />
                </div>
                <div className="form-group">
                  <label>Institution</label>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    placeholder="e.g., Harvard Medical School"
                  />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={edu.year || new Date().getFullYear()}
                    onChange={(e) => handleEducationChange(index, 'year', parseInt(e.target.value))}
                    min="1950"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn-icon btn-remove"
                onClick={() => handleRemoveArrayField('education', index)}
                aria-label="Remove education"
              >
                × Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary btn-add"
            onClick={handleAddEducation}
          >
            + Add Education
          </button>
        </div>
      </div>

      {/* Awards */}
      <div className="form-section">
        <h3>Awards & Recognition</h3>
        <div className="array-field-container">
          {formData.awards.map((award, index) => (
            <div key={index} className="array-field-item">
              <input
                type="text"
                value={award}
                onChange={(e) => handleArrayFieldChange('awards', index, e.target.value)}
                placeholder="e.g., Best Doctor Award 2023"
              />
              <button
                type="button"
                className="btn-icon btn-remove"
                onClick={() => handleRemoveArrayField('awards', index)}
                aria-label="Remove award"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary btn-add"
            onClick={() => handleAddArrayField('awards', '')}
          >
            + Add Award
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <div className="auto-save-indicator">
          {isDirty && <span className="saving-indicator">Unsaved changes</span>}
          {!isDirty && <span className="saved-indicator">All changes saved</span>}
        </div>
        <div className="action-buttons">
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DoctorProfileEditForm;
