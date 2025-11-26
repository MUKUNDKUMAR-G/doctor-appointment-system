import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import './DoctorCredentialManager.css';

const CREDENTIAL_TYPES = [
  { value: 'LICENSE', label: 'Medical License' },
  { value: 'CERTIFICATION', label: 'Board Certification' },
  { value: 'DEGREE', label: 'Medical Degree' },
  { value: 'FELLOWSHIP', label: 'Fellowship' },
  { value: 'RESIDENCY', label: 'Residency Certificate' },
  { value: 'OTHER', label: 'Other' },
];

const VERIFICATION_STATUS_LABELS = {
  PENDING: { label: 'Pending Verification', color: '#f39c12', icon: '⏳' },
  VERIFIED: { label: 'Verified', color: '#27ae60', icon: '✓' },
  REJECTED: { label: 'Rejected', color: '#e74c3c', icon: '✗' },
};

const DoctorCredentialManager = ({ doctorId, credentials = [], onUpdate }) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    credentialType: 'LICENSE',
    documentName: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    file: null,
  });

  const [errors, setErrors] = useState({});

  // Reset form
  const resetForm = () => {
    setFormData({
      credentialType: 'LICENSE',
      documentName: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      file: null,
    });
    setErrors({});
    setIsAddingNew(false);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.credentialType) {
      newErrors.credentialType = 'Credential type is required';
    }

    if (!formData.documentName.trim()) {
      newErrors.documentName = 'Document name is required';
    }

    if (!formData.issuingAuthority.trim()) {
      newErrors.issuingAuthority = 'Issuing authority is required';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }

    if (formData.expiryDate && formData.issueDate) {
      const issue = new Date(formData.issueDate);
      const expiry = new Date(formData.expiryDate);
      if (expiry <= issue) {
        newErrors.expiryDate = 'Expiry date must be after issue date';
      }
    }

    if (!editingId && !formData.file) {
      newErrors.file = 'Document file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (JPEG, PNG)');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setFormData(prev => ({
      ...prev,
      file
    }));

    // Clear file error
    if (errors.file) {
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  };

  // Handle add credential
  const handleAddCredential = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setUploading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('credentialType', formData.credentialType);
      formDataToSend.append('documentName', formData.documentName);
      formDataToSend.append('issuingAuthority', formData.issuingAuthority);
      formDataToSend.append('issueDate', formData.issueDate);
      if (formData.expiryDate) {
        formDataToSend.append('expiryDate', formData.expiryDate);
      }
      formDataToSend.append('file', formData.file);

      const response = await api.post(
        `/doctors/${doctorId}/credentials`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Credential added successfully');
      resetForm();
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Add credential error:', error);
      toast.error(error.response?.data?.message || 'Failed to add credential');
    } finally {
      setUploading(false);
    }
  };

  // Handle edit credential
  const handleEditCredential = (credential) => {
    setEditingId(credential.id);
    setFormData({
      credentialType: credential.credentialType,
      documentName: credential.documentName,
      issuingAuthority: credential.issuingAuthority,
      issueDate: credential.issueDate,
      expiryDate: credential.expiryDate || '',
      file: null,
    });
    setIsAddingNew(true);
  };

  // Handle update credential
  const handleUpdateCredential = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setUploading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('credentialType', formData.credentialType);
      formDataToSend.append('documentName', formData.documentName);
      formDataToSend.append('issuingAuthority', formData.issuingAuthority);
      formDataToSend.append('issueDate', formData.issueDate);
      if (formData.expiryDate) {
        formDataToSend.append('expiryDate', formData.expiryDate);
      }
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      await api.put(
        `/doctors/${doctorId}/credentials/${editingId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Credential updated successfully');
      resetForm();
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Update credential error:', error);
      toast.error(error.response?.data?.message || 'Failed to update credential');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete credential
  const handleDeleteCredential = async (credentialId) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) {
      return;
    }

    try {
      setDeleting(credentialId);
      await api.delete(`/doctors/${doctorId}/credentials/${credentialId}`);
      toast.success('Credential deleted successfully');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Delete credential error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete credential');
    } finally {
      setDeleting(null);
    }
  };

  // Handle view document
  const handleViewDocument = (documentUrl) => {
    window.open(documentUrl, '_blank');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Check if credential is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="doctor-credential-manager">
      <div className="credential-manager-header">
        <h3>Professional Credentials</h3>
        {!isAddingNew && (
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingNew(true)}
          >
            + Add Credential
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAddingNew && (
        <div className="credential-form-container">
          <form onSubmit={editingId ? handleUpdateCredential : handleAddCredential}>
            <h4>{editingId ? 'Edit Credential' : 'Add New Credential'}</h4>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="credentialType">
                  Credential Type <span className="required">*</span>
                </label>
                <select
                  id="credentialType"
                  name="credentialType"
                  value={formData.credentialType}
                  onChange={handleChange}
                  className={errors.credentialType ? 'error' : ''}
                >
                  {CREDENTIAL_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.credentialType && (
                  <span className="error-message">{errors.credentialType}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="documentName">
                  Document Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="documentName"
                  name="documentName"
                  value={formData.documentName}
                  onChange={handleChange}
                  placeholder="e.g., Medical License - California"
                  className={errors.documentName ? 'error' : ''}
                />
                {errors.documentName && (
                  <span className="error-message">{errors.documentName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="issuingAuthority">
                  Issuing Authority <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="issuingAuthority"
                  name="issuingAuthority"
                  value={formData.issuingAuthority}
                  onChange={handleChange}
                  placeholder="e.g., California Medical Board"
                  className={errors.issuingAuthority ? 'error' : ''}
                />
                {errors.issuingAuthority && (
                  <span className="error-message">{errors.issuingAuthority}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="issueDate">
                  Issue Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="issueDate"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.issueDate ? 'error' : ''}
                />
                {errors.issueDate && (
                  <span className="error-message">{errors.issueDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  min={formData.issueDate || new Date().toISOString().split('T')[0]}
                  className={errors.expiryDate ? 'error' : ''}
                />
                {errors.expiryDate && (
                  <span className="error-message">{errors.expiryDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="file">
                  Document File {!editingId && <span className="required">*</span>}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={errors.file ? 'error' : ''}
                />
                <span className="file-hint">PDF or Image (JPEG, PNG). Max 10MB.</span>
                {errors.file && (
                  <span className="error-message">{errors.file}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : editingId ? 'Update Credential' : 'Add Credential'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credentials List */}
      <div className="credentials-list">
        {credentials.length === 0 ? (
          <div className="empty-state">
            <p>No credentials added yet.</p>
            <p className="empty-hint">Add your professional credentials to build trust with patients.</p>
          </div>
        ) : (
          credentials.map(credential => {
            const statusInfo = VERIFICATION_STATUS_LABELS[credential.verificationStatus] || VERIFICATION_STATUS_LABELS.PENDING;
            const expired = isExpired(credential.expiryDate);

            return (
              <div key={credential.id} className={`credential-card ${expired ? 'expired' : ''}`}>
                <div className="credential-header">
                  <div className="credential-type">
                    <span className="type-badge">
                      {CREDENTIAL_TYPES.find(t => t.value === credential.credentialType)?.label || credential.credentialType}
                    </span>
                    <h4>{credential.documentName}</h4>
                  </div>
                  <div className="credential-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="credential-details">
                  <div className="detail-item">
                    <span className="detail-label">Issuing Authority:</span>
                    <span className="detail-value">{credential.issuingAuthority}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Issue Date:</span>
                    <span className="detail-value">{formatDate(credential.issueDate)}</span>
                  </div>
                  {credential.expiryDate && (
                    <div className="detail-item">
                      <span className="detail-label">Expiry Date:</span>
                      <span className={`detail-value ${expired ? 'expired-text' : ''}`}>
                        {formatDate(credential.expiryDate)}
                        {expired && ' (Expired)'}
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Uploaded:</span>
                    <span className="detail-value">{formatDate(credential.uploadedAt)}</span>
                  </div>
                </div>

                <div className="credential-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleViewDocument(credential.documentUrl)}
                  >
                    View Document
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEditCredential(credential)}
                    disabled={deleting === credential.id}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCredential(credential.id)}
                    disabled={deleting === credential.id}
                  >
                    {deleting === credential.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DoctorCredentialManager;
