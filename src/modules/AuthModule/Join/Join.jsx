import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import '../../AuthModule/auth.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const SELECT_OPTIONS = [
  {
    id:   'personal',
    icon: 'fa-solid fa-user',
    key:  'personal_use',
    descKey: 'personal_use_desc',
  },
  {
    id:   'professional',
    icon: 'fa-solid fa-briefcase',
    key:  'professional',
    descKey: 'professional_desc',
  },
];

const ROLE_OPTIONS = [
  {
    id:    'agent',
    icon:  'fa-solid fa-user-gear',
    key:   'real_estate_agent',
    descKey: 'agent_desc',
    route: 'auth/join/signupagent',
  },
  // {
  //   id:    'owner',
  //   icon:  'fa-solid fa-house',
  //   key:   'property_owner',
  //   descKey: 'owner_desc',
  //   route: '/auth/SignUpOwner',
  // },
  // {
  //   id:    'developer',
  //   icon:  'fa-solid fa-building',
  //   key:   'real_estate_developer',
  //   descKey: 'developer_desc',
  //   route: 'auth/join/SignUpDeveloper',
  // },
];

// ─── Sub Components ───────────────────────────────────────────────────────────
const OptionCard = ({ option, selected, onSelect, t }) => (
  <div
    className={`signup-option-card ${selected === option.id ? 'selected' : ''}`}
    onClick={() => onSelect(option.id)}
  >
    <i className={option.icon} />
    <h6>{t(option.key)}</h6>
    <p>{t(option.descKey)}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SignUp() {

  const { t } = useTranslation();
  const [view,     setView]     = useState('select');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();


  const handleContinue = useCallback(() => {
  if (!selected) return;

  if (view === 'select') {
    if (selected === 'personal') {
      navigate('auth/join/signupnormal');
    } else {
      setSelected(null);
      setView('role');
    }
    return;
  }

  if (view === 'role') {
    const role = ROLE_OPTIONS.find(r => r.id === selected);
    if (!role) return; // ✅ حماية من undefined
    navigate(role.route);
  }
}, [view, selected, navigate]);

  const handleBack = useCallback(() => {
    setSelected(null);
    setView('select');
  }, []);

  const currentOptions = view === 'select' ? SELECT_OPTIONS : ROLE_OPTIONS;
  const isWide         = view === 'role';

  return (
    <div className="signup-page">

      {/* ── Logo ── */}
      <div className="text-center mb-4">
        <div className="mb-2">
          <i className="fa-solid fa-house" style={{ fontSize: '28px', color: '#0088BD' }} />
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#0b0d2a', marginLeft: '8px' }}>
            Homiom
          </span>
        </div>
        <h2 className="signup-title">{t('create_account')}</h2>
        <p className="signup-subtitle">{t('signup_subtitle')}</p>
      </div>

      {/* ── Card ── */}
      <div className={`signup-card ${isWide ? 'wide' : ''}`}>

        {/* ── Progress ── */}
        <div className="signup-progress">
          <div className="step-circle active">1</div>
          <div style={{ flex: 1, height: '3px', background: '#e0e0e0', borderRadius: '2px', minWidth: 0 }} />
          <div className={`step-circle ${view === 'role' ? 'active' : 'inactive'}`}>2</div>
        </div>

        {/* ── Step Title ── */}
        <h3 className="signup-step-title">
          {view === 'select' ? t('how_use_homiom') : t('select_role')}
        </h3>
        <p className="signup-step-subtitle">
          {view === 'select' ? t('choose_best_option') : t('choose_account_type')}
        </p>

        {/* ── Options ── */}
        <div className={`signup-options ${isWide ? 'three-col' : ''}`}>
          {currentOptions.map(option => (
            <OptionCard
              key={option.id}
              option={option}
              selected={selected}
              onSelect={setSelected}
              t={t}
            />
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="signup-footer">
          <span>
            {view === 'select' ? (
              <>
                {t('already_have_account')}{' '}
                <Link to="/auth/join">{t('login')}</Link>
              </>
            ) : (
              <span className="signup-back" onClick={handleBack}>
                <i className="fa-solid fa-arrow-left me-1" /> {t('back')}
              </span>
            )}
          </span>
          <button
            className={`signup-continue-btn ${selected ? 'ready' : ''}`}
            onClick={handleContinue}
            disabled={!selected}
          >
            {t('continue')} <i className="fa-solid fa-arrow-right" />
          </button>
        </div>

      </div>

      {/* ── Terms ── */}
      <p className="signup-terms">
        {t('signup_agree')}{' '}
        <Link to="/terms">{t('terms_of_service')}</Link>
        {' '}{t('and')}{' '}
        <Link to="/privacy">{t('privacy_policy')}</Link>
      </p>

    </div>
  );
}