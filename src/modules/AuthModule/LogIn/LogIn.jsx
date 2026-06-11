import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { apiKey, EmailValidation, PasswordValidation } from '../../../constants/Validations.js';
import { USERS_URLs } from '../../../constants/EndPoints.js';
import { AuthContext } from '../context/AuthContext.jsx';
import '../../AuthModule/auth.css';

// ─── Sub Components ───────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.5 39.5 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LogIn() {

  const { saveLoginData } = useContext(AuthContext);
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading(t('logging_in'));
    try {
      const response = await axios.post(USERS_URLs.Login, data, {
        headers: {
          Authorization: '',
          apiKey,
          'Content-Type': 'application/json',
        },
      });
      sessionStorage.setItem('token', response.data.token);
      saveLoginData();
      toast.update(toastId, {
        render: t('welcome_back'),
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      setTimeout(() => navigate('/home', { replace: true }), 500);
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.message || t('login_failed'),
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">

      {/* ── Logo ── */}
      <div className="text-center mb-4">
        <div className="mb-2">
          <i className="fa-solid fa-house" style={{ fontSize: '28px', color: '#0088BD' }} />
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#0b0d2a', marginLeft: '8px' }}>
            Homiom
          </span>
        </div>
        <h2 className="login-title">{t('welcome_back')}</h2>
        <p className="login-subtitle">{t('login_subtitle')}</p>
      </div>

      {/* ── Card ── */}
      <div className="login-card">
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">

          <h5>{t('login')}</h5>
          <p>{t('login_credentials')}</p>

          {/* ── Email ── */}
          <div className="mb-3">
            <label className="login-label">{t('email_address')}</label>
            <input
              type="email"
              className="form-control login-input"
              placeholder="ahmed@example.com"
              {...register('email', EmailValidation)}
            />
            {errors.email && <p className="login-error">{errors.email.message}</p>}
          </div>

          {/* ── Password ── */}
          <div className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="login-label mb-0">{t('password')}</label>
              <Link to="/auth/forgot-password" className="login-forgot">{t('forgot_password')}</Link>
            </div>
            <div className="password-wrapper">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                className="form-control login-input"
                placeholder="••••••••"
                {...register('password', PasswordValidation)}
              />
              <button
                type="button"
                className="toggle-eye"
                onMouseDown={e => e.preventDefault()}
                onClick={() => setIsPasswordVisible(v => !v)}
              >
                <i className={isPasswordVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'} />
              </button>
            </div>
            {errors.password && <p className="login-error">{errors.password.message}</p>}
          </div>

          {/* ── Remember Me ── */}
          <div className="form-check login-remember mb-3">
            <input type="checkbox" className="form-check-input" id="rememberMe" />
            <label className="form-check-label" htmlFor="rememberMe">{t('remember_me')}</label>
          </div>

          {/* ── Submit ── */}
          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? t('logging_in') : t('login')}
          </button>

        </form>

        {/* ── Divider ── */}
        <div className="login-divider">
          <hr /><span>{t('or_continue_with')}</span><hr />
        </div>

        {/* ── Social ── */}
        <div className="d-flex gap-3">
          <button className="social-btn"><GoogleIcon /> Google</button>
          <button className="social-btn"><GitHubIcon /> GitHub</button>
        </div>

        {/* ── Sign Up Link ── */}
        <div className="login-bottom">
          {t('no_account')} <Link to="/auth/join/signup">{t('sign_up')}</Link>
        </div>

      </div>

      {/* ── reCAPTCHA ── */}
      <p className="login-recaptcha">
        {t('recaptcha_text')}{' '}
        <Link to="/privacy">{t('privacy_policy')}</Link>
      </p>

    </div>
  );
}