import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../AuthModule/context/AuthContext';
import profileimg from '../../../../assets/imgs/profile.png';
import { BASE_URL } from '../../../../constants/EndPoints.js';
import '../../RealEstateAgents/AgentPannel.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { key: 'marketplace', to: '/agentlayout/marketplace' },
  { key: 'insights',    to: '/agentlayout/insights'    },
  { key: 'concierge',   to: '/agentlayout/concierge'   },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentNav({ onMenuClick }) {

  const { loginData } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const photo     = loginData?.Photo || '';
  const photoLink = photo ? `${BASE_URL}/images/${photo}` : profileimg;

  return (
    <nav className="agent-nav">
      <button
        className="d-md-none me-3"
        style={{ background: 'none', border: 'none', fontSize: '20px', color: '#0b0d2a' }}
        onClick={onMenuClick}
      >
        <i className="fa-solid fa-bars" />
      </button>

      {/* ── Brand ── */}
      <Link to="/agentlayout/overview" className="agent-nav-brand">
        Homiom
      </Link>

      {/* ── Center Links ── */}
      <ul className="agent-nav-links">
        {NAV_LINKS.map(link => (
          <li key={link.key}>
            <Link to={link.to}>{t(link.key)}</Link>
          </li>
        ))}
      </ul>

      {/* ── Right Side ── */}
      <div className="agent-nav-right">

        {/* Bell */}
        <button className="agent-nav-bell" title={t('notifications')}>
          <i className="fa-regular fa-bell" />
        </button>

        {/* List Property */}
        <Link to="agentpannel/addproperty" className="agent-nav-list-btn">
          {t('list_property')}
        </Link>

        {/* Avatar */}
        <img
          src={photoLink}
          alt="Profile"
          className="agent-nav-avatar"
          onClick={() => navigate('/agentlayout/profile')}
        />

      </div>
    </nav>
  );
}