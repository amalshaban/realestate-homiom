import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { USERS_URLs } from '../../../../constants/EndPoints';
import { apiKey, EmailValidation, PasswordValidation } from '../../../../constants/Validations';
import '../../../AuthModule/auth.css';
// ─── Constants ────────────────────────────────────────────────────────────────
const browserLanguage = navigator.language || 'en';

const TABS = [
  { id: 'personal', label: 'Personal' },
  { id: 'company',  label: 'Company'  },
];

const TAB_FIELDS = {
  personal: ['register.firstName', 'register.lastName', 'register.email', 'register.password', 'register.phone'],
  company:  ['nameAr', 'nameEn', 'cr', 'fal', 'falExpiryDate', 'logo'],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentSignUp() {

  const [activeTab,         setActiveTab]         = useState('personal');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [doneTabs,          setDoneTabs]          = useState([]);
  const [logoName,          setLogoName]          = useState('');

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      register:    { firstName: '', lastName: '', email: '', password: '', phone: '' },
      nameAr: '', nameEn: '', cr: '', fal: '', falExpiryDate: '',
    },
  });

  const handleNext = useCallback(async () => {
    const valid = await trigger(TAB_FIELDS[activeTab]);
    if (!valid) return;
    setDoneTabs(prev => [...new Set([...prev, activeTab])]);
    const idx = TABS.findIndex(t => t.id === activeTab);
    if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
  }, [activeTab, trigger]);

  const handleBack = useCallback(() => {
    const idx = TABS.findIndex(t => t.id === activeTab);
    if (idx > 0) setActiveTab(TABS[idx - 1].id);
  }, [activeTab]);

  const onSubmit = useCallback(async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Creating your account...');
    const payload = new FormData();

    payload.append('register.firstName', data.register.firstName);
    payload.append('register.lastName',  data.register.lastName);
    payload.append('register.email',     data.register.email);
    payload.append('register.password',  data.register.password);
    payload.append('register.phone',     data.register.phone);
    payload.append('nameAr',             data.nameAr);
    payload.append('nameEn',             data.nameEn);
    payload.append('cr',                 data.cr);
    payload.append('fal',                data.fal);
    payload.append('falExpiryDate',      data.falExpiryDate);
    payload.append('logo',               data.logo[0]);

    try {
      const response = await axios.post(USERS_URLs.AgentRegister, payload, {
        headers: {
          Authorization: '',
          apiKey,
          'Accept-Language': browserLanguage,
        },
      });
      toast.update(toastId, {
        render: response?.data?.message || 'Account created successfully! 🎉',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      setTimeout(() => navigate('/home'), 500);
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.message || 'Registration failed. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate]);

  const isLastTab = activeTab === TABS[TABS.length - 1].id;

  return (
    <div className="agent-page">

      {/* ── Logo ── */}
      <div className="text-center mb-4">
        <div className="mb-2">
          <i className="fa-solid fa-house" style={{ fontSize: '28px', color: '#0088BD' }} />
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#0b0d2a', marginLeft: '8px' }}>
            Homiom
          </span>
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#0b0d2a', marginBottom: '4px' }}>
          Create Agent Account
        </h2>
        <p style={{ fontSize: '14px', color: '#666' }}>Fill in your details to get started</p>
      </div>

      <div className="agent-card">
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">

          {/* ── Tabs ── */}
          <div className="agent-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`agent-tab ${activeTab === tab.id ? 'active' : ''} ${doneTabs.includes(tab.id) && activeTab !== tab.id ? 'done' : ''}`}
                onClick={() => {
                  if (doneTabs.includes(tab.id) || tab.id === activeTab) setActiveTab(tab.id);
                }}
              >
                {doneTabs.includes(tab.id) && activeTab !== tab.id
                  ? <><i className="fa-solid fa-check" style={{ fontSize: '11px', color: '#0088BD', marginRight: '5px' }} />{tab.label}</>
                  : tab.label
                }
              </button>
            ))}
          </div>

          {/* ── Tab 1: Personal ── */}
          {activeTab === 'personal' && (
            <Row className="g-3">
              <Col md={6}>
                <label className="agent-label">First Name</label>
                <input className={`agent-input ${errors.register?.firstName ? 'is-invalid' : ''}`}
                  placeholder="First Name"
                  {...register('register.firstName', { required: 'First name is required' })} />
                {errors.register?.firstName && <p className="agent-error">{errors.register.firstName.message}</p>}
              </Col>

              <Col md={6}>
                <label className="agent-label">Last Name</label>
                <input className={`agent-input ${errors.register?.lastName ? 'is-invalid' : ''}`}
                  placeholder="Last Name"
                  {...register('register.lastName', { required: 'Last name is required' })} />
                {errors.register?.lastName && <p className="agent-error">{errors.register.lastName.message}</p>}
              </Col>

              <Col md={6}>
                <label className="agent-label">Email</label>
                <input type="email" className={`agent-input ${errors.register?.email ? 'is-invalid' : ''}`}
                  placeholder="ahmed@example.com"
                  {...register('register.email', EmailValidation)} />
                {errors.register?.email && <p className="agent-error">{errors.register.email.message}</p>}
              </Col>

              <Col md={6}>
                <label className="agent-label">Phone</label>
                <input className={`agent-input ${errors.register?.phone ? 'is-invalid' : ''}`}
                  placeholder="+966 5xx xxx xxx"
                  {...register('register.phone', { required: 'Phone is required' })} />
                {errors.register?.phone && <p className="agent-error">{errors.register.phone.message}</p>}
              </Col>

              <Col md={12}>
                <label className="agent-label">Password</label>
                <div className="agent-password-wrapper">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    className={`agent-input ${errors.register?.password ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                    {...register('register.password', PasswordValidation)}
                  />
                  <button type="button" className="agent-toggle-eye"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setIsPasswordVisible(v => !v)}>
                    <i className={isPasswordVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'} />
                  </button>
                </div>
                {errors.register?.password && <p className="agent-error">{errors.register.password.message}</p>}
              </Col>
            </Row>
          )}

          {/* ── Tab 2: Company ── */}
          {activeTab === 'company' && (
            <Row className="g-3">
              <Col md={6}>
                <label className="agent-label">Company Name (Arabic)</label>
                <input className={`agent-input ${errors.nameAr ? 'is-invalid' : ''}`}
                  placeholder="اسم الشركة"
                  {...register('nameAr', { required: 'Company name in Arabic is required' })} />
                {errors.nameAr && <p className="agent-error">{errors.nameAr.message}</p>}
              </Col>

              <Col md={6}>
                <label className="agent-label">Company Name (English)</label>
                <input className={`agent-input ${errors.nameEn ? 'is-invalid' : ''}`}
                  placeholder="Company Name"
                  {...register('nameEn', { required: 'Company name in English is required' })} />
                {errors.nameEn && <p className="agent-error">{errors.nameEn.message}</p>}
              </Col>

              <Col md={6}>
                <label className="agent-label">CR Number</label>
                <input className={`agent-input ${errors.cr ? 'is-invalid' : ''}`}
                  placeholder="Commercial Registration"
                  {...register('cr', { required: 'CR number is required' })} />
                {errors.cr && <p className="agent-error">{errors.cr.message}</p>}
              </Col>

              <Col md={6}>
                <label className="agent-label">FAL License</label>
                <input className={`agent-input ${errors.fal ? 'is-invalid' : ''}`}
                  placeholder="FAL License Number"
                  {...register('fal', { required: 'FAL license is required' })} />
                {errors.fal && <p className="agent-error">{errors.fal.message}</p>}
              </Col>

              <Col md={6}>
                <label className="agent-label">FAL Expiry Date</label>
                <input type="date" className={`agent-input ${errors.falExpiryDate ? 'is-invalid' : ''}`}
                  {...register('falExpiryDate', { required: 'FAL expiry date is required' })} />
                {errors.falExpiryDate && <p className="agent-error">{errors.falExpiryDate.message}</p>}
              </Col>

              <Col md={6}>
                <label className="agent-label">Company Logo</label>
                <label className="agent-file-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    {...register('logo', { required: 'Logo is required' })}
                    onChange={e => {
                      register('logo').onChange(e);
                      setLogoName(e.target.files[0]?.name || '');
                    }}
                  />
                  <span className="agent-file-btn">Choose File</span>
                  <span className="agent-file-name">{logoName || 'No file chosen'}</span>
                </label>
                {errors.logo && <p className="agent-error">{errors.logo.message}</p>}
              </Col>
            </Row>
          )}

          {/* ── Footer ── */}
          <div className="agent-footer">
            {activeTab !== 'personal' ? (
              <button type="button" className="agent-btn-back" onClick={handleBack}>
                <i className="fa-solid fa-arrow-left" /> Back
              </button>
            ) : (
              <span style={{ fontSize: '13px', color: '#888' }}>
                Already have an account?{' '}
                <Link to="/auth/join" style={{ color: '#0088BD', fontWeight: 600, textDecoration: 'none' }}>
                  Login
                </Link>
              </span>
            )}

            {isLastTab ? (
              <button type="submit" className="agent-btn-next" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Creating Account...'
                  : <><i className="fa-solid fa-check" /> Create Account</>
                }
              </button>
            ) : (
              <button type="button" className="agent-btn-next" onClick={handleNext}>
                Next <i className="fa-solid fa-arrow-right" />
              </button>
            )}
          </div>

        </form>
      </div>

      {/* ── Terms ── */}
      <p className="agent-terms">
        By signing up, you agree to our{' '}
        <Link to="/terms">Terms of Service</Link>
        {' '}and{' '}
        <Link to="/privacy">Privacy Policy</Link>
      </p>

    </div>
  );
}