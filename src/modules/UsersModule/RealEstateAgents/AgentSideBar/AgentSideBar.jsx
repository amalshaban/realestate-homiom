import React, { useContext, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../AuthModule/context/AuthContext.jsx';
import '../../RealEstateAgents/AgentPannel.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const SIDEBAR_LINKS = [
  { key: 'overview',          to: '/agentpannel/overview',         icon: 'fa-solid fa-chart-pie'            },
  { key: 'my_properties',     to: '/agentpannel/properties',       icon: 'fa-solid fa-building'             },
  { key: 'visit_requests',    to: '/agentpannel/visitrequests',    icon: 'fa-solid fa-calendar-check'       },
  { key: 'purchase_requests', to: '/agentpannel/purchaserequests', icon: 'fa-solid fa-hand-holding-dollar'  },
  { key: 'rent_requests',     to: '/agentpannel/rentrequests',     icon: 'fa-solid fa-file-contract'        },
  { key: 'rents',             to: '/agentpannel/rents',            icon: 'fa-solid fa-key'                  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentSidebar({ onClose }) {

  const { logOut } = useContext(AuthContext);
  const { t }      = useTranslation();
  const navigate   = useNavigate();

  const handleLogout = useCallback(() => {
    logOut();
    navigate('/home');
  }, [logOut, navigate]);

  return (
    <div className="agent-sidebar">

      {/* ── Mobile Close ── */}
      <div className="d-md-none d-flex justify-content-end mb-2">
        <button
          style={{ background: 'none', border: 'none', fontSize: '20px', color: '#888' }}
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {/* ── Header ── */}
      <div>
        <h5 className="ap-sidebar-title">{t('agent_dashboard')}</h5>
        <p className="ap-sidebar-subtitle">{t('real_estate_management')}</p>
      </div>

      {/* ── Links ── */}
      <ul className="ap-sidebar-links">
        {SIDEBAR_LINKS.map(link => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => `ap-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className={link.icon} />
              {t(link.key)}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* ── Bottom ── */}
      <div className="ap-sidebar-bottom">
        <NavLink
          to="/agentpannel/help"
          className={({ isActive }) => `ap-sidebar-link ${isActive ? 'active' : ''}`}
        >
          <i className="fa-regular fa-circle-question" />
          {t('help_center')}
        </NavLink>

        <button className="ap-sidebar-link ap-signout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket" />
          {t('sign_out')}
        </button>
      </div>

    </div>
  );
}