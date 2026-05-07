import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAgentProfile } from '../useAgentData.js';
import profileimg from '../../../../assets/imgs/profile.png';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_IMG = 'https://realstate.niledevelopers.com/images/';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentProfile() {

  const { profile, loading, error, updating, updateProfile } = useAgentProfile();
  const [photo,        setPhoto]        = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm();

  // ── prefill form لما الـ profile يتحمل ──
  useEffect(() => {
    if (profile) {
      reset({
        nameAr: profile.nameAr || '',
        nameEn: profile.nameEn || '',
      });
    }
  }, [profile, reset]);

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const onSubmit = useCallback(async (data) => {
    const toastId = toast.loading('Updating profile...');
    const success = await updateProfile(
      { id: profile?.id, ...data },
      photo
    );
    if (success) {
      toast.update(toastId, {
        render: 'Profile updated successfully! ✅',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
    } else {
      toast.update(toastId, {
        render: 'Failed to update profile.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  }, [profile, photo, updateProfile]);

  if (loading) return (
    <div className="agent-profile-page">
      <div className="agent-profile-skeleton mb-3" style={{ height: 24, width: '40%' }} />
      <div className="agent-profile-skeleton mb-4" style={{ height: 100, borderRadius: 14 }} />
      <div className="agent-profile-skeleton mb-3" style={{ height: 44 }} />
      <div className="agent-profile-skeleton"      style={{ height: 44 }} />
    </div>
  );

  if (error) return (
    <div className="agent-profile-page">
      <p style={{ color: '#e53e3e' }}>Failed to load profile.</p>
    </div>
  );

  return (
    <div className="agent-profile-page">

      {/* ── Header ── */}
      <h2 className="agent-profile-title">Profile Settings</h2>
      <p className="agent-profile-subtitle">Update your agency information</p>

      {/* ── Avatar ── */}
      <div className="agent-profile-avatar-wrapper">
        <img
          src={photoPreview || (profile?.logoPath ? `${BASE_IMG}${profile.logoPath}` : profileimg)}
          alt={profile?.nameEn}
          className="agent-profile-avatar"
        />
        <div className="agent-profile-avatar-info">
          <h6>{profile?.nameEn}</h6>
          <p>{profile?.nameAr}</p>
          <label className="agent-profile-file-wrapper">
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            <i className="fa-solid fa-camera" />
            Change Photo
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <Row className="g-3">

          {/* ── Name EN ── */}
          <Col md={12}>
            <label className="agent-profile-label">Company Name (English)</label>
            <input
              className={`agent-profile-input ${errors.nameEn ? 'is-invalid' : ''}`}
              placeholder="Company Name"
              {...register('nameEn', { required: 'Company name in English is required' })}
            />
            {errors.nameEn && <p className="agent-profile-error">{errors.nameEn.message}</p>}
          </Col>

          {/* ── Name AR ── */}
          <Col md={12}>
            <label className="agent-profile-label">Company Name (Arabic)</label>
            <input
              className={`agent-profile-input ${errors.nameAr ? 'is-invalid' : ''}`}
              placeholder="اسم الشركة"
              {...register('nameAr', { required: 'Company name in Arabic is required' })}
            />
            {errors.nameAr && <p className="agent-profile-error">{errors.nameAr.message}</p>}
          </Col>

        </Row>

        {/* ── Read-only Info ── */}
        <p className="agent-profile-divider">Account Information</p>

        <div className="agent-profile-info-row">
          <span className="agent-profile-info-label">License Number</span>
          <span className="agent-profile-info-value">{profile?.licenseNumber || '—'}</span>
        </div>
        <div className="agent-profile-info-row">
          <span className="agent-profile-info-label">CR Number</span>
          <span className="agent-profile-info-value">{profile?.cr || '—'}</span>
        </div>
        <div className="agent-profile-info-row">
          <span className="agent-profile-info-label">License Expiry</span>
          <span className="agent-profile-info-value">
            {profile?.licenseExpiryDate
              ? new Date(profile.licenseExpiryDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })
              : '—'
            }
          </span>
        </div>
        <div className="agent-profile-info-row">
          <span className="agent-profile-info-label">Status</span>
          <span className="agent-profile-info-value" style={{ color: profile?.isActive ? '#16a34a' : '#e53e3e' }}>
            {profile?.isActive ? '✅ Active' : '❌ Inactive'}
          </span>
        </div>

        {/* ── Submit ── */}
        <button type="submit" className="agent-profile-btn" disabled={updating}>
          {updating
            ? <><span className="spinner-border spinner-border-sm" /> Updating...</>
            : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
          }
        </button>

      </form>
    </div>
  );
}