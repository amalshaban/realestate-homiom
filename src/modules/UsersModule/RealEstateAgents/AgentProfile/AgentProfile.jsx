import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAgentProfile } from '../useAgentData.js';
import profileimg from '../../../../assets/imgs/profile.png';
import { BASE_URL } from '../../../../constants/EndPoints.js';
import '../AgentPannel.css';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentProfile() {

  const { profile, loading, error, updating, updateProfile } = useAgentProfile();
  const { t } = useTranslation();
  const [photo,        setPhoto]        = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm();

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
    const toastId = toast.loading(t('updating_profile'));
    const success = await updateProfile({ id: profile?.id, ...data }, photo);
    if (success) {
      toast.update(toastId, {
        render: t('profile_updated'),
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
    } else {
      toast.update(toastId, {
        render: t('failed_update_profile'),
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  }, [profile, photo, updateProfile, t]);

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
      <p style={{ color: '#e53e3e' }}>{t('failed_load_profile')}</p>
    </div>
  );

  return (
    <div className="agent-profile-page">

      {/* ── Header ── */}
      <h2 className="agent-profile-title">{t('profile_settings')}</h2>
      <p className="agent-profile-subtitle">{t('update_agency_info')}</p>

      {/* ── Avatar ── */}
      <div className="agent-profile-avatar-wrapper">
        <img
          src={photoPreview || (profile?.logoPath ? `${BASE_URL}/images/${profile.logoPath}` : profileimg)}
          alt={profile?.nameEn}
          className="agent-profile-avatar"
        />
        <div className="agent-profile-avatar-info">
          <h6>{profile?.nameEn}</h6>
          <p>{profile?.nameAr}</p>
          <label className="agent-profile-file-wrapper">
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            <i className="fa-solid fa-camera" />
            {t('change_photo')}
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <Row className="g-3">

          {/* ── Name EN ── */}
          <Col md={12}>
            <label className="agent-profile-label">{t('company_name_en')}</label>
            <input
              className={`agent-profile-input ${errors.nameEn ? 'is-invalid' : ''}`}
              placeholder={t('company_name_en')}
              {...register('nameEn', { required: t('company_name_en_required') })}
            />
            {errors.nameEn && <p className="agent-profile-error">{errors.nameEn.message}</p>}
          </Col>

          {/* ── Name AR ── */}
          <Col md={12}>
            <label className="agent-profile-label">{t('company_name_ar')}</label>
            <input
              className={`agent-profile-input ${errors.nameAr ? 'is-invalid' : ''}`}
              placeholder={t('company_name_ar')}
              {...register('nameAr', { required: t('company_name_ar_required') })}
            />
            {errors.nameAr && <p className="agent-profile-error">{errors.nameAr.message}</p>}
          </Col>

        </Row>

        {/* ── Read-only Info ── */}
        <p className="agent-profile-divider">{t('account_information')}</p>

        <div className="agent-profile-info-row">
          <span className="agent-profile-info-label">{t('license_number')}</span>
          <span className="agent-profile-info-value">{profile?.licenseNumber || '—'}</span>
        </div>
        <div className="agent-profile-info-row">
          <span className="agent-profile-info-label">{t('cr_number')}</span>
          <span className="agent-profile-info-value">{profile?.cr || '—'}</span>
        </div>
        <div className="agent-profile-info-row">
          <span className="agent-profile-info-label">{t('license_expiry')}</span>
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
          <span className="agent-profile-info-label">{t('status')}</span>
          <span className="agent-profile-info-value" style={{ color: profile?.isActive ? '#16a34a' : '#e53e3e' }}>
            {profile?.isActive ? `✅ ${t('active')}` : `❌ ${t('inactive')}`}
          </span>
        </div>

        {/* ── Submit ── */}
        <button type="submit" className="agent-profile-btn" disabled={updating}>
          {updating
            ? <><span className="spinner-border spinner-border-sm" /> {t('updating')}</>
            : <><i className="fa-solid fa-floppy-disk" /> {t('save_changes')}</>
          }
        </button>

      </form>
    </div>
  );
}